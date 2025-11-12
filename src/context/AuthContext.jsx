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
  const [customer, setCustomer] = useState(() => {
    try {
      const raw = localStorage.getItem('azad_customer')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })

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
        // if user has customerId, try fetching customer into global state
        if (resp.user && resp.user.customerId) {
          try {
            // dynamic import to avoid circular issues
            const customerService = (await import('../api/customerService')).default
            const cust = await customerService.getCustomer(resp.user.customerId)
            if (mounted) {
              setCustomer(cust)
              try { localStorage.setItem('azad_customer', JSON.stringify(cust)) } catch (e) {}
            }
          } catch (err) {
            // ignore
            console.warn('could not fetch customer on init', err)
          }
        }
      } catch (err) {
        console.warn('auth me failed', err)
        // invalid token -> clear
        localStorage.removeItem('token')
        localStorage.removeItem('azad_user')
        setToken(null)
        setUser(null)
        setCustomer(null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  async function requestOtp(phone, isNewUser = false) {
    return authService.requestOtp(phone, isNewUser)
  }

  async function verifyOtp(phone, code, profile = null) {
    const resp = await authService.verifyOtp(phone, code, profile)
    if (resp && resp.token) {
      try {
        localStorage.setItem('token', resp.token)
        localStorage.setItem('azad_user', JSON.stringify(resp.user || null))
      } catch (e) {
        // ignore
      }
      setToken(resp.token)
      setUser(resp.user || null)
      // fetch customer if present
      if (resp.user && resp.user.customerId) {
        try {
          const customerService = (await import('../api/customerService')).default
          const cust = await customerService.getCustomer(resp.user.customerId)
          setCustomer(cust)
          try { localStorage.setItem('azad_customer', JSON.stringify(cust)) } catch (e) {}
        } catch (err) {
          console.warn('fetch customer after login failed', err)
        }
      }
    }
    return resp
  }

  async function createCustomer(payload) {
    const resp = await authService.createCustomer(payload)
    return resp
  }

  // get customer by id and sync to global state
  async function getCustomer(id) {
    try {
      const customerService = (await import('../api/customerService')).default
      const cust = await customerService.getCustomer(id)
      setCustomer(cust)
      try { localStorage.setItem('azad_customer', JSON.stringify(cust)) } catch (e) {}
      return cust
    } catch (err) {
      throw err
    }
  }

  // update customer and sync to global state
  async function updateCustomer(id, payload) {
    try {
      const customerService = (await import('../api/customerService')).default
      const updated = await customerService.updateCustomer(id, payload)
      setCustomer(updated)
      try { localStorage.setItem('azad_customer', JSON.stringify(updated)) } catch (e) {}
      return updated
    } catch (err) {
      throw err
    }
  }

  function logout() {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('azad_user')
    } catch (e) {}
    setToken(null)
    setUser(null)
  }

  const value = { user, token, loading, customer, requestOtp, verifyOtp, createCustomer, getCustomer, updateCustomer, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
