import React from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

export default function SpeechRecognitionTest() {
  const {
    isSupported,
    transcript,
    status,
    error,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 20 }}>
      <h2>Speech Recognition Test</h2>
      {!isSupported && (
        <p style={{ color: 'red' }}>
          SpeechRecognition API not supported. Use Chrome or Android WebView.
        </p>
      )}
      {isSupported && (
        <>
          <button
            onClick={startListening}
            style={{ padding: '12px 20px', fontSize: 18 }}
            disabled={status === 'listening'}
          >
            🎤 Start Listening
          </button>
          <button
            onClick={stopListening}
            style={{ padding: '12px 20px', fontSize: 18, marginLeft: 10 }}
            disabled={status !== 'listening'}
          >
            ⏹️ Stop
          </button>
          <p id="status" style={{ marginTop: 10 }}>
            Status: {status}
            {error && <span style={{ color: 'red', marginLeft: 10 }}>Error: {error}</span>}
          </p>
          <div id="output" style={{ marginTop: 20, fontSize: 24 }}>
            {transcript && <span>You said: {transcript}</span>}
          </div>
        </>
      )}
    </div>
  );
}
