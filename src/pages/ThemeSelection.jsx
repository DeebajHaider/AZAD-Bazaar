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

  // Ensure initial selected state matches persisted/local applied theme.
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('theme')
      const rootIsDark = document.documentElement.classList.contains('dark')
      const effective = stored || (rootIsDark ? 'dark' : 'light')
      if (effective && effective !== theme) {
        setTheme(effective)
      }
    } catch (_) {
      // ignore
    }
  }, [setTheme])

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
    // Page Container: Surface Background
    <div className="min-h-screen flex items-center justify-center bg-md-surface p-4">
      <div className="w-full max-w-[430px] space-y-6">
        
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            {/* Animated Icon Swap Container: Secondary Container */}
            <div className="w-16 h-16 rounded-full bg-md-secondary-container flex items-center justify-center relative shadow-sm overflow-hidden">
              <Sun className={`w-8 h-8 text-md-on-secondary-container transition-all duration-500 absolute ${theme === 'light' ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`} />
              <Moon className={`w-8 h-8 text-md-on-secondary-container transition-all duration-500 absolute ${theme === 'dark' ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-90'}`} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-md-on-surface">{t('headerTitle')}</h1>
            <p className="mt-1 text-base text-md-on-surface-variant">{t('headerSubtitle')}</p>
          </div>
        </div>
        
        {/* Main Content Card: Surface Container */}
        <div className="bg-md-surface-container rounded-md shadow-sm p-5 space-y-4">
          {/* Theme Options */}
          <div className="space-y-3">
            {themes.map((themeOption) => {
              const { id, name, description, icon: Icon } = themeOption;
              const isSelected = theme === id;

              return (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  // Card Styling:
                  // Selected: Primary Container + Border
                  // Unselected: Surface Container High (Filled)
                  className={`w-full min-h-[80px] p-4 rounded-md transition-all duration-200 flex items-center justify-between text-left border ${
                    isSelected
                      ? 'bg-md-primary-container border-md-primary shadow-sm'
                      : 'bg-md-surface-container-high border-transparent hover:bg-md-surface-container-highest'
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`Select ${name} theme`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon: Adapts to container text color */}
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-md-on-primary-container' : 'text-md-on-surface-variant'}`} />
                    <div>
                      <p className={`font-semibold text-lg ${isSelected ? 'text-md-on-primary-container' : 'text-md-on-surface'}`}>
                        {name}
                      </p>
                      <p className={`text-sm ${isSelected ? 'text-md-on-primary-container/80' : 'text-md-on-surface-variant'}`}>
                        {description}
                      </p>
                    </div>
                  </div>
                  {/* Checkmark */}
                  {isSelected && <CheckCircle className="w-6 h-6 text-md-primary flex-shrink-0" />}
                </button>
              )
            })}
          </div>
          
          {/* Proceed Button: Primary */}
          <button
            onClick={() => {
              localStorage.setItem('hasOnboarded', 'true');
              navigate('/login');
            }}
            className="w-full min-h-[48px] px-6 py-3 bg-md-primary text-md-on-primary font-bold rounded-md shadow-md hover:shadow-lg transition-all active:scale-[0.98] mt-4"
          >
            {t('proceedButton')}
          </button>
        </div>
      </div>
    </div>
  )
}