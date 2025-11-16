import React, { createContext, useContext, useMemo } from 'react'
import en from '../locales/en.json'
import ur from '../locales/ur.json'
import usePersistedLang from '../hooks/usePersistedLang'

const I18nContext = createContext()

export function I18nProvider({ children, defaultLang = 'en' }) {
  const [lang, setLang] = usePersistedLang('lang', defaultLang)

  // use the external JSON locale files so you can edit them separately
  const translations = useMemo(() => ({ en, ur }), [])

  const getNested = (obj, path) => {
    if (!obj || !path) return undefined
    return path.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), obj)
  }

  const t = (key) => {
    if (!key) return ''
    // try current language, then fallback to English, finally return the raw key
    const inCurrent = getNested(translations[lang] || {}, key)
    if (inCurrent !== undefined) return inCurrent
    const inEn = getNested(translations.en || {}, key)
    return inEn !== undefined ? inEn : key
  }

  const value = { lang, setLang, t }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
