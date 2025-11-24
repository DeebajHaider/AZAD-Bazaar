import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, Moon, CheckCircle } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useI18n } from '../context/I18nContext'

// It's good practice to keep translatable strings in one place.
const translations = {
  headerTitle: {
    en: "Choose Your Theme",
    ur: "اپنی تھیم منتخب کریں۔"
  },
  headerSubtitle: {
    en: "Select a light or dark theme to personalize your experience.",
    ur: "اپنے تجربے کو ذاتی بنانے کے لیے لائٹ یا ڈارک تھیم منتخب کریں۔"
  },
  lightTheme: {
    en: "Light",
    ur: "لائٹ"
  },
  lightThemeDesc: {
    en: "A bright, clean interface.",
    ur: "ایک روشن، صاف انٹرفیس۔"
  },
  darkTheme: {
    en: "Dark",
    ur: "ڈارک"
  },
  darkThemeDesc: {
    en: "Easy on the eyes at night.",
    ur: "رات کو آنکھوں پر آسان۔"
  },
  proceedButton: {
    en: "Continue to Login",
    ur: "لاگ ان پر جائیں۔"
  }
}

export default function ThemeSelection() {
  const { theme, setTheme } = useTheme()
  const { lang } = useI18n()
  const navigate = useNavigate()

  // Helper function for translations
  const t = (key) => translations[key][lang] || translations[key]['en'];

  const themes = [
    {
      id: 'light',
      name: t('lightTheme'),
      description: t('lightThemeDesc'),
      icon: Sun,
    },
    {
      id: 'dark',
      name: t('darkTheme'),
      description: t('darkThemeDesc'),
      icon: Moon,
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center primBg p-4">
      <div className="w-full max-w-[430px] space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            {/* Animated Icon Swap */}
            <div className="w-16 h-16 secBg rounded-full flex items-center justify-center primBorder relative">
              <Sun className={`w-8 h-8 accentPrimText transition-all duration-500 absolute ${theme === 'light' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
              <Moon className={`w-8 h-8 accentPrimText transition-all duration-500 absolute ${theme === 'dark' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold primText">{t('headerTitle')}</h1>
            <p className="mt-1 text-base secText">{t('headerSubtitle')}</p>
          </div>
        </div>
        
        {/* Main Content Card */}
        <div className="secBg primBorder rounded-xl shadow-sm p-5 space-y-4">
          {/* Theme Options */}
          <div className="space-y-3">
            {themes.map((themeOption) => {
              const { id, name, description, icon: Icon } = themeOption;
              const isSelected = theme === id;

              return (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className={`w-full min-h-16 p-4 rounded-lg transition-all duration-200 flex items-center justify-between text-left ${
                    isSelected
                      ? 'modeChooseButton-selected'
                      : 'modeChooseButton-unselected'
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`Select ${name} theme`}
                >
                  <div className="flex items-center gap-4">
                    <Icon className={`w-6 h-6 ${isSelected ? 'accentPrimText' : 'secText'}`} />
                    <div>
                      <p className={`font-semibold text-lg ${isSelected ? '' : 'primText'}`}>{name}</p>
                      <p className={`text-sm ${isSelected ? '' : 'secText'}`}>{description}</p>
                    </div>
                  </div>
                  {isSelected && <CheckCircle className="w-6 h-6 accentPrimText flex-shrink-0" />}
                </button>
              )
            })}
          </div>
          
          {/* Proceed Button */}
          <button
            onClick={() => {
              localStorage.setItem('hasOnboarded', 'true');
              navigate('/login');
            }}
            className="w-full min-h-12 px-6 py-3 btnPrimary rounded-lg transition-all duration-200 mt-4"
          >
            {t('proceedButton')}
          </button>
        </div>
      </div>
    </div>
  )
}