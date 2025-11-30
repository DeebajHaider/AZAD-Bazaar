import React, { useEffect, useCallback } from 'react';
import { Mic, X, AlertCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { useI18n } from '../context/I18nContext';

/**
 * VoiceInputModal - Bottom Sheet Fixed
 * MD3: Uses Surface Container High for sheet background.
 */
export default function VoiceInputModal({ isOpen, onClose, onConfirm, confirmLabel }) {
  const { t } = useI18n();
  const { status, transcript, startListening, error, isSupported } = useSpeechRecognition();

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle Confirm
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

  // Variants for the sheet animation
  const sheetVariants = {
    hidden: { y: "100%" },
    visible: { y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } },
    exit: { y: "100%", transition: { duration: 0.2 } }
  };

  // Variants for the backdrop fade
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const renderContent = () => {
    if (status === 'error' || !isSupported) {
      return (
        <motion.div
          key="error-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full flex flex-col items-center justify-center text-center py-6"
        >
          {/* Error Icon: Error Container */}
          <div className="w-20 h-20 rounded-md bg-md-error-container flex items-center justify-center mb-4">
            <AlertCircle size={40} className="text-md-on-error-container" />
          </div>
          <h3 className="font-bold text-lg text-md-on-surface mb-1">{t('voiceModal.error.title')}</h3>
          <p className="text-sm text-md-on-surface-variant max-w-xs mb-6">{getErrorMessage()}</p>
          {isSupported && (
             <button onClick={startListening} className="w-full min-h-12 px-6 py-3 bg-md-secondary-container text-md-on-secondary-container font-medium rounded-lg hover:opacity-90 transition-opacity">
                {t('voiceModal.actions.retry')}
             </button>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div
        key="live-view"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full flex flex-col"
      >
        {/* Transcript Area */}
        <div className="flex-grow mb-6">
          <h3 id="transcript-title" className="text-sm font-semibold text-md-on-surface-variant mb-2 uppercase tracking-wide">
            {t('voiceModal.liveTranscript.title')}
          </h3>
          <div
            aria-labelledby="transcript-title"
            aria-live="polite"
            // Filled Input Style: Surface Container Highest
            className="min-h-[10rem] w-full p-4 bg-md-surface-container-highest rounded-lg text-lg text-md-on-surface shadow-inner overflow-y-auto"
            dir="auto"
          >
            {hasTranscript ? (
              transcript
            ) : (
              <span className="text-md-on-surface-variant/60 italic">
                {isListening ? '...' : t('voiceModal.liveTranscript.placeholder')}
              </span>
            )}
          </div>
        </div>

        {/* Mic Button */}
        <div className="flex-shrink-0 flex justify-center items-center pb-6">
          <div className="relative">
            {isListening && (
              // Pulse Ring: Primary Color with opacity
              <div className="absolute inset-[-12px] rounded-full border-4 border-md-primary/30 animate-ping" />
            )}
            <button
              onClick={startListening}
              aria-label={isListening ? t('voiceModal.instructions.listening') : t('voiceModal.instructions.idle')}
              // State Switch: Listening = Error (Red), Idle = Primary (Blue/Brand)
              className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 active:scale-95 hover:shadow-xl
                ${isListening ? 'bg-md-error text-md-on-error' : 'bg-md-primary text-md-on-primary'}
              `}
            >
              <Mic size={36} />
            </button>
          </div>
        </div>
        
        {/* Confirm Button */}
        <div className="flex-shrink-0 pt-2">
          <button
            onClick={handleConfirm}
            disabled={!hasTranscript || isListening}
            className="w-full min-h-12 px-6 py-3 bg-md-primary text-md-on-primary font-bold rounded-lg flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all"
          >
            <Search size={20} />
            {confirmLabel || t('voiceModal.actions.confirm')}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ bottom: 0, left: 0, right: 0, top: 0, height: '100vh', margin: 0, padding: 0 }}
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            key="voice-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ bottom: 0 }}
          />

          {/* Bottom Sheet: Surface Container High */}
          <motion.div
            key="voice-sheet"
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-md-surface-container-high w-full max-w-[430px] rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] z-10"
            style={{ marginBottom: 0 }}
          >
             {/* Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                <div className="w-12 h-1 rounded-md bg-md-on-surface-variant/40"></div>
            </div>

            {/* Header */}
            <header className="w-full flex items-center justify-between px-5 pt-2 pb-2 border-b border-md-outline-variant/30 flex-shrink-0">
              <h2 id="voice-modal-title" className="text-xl font-bold text-md-on-surface">
                {t('voiceModal.title')}
              </h2>
              {/* Close: Tonal Button */}
              <button
                onClick={onClose}
                aria-label={t('voiceModal.actions.close')}
                className="w-9 h-9 flex items-center justify-center rounded-md bg-md-secondary-container text-md-on-secondary-container hover:opacity-80 transition-opacity"
              >
                <X size={18} />
              </button>
            </header>

            {/* Content Container */}
            <main className="flex-1 flex w-full p-5 overflow-y-auto">
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