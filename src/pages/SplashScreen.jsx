import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'
import ImageWithLoader from '../component/ImageWithLoader'

/**
 * A splash screen component that shows a logo animation.
 * It checks localStorage for 'hasOnboarded' status and redirects accordingly.
 * 
 * Logic:
 * 1. hasOnboarded === 'true' -> Redirect to /login
 * 2. hasOnboarded !== 'true' -> Redirect to /language-selection
 *
 * @param {object} props
 * @param {number} [props.duration=2000] - Total time in milliseconds to show the splash screen.
 */
export default function SplashScreen({ duration = 2000 }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    // Timer to fade in the text shortly after the logo animation starts
    const textTimer = setTimeout(() => {
      setShowText(true)
    }, 500) // 0.5s delay

    // Timer to handle the navigation logic
    const navigationTimer = setTimeout(() => {
      // Check if the user has completed onboarding previously
      const hasOnboarded = localStorage.getItem('hasOnboarded')

      if (hasOnboarded === 'true') {
        // User has seen onboarding -> Go to Login
        // replace: true prevents back button from returning to splash
        navigate('/login', { replace: true })
      } else {
        // New user -> Go to Language Selection
        navigate('/language-selection', { replace: true })
      }
    }, duration)

    // Cleanup timers on component unmount
    return () => {
      clearTimeout(textTimer)
      clearTimeout(navigationTimer)
    }
  }, [navigate, duration])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center primBg">
      <div className="flex flex-col items-center gap-4">
        {/* Logo with the fade-in and scale animation */}
        <ImageWithLoader
          src="/Azad-Bazaar.svg"
          alt="Azad Bazaar Logo"
          imageClassName="h-40 w-auto animate-fade-in-scale"
        />

        {/* Feedback text that fades in after a short delay */}
        <p className={`text-base secText transition-opacity duration-1000 ${showText ? 'opacity-100' : 'opacity-0'}`}>
          {t('splash.loadingMessage')}
        </p>
      </div>
    </div>
  )
}