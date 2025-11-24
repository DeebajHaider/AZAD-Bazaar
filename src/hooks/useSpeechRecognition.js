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
  const [status, setStatus] = useState('idle'); // idle | listening | error | done
  const [error, setError] = useState(null);
  
  // Web-specific ref
  const webRecognitionRef = useRef(null);
  
  // Determine if we are on a native device (iOS/Android)
  const isNative = Capacitor.isNativePlatform();

  // Check support: Native is always "supported" (checked via plugin), Web checks window object
  const isSupported = isNative || (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

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
        // 1. Check/Request Permissions
        const permissionStatus = await SpeechRecognition.requestPermissions();
        
        if (permissionStatus.speechRecognition !== 'granted' && permissionStatus.speechRecognition !== 'prompt') {
          setStatus('error');
          setError('Microphone or Speech permission denied.');
          return;
        }

        // 2. Remove any lingering listeners to avoid duplicates
        await SpeechRecognition.removeAllListeners();

        // 3. Listen for Partial Results (Updates transcript as you speak)
        await SpeechRecognition.addListener('partialResults', (data) => {
          if (data.matches && data.matches.length > 0) {
            setTranscript(data.matches[0]);
          }
        });

        // 4. Listen for State Changes (Detect when listening stops)
        await SpeechRecognition.addListener('listeningState', (data) => {
          if (data.status === 'stopped') {
            setStatus((prev) => prev === 'error' ? prev : 'idle');
          } else if (data.status === 'started') {
            setStatus('listening');
          }
        });

        // 5. Start Listening
        // We use partialResults: true to get real-time feedback
        await SpeechRecognition.start({
          language: LANG_MAP[lang] || 'en-US',
          maxResults: 1,
          partialResults: true,
          popup: false, // Use false for invisible background listening
        });

      } catch (e) {
        console.error('Speech Recognition Error:', e);
        setStatus('error');
        setError(e.message || 'Native speech recognition failed');
        await SpeechRecognition.stop();
      }
      return;
    }

    // --- WEB IMPLEMENTATION (ORIGINAL CODE) ---
    const SpeechRecognitionWeb = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionWeb();
    
    recognition.lang = LANG_MAP[lang] || 'en-US';
    recognition.interimResults = false; // Keep false to match your original logic, or true for live typing
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
        // Remove listeners to clean up
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