import React, { useEffect, useRef, useState } from 'react'
import { useI18n } from '../context/I18nContext'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Globe } from 'lucide-react'
import { useTTS } from '../context/TTSContext'

export default function LanguageSelection() {
  const { lang, setLang } = useI18n()
  const navigate = useNavigate()
  const { speakText, stop } = useTTS()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const speakingRef = useRef(false)

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  ]

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
    },
    tts: {
      chooseLangEn: "Choose your language",
      chooseLangUr: "اپنی زبان منتخب کریں",
      selectedEn: "You have selected English",
      selectedUr: "آپ نے اردو منتخب کی ہے",
      proceed: "آگے بڑھ رہے ہیں"
    }
  }

  const speakWithIndicator = async (text, options = {}) => {
    setIsSpeaking(true)
    speakingRef.current = true
    try {
      await stop(); 
      await speakText(text, options)
    } finally {
      setIsSpeaking(false)
      speakingRef.current = false
    }
  }

  useEffect(() => {
    let cancelled = false
    const playPrompts = async () => {
      await speakWithIndicator(languageStrings.tts.chooseLangEn, { lang: 'en-US' })
      if (cancelled) return
      await speakWithIndicator(languageStrings.tts.chooseLangUr, { lang: 'ur-PK' })
    }
    playPrompts()
    return () => {
      cancelled = true
      stop()
      setIsSpeaking(false)
      speakingRef.current = false
    }
    // eslint-disable-next-line
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-md-surface p-4 relative">
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute top-4 right-4 z-50">
          <span className="inline-block w-4 h-4 rounded-full bg-md-primary animate-pulse border-2 border-md-surface shadow-sm"></span>
        </div>
      )}
      
      <div className="w-full max-w-[430px] space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            {/* Icon Container: Secondary Container */}
            <div className="w-16 h-16 rounded-full bg-md-secondary-container flex items-center justify-center text-md-on-secondary-container shadow-sm">
              <Globe className="w-8 h-8" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-md-on-surface">{languageStrings.headerTitle.en}</h1>
            <p className="mt-1 text-lg text-md-on-surface-variant">{languageStrings.headerTitle.ur}</p>
          </div>
        </div>

        {/* Main Content Card: Surface Container */}
        <div className="bg-md-surface-container rounded-md shadow-sm p-5 space-y-4">
          
          {/* Language Options */}
          <div className="space-y-3">
            {languages.map((language) => {
              const isSelected = lang === language.code
              return (
                <button
                  key={language.code}
                  onClick={async () => {
                    setLang(language.code)
                    if (language.code === 'en') {
                      await speakWithIndicator(languageStrings.tts.selectedEn, { lang: 'en-US' })
                    } else if (language.code === 'ur') {
                      await speakWithIndicator(languageStrings.tts.selectedUr, { lang: 'ur-PK' })
                    }
                  }}
                  // Button Styling:
                  // Selected: Primary Container + Border Primary
                  // Unselected: Surface Container High (Filled tonal look)
                  className={`w-full min-h-[72px] p-4 rounded-md transition-all duration-200 flex items-center justify-between text-left border ${
                    isSelected
                      ? 'bg-md-primary-container border-md-primary shadow-sm'
                      : 'bg-md-surface-container-high border-transparent hover:bg-md-surface-container-highest'
                  }`}
                >
                  <div>
                    <p className={`font-bold text-lg ${isSelected ? 'text-md-on-primary-container' : 'text-md-on-surface'}`}>
                      {language.name}
                    </p>
                    <p className={`text-sm ${isSelected ? 'text-md-on-primary-container/80' : 'text-md-on-surface-variant'}`}>
                      {language.nativeName}
                    </p>
                  </div>
                  {isSelected && <CheckCircle className="w-6 h-6 text-md-primary" />}
                </button>
              )
            })}
          </div>

          {/* Confirmation Text */}
          <div className="text-center pt-2">
            <p className="text-sm text-md-on-surface-variant">
              {lang === 'ur' ? languageStrings.selectionConfirmation.ur : languageStrings.selectionConfirmation.en}
            </p>
          </div>

          {/* Proceed Button: Primary */}
          <button
            onClick={() => {
              navigate('/mode-selection')
            }}
            className="w-full min-h-[48px] px-6 py-3 bg-md-primary text-md-on-primary font-bold rounded-md shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            {lang === 'ur' ? languageStrings.proceedButton.ur : languageStrings.proceedButton.en}
          </button>
        </div>
      </div>
    </div>
  )
}