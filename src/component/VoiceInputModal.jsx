import React, { useEffect, useCallback } from 'react';
import { Mic, X, Check, AlertCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { useI18n } from '../context/I18nContext';

/**
 * A reusable, accessible, and mobile-friendly modal for voice input.
 * Redesigned for live feedback and a streamlined workflow.
 * @param {object} props
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {() => void} props.onClose - Function to call when the modal should be closed.
 * @param {(transcript: string) => void} props.onConfirm - Function called with the final transcript when confirmed.
 */
export default function VoiceInputModal({ isOpen, onClose, onConfirm }) {
  const { t } = useI18n();
  const { status, transcript, startListening, error, isSupported } = useSpeechRecognition();

  // Close modal on 'Escape' key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Safely handle confirmation
  const handleConfirm = useCallback(() => {
    if (transcript) {
      onConfirm(transcript);
    }
    onClose();
  }, [transcript, onConfirm, onClose]);

  const getErrorMessage = () => {
    if (!isSupported) return t('voiceModal.error.notSupported');
    if (error === 'no-speech' || error === 'audio-capture') return t('voiceModal.error.noSpeech');
    return t('voiceModal.error.generic');
  };

  const isListening = status === 'listening';
  const hasTranscript = transcript.trim().length > 0;

  // Renders the main content, switching between the live view and a full-screen error
  const renderContent = () => {
    if (status === 'error' || !isSupported) {
      return (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full flex flex-col items-center justify-center text-center"
        >
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-4">
            <AlertCircle size={40} className="accentDangerText" />
          </div>
          <h3 className="font-bold text-lg primText mb-1">{t('voiceModal.error.title')}</h3>
          <p className="text-sm secText max-w-xs mb-6">{getErrorMessage()}</p>
          {isSupported && (
             <button onClick={startListening} className="w-full min-h-12 px-6 py-3 btnSecondary rounded-lg">
                {t('voiceModal.actions.retry')}
             </button>
          )}
        </motion.div>
      );
    }

    // Default, unified view for idle, listening, and done states
    return (
      <motion.div
        key="live-view"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full flex flex-col"
      >
        {/* Top: Live Transcript Area */}
        <div className="flex-grow mb-4">
          <h3 id="transcript-title" className="text-sm font-semibold primText mb-2">
            {t('voiceModal.liveTranscript.title')}
          </h3>
          <div
            aria-labelledby="transcript-title"
            aria-live="polite"
            className="min-h-[7rem] w-full p-4 primBorder secBg rounded-lg text-lg primText"
            dir="auto"
          >
            {hasTranscript ? (
              transcript
            ) : (
              <span className="secText opacity-70">
                {isListening ? '...' : t('voiceModal.liveTranscript.placeholder')}
              </span>
            )}
          </div>
        </div>

        {/* Middle: Microphone Button */}
        <div className="flex-shrink-0 flex justify-center items-center py-4">
          <div className="relative">
            {isListening && (
              <div className="absolute inset-[-10px] rounded-full bg-blue-500/20 animate-ping" />
            )}
            <button
              onClick={startListening}
              aria-label={isListening ? t('voiceModal.instructions.listening') : t('voiceModal.instructions.idle')}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 active:scale-95 hover:brightness-110
                ${isListening ? 'btnDanger' : 'btnPrimary'}
              `}
            >
              <Mic size={48} />
            </button>
          </div>
        </div>
        
        {/* Bottom: Confirm Button */}
        <div className="flex-shrink-0 pt-4 mt-auto">
          <button
            onClick={handleConfirm}
            disabled={!hasTranscript || isListening}
            className="w-full min-h-12 px-6 py-3 btnPrimary rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search size={20} />
            {t('voiceModal.actions.confirmSearch')}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="voice-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative secBg rounded-2xl p-6 w-full max-w-sm flex flex-col min-h-[28rem] shadow-xl"
          >
            <header className="w-full flex items-center justify-between mb-4 flex-shrink-0">
              <h2 id="voice-modal-title" className="text-xl font-bold primText">
                {t('voiceModal.title')}
              </h2>
              <button
                onClick={onClose}
                aria-label={t('voiceModal.actions.close')}
                className="w-10 h-10 flex items-center justify-center btnSecondary rounded-full transition-transform active:scale-90"
              >
                <X size={20} />
              </button>
            </header>

            <main className="flex-1 flex w-full">
              <AnimatePresence mode="wait">
                {renderContent()}
              </AnimatePresence>
            </main>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}