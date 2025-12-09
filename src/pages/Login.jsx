import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'
import logo from '/Azad-Bazaar.svg'
import ImageWithLoader from '../component/ImageWithLoader'
import VoiceInputModal from '../component/VoiceInputModal'
import { Mic, AlertCircle, CheckCircle } from 'lucide-react'
import { useAccessibility } from '../context/AccessibilityContext'

export default function Login() {
  const { requestOtp, verifyOtp, user } = useAuth()
  const navigate = useNavigate()
  const { t } = useI18n()

  const [mode, setMode] = useState('login')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [step, setStep] = useState('enter-phone')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [info, setInfo] = useState(null)

  const { ascMode } = useAccessibility && useAccessibility() || {}
  const isVoiceInput = typeof ascMode === 'string' && ascMode.includes('voiceInput')

  const [voiceModalOpen, setVoiceModalOpen] = useState(false)
  const [voiceTarget, setVoiceTarget] = useState(null)
  
  const lang = (typeof window !== 'undefined' && (window.__lang || (window.localStorage && window.localStorage.getItem && window.localStorage.getItem('lang')))) || 'en';
  const isRTL = lang === 'ar' || lang === 'he' || lang === 'fa' || lang === 'ur';

  const handleVoiceConfirm = useCallback((transcript) => {
    if (!voiceTarget) return;
    if (voiceTarget === 'name') setName(transcript)
    else if (voiceTarget === 'address') setAddress(transcript)
    else if (voiceTarget === 'phone') {
      const digits = transcript.replace(/\D/g, '');
      setPhone(digits);
    }
    else if (voiceTarget === 'otp') {
      const digits = transcript.replace(/\D/g, '');
      setOtp(digits);
    }
    setVoiceModalOpen(false);
    setVoiceTarget(null);
  }, [voiceTarget, t])

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (mode === 'signup' && navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude)
          setLng(pos.coords.longitude)
        },
        () => {},
        { timeout: 5000 }
      )
    }
  }, [mode])

  async function handleSendOtp(e) {
    e && e.preventDefault()
    setErr(null)
    setInfo(null)
    if (!phone) return setErr(t('login.notifications.errors.phoneRequired'))
    setLoading(true)
    try {
      const res = await requestOtp(phone, mode === 'signup')
      setStep('waiting-otp')
      setInfo(t('login.notifications.info.otpSent') + res.otp)
    } catch (error) {
      setErr(error && error.message ? error.message : t('login.notifications.errors.otpSendFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e) {
    e && e.preventDefault()
    setErr(null)
    setInfo(null)
    if (!otp) return setErr(t('login.notifications.errors.otpRequired'))
    setLoading(true)
    try {
      const profile = mode === 'signup' ? { name, address, lat, lng } : null
      const resp = await verifyOtp(phone, otp, profile)
      if (resp && resp.success) {
        setInfo(t('login.notifications.info.verified'))
      } else {
        setErr(t('login.notifications.errors.verificationFailed'))
      }
    } catch (error) {
      setErr(error && error.message ? error.message : t('login.notifications.errors.otpVerificationFailed'))
    } finally {
      setLoading(false)
    }
  }

  function resetToPhone() {
    setStep('enter-phone')
    setOtp('')
    setErr(null)
    setInfo(null)
  }

  function switchMode(newMode) {
    setMode(newMode)
    setStep('enter-phone')
    setErr(null)
    setInfo(null)
    setOtp('')
  }

  // Reusable Input Style (Filled)
  const inputClass = "w-full h-12 rounded-md bg-md-surface-container-highest px-4 text-md-on-surface placeholder:text-md-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-md-primary transition-all";

  const phoneInputRef = useRef(null)
  const otpInputRef = useRef(null)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (step === 'enter-phone') {
        handleSendOtp(e);
        phoneInputRef.current?.blur();
      } else if (step === 'waiting-otp') {
        handleVerifyOtp(e);
        otpInputRef.current?.blur();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-md-surface px-4">
      <div className="w-full max-w-[430px]">
        
        {/* Logo */}
        <div className="flex items-center justify-center mb-4">
          <ImageWithLoader src={logo} alt="Azad Bazaar" imageClassName="w-full max-w-[340px] h-[314px] object-contain" />
        </div>

        {/* Accessibility Button - Tonal Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/accessibility')}
            className="min-h-11 px-4 py-2 flex items-center gap-2 bg-md-secondary-container text-md-on-secondary-container rounded-md hover:opacity-90 transition-all duration-200"
            aria-label={t('login.accessibility.ariaLabel')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="text-sm font-medium">{t('login.accessibility.button')}</span>
          </button>
        </div>

        {/* Error Alert - Error Container */}
        {err && (
          <div className="mb-4 flex items-center gap-2 text-sm bg-md-error-container text-md-on-error-container p-4 rounded-md">
            <AlertCircle size={18} />
            {err}
          </div>
        )}
        
        {/* Success Alert - Green (Custom Success) */}
        {info && (
          <div className="mb-4 flex items-center gap-2 text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 p-4 rounded-md">
            <CheckCircle size={18} />
            {info}
          </div>
        )}

        {/* Main Card - Surface Container */}
        <div className="bg-md-surface-container rounded-xl shadow-sm overflow-hidden border border-transparent">
          
          {/* Mode Toggle - Segmented Button Style */}
          <div className="p-4 border-b border-md-outline-variant/30">
            <div className="flex gap-1 p-1 bg-md-surface-container-high rounded-lg">
              <button
                onClick={() => switchMode('login')}
                className={`flex-1 min-h-11 py-2 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                  mode === 'login' 
                    ? 'bg-md-primary text-md-on-primary shadow-sm' 
                    : 'text-md-on-surface-variant hover:text-md-on-surface'
                }`}
              >
                {t('login.modes.login')}
              </button>
              <button
                onClick={() => switchMode('signup')}
                className={`flex-1 min-h-11 py-2 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                  mode === 'signup' 
                    ? 'bg-md-primary text-md-on-primary shadow-sm' 
                    : 'text-md-on-surface-variant hover:text-md-on-surface'
                }`}
              >
                {t('login.modes.signup')}
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-5">
            <div className="space-y-5">
              
              {/* Signup Fields */}
              {mode === 'signup' && step === 'enter-phone' && (
                <>
                  {/* Name */}
                  <div className="relative">
                    <label className="block text-sm font-bold mb-2 text-md-on-surface">
                      {t('login.form.name.label')}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('login.form.name.placeholder')}
                      className={`${inputClass} pr-12 rtl:pl-12`}
                    />
                    {isVoiceInput && (
                      <button
                        type="button"
                        onClick={() => { setVoiceTarget('name'); setVoiceModalOpen(true); }}
                        className={`absolute top-1.5 ${isRTL ? 'left-2' : 'right-2'} z-10 flex items-center justify-center w-9 h-9 rounded-full bg-md-secondary-container text-md-on-secondary-container hover:opacity-80 transition-colors`}
                      >
                        <Mic size={18} />
                      </button>
                    )}
                  </div>

                  {/* Address */}
                  <div className="relative">
                    <label className="block text-sm font-bold mb-2 text-md-on-surface">
                      {t('login.form.address.label')}
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t('login.form.address.placeholder')}
                      className={`${inputClass} pr-12 rtl:pl-12`}
                    />
                    {isVoiceInput && (
                      <button
                        type="button"
                        onClick={() => { setVoiceTarget('address'); setVoiceModalOpen(true); }}
                        className={`absolute top-1.5 ${isRTL ? 'left-2' : 'right-2'} z-10 flex items-center justify-center w-9 h-9 rounded-full bg-md-secondary-container text-md-on-secondary-container hover:opacity-80 transition-colors`}
                      >
                        <Mic size={18} />
                      </button>
                    )}
                  </div>

                  {/* Location Info */}
                  {(lat || lng) && (
                    <div className="flex gap-3 p-3 bg-md-surface-container-high rounded-md border border-md-outline-variant/30">
                      <div className="flex-1">
                        <div className="text-xs text-md-on-surface-variant mb-1">{t('login.form.location.latitude')}</div>
                        <div className="text-sm font-mono font-medium text-md-on-surface">
                          {lat?.toFixed(6) ?? '—'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-md-on-surface-variant mb-1">{t('login.form.location.longitude')}</div>
                        <div className="text-sm font-mono font-medium text-md-on-surface">
                          {lng?.toFixed(6) ?? '—'}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Phone Input */}
              {step === 'enter-phone' && (
                <div className="relative">
                  <label className="block text-sm font-bold mb-2 text-md-on-surface">
                    {t('login.form.phone.label')}
                  </label>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={handleKeyDown}
                    placeholder={t('login.form.phone.placeholder')}
                    className={`${inputClass} pr-12 rtl:pl-12`}
                  />
                  {isVoiceInput && (
                    <button
                      type="button"
                      onClick={() => { setVoiceTarget('phone'); setVoiceModalOpen(true); }}
                      className={`absolute top-1.5 ${isRTL ? 'left-2' : 'right-2'} z-10 flex items-center justify-center w-9 h-9 rounded-full bg-md-secondary-container text-md-on-secondary-container hover:opacity-80 transition-colors`}
                    >
                      <Mic size={18} />
                    </button>
                  )}
                </div>
              )}

              {/* Voice Modal */}
              {isVoiceInput && voiceModalOpen && (
                <VoiceInputModal
                  isOpen={voiceModalOpen}
                  onClose={() => { setVoiceModalOpen(false); setVoiceTarget(null); }}
                  onConfirm={handleVoiceConfirm}
                  confirmLabel={t('voiceModal.actions.confirm')}
                />
              )}

              {/* OTP Input */}
              {step === 'waiting-otp' && (
                <div className="relative">
                  <label className="block text-sm font-bold mb-2 text-md-on-surface">
                    {t('login.form.otp.label')}
                  </label>
                  <input
                    ref={otpInputRef}
                    type="tel"
                    inputMode="tel"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={handleKeyDown}
                    placeholder={t('login.form.otp.placeholder')}
                    maxLength={6}
                    className={`${inputClass} text-center text-2xl font-semibold tracking-widest pr-12 rtl:pl-12`}
                  />
                  {isVoiceInput && (
                    <button
                      type="button"
                      onClick={() => { setVoiceTarget('otp'); setVoiceModalOpen(true); }}
                      className={`absolute top-1.5 ${isRTL ? 'left-2' : 'right-2'} z-10 flex items-center justify-center w-9 h-9 rounded-full bg-md-secondary-container text-md-on-secondary-container hover:opacity-80 transition-colors`}
                    >
                      <Mic size={18} />
                    </button>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 pt-2">
                {step === 'enter-phone' ? (
                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full min-h-12 px-6 py-3 bg-md-primary text-md-on-primary font-bold rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? t('login.buttons.sending') : (mode === 'login' ? t('login.buttons.sendOtp') : t('login.buttons.createAccountAndSendOtp'))}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading}
                      // Success color for Verification
                      className="w-full min-h-12 px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? t('login.buttons.verifying') : t('login.buttons.verifyAndSignIn')}
                    </button>
                    <button
                      onClick={resetToPhone}
                      disabled={loading}
                      className="w-full min-h-12 px-6 py-3 bg-md-surface-container-highest text-md-on-surface font-medium rounded-lg hover:bg-md-on-surface/10 transition-colors disabled:opacity-60"
                    >
                      {t('login.buttons.back')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-md-on-surface-variant/60 font-medium">
          {t('login.footer.mvpNote')}
        </div>
      </div>
    </div>
  )
}