import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Accessibility, Mic, Ear } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useI18n } from '../context/I18nContext';
import { useTTS } from '../context/TTSContext';
import { Layout } from '../Layout';
import HeaderWithName from '../component/HeaderWithName';

// A reusable, styled button component for this specific page
const ModeButton = ({ title, description, icon, accentClass, onClick, ariaLabel }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className="flex-1 w-full secBg primBorder rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-200 secHoverBg focusRing active:scale-[0.98] shadow-sm"
  >
    {/* Large, accented icon container */}
    <div className={`w-24 h-24 mb-5 flex items-center justify-center ${accentClass}`}>
      {icon}
    </div>
    {/* Big, bold title */}
    <h2 className="text-3xl font-bold primText mb-2">
      {title}
    </h2>
    {/* Clear, concise description */}
    <p className="text-base secText max-w-xs">
      {description}
    </p>
  </button>
);

export default function ModeSelection() {
  const { setAscMode } = useAccessibility();
  const { t } = useI18n();
  const { speakText, stop } = useTTS();
  const navigate = useNavigate();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakingRef = useRef(false);

  // Prepare translations and ARIA labels
  const normalTitle = t('modeSelection.normal.title', 'I am completely normal');
  const normalDesc = t('modeSelection.normal.description', 'Standard app experience with default settings.');
  const assistedTitle = t('modeSelection.assistance.title', 'I need assistance');
  const assistedDesc = t('modeSelection.assistance.description', 'Larger text, higher contrast, and simplified controls.');
  const illiterateTitle = t('modeSelection.illiterate.title', 'I am completely illiterate');
  const illiterateDesc = t('modeSelection.illiterate.description', 'Voice-guided navigation with audio feedback.');

  // TTS: Use i18n keys for intro and concise option descriptions
  const ttsIntro = t('tts.modeSelection.intro');
  const ttsStrings = [
    t('tts.modeSelection.option1'),
    t('tts.modeSelection.option2'),
    t('tts.modeSelection.option3')
  ];

  // Helper to handle speaking with indicator, sequential and cancel previous
  const speakWithIndicator = async (text, options = {}) => {
    setIsSpeaking(true);
    speakingRef.current = true;
    try {
      await stop(); // Cancel any current speech before starting new
      await speakText(text, options);
    } finally {
      setIsSpeaking(false);
      speakingRef.current = false;
    }
  };

  // On mount: announce intro, then all 3 options sequentially
  useEffect(() => {
    let cancelled = false;
    const playAll = async () => {
      await speakWithIndicator(ttsIntro);
      if (cancelled) return;
      for (let i = 0; i < ttsStrings.length; i++) {
        await speakWithIndicator(ttsStrings[i]);
        if (cancelled) return;
      }
    };
    playAll();
    return () => {
      cancelled = true;
      stop();
      setIsSpeaking(false);
      speakingRef.current = false;
    };
    // eslint-disable-next-line
  }, [ttsIntro, ttsStrings[0], ttsStrings[1], ttsStrings[2]]);

  // Handler for mode selection: no TTS on click
  const handleModeSelect = (mode) => {
    setAscMode(mode);
    navigate('/login');
  };

  return (
    <Layout
      header={
        <HeaderWithName
          title={t('modeSelection.title', 'Choose Your Experience')}
          to={-1}
        />
      }
    >
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute top-4 right-4 z-50">
          <span className="inline-block w-4 h-4 rounded-full bg-blue-500 animate-pulse border-2 border-white shadow"></span>
        </div>
      )}
      {/* Main container for the mode selection page */}
      <main className="flex-1 flex overflow-y-auto primBg min-h-full">
        <div className="p-4 space-y-6 flex flex-col flex-1">
          {/* Main Selection Area: 3 Full-width buttons */}
          <div className="flex flex-col gap-4 flex-1">
            <ModeButton
              title={normalTitle}
              description={normalDesc}
              ariaLabel={`${normalTitle}. ${normalDesc}`}
              icon={<User size={64} strokeWidth={1.5} />}
              accentClass="accentPrimText"
              onClick={() => handleModeSelect('standard')}
            />
            <ModeButton
              title={assistedTitle}
              description={assistedDesc}
              ariaLabel={`${assistedTitle}. ${assistedDesc}`}
              icon={<Accessibility size={64} strokeWidth={1.5} />}
              accentClass="accentSuccessText"
              onClick={() => handleModeSelect('assisted')}
            />
            <ModeButton
              title={illiterateTitle}
              description={illiterateDesc}
              ariaLabel={`${illiterateTitle}. ${illiterateDesc}`}
              icon={
                <div className="flex items-center gap-2">
                  <Ear size={56} strokeWidth={1.5} />
                  <Mic size={56} strokeWidth={1.5} />
                </div>
              }
              accentClass="accentWarningText"
              onClick={() => handleModeSelect('illiterate')}
            />
          </div>
        </div>
      </main>
    </Layout>
  );
}