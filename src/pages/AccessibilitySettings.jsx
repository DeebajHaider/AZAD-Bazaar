import React from 'react'
import { useAccessibility } from '../context/AccessibilityContext'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext' // added import
import { useI18n } from '../context/I18nContext'
import { Layout } from '../Layout' // import Layout for consistent page structure
import HeaderWithName from '../component/HeaderWithName'

export default function AccessibilitySettings() {
  const { fontSize, setFontSize, colorMode, setColorMode, ascMode, setAscMode, resetToDefaults } = useAccessibility()
    // Voice Input toggle logic
    const voiceInputEnabled = typeof ascMode === 'string' && ascMode.includes('voiceInput')
    const handleVoiceInputToggle = () => {
      console.log('Toggling Voice Input From AccessibilitySettings. Currently enabled:', voiceInputEnabled)
      if (voiceInputEnabled) {
        // Remove 'voiceInput' from ascMode string
        setAscMode((ascMode || '').replace('voiceInput', '').replace(/\s+/g, ' ').trim())
        console.log('Voice Input Disabled')
      } else {
        setAscMode(((ascMode ? ascMode + ' ' : '') + 'voiceInput').replace(/\s+/g, ' ').trim())
        console.log('Voice Input Enabled')
      }
    }
  const { theme, setTheme } = useTheme() // use ThemeContext
  const { t } = useI18n()
  const navigate = useNavigate()

  const fontSizes = [
    { id: 'small', label: t('accessibility.fontSize.options.small'), size: 'text-sm' },
    { id: 'normal', label: t('accessibility.fontSize.options.normal'), size: 'text-base' },
    { id: 'large', label: t('accessibility.fontSize.options.large'), size: 'text-lg' },
    { id: 'xlarge', label: t('accessibility.fontSize.options.xlarge'), size: 'text-xl' }
  ]

  // use the locale keys for option labels/descriptions
  const colorModes = [
    { id: 'default', label: t('accessibility.colorMode.options.default.label'), desc: t('accessibility.colorMode.options.default.description') },
    { id: 'highContrast', label: t('accessibility.colorMode.options.highContrast.label'), desc: t('accessibility.colorMode.options.highContrast.description') },
    { id: 'deuteranopia', label: t('accessibility.colorMode.options.deuteranopia.label'), desc: t('accessibility.colorMode.options.deuteranopia.description') },
    { id: 'protanopia', label: t('accessibility.colorMode.options.protanopia.label'), desc: t('accessibility.colorMode.options.protanopia.description') },
    { id: 'tritanopia', label: t('accessibility.colorMode.options.tritanopia.label'), desc: t('accessibility.colorMode.options.tritanopia.description') }
  ]

  return (
    <Layout header={<HeaderWithName title={t('accessibility.header.title')} to={-1} />}>
      <div className="min-h-screen primBg">
        {/* Content */}
        <div className="max-w-[430px] mx-auto p-4 space-y-6">

          {/* Voice Input Mode Toggle */}
          <div className="secBg primBorder rounded-xl p-5">
            <h2 className="text-lg font-semibold primText mb-2">
              {t('accessibility.voiceInput.title') || 'Voice Input'}
            </h2>
            <p className="text-sm secText mb-4">
              {t('accessibility.voiceInput.description') || 'Enable voice input features for text fields.'}
            </p>
            <button
              onClick={handleVoiceInputToggle}
              className={`w-full min-h-12 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${voiceInputEnabled ? 'modeChooseButton-selected' : 'modeChooseButton-unselected'}`}
              aria-pressed={voiceInputEnabled}
            >
              {voiceInputEnabled ? (t('accessibility.voiceInput.enabled') || 'Voice Input Enabled') : (t('accessibility.voiceInput.disabled') || 'Voice Input Disabled')}
            </button>
          </div>

          {/* Font Size Section */}
          <div className="secBg primBorder rounded-xl p-5">
            <h2 className="text-lg font-semibold primText  mb-2">
              {t('accessibility.fontSize.title')}
            </h2>
            <p className="text-sm secText mb-4">
              {t('accessibility.fontSize.description')}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {fontSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setFontSize(size.id)}
                  className={`min-h-16 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${fontSize === size.id
                    ? 'modeChooseButton-selected'
                    : 'modeChooseButton-unselected'
                    }`}
                >
                  <div className={size.size}>{size.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Section: inserted directly after Font Size */}
          <div className="secBg primBorder rounded-xl p-5">
            <h2 className="text-lg font-semibold primText  mb-2">
              {t('accessibility.theme.title')}
            </h2>
            <p className="text-sm secText mb-4">
              {t('accessibility.theme.description')}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`min-h-16 px-4 py-3 rounded-lg  font-medium transition-all duration-200 ${theme === 'light'
                  ? 'modeChooseButton-selected'
                  : 'modeChooseButton-unselected'
                  }`}
              >
                {t('accessibility.theme.options.light')}
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`min-h-16 px-4 py-3 rounded-lg  font-medium transition-all duration-200 ${theme === 'dark'
                  ? 'modeChooseButton-selected'
                  : 'modeChooseButton-unselected'
                  }`}
              >
                {t('accessibility.theme.options.dark')}
              </button>
            </div>
          </div>

          {/* Color Mode Section */}
          <div className="secBg primBorder rounded-xl p-5">
            <h2 className="text-lg font-semibold primText  mb-2">
              {t('accessibility.colorMode.title')}
            </h2>
            <p className="text-sm secText mb-4">
              {t('accessibility.colorMode.description')}
            </p>

            <div className="space-y-2">
              {colorModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setColorMode(mode.id)}
                  className={`w-full min-h-16 px-4 py-3 rounded-lg  text-left transition-all duration-200 ${colorMode === mode.id
                    ? 'modeChooseButton-selected'
                    : 'modeChooseButton-unselected'
                    }`}
                >
                  <div className="font-medium primText  mb-1">
                    {mode.label}
                    {colorMode === mode.id && (
                      <span className="ml-2 accentPrimText">✓</span>
                    )}
                  </div>
                  <div className="text-xs secText">
                    {mode.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Section */}
          <div className="secBg primBorder rounded-xl p-5">
            <h2 className="text-lg font-semibold primText  mb-4">
              {t('accessibility.preview.title')}
            </h2>

            <div className="space-y-3">
              <div className="p-4 primBg primBorder rounded-lg">
                <p className="primText  mb-2">
                  {t('accessibility.preview.mainText')}
                </p>
                <p className="text-sm secText">
                  {t('accessibility.preview.secondaryText')}
                </p>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 min-h-12 px-4 py-3 btnPrimary rounded-lg transition-all duration-200">
                  {t('accessibility.preview.primaryButton')}
                </button>
                <button className="flex-1 min-h-12 px-4 py-3 btnSuccess rounded-lg transition-all duration-200">
                  {t('accessibility.preview.successButton')}
                </button>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetToDefaults}
            className="w-full min-h-12 px-6 py-3 btnSecondary rounded-lg transition-all duration-200"
          >
            {t('accessibility.actions.reset')}
          </button>

          {/* Info Note */}
          <div className="text-center text-xs secText space-y-1">
            <p>{t('accessibility.footer.autoSaveNote')}</p>
            <p>{t('accessibility.footer.globalApplyNote')}</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}