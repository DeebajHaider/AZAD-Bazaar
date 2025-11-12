import React from 'react'
import { useAccessibility } from '../context/AccessibilityContext'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext' // added import

export default function AccessibilitySettings() {
  const { fontSize, setFontSize, colorMode, setColorMode, resetToDefaults } = useAccessibility()
  const { theme, setTheme } = useTheme() // use ThemeContext
  const navigate = useNavigate()

  const fontSizes = [
    { id: 'small', label: 'Small', size: 'text-sm' },
    { id: 'normal', label: 'Normal', size: 'text-base' },
    { id: 'large', label: 'Large', size: 'text-lg' },
    { id: 'xlarge', label: 'Extra Large', size: 'text-xl' }
  ]

  const colorModes = [
    { id: 'default', label: 'Default', desc: 'Standard colors' },
    { id: 'high-contrast', label: 'High Contrast', desc: 'Maximum contrast for better visibility' },
    { id: 'deuteranopia', label: 'Red-Green (Deuteranopia)', desc: 'Optimized for red-green colorblindness' },
    { id: 'protanopia', label: 'Red-Green (Protanopia)', desc: 'Alternative red-green adjustment' },
    { id: 'tritanopia', label: 'Blue-Yellow', desc: 'Optimized for blue-yellow colorblindness' }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4">
        <div className="max-w-[430px] mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="min-h-11 min-w-11 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-50 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-50">
            Accessibility Settings
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[430px] mx-auto p-4 space-y-6">
        
        {/* Font Size Section */}
        <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-50 mb-2">
            Font Size
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
            Adjust text size for better readability
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            {fontSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setFontSize(size.id)}
                className={`min-h-16 px-4 py-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                  fontSize === size.id
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
            Theme
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
            Choose light or dark theme
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`min-h-16 px-4 py-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
              }`}
            >
              Light
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`min-h-16 px-4 py-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50 hover:border-gray-300 dark:hover:border-slate-700'
              }`}
            >
              Dark
            </button>
          </div>
        </div>

        {/* Color Mode Section */}
        <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-50 mb-2">
            Color Mode
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
            Choose a color scheme that works best for you
          </p>
          
          <div className="space-y-2">
            {colorModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setColorMode(mode.id)}
                className={`w-full min-h-16 px-4 py-3 rounded-lg border-2 text-left transition-all duration-200 ${
                  colorMode === mode.id
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
            Preview
          </h2>
          
          <div className="space-y-3">
            <div className="p-4 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg">
              <p className="text-gray-900 dark:text-slate-50 mb-2">
                This is how text will appear with your current settings.
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Secondary text looks like this.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button className="flex-1 min-h-12 px-4 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200">
                Primary Button
              </button>
              <button className="flex-1 min-h-12 px-4 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200">
                Success
              </button>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetToDefaults}
          className="w-full min-h-12 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-50 font-medium rounded-lg transition-all duration-200"
        >
          Reset to Defaults
        </button>

        {/* Info Note */}
        <div className="text-center text-xs text-gray-500 dark:text-slate-400 space-y-1">
          <p>Settings are saved automatically</p>
          <p>Changes apply across the entire app</p>
        </div>
      </div>
    </div>
  )
}
