import React from 'react'
import { useAccessibility } from '../context/AccessibilityContext'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useI18n } from '../context/I18nContext'
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import { Mic, Type, Palette, Monitor, RefreshCw } from 'lucide-react'

export default function AccessibilitySettings() {
  const { fontSize, setFontSize, colorMode, setColorMode, ascMode, setAscMode, resetToDefaults } = useAccessibility()
    
    // Voice Input toggle logic
    const voiceInputEnabled = typeof ascMode === 'string' && ascMode.includes('voiceInput')
    const handleVoiceInputToggle = () => {
      if (voiceInputEnabled) {
        setAscMode((ascMode || '').replace('voiceInput', '').replace(/\s+/g, ' ').trim())
      } else {
        setAscMode(((ascMode ? ascMode + ' ' : '') + 'voiceInput').replace(/\s+/g, ' ').trim())
      }
    }
    
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()
  const navigate = useNavigate()

  const fontSizes = [
    { id: 'small', label: t('accessibility.fontSize.options.small'), size: 'text-sm' },
    { id: 'normal', label: t('accessibility.fontSize.options.normal'), size: 'text-base' },
    { id: 'large', label: t('accessibility.fontSize.options.large'), size: 'text-lg' },
    { id: 'xlarge', label: t('accessibility.fontSize.options.xlarge'), size: 'text-xl' }
  ]

  const colorModes = [
    { id: 'default', label: t('accessibility.colorMode.options.default.label'), desc: t('accessibility.colorMode.options.default.description') },
    { id: 'highContrast', label: t('accessibility.colorMode.options.highContrast.label'), desc: t('accessibility.colorMode.options.highContrast.description') },
    { id: 'deuteranopia', label: t('accessibility.colorMode.options.deuteranopia.label'), desc: t('accessibility.colorMode.options.deuteranopia.description') },
    { id: 'protanopia', label: t('accessibility.colorMode.options.protanopia.label'), desc: t('accessibility.colorMode.options.protanopia.description') },
    { id: 'tritanopia', label: t('accessibility.colorMode.options.tritanopia.label'), desc: t('accessibility.colorMode.options.tritanopia.description') }
  ]

  // Shared class for selection buttons
  const getButtonClass = (isSelected) => `
    w-full rounded-md transition-all duration-200 border
    ${isSelected 
        ? 'bg-md-secondary-container border-md-primary text-md-on-secondary-container shadow-sm' 
        : 'bg-md-surface-container-high border-transparent text-md-on-surface hover:bg-md-surface-container-highest'
    }
  `;

  return (
    <Layout header={<HeaderWithName title={t('accessibility.header.title')} to={-1} />}>
      <div className="min-h-screen bg-md-surface">
        {/* Content */}
        <div className="max-w-[430px] mx-auto p-4 space-y-6">

          {/* Voice Input Mode Toggle */}
          <div className="bg-md-surface-container rounded-md p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <Mic size={20} className="text-md-primary" />
                <h2 className="text-lg font-bold text-md-on-surface">
                {t('accessibility.voiceInput.title') || 'Voice Input'}
                </h2>
            </div>
            <p className="text-sm text-md-on-surface-variant mb-4 leading-relaxed">
              {t('accessibility.voiceInput.description') || 'Enable voice input features for text fields.'}
            </p>
            <button
              onClick={handleVoiceInputToggle}
              className={`min-h-[48px] px-4 py-3 font-medium ${getButtonClass(voiceInputEnabled)}`}
              aria-pressed={voiceInputEnabled}
            >
              {voiceInputEnabled ? (t('accessibility.voiceInput.enabled') || 'Voice Input Enabled') : (t('accessibility.voiceInput.disabled') || 'Voice Input Disabled')}
            </button>
          </div>

          {/* Font Size Section */}
          <div className="bg-md-surface-container rounded-md p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <Type size={20} className="text-md-primary" />
                <h2 className="text-lg font-bold text-md-on-surface">
                {t('accessibility.fontSize.title')}
                </h2>
            </div>
            <p className="text-sm text-md-on-surface-variant mb-4 leading-relaxed">
              {t('accessibility.fontSize.description')}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {fontSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setFontSize(size.id)}
                  className={`min-h-[64px] px-4 py-3 font-medium flex items-center justify-center ${getButtonClass(fontSize === size.id)}`}
                >
                  <div className={size.size}>{size.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Section */}
          <div className="bg-md-surface-container rounded-md p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <Monitor size={20} className="text-md-primary" />
                <h2 className="text-lg font-bold text-md-on-surface">
                {t('accessibility.theme.title')}
                </h2>
            </div>
            <p className="text-sm text-md-on-surface-variant mb-4 leading-relaxed">
              {t('accessibility.theme.description')}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`min-h-[64px] px-4 py-3 font-medium flex items-center justify-center ${getButtonClass(theme === 'light')}`}
              >
                {t('accessibility.theme.options.light')}
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`min-h-[64px] px-4 py-3 font-medium flex items-center justify-center ${getButtonClass(theme === 'dark')}`}
              >
                {t('accessibility.theme.options.dark')}
              </button>
            </div>
          </div>

          {/* Color Mode Section */}
          <div className="bg-md-surface-container rounded-md p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <Palette size={20} className="text-md-primary" />
                <h2 className="text-lg font-bold text-md-on-surface">
                {t('accessibility.colorMode.title')}
                </h2>
            </div>
            <p className="text-sm text-md-on-surface-variant mb-4 leading-relaxed">
              {t('accessibility.colorMode.description')}
            </p>

            <div className="space-y-3">
              {colorModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setColorMode(mode.id)}
                  className={`min-h-[64px] px-4 py-3 text-left ${getButtonClass(colorMode === mode.id)}`}
                >
                  <div className="font-bold mb-1 flex justify-between items-center">
                    {mode.label}
                    {colorMode === mode.id && (
                      <span className="text-md-primary font-bold">✓</span>
                    )}
                  </div>
                  <div className={`text-xs ${colorMode === mode.id ? 'text-md-on-secondary-container/80' : 'text-md-on-surface-variant'}`}>
                    {mode.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-md-surface-container rounded-md p-5 shadow-sm">
            <h2 className="text-lg font-bold text-md-on-surface mb-4">
              {t('accessibility.preview.title')}
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-md-surface border border-md-outline-variant rounded-md">
                <p className="text-md-on-surface font-medium mb-2">
                  {t('accessibility.preview.mainText')}
                </p>
                <p className="text-sm text-md-on-surface-variant">
                  {t('accessibility.preview.secondaryText')}
                </p>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 min-h-[48px] px-4 py-3 bg-md-primary text-md-on-primary font-bold rounded-md shadow-sm">
                  {t('accessibility.preview.primaryButton')}
                </button>
                {/* Success Button: Custom style since MD3 doesn't have a distinct 'success' role in core palette, using a green mix */}
                <button className="flex-1 min-h-[48px] px-4 py-3 bg-green-700 text-white font-bold rounded-md shadow-sm dark:bg-green-800">
                  {t('accessibility.preview.successButton')}
                </button>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetToDefaults}
            className="w-full min-h-[48px] px-6 py-3 bg-md-secondary-container text-md-on-secondary-container font-medium rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            {t('accessibility.actions.reset')}
          </button>

          {/* Info Note */}
          <div className="text-center text-xs text-md-on-surface-variant/70 space-y-1 pb-4">
            <p>{t('accessibility.footer.autoSaveNote')}</p>
            <p>{t('accessibility.footer.globalApplyNote')}</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}