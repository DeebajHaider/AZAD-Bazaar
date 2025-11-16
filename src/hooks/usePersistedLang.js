import { useState, useEffect } from 'react'

// Hook that persists language to localStorage and keeps document `dir` in sync
export default function usePersistedLang(storageKey = 'lang', initial = 'en') {
  const getInitial = () => {
    try {
      if (typeof window === 'undefined') return initial
      const stored = window.localStorage.getItem(storageKey)
      return stored || initial
    } catch (err) {
      return initial
    }
  }

  const [lang, setLangState] = useState(getInitial)

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, lang)
    } catch (err) {
      // ignore
    }
    // update document direction when language changes
    try {
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.setAttribute('dir', lang === 'ur' ? 'rtl' : 'ltr')
      }
    } catch (err) {
      // ignore
    }
  }, [lang, storageKey])

  const setLang = (value) => {
    setLangState(value)
  }

  return [lang, setLang]
}
