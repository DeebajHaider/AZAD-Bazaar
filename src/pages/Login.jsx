import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'

export default function Login() {
  const { requestOtp, verifyOtp } = useAuth()
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
      await requestOtp(phone, mode === 'signup')
      setStep('waiting-otp')
      setInfo(t('login.notifications.info.otpSent'))
    } catch (error) {
      console.error('requestOtp err', error)
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
      console.error('verify err', error)
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-4">
      <div className="w-full max-w-[430px]">
        
        {/* Accessibility Button - Top Right */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/accessibility')}
            className="min-h-11 px-4 py-2 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-gray-900 dark:text-slate-50 font-medium rounded-lg border border-gray-200 dark:border-slate-800 transition-all duration-200"
            aria-label={t('login.accessibility.ariaLabel')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="text-sm">{t('login.accessibility.button')}</span>
          </button>
        </div>

        {/* Error Alert */}
        {err && (
          <div className="mb-4 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 rounded-lg">
            {err}
          </div>
        )}
        
        {/* Success Alert */}
        {info && (
          <div className="mb-4 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded-lg">
            {info}
          </div>
        )}

        {/* Main Card */}
        <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          
          {/* Mode Toggle */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-800">
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-950 rounded-lg">
              <button
                onClick={() => switchMode('login')}
                className={`flex-1 min-h-11 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                }`}
              >
                {t('login.modes.login')}
              </button>
              <button
                onClick={() => switchMode('signup')}
                className={`flex-1 min-h-11 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  mode === 'signup'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                }`}
              >
                {t('login.modes.signup')}
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-5">
            <div className="space-y-4">
              
              {/* Signup Fields */}
              {mode === 'signup' && step === 'enter-phone' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-slate-50">
                      {t('login.form.name.label')}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('login.form.name.placeholder')}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-slate-50">
                      {t('login.form.address.label')}
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t('login.form.address.placeholder')}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  {(lat || lng) && (
                    <div className="flex gap-3 p-3 bg-gray-100 dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-800">
                      <div className="flex-1">
                        <div className="text-xs text-gray-600 dark:text-slate-400 mb-1">{t('login.form.location.latitude')}</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-slate-50">
                          {lat?.toFixed(6) ?? '—'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-600 dark:text-slate-400 mb-1">{t('login.form.location.longitude')}</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-slate-50">
                          {lng?.toFixed(6) ?? '—'}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {step === 'enter-phone' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-slate-50">
                    {t('login.form.phone.label')}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('login.form.phone.placeholder')}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              )}

              {step === 'waiting-otp' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-slate-50">
                    {t('login.form.otp.label')}
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder={t('login.form.otp.placeholder')}
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-2xl font-semibold tracking-widest"
                  />
                </div>
              )}

              <div className="space-y-2 pt-2">
                {step === 'enter-phone' ? (
                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full min-h-12 px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? t('login.buttons.sending') : (mode === 'login' ? t('login.buttons.sendOtp') : t('login.buttons.createAccountAndSendOtp'))}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading}
                      className="w-full min-h-12 px-6 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? t('login.buttons.verifying') : t('login.buttons.verifyAndSignIn')}
                    </button>
                    <button
                      onClick={resetToPhone}
                      disabled={loading}
                      className="w-full min-h-12 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-50 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('login.buttons.back')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500 dark:text-slate-400">
          {t('login.footer.mvpNote')}
        </div>
      </div>
    </div>
  )
}