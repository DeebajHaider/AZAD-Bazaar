import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Eye, Ear, Check, Volume2 } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useI18n } from '../context/I18nContext';
import { useTTS } from '../context/TTSContext';
import { Layout } from '../Layout';
import HeaderWithName from '../component/HeaderWithName';

// --- Sub-component: Selectable Mode Card ---
const ModeOption = ({ id, isSelected, title, description, icon: Icon, accentColorClass, onClick }) => (
  <button
    onClick={() => onClick(id)}
    // Card Style: Surface Container (Base), Primary Container (Selected)
    className={`w-full flex flex-row items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 border-2 group
      ${isSelected 
        ? 'bg-md-primary-container border-md-primary text-md-on-primary-container shadow-md' 
        : 'bg-md-surface-container border-transparent hover:bg-md-surface-container-high hover:shadow-sm text-md-on-surface'
      }
    `}
    aria-pressed={isSelected}
  >
    {/* Icon Container */}
    <div className={`
      w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
      ${isSelected ? 'bg-md-background text-md-primary' : 'bg-md-surface-container-highest text-md-on-surface-variant'}
    `}>
      <Icon 
        size={28} 
        // Use the accent color class if not selected to distinguish modes, 
        // but if selected, force Primary color to match the container theme.
        className={isSelected ? 'text-md-primary' : accentColorClass} 
      />
    </div>

    {/* Text Content */}
    <div className="flex-1">
      <h3 className="text-lg font-bold mb-1">
        {title}
      </h3>
      <p className={`text-sm leading-tight ${isSelected ? 'text-md-on-primary-container/80' : 'text-md-on-surface-variant'}`}>
        {description}
      </p>
    </div>

    {/* Selection Indicator */}
    <div className={`
      w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all
      ${isSelected 
        ? 'bg-md-primary border-md-primary text-md-on-primary' 
        : 'border-md-outline-variant bg-transparent'}
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

  const [selectedMode, setSelectedMode] = useState(() => {
    if (!ascMode || ascMode === 'standard') return 'standard';
    if (ascMode.includes('highContrast')) return 'highContrast';
    if (ascMode.includes('illiterate')) return 'illiterate';
    return 'standard';
  });

  React.useEffect(() => {
    if (selectedMode === 'highContrast') {
      if (colorMode !== 'highContrast') setColorMode('highContrast');
      if (fontSize !== 'large') setFontSize('large');
    }
  }, [selectedMode, setColorMode, setFontSize, colorMode, fontSize]);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakingRef = useRef(false);

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
    const introText = t('tts.modeSelection.intro') || "Please select your display mode.";
    speakWithIndicator(introText);
    
    return () => {
      stop();
      setIsSpeaking(false);
    };
    // eslint-disable-next-line
  }, []);

  const handleModeChange = (id) => {
    setSelectedMode(id);
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
    
    let ttsKey = '';
    if (id === 'standard') ttsKey = 'tts.modeSelection.option1';
    else if (id === 'highContrast') ttsKey = 'tts.modeSelection.option2';
    else if (id === 'illiterate') ttsKey = 'tts.modeSelection.option3';
    const label = t(ttsKey);
    speakWithIndicator(label);
  };

  const handleConfirm = () => {
    navigate('/theme-selection');
  };

  // --- Footer Component ---
  const ConfirmFooter = () => (
    <div className="bg-md-surface border-t border-md-outline-variant p-4 pb-6">
      <button
        onClick={handleConfirm}
        className="w-full min-h-[56px] px-6 py-4 bg-md-primary text-md-on-primary font-bold rounded-xl text-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
      {/* Speaking Indicator: Primary Color */}
      {isSpeaking && (
        <div className="fixed top-20 right-4 z-50 pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-md-primary text-md-on-primary shadow-lg animate-pulse">
            <Volume2 size={18} />
            <span className="text-xs font-bold">Speaking...</span>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto bg-md-surface h-full">
        <div className="max-w-[430px] mx-auto p-4 space-y-6">
          
          <div className="text-center space-y-2 py-4">
            <h2 className="text-xl font-bold text-md-on-surface">
              {t('modeSelection.heading') || 'How should the app look?'}
            </h2>
            <p className="text-sm text-md-on-surface-variant">
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
              accentColorClass="text-md-primary" // Use theme color
            />

            {/* 2. Assisted (High Contrast) */}
            <ModeOption 
              id="highContrast"
              isSelected={selectedMode === 'highContrast'}
              onClick={handleModeChange}
              title={t('modeSelection.assistance.title', 'Visual Assistance')}
              description={t('modeSelection.assistance.description', 'High contrast colors and larger text.')}
              icon={Eye}
              // Using a semantic color (e.g. Tertiary or Success-like) if available, 
              // or just keep explicit classes if they map to your specific accessible palette.
              accentColorClass="text-green-700 dark:text-green-300" 
            />

            {/* 3. Illiterate (Audio Guided) */}
            <ModeOption 
              id="illiterate"
              isSelected={selectedMode === 'illiterate'}
              onClick={handleModeChange}
              title={t('modeSelection.illiterate.title', 'Audio Guided')}
              description={t('modeSelection.illiterate.description', 'Enables voice commands and voice readout.')}
              icon={Ear}
              accentColorClass="text-md-tertiary" // Use Tertiary role
            />
          </div>

        </div>
      </main>
    </Layout>
  );
}