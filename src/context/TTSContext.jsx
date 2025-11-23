import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { TextToSpeech } from '@capacitor-community/text-to-speech'
import { useI18n } from './I18nContext'
import ur from '../locales/ur.json'
import en from '../locales/en.json'

// Map app language -> preferred BCP-47 tag
const LANGUAGE_TAG_MAP = {
  en: 'en-US',
  ur: 'ur-PK'
}

const URDU_TAG_CANDIDATES = ['ur', 'ur-PK', 'ur-IN']

const TTSContext = createContext()

export function TTSProvider({ children, defaultRate = 1.0, defaultPitch = 1.0, defaultVolume = 1.0 }) {
  const { lang, t } = useI18n()
  const [supportedLangTags, setSupportedLangTags] = useState([])
  const [isUrduSupported, setIsUrduSupported] = useState(false)
  const [initialised, setInitialised] = useState(false)

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        const { languages } = await TextToSpeech.getSupportedLanguages()
        if (cancelled) return
        setSupportedLangTags(languages)
        const urduOk = URDU_TAG_CANDIDATES.some(tag => languages.includes(tag))
        setIsUrduSupported(urduOk)
      } catch (e) {
        // If plugin call fails, keep arrays empty; fallback logic will use English
        setSupportedLangTags([])
        setIsUrduSupported(false)
      } finally {
        if (!cancelled) setInitialised(true)
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  const getNested = (obj, path) => {
    if (!obj || !path) return undefined
    return path.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), obj)
  }

  // Decide which BCP-47 language tag to use for synthesis
  const resolveSpeechLangTag = useCallback(() => {
    if (lang === 'ur' && isUrduSupported) {
      // Prefer mapped tag if present in supported list, else first candidate that is supported
      const preferred = LANGUAGE_TAG_MAP.ur
      if (supportedLangTags.includes(preferred)) return preferred
      const fallbackCandidate = URDU_TAG_CANDIDATES.find(tag => supportedLangTags.includes(tag))
      if (fallbackCandidate) return fallbackCandidate
    }
    // Default to English tag that is supported or 'en-US'
    const enTag = LANGUAGE_TAG_MAP.en
    if (supportedLangTags.includes(enTag)) return enTag
    const anyEn = supportedLangTags.find(tag => tag.startsWith('en'))
    return anyEn || 'en-US'
  }, [lang, isUrduSupported, supportedLangTags])

  // Retrieve text for a key: only native Urdu or English fallback
  const getTextForKey = useCallback((key) => {
    if (!key) return ''
    if (lang === 'ur') {
      const directUr = getNested(ur, key)
      if (directUr !== undefined) return directUr
      // fall back to English translation via direct lookup (not t to avoid re-fallback chain confusion)
      const english = getNested(en, key)
      if (english !== undefined) return english
      return key
    }
    // For English (or other future languages) rely on i18n's fallback logic
    return t(key)
  }, [lang, t])

  const speakText = useCallback(async (text, options = {}) => {
    if (!text) return
    const speechLang = resolveSpeechLangTag()
    try {
      await TextToSpeech.speak({
        text,
        lang: speechLang,
        rate: options.rate ?? defaultRate,
        pitch: options.pitch ?? defaultPitch,
        volume: options.volume ?? defaultVolume,
        // queueStrategy left default (Flush) unless user overrides
        queueStrategy: options.queueStrategy
      })
    } catch (e) {
      // Silently fail or could add logging mechanism
    }
  }, [resolveSpeechLangTag, defaultRate, defaultPitch, defaultVolume])

  const speakKey = useCallback(async (key, options = {}) => {
    const text = getTextForKey(key)
    await speakText(text, options)
  }, [getTextForKey, speakText])

  const stop = useCallback(async () => {
    try { await TextToSpeech.stop() } catch (e) { /* ignore */ }
  }, [])

  const value = {
    initialised,
    supportedLangTags,
    isUrduSupported,
    speakText,
    speakKey,
    stop,
    resolveSpeechLangTag
  }

  return <TTSContext.Provider value={value}>{children}</TTSContext.Provider>
}

export function useTTS() {
  const ctx = useContext(TTSContext)
  if (!ctx) throw new Error('useTTS must be used within TTSProvider')
  return ctx
}
