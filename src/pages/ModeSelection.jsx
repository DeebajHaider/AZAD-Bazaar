import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Accessibility, Mic, Ear, Volume2 } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useI18n } from '../context/I18nContext';
import { useTTS } from '../context/TTSContext';
import { Layout } from '../Layout';
import HeaderWithName from '../component/HeaderWithName';

// Reusable Mode Option Card
const ModeButton = ({ title, description, icon, accentTextClass, onClick, ariaLabel }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className="group flex-1 w-full card flex flex-col items-center justify-center text-center transition-all duration-200 secHoverBg focusRing relative overflow-hidden"
  >
    {/* Decorative background circle for icon (subtle) */}
    <div className="mb-4 p-4 rounded-full primBg primBorder group-hover:scale-110 transition-transform duration-300">
      <div className={`${accentTextClass}`}>
        {icon}
      </div>
    </div>
    
    <h2 className="text-xl font-bold primText mb-2">
      {title}
    </h2>
    
    <p className="text-sm secText max-w-[85%] leading-relaxed">
      {description}
    </p>

    {/* Chevron/Arrow visual cue could go here, but kept clean for high contrast/focus */}
  </button>
);

export default function ModeSelection() {
  const { ascMode, setAscMode } = useAccessibility();
  const { t } = useI18n();
  const { speakText, stop } = useTTS();
  const navigate = useNavigate();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakingRef = useRef(false);

  // Logic for Voice Input Toggle
  const voiceInputEnabled = typeof ascMode === 'string' && ascMode.includes('voiceInput');
  const handleVoiceInputToggle = () => {
    console.log('Toggling Voice Input From ModeSelection.  Currently enabled:', voiceInputEnabled);
    if (voiceInputEnabled) {
      setAscMode((ascMode || '').replace('voiceInput', '').replace(/\s+/g, ' ').trim());
      console.log('Voice Input Disabled');
    } else {
      setAscMode(((ascMode ? ascMode + ' ' : '') + 'voiceInput').replace(/\s+/g, ' ').trim());
      console.log('Voice Input Enabled');
    }
  };

  // Translations
  const normalTitle = t('modeSelection.normal.title', 'Normal Mode');
  const normalDesc = t('modeSelection.normal.description', 'Standard text size and layout.');
  
  const assistedTitle = t('modeSelection.assistance.title', 'Assisted Mode');
  const assistedDesc = t('modeSelection.assistance.description', 'High contrast, larger text & buttons.');
  
  const illiterateTitle = t('modeSelection.illiterate.title', 'Audio Guided');
  const illiterateDesc = t('modeSelection.illiterate.description', 'Full voice navigation support.');

  // TTS Setup
  const ttsIntro = t('tts.modeSelection.intro');
  const ttsStrings = [
    t('tts.modeSelection.option1'),
    t('tts.modeSelection.option2'),
    t('tts.modeSelection.option3')
  ];

  const speakWithIndicator = async (text, options = {}) => {
    setIsSpeaking(true);
    speakingRef.current = true;
    try {
      await stop(); 
      await speakText(text, options);
    } finally {
      setIsSpeaking(false);
      speakingRef.current = false;
    }
  };

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
  }, [ttsIntro]);

  const handleModeSelect = (mode) => {
    // Preserve 'voiceInput' if present in ascMode
    let newAscMode = mode;
    if (typeof ascMode === 'string' && ascMode.includes('voiceInput')) {
      newAscMode = `${mode} voiceInput`.replace(/\s+/g, ' ').trim();
    }
    setAscMode(newAscMode);
    navigate('/login');
  };

  return (
    <Layout
      header={
        <HeaderWithName
          title={t('modeSelection.title', 'Select Mode')}
          to={-1}
        />
      }
    >
      {/* Speaking Indicator - using semantic colors */}
      {isSpeaking && (
        <div className="absolute top-4 right-4 z-50 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full card shadow-md animate-pulse">
            <Volume2 size={16} className="accentPrimText" />
            <span className="text-xs font-medium accentPrimText">Speaking...</span>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden primBg">
        <div className="flex-1 flex flex-col max-w-[430px] mx-auto w-full p-4 gap-4">
          
          {/* Voice Input Section - Styled as a settings pill */}
          <div className="card flex flex-row items-center justify-between gap-4 p-4 shadow-sm shrink-0">
            <div className="flex-1">
              <h2 className="text-base font-semibold primText">
                {t('accessibility.voiceInput.title') || 'Voice Input'}
              </h2>
              <p className="text-xs secText">
                {t('accessibility.voiceInput.description') || 'Enable microphone support'}
              </p>
            </div>
            <button
              onClick={handleVoiceInputToggle}
              className={`h-12 px-6 rounded-lg font-bold text-sm transition-all duration-200 border-2 ${
                voiceInputEnabled 
                  ? 'modeChooseButton-selected' 
                  : 'modeChooseButton-unselected'
              }`}
              aria-pressed={voiceInputEnabled}
            >
              {voiceInputEnabled 
                ? (t('common.on') || 'ON') 
                : (t('common.off') || 'OFF')
              }
            </button>
          </div>

          {/* Divider with label */}
          <div className="text-center relative py-2 shrink-0">
            <span className="secText text-sm bg-transparent px-2 font-medium">
              {t('modeSelection.chooseLabel', 'Choose your view')}
            </span>
          </div>

          {/* Main Options - Flex-1 to fill remaining vertical space equally */}
          <div className="flex-1 flex flex-col gap-3 pb-4 min-h-0">
            <ModeButton
              title={normalTitle}
              description={normalDesc}
              ariaLabel={`${normalTitle}. ${normalDesc}`}
              icon={<User size={48} strokeWidth={1.5} />}
              accentTextClass="accentPrimText"
              onClick={() => handleModeSelect('standard')}
            />
            
            <ModeButton
              title={assistedTitle}
              description={assistedDesc}
              ariaLabel={`${assistedTitle}. ${assistedDesc}`}
              icon={<Accessibility size={48} strokeWidth={1.5} />}
              accentTextClass="accentSuccessText"
              onClick={() => handleModeSelect('assisted')}
            />
            
            <ModeButton
              title={illiterateTitle}
              description={illiterateDesc}
              ariaLabel={`${illiterateTitle}. ${illiterateDesc}`}
              icon={
                <div className="flex items-center gap-1">
                  <Ear size={40} strokeWidth={1.5} />
                  <Mic size={32} strokeWidth={1.5} className="opacity-80" />
                </div>
              }
              accentTextClass="accentWarningText"
              onClick={() => handleModeSelect('illiterate')}
            />
          </div>
        </div>
      </main>
    </Layout>
  );
}