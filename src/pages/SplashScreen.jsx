import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'
import ImageWithLoader from '../component/ImageWithLoader'

/**
 * A splash screen component that shows a logo animation.
 * Theme: Material Design 3 Surface
 */
export default function SplashScreen({ duration = 2000 }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    const textTimer = setTimeout(() => setShowText(true), 500);

    const navigationTimer = setTimeout(() => {
      const hasOnboarded = localStorage.getItem('hasOnboarded');
      // Navigate based on onboarding status
      if (hasOnboarded === 'true') {
        navigate('/login', { replace: true });
      } else {
        navigate('/language-selection', { replace: true });
      }
    }, duration);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(navigationTimer);
    };
  }, [navigate, duration]);

  return (
    // Container: Surface Background
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-md-surface">
      <div className="flex flex-col items-center gap-4">
        {/* Logo with the fade-in and scale animation */}
        <ImageWithLoader
          src="/Azad-Bazaar.svg"
          alt="Azad Bazaar Logo"
          imageClassName="h-40 w-auto animate-fade-in-scale"
        />

        {/* Feedback text: Medium Emphasis (On Surface Variant) */}
        <p className={`text-base text-md-on-surface-variant transition-opacity duration-1000 ${showText ? 'opacity-100' : 'opacity-0'}`}>
          {t('splash.loadingMessage')}
        </p>
      </div>
    </div>
  )
}