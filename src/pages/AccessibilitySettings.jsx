import React from 'react'
import { useAccessibility } from '../context/AccessibilityContext'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext' // added import
import { useI18n } from '../context/I18nContext'
import { Layout } from '../Layout' // import Layout for consistent page structure
import HeaderWithName from '../component/HeaderWithName'

export default function AccessibilitySettings() {
  const { fontSize, setFontSize, colorMode, setColorMode, resetToDefaults } = useAccessibility()
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
    <Layout header={<HeaderWithName title={t('accessibility.header.title')} to="/settings" />}>
      <div className="min-h-screen bg-white dark:bg-slate-950">
        {/* Content */}
        <div className="max-w-[430px] mx-auto p-4 space-y-6">

          {/* Font Size Section */}
          <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-50 mb-2">
              {t('accessibility.fontSize.title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              {t('accessibility.fontSize.description')}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {fontSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setFontSize(size.id)}
                  className={`min-h-16 px-4 py-3 rounded-lg border-2 font-medium transition-all duration-200 ${fontSize === size.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50 hover:border-gray-300 dark:hover:border-slate-700'
                    }`}
                >
                  <div className={size.size}>{size.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Section: inserted directly after Font Size */}
          <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-50 mb-2">
              {t('accessibility.theme.title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              {t('accessibility.theme.description')}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`min-h-16 px-4 py-3 rounded-lg border-2 font-medium transition-all duration-200 ${theme === 'light'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                  }`}
              >
                {t('accessibility.theme.options.light')}
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`min-h-16 px-4 py-3 rounded-lg border-2 font-medium transition-all duration-200 ${theme === 'dark'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50 hover:border-gray-300 dark:hover:border-slate-700'
                  }`}
              >
                {t('accessibility.theme.options.dark')}
              </button>
            </div>
          </div>

          {/* Color Mode Section */}
          <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-50 mb-2">
              {t('accessibility.colorMode.title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              {t('accessibility.colorMode.description')}
            </p>

            <div className="space-y-2">
              {colorModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setColorMode(mode.id)}
                  className={`w-full min-h-16 px-4 py-3 rounded-lg border-2 text-left transition-all duration-200 ${colorMode === mode.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-gray-300 dark:hover:border-slate-700'
                    }`}
                >
                  <div className="font-medium text-gray-900 dark:text-slate-50 mb-1">
                    {mode.label}
                    {colorMode === mode.id && (
                      <span className="ml-2 text-blue-600 dark:text-blue-400">✓</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-slate-400">
                    {mode.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-50 mb-4">
              {t('accessibility.preview.title')}
            </h2>

            <div className="space-y-3">
              <div className="p-4 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg">
                <p className="text-gray-900 dark:text-slate-50 mb-2">
                  {t('accessibility.preview.mainText')}
                </p>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  {t('accessibility.preview.secondaryText')}
                </p>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 min-h-12 px-4 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200">
                  {t('accessibility.preview.primaryButton')}
                </button>
                <button className="flex-1 min-h-12 px-4 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200">
                  {t('accessibility.preview.successButton')}
                </button>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetToDefaults}
            className="w-full min-h-12 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-50 font-medium rounded-lg transition-all duration-200"
          >
            {t('accessibility.actions.reset')}
          </button>

          {/* Info Note */}
          <div className="text-center text-xs text-gray-500 dark:text-slate-400 space-y-1">
            <p>{t('accessibility.footer.autoSaveNote')}</p>
            <p>{t('accessibility.footer.globalApplyNote')}</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
