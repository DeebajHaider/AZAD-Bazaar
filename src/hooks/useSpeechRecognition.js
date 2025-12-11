import { useState, useRef, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capgo/capacitor-speech-recognition';
import { useI18n } from '../context/I18nContext';

// Supported language codes
const LANG_MAP = {
  en: 'en-US',
  ur: 'ur-PK',
};

export default function useSpeechRecognition() {
  const { lang } = useI18n();
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const webRecognitionRef = useRef(null);
  const isNative = Capacitor.isNativePlatform();

  const isSupported = isNative || (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

  // Initialize permissions on mount for native platforms
  useEffect(() => {
    if (isNative && !isInitialized) {
      const initPermissions = async () => {
        try {
          const permissionStatus = await SpeechRecognition.requestPermissions();
          if (permissionStatus.speechRecognition === 'granted') {
            setIsInitialized(true);
          }
        } catch (e) {
          console.error('Permission initialization error:', e);
        }
      };
      initPermissions();
    }
  }, [isNative, isInitialized]);

  const startListening = useCallback(async () => {
    setError(null);
    setTranscript('');

    if (!isSupported) {
      setStatus('error');
      setError('SpeechRecognition API not supported.');
      return;
    }

    setStatus('listening');

    // --- NATIVE IMPLEMENTATION (CAPACITOR) ---
    if (isNative) {
      try {
        // Stop any existing recognition first
        await SpeechRecognition.stop().catch(() => {});
        
        // Small delay to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Remove any lingering listeners
        await SpeechRecognition.removeAllListeners();

        // Request permissions if not already granted
        const permissionStatus = await SpeechRecognition.requestPermissions();
        
        if (permissionStatus.speechRecognition !== 'granted' && permissionStatus.speechRecognition !== 'prompt') {
          setStatus('error');
          setError('Microphone or Speech permission denied.');
          return;
        }

        // Listen for Partial Results
        await SpeechRecognition.addListener('partialResults', (data) => {
          if (data.matches && data.matches.length > 0) {
            setTranscript(data.matches[0]);
          }
        });

        // Listen for State Changes
        await SpeechRecognition.addListener('listeningState', (data) => {
          if (data.status === 'stopped') {
            setStatus((prev) => prev === 'error' ? prev : 'idle');
          } else if (data.status === 'started') {
            setStatus('listening');
          }
        });

        // Small delay before starting to ensure listeners are ready
        await new Promise(resolve => setTimeout(resolve, 150));

        // Start Listening with explicit language configuration
        await SpeechRecognition.start({
          language: LANG_MAP[lang] || 'en-US',
          maxResults: 1,
          partialResults: true,
          popup: false,
        });

      } catch (e) {
        console.error('Speech Recognition Error:', e);
        setStatus('error');
        setError(e.message || 'Native speech recognition failed');
        await SpeechRecognition.stop().catch(() => {});
      }
      return;
    }

    // --- WEB IMPLEMENTATION ---
    const SpeechRecognitionWeb = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionWeb();
    
    recognition.lang = LANG_MAP[lang] || 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setStatus('listening');
    
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setStatus('done');
    };

    recognition.onerror = (e) => {
      setStatus('error');
      setError(e.error || 'Unknown error');
    };

    recognition.onend = () => {
      setStatus((prev) => (prev === 'error' || prev === 'done' ? prev : 'idle'));
    };

    webRecognitionRef.current = recognition;
    recognition.start();

  }, [lang, isSupported, isNative]);

  const stopListening = useCallback(async () => {
    if (isNative) {
      try {
        await SpeechRecognition.stop();
        await SpeechRecognition.removeAllListeners();
        setStatus('idle');
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    } else {
      if (webRecognitionRef.current) {
        webRecognitionRef.current.stop();
        setStatus('idle');
      }
    }
  }, [isNative]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isNative) {
        SpeechRecognition.stop().catch(() => {});
        SpeechRecognition.removeAllListeners().catch(() => {});
      } else {
        if (webRecognitionRef.current) {
          webRecognitionRef.current.stop();
        }
      }
    };
  }, [isNative]);

  return {
    isSupported: !!isSupported,
    transcript,
    status,
    error,
    startListening,
    stopListening,
  };
}