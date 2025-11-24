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
    const textTimer = setTimeout(() => setShowText(true), 500);

    const navigationTimer = setTimeout(() => {
      const hasOnboarded = localStorage.getItem('hasOnboarded');

      // If user hasn't onboarded, set theme to device default
      if (hasOnboarded !== 'true') {
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        localStorage.setItem('theme', prefersDark ? 'dark' : 'light');

        // Optionally, also update document class immediately
        const root = document.documentElement;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }

      // Navigate to appropriate page
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