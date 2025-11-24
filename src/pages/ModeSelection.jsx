import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Eye, Ear, Check, Volume2 } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useI18n } from '../context/I18nContext';
import { useTTS } from '../context/TTSContext';
import { Layout } from '../Layout';
import HeaderWithName from '../component/HeaderWithName';

// --- Sub-component: Selectable Mode Card ---
const ModeOption = ({ id, isSelected, title, description, icon: Icon, accentClass, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex flex-row items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 border-2 group
      ${isSelected ? 'modeChooseButton-selected shadow-md' : 'modeChooseButton-unselected shadow-sm'}
    `}
    aria-pressed={isSelected}
  >
    {/* Icon Container */}
    <div className={`
      w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
      ${isSelected ? 'bg-white dark:bg-black' : 'secBg'}
    `}>
      <Icon 
        size={28} 
        className={isSelected ? accentClass : 'secText group-hover:text-gray-900 dark:group-hover:text-gray-100'} 
      />
    </div>

    {/* Text Content */}
    <div className="flex-1">
      <h3 className={`text-lg font-bold mb-1 ${isSelected ? 'text-inherit' : 'primText'}`}>
        {title}
      </h3>
      <p className={`text-sm leading-tight ${isSelected ? 'text-inherit opacity-90' : 'secText'}`}>
        {description}
      </p>
    </div>

    {/* Selection Indicator (Checkmark) */}
    <div className={`
      w-6 h-6 rounded-full flex items-center justify-center border-2
      ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 dark:border-slate-600 bg-transparent'}
    `}>
      {isSelected && <Check size={14} strokeWidth={3} />}
    </div>
  </button>
);

export default function ModeSelection() {
  const { ascMode, setAscMode, setColorMode, setFontSize, colorMode, fontSize } = useAccessibility();
  const { t } = useI18n();
  const { speakText, stop } = useTTS();
  const navigate = useNavigate();

  // Local state to track selection before confirming
  // We initialize based on current context, defaulting to 'standard'
  const [selectedMode, setSelectedMode] = useState(() => {
    if (!ascMode || ascMode === 'standard') return 'standard';
    if (ascMode.includes('highContrast')) return 'highContrast';
    if (ascMode.includes('illiterate')) return 'illiterate';
    return 'standard';
  });

  // Ensure colorMode and fontSize are set correctly on mount for highContrast
  React.useEffect(() => {
    if (selectedMode === 'highContrast') {
      if (colorMode !== 'highContrast') setColorMode('highContrast');
      if (fontSize !== 'large') setFontSize('large');
    }
  }, [selectedMode, setColorMode, setFontSize, colorMode, fontSize]);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakingRef = useRef(false);

  // --- TTS Logic ---
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
    // Read instructions on mount
    const introText = t('tts.modeSelection.intro') || "Please select your display mode.";
    speakWithIndicator(introText);
    
    return () => {
      stop();
      setIsSpeaking(false);
    };
    // eslint-disable-next-line
  }, []);

  // --- Handlers ---
  const handleModeChange = (id) => {
    setSelectedMode(id);
    // Always update context state, even if re-selecting same mode
    if (id === 'illiterate') {
      setAscMode('illiterate voiceInput');
      setFontSize('normal');
      setColorMode('default');
    } else if (id === 'highContrast') {
      setAscMode('highContrast');
      setColorMode('highContrast');
      setFontSize('large');
    } else {
      setColorMode('default');
      setAscMode('standard');
      setFontSize('normal');
    }
    // Speak the translated TTS label for the selected mode
    let ttsKey = '';
    if (id === 'standard') ttsKey = 'tts.modeSelection.option1';
    else if (id === 'highContrast') ttsKey = 'tts.modeSelection.option2';
    else if (id === 'illiterate') ttsKey = 'tts.modeSelection.option3';
    const label = t(ttsKey);
    speakWithIndicator(label);
  };

  const handleConfirm = () => {
    navigate('/login'); // Navigate to next screen
  };

  // --- Footer Component ---
  const ConfirmFooter = () => (
    <div className="secBg dividerBorder border-t p-4 pb-6">
      <button
        onClick={handleConfirm}
        className="w-full min-h-12 px-6 py-4 btnPrimary rounded-xl text-lg shadow-lg flex items-center justify-center gap-2"
      >
        <span>{t('common.confirm') || 'Confirm & Continue'}</span>
      </button>
    </div>
  );

  return (
    <Layout
      header={<HeaderWithName title={t('modeSelection.title', 'Select View')} to={-1} />}
      footer={<ConfirmFooter />}
    >
      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="fixed top-20 right-4 z-50 pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 text-white shadow-lg animate-pulse">
            <Volume2 size={18} />
            <span className="text-xs font-bold">Speaking...</span>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto primBg h-full">
        <div className="max-w-[430px] mx-auto p-4 space-y-6">
          
          <div className="text-center space-y-2 py-2">
            <h2 className="text-xl font-bold primText">
              {t('modeSelection.heading') || 'How should the app look?'}
            </h2>
            <p className="text-sm secText">
              {t('modeSelection.subHeading') || 'Choose the experience that works best for you.'}
            </p>
          </div>

          <div className="space-y-4">
            {/* 1. Normal Mode */}
            <ModeOption 
              id="standard"
              isSelected={selectedMode === 'standard'}
              onClick={handleModeChange}
              title={t('modeSelection.normal.title', 'Normal Mode')}
              description={t('modeSelection.normal.description', 'Default layout and colors.')}
              icon={User}
              accentClass="text-blue-600 dark:text-blue-400"
            />

            {/* 2. Assisted (High Contrast) */}
            <ModeOption 
              id="highContrast"
              isSelected={selectedMode === 'highContrast'}
              onClick={handleModeChange}
              title={t('modeSelection.assistance.title', 'Visual Assistance')}
              description={t('modeSelection.assistance.description', 'High contrast colors and larger text.')}
              icon={Eye}
              accentClass="text-green-600 dark:text-green-400"
            />

            {/* 3. Illiterate (Audio Guided) */}
            <ModeOption 
              id="illiterate"
              isSelected={selectedMode === 'illiterate'}
              onClick={handleModeChange}
              title={t('modeSelection.illiterate.title', 'Audio Guided')}
              description={t('modeSelection.illiterate.description', 'Enables voice commands and voice readout.')}
              icon={Ear}
              accentClass="text-amber-600 dark:text-amber-400"
            />
          </div>

        </div>
      </main>
    </Layout>
  );
}