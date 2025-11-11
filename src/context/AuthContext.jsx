import React, { createContext, useContext, useEffect, useState } from 'react'
import authService from '../api/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('azad_user')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // simple init: verify token by calling /me if present
    let mounted = true
    ;(async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const resp = await authService.me()
        if (!mounted) return
        setUser(resp.user || null)
      } catch (err) {
        console.warn('auth me failed', err)
        // invalid token -> clear
        localStorage.removeItem('token')
        localStorage.removeItem('azad_user')
        setToken(null)
        setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  async function requestOtp(phone, isNewUser = false) {
    return authService.requestOtp(phone, isNewUser)
  }

  async function verifyOtp(phone, code) {
    const resp = await authService.verifyOtp(phone, code)
    if (resp && resp.token) {
      try {
        localStorage.setItem('token', resp.token)
        localStorage.setItem('azad_user', JSON.stringify(resp.user || null))
      } catch (e) {
        // ignore
      }
      setToken(resp.token)
      setUser(resp.user || null)
    }
    return resp
  }

  async function createCustomer(payload) {
    const resp = await authService.createCustomer(payload)
    return resp
  }

  function logout() {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('azad_user')
    } catch (e) {}
    setToken(null)
    setUser(null)
  }

  const value = { user, token, loading, requestOtp, verifyOtp, createCustomer, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
