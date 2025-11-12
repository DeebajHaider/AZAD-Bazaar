import React from 'react'
import { useI18n } from '../context/I18nContext'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Globe } from 'lucide-react'

export default function LanguageSelection() {
  const { lang, setLang } = useI18n()
  const navigate = useNavigate()

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  ]

  // This object is kept inside for simplicity, but could be defined outside the component.
  const languageStrings = {
    headerTitle: {
      en: "Choose Your Language",
      ur: "زبان منتخب کریں"
    },
    selectionConfirmation: {
      en: "You have selected English",
      ur: "آپ نے اردو منتخب کی ہے"
    },
    proceedButton: {
      en: "Proceed",
      ur: "آگے بڑھیں"
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 p-4">
      <div className="w-full max-w-[430px] space-y-6">
        
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-900 rounded-full flex items-center justify-center border border-gray-200 dark:border-slate-800">
              <Globe className="w-8 h-8 text-gray-600 dark:text-slate-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-50">
              {languageStrings.headerTitle.en}
            </h1>
            <p className="mt-1 text-lg text-gray-600 dark:text-slate-400">
              {languageStrings.headerTitle.ur}
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm p-5 space-y-4">
          
          {/* Language Options */}
          <div className="space-y-3">
            {languages.map((language) => {
              const isSelected = lang === language.code
              return (
                <button
                  key={language.code}
                  onClick={() => setLang(language.code)}
                  className={`w-full min-h-16 p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                      : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-gray-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <p className={`font-semibold text-lg ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-slate-50'}`}>
                      {language.name}
                    </p>
                    <p className={`text-sm ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-slate-400'}`}>
                      {language.nativeName}
                    </p>
                  </div>
                  {isSelected && <CheckCircle className="w-6 h-6 text-blue-500 dark:text-blue-400" />}
                </button>
              )
            })}
          </div>

          {/* Confirmation Text */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {lang === 'ur' ? languageStrings.selectionConfirmation.ur : languageStrings.selectionConfirmation.en}
            </p>
          </div>

          {/* Proceed Button */}
          <button
            onClick={() => navigate('/home')} // Navigates to the home page on click
            className="w-full min-h-12 px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200"
          >
            {lang === 'ur' ? languageStrings.proceedButton.ur : languageStrings.proceedButton.en}
          </button>
        </div>
      </div>
    </div>
  )
}