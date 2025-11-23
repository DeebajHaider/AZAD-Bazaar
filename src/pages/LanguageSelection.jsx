
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
    },
    tts: {
      chooseLangEn: "Choose your language",
      chooseLangUr: "اپنی زبان منتخب کریں",
      selectedEn: "You have selected English",
      selectedUr: "آپ نے اردو منتخب کی ہے",
      proceed: "آگے بڑھ رہے ہیں"
    }
  }

  // Helper to handle speaking with indicator, sequential and cancel previous
  const speakWithIndicator = async (text, options = {}) => {
    setIsSpeaking(true)
    speakingRef.current = true
    try {
      await stop(); // Cancel any current speech before starting new
      await speakText(text, options)
    } finally {
      setIsSpeaking(false)
      speakingRef.current = false
    }
  }

  // On mount: play English, then Urdu prompt sequentially
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
    <div className="min-h-screen flex items-center justify-center primBg p-4 relative">
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute top-4 right-4 z-50">
          <span className="inline-block w-4 h-4 rounded-full bg-blue-500 animate-pulse border-2 border-white shadow"></span>
        </div>
      )}
      <div className="w-full max-w-[430px] space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 secBg rounded-full flex items-center justify-center primBorder">
              <Globe className="w-8 h-8 secText" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold primText ">{languageStrings.headerTitle.en}</h1>
            <p className="mt-1 text-lg secText">{languageStrings.headerTitle.ur}</p>
          </div>
        </div>
        {/* Main Content Card */}
        <div className="secBg primBorder rounded-xl shadow-sm p-5 space-y-4">
          {/* Language Options */}
          <div className="space-y-3">
            {languages.map((language) => {
              const isSelected = lang === language.code
              return (
                <button
                  key={language.code}
                  onClick={async () => {
                    setLang(language.code)
                    // Cancel any current speech, then play TTS for selection
                    if (language.code === 'en') {
                      await speakWithIndicator(languageStrings.tts.selectedEn, { lang: 'en-US' })
                    } else if (language.code === 'ur') {
                      await speakWithIndicator(languageStrings.tts.selectedUr, { lang: 'ur-PK' })
                    }
                  }}
                  className={`w-full min-h-16 p-4 rounded-lg transition-all duration-200 flex items-center justify-between text-left ${
                    isSelected
                      ? 'modeChooseButton-selected'
                      : 'modeChooseButton-unselected'
                  }`}
                >
                  <div>
                    <p className={`font-semibold text-lg ${isSelected ? '' : 'primText'}`}>{language.name}</p>
                    <p className={`text-sm ${isSelected ? '' : 'secText'}`}>{language.nativeName}</p>
                  </div>
                  {isSelected && <CheckCircle className="w-6 h-6 accentPrimText" />}
                </button>
              )
            })}
          </div>
          {/* Confirmation Text */}
          <div className="text-center pt-2">
            <p className="text-sm secText">
              {lang === 'ur' ? languageStrings.selectionConfirmation.ur : languageStrings.selectionConfirmation.en}
            </p>
          </div>
          {/* Proceed Button */}
          <button
            onClick={async () => {
              await speakWithIndicator(languageStrings.tts.proceed, { lang: 'ur-PK' })
              navigate('/login')
            }}
            className="w-full min-h-12 px-6 py-3 btnPrimary rounded-lg transition-all duration-200"
          >
            {lang === 'ur' ? languageStrings.proceedButton.ur : languageStrings.proceedButton.en}
          </button>
        </div>
      </div>
    </div>
  )
}