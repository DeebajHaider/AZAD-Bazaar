import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Login() {
  const { requestOtp, verifyOtp } = useAuth()
  const { theme } = useTheme()

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [step, setStep] = useState('enter-phone') // enter-phone | waiting-otp
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
    if (!phone) return setErr('Please enter phone number')
    setLoading(true)
    try {
      await requestOtp(phone, mode === 'signup')
      setStep('waiting-otp')
      setInfo('OTP sent — check server console for code (MVP)')
    } catch (error) {
      console.error('requestOtp err', error)
      setErr(error && error.message ? error.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e) {
    e && e.preventDefault()
    setErr(null)
    setInfo(null)
    if (!otp) return setErr('Please enter OTP')
    setLoading(true)
    try {
      const profile = mode === 'signup' ? { name, address, lat, lng } : null
      const resp = await verifyOtp(phone, otp, profile)
      if (resp && resp.success) {
        setInfo('Verified — signing you in')
      } else {
        setErr('Verification failed')
      }
    } catch (error) {
      console.error('verify err', error)
      setErr(error && error.message ? error.message : 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        {err && (
          <div className="mb-3 text-sm text-red-700 bg-red-100 border border-red-200 p-2 rounded">{err}</div>
        )}
        {info && (
          <div className="mb-3 text-sm text-green-800 bg-green-100 border border-green-200 p-2 rounded">{info}</div>
        )}

        <div className={`rounded-xl shadow-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
          <div className="px-6 py-4">
            <div className="flex justify-center gap-2 mb-4">
              <button
                onClick={() => { setMode('login'); setStep('enter-phone'); setErr(null); setInfo(null) }}
                className={`flex-1 py-2 rounded ${mode === 'login' ? 'bg-indigo-600 text-white' : 'bg-transparent text-gray-500'}`}
              >
                Login
              </button>
              <button
                onClick={() => { setMode('signup'); setStep('enter-phone'); setErr(null); setInfo(null) }}
                className={`flex-1 py-2 rounded ${mode === 'signup' ? 'bg-indigo-600 text-white' : 'bg-transparent text-gray-500'}`}
              >
                Sign up
              </button>
            </div>

            <form onSubmit={step === 'enter-phone' ? handleSendOtp : handleVerifyOtp} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
                  </div>
                  <div className="flex gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex-1">Lat: {lat ?? '—'}</div>
                    <div className="flex-1">Lng: {lng ?? '—'}</div>
                  </div>
                </>
              )}

              {step === 'enter-phone' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +923001234567" className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
                </div>
              )}

              {step === 'waiting-otp' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Enter OTP</label>
                  <input value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
                </div>
              )}

              <div>
                {step === 'enter-phone' ? (
                  <button disabled={loading} onClick={handleSendOtp} className="w-full py-2 rounded bg-indigo-600 text-white font-medium">
                    {loading ? 'Sending...' : (mode === 'login' ? 'Send OTP' : 'Create account & Send OTP')}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button disabled={loading} onClick={handleVerifyOtp} className="w-full py-2 rounded bg-green-600 text-white font-medium">{loading ? 'Verifying...' : 'Verify & Sign in'}</button>
                    <button disabled={loading} onClick={() => { setStep('enter-phone'); setOtp(''); setErr(null); setInfo(null) }} className="w-full py-2 rounded border">Back</button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">OTP is logged on server console for MVP.</div>
      </div>
    </div>
  )
}
