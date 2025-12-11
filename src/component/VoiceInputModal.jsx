import React, { useEffect, useCallback, useState } from 'react';
import { Mic, X, AlertCircle, Check, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { useI18n } from '../context/I18nContext';

/**
 * VoiceInputModal - Fixed Version for Capacitor Speech Recognition
 * Fixes:
 * 1. Added local state management to reset transcript
 * 2. Added stopListening function and Stop button to manually stop recording
 * 3. Changed X button to reset/stop recording instead of closing modal
 * 4. Added proper cleanup on mount/unmount to prevent stale state
 */
export default function VoiceInputModal({ isOpen, onClose, onConfirm, confirmLabel }) {
  const { t } = useI18n();
  const { 
    status, 
    transcript: hookTranscript, 
    startListening, 
    stopListening,
    error, 
    isSupported 
  } = useSpeechRecognition();

  // Local state to manage transcript (so we can reset it)
  const [localTranscript, setLocalTranscript] = useState('');

  // Sync hook transcript to local state
  useEffect(() => {
    if (hookTranscript) {
      setLocalTranscript(hookTranscript);
    }
  }, [hookTranscript]);

  // Define state variables
  const isListening = status === 'listening';
  const hasTranscript = localTranscript.trim().length > 0;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalTranscript('');
      stopListening();
    }
  }, [isOpen, stopListening]);

  // Cleanup on unmount or modal close
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setLocalTranscript('');
    }
  }, [isOpen, stopListening]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        stopListening();
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, stopListening]);

  // Handle Confirm
  const handleConfirm = useCallback(() => {
    if (localTranscript) {
      onConfirm(localTranscript);
    }
    stopListening();
    setLocalTranscript('');
    onClose();
  }, [localTranscript, onConfirm, onClose, stopListening]);

  // Handle Close - stop recording and close
  const handleClose = useCallback(() => {
    stopListening();
    setLocalTranscript('');
    onClose();
  }, [stopListening, onClose]);

  // Handle Reset - stop and clear transcript
  const handleReset = useCallback(() => {
    stopListening();
    setLocalTranscript('');
  }, [stopListening]);

  // Toggle recording
  const handleToggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      setLocalTranscript(''); // Clear before starting new recording
      startListening();
    }
  };

  const getErrorMessage = () => {
    if (!isSupported) return t('voiceModal.error.notSupported');
    if (error === 'no-speech' || error === 'audio-capture') return t('voiceModal.error.noSpeech');
    return t('voiceModal.error.generic');
  };

  // Animation Variants
  const sheetVariants = {
    hidden: { y: "100%" },
    visible: { y: 0, transition: { type: "tween", duration: 0.25, ease: "easeOut" } },
    exit: { y: "100%", transition: { duration: 0.2 } }
  };
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };
  const buttonVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
    exit: { scale: 0.5, opacity: 0, transition: { duration: 0.15 } }
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
          <div className="w-20 h-20 rounded-md bg-md-error-container flex items-center justify-center mb-4">
            <AlertCircle size={40} className="text-md-on-error-container" />
          </div>
          <h3 className="font-bold text-lg text-md-on-surface mb-1">{t('voiceModal.error.title')}</h3>
          <p className="text-sm text-md-on-surface-variant max-w-xs mb-6">{getErrorMessage()}</p>
          {isSupported && (
             <button 
               onClick={() => {
                 setLocalTranscript('');
                 startListening();
               }} 
               className="w-full min-h-12 px-6 py-3 bg-md-secondary-container text-md-on-secondary-container font-medium rounded-lg hover:opacity-90 transition-opacity"
             >
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
        className="w-full h-full flex flex-col justify-between"
      >
        {/* Transcript Area */}
        <div className="mb-4">
          <h3 id="transcript-title" className="text-sm font-semibold text-md-on-surface-variant mb-2 uppercase tracking-wide">
            {t('voiceModal.liveTranscript.title')}
          </h3>
          <div
            aria-labelledby="transcript-title"
            aria-live="polite"
            className="min-h-[6rem] max-h-[8rem] w-full p-4 bg-md-surface-container-highest rounded-lg text-lg text-md-on-surface shadow-inner overflow-y-auto"
            dir="auto"
          >
            {hasTranscript ? (
              localTranscript
            ) : (
              <span className="text-md-on-surface-variant/60 italic">
                {isListening ? '...' : t('voiceModal.liveTranscript.placeholder')}
              </span>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex-shrink-0 flex justify-between items-center py-4">
          {/* Reset Button - Only show if there's transcript */}
          <div className="w-14 h-14">
            <AnimatePresence>
              {hasTranscript && (
                <motion.button
                  variants={buttonVariants}
                  initial="hidden" 
                  animate="visible" 
                  exit="exit"
                  onClick={handleReset}
                  aria-label="Reset recording"
                  className="w-14 h-14 rounded-full flex items-center justify-center bg-md-error-container text-md-on-error-container transition-transform active:scale-90"
                >
                  <X size={24} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          
          {/* Main Mic/Stop Button */}
          <div className="relative">
            {isListening && (
              <div className="absolute inset-[-16px] rounded-full border-4 border-md-error/30 animate-ping" />
            )}
            <button
              onClick={handleToggleRecording}
              aria-label={isListening ? 'Stop recording' : 'Start recording'}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95 hover:shadow-xl
                ${isListening 
                  ? 'bg-md-error-container text-md-on-error-container' 
                  : 'bg-md-primary-container text-md-on-primary-container'
                }
              `}
            >
              {isListening ? <Square size={40} /> : <Mic size={40} />}
            </button>
          </div>

          {/* Confirm Button */}
          <div className="w-14 h-14">
            <AnimatePresence>
              {hasTranscript && !isListening && (
                  <motion.button
                    variants={buttonVariants}
                    initial="hidden" 
                    animate="visible" 
                    exit="exit"
                    onClick={handleConfirm}
                    disabled={!hasTranscript || isListening}
                    aria-label={confirmLabel || t('voiceModal.actions.confirm')}
                    className="w-14 h-14 rounded-full flex items-center justify-center bg-md-primary text-md-on-primary shadow-md transition-transform active:scale-90 disabled:opacity-50"
                  >
                    <Check size={24} />
                  </motion.button>
              )}
            </AnimatePresence>
          </div>
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
            onClick={handleClose}
            className="absolute inset-0 bg-black/60"
          />

          {/* Bottom Sheet */}
          <motion.div
            key="voice-sheet"
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-md-surface-container-high w-full max-w-[430px] rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] z-10"
          >
             {/* Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-1" onClick={handleClose}>
                <div className="w-12 h-1 rounded-md bg-md-on-surface-variant/40"></div>
            </div>

            {/* Header */}
            <header className="w-full flex items-center justify-between px-5 pt-2 pb-2 border-b border-md-outline-variant/30 flex-shrink-0">
              <h2 id="voice-modal-title" className="text-xl font-bold text-md-on-surface">
                {t('voiceModal.title')}
              </h2>
              <button
                onClick={handleClose}
                aria-label={t('voiceModal.actions.close')}
                className="w-9 h-9 flex items-center justify-center rounded-md bg-md-secondary-container text-md-on-secondary-container hover:opacity-80 transition-opacity"
              >
                <X size={18} />
              </button>
            </header>

            {/* Content Container */}
            <main className="flex-1 flex w-full p-5 overflow-y-auto pb-safe">
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