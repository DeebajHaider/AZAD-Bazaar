import { useState, useRef, useCallback } from 'react';
import { useI18n } from '../context/I18nContext';

// Supported language codes for SpeechRecognition
const LANG_MAP = {
  en: 'en-US',
  ur: 'ur-PK',
};

export default function useSpeechRecognition() {
  const { lang } = useI18n();
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle'); // idle | listening | error | done
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const isSupported = typeof window !== 'undefined' && (
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    if (!isSupported) {
      setStatus('error');
      setError('SpeechRecognition API not supported. Use Chrome or Android WebView.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
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
      if (status !== 'error' && status !== 'done') setStatus('idle');
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, [lang, isSupported, status]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setStatus('idle');
    }
  }, []);

  return {
    isSupported: !!isSupported,
    transcript,
    status,
    error,
    startListening,
    stopListening,
  };
}
