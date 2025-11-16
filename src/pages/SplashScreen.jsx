import React, { useState, useEffect } from 'react'
import { useI18n } from '../context/I18nContext'

/**
 * A splash screen component that shows a logo animation and a feedback message.
 * It automatically calls the onComplete callback after a set duration.
 *
 * @param {object} props
 * @param {() => void} props.onComplete - The function to call when the splash animation is finished.
 * @param {number} [props.duration=2500] - Total time in milliseconds to show the splash screen.
 */
export default function SplashScreen({ onComplete, duration = 2500 }) {
  const { t } = useI18n()
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    // Timer to fade in the text shortly after the logo animation starts
    const textTimer = setTimeout(() => {
      setShowText(true)
    }, 500) // 0.5s delay

    // Timer to signal completion of the splash screen
    const completeTimer = setTimeout(() => {
      onComplete()
    }, duration)

    // Cleanup timers on component unmount
    return () => {
      clearTimeout(textTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete, duration])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center primBg">
      <div className="flex flex-col items-center gap-4">
        {/* Logo with the 2-second fade-in and scale animation */}
        <img
          src="src/Azad-Bazaar.svg"
          alt="Azad Bazaar Logo"
          className="h-40 w-auto animate-fade-in-scale"
        />

        {/* Feedback text that fades in after a short delay */}
        <p className={`text-base secText transition-opacity duration-1000 ${showText ? 'opacity-100' : 'opacity-0'}`}>
          {t('splash.loadingMessage')}
        </p>
      </div>
    </div>
  )
}