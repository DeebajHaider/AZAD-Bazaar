import React, { createContext, useContext, useEffect, useState } from 'react'
import authService from '../api/authService'
import { invalidateCache } from '../api/cacheUtils'
import { CART, ORDERS_LIST, ORDER_BY_ID } from '../api/cacheKeys'

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
  const [addressLoading, setAddressLoading] = useState(false)

  useEffect(() => {
    // simple init: verify token by calling /me if present
    let mounted = true
    ;(async () => {
      if (!token) {
        setLoading(false)
        return
      }
      // ensure axios client has token on init to attach to requests
      try { import('../api/client').then((m) => m.setAuthToken(token)).catch(() => {}) } catch (e) {}
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
      // ensure axios client has the token immediately (avoid timing issues)
      try {
        import('../api/client').then((m) => m.setAuthToken(resp.token)).catch(() => {})
      } catch (e) {}
      
      // Clear cart and order caches on login
      invalidateCache('cart_') // Clear all cart caches
      invalidateCache(ORDERS_LIST)
      invalidateCache('order_') // Clear all individual order caches
      
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

  // Address management functions
  async function getAddresses() {
    if (!token) throw new Error('Not authenticated')
    try {
      setAddressLoading(true)
      console.log("fetching addresses")
      const customerService = (await import('../api/customerService')).default
      const addresses = await customerService.getAddresses()
      return addresses
    } catch (err) {
      console.error('Failed to get addresses:', err)
      throw err
    } finally {
      setAddressLoading(false)
    }
  }

  async function addAddress(addressData) {
    if (!token) throw new Error('Not authenticated')
    try {
      setAddressLoading(true)
      const customerService = (await import('../api/customerService')).default
      const newAddress = await customerService.addAddress(addressData)
      // Invalidate cache so next fetch gets fresh data
      const { CUSTOMER_ADDRESSES } = await import('../api/cacheKeys')
      const { invalidateCache } = await import('../api/cacheUtils')
      if (customer?._id || customer?.id) {
        invalidateCache(CUSTOMER_ADDRESSES(customer._id || customer.id))
      }
      return newAddress
    } catch (err) {
      console.error('Failed to add address:', err)
      throw err
    } finally {
      setAddressLoading(false)
    }
  }

  async function updateAddress(addressData) {
    if (!token) throw new Error('Not authenticated')
    try {
      setAddressLoading(true)
      const customerService = (await import('../api/customerService')).default
      const updatedAddress = await customerService.updateAddress(addressData)
      // Invalidate cache so next fetch gets fresh data
      const { CUSTOMER_ADDRESSES } = await import('../api/cacheKeys')
      const { invalidateCache } = await import('../api/cacheUtils')
      if (customer?._id || customer?.id) {
        invalidateCache(CUSTOMER_ADDRESSES(customer._id || customer.id))
      }
      // Sync local customer state with new addresses array
      setCustomer(prev => prev ? { ...prev, addresses: updatedAddress } : prev)
      try { localStorage.setItem('azad_customer', JSON.stringify({ ...(customer || {}), addresses: updatedAddress })) } catch (e) {}
      return updatedAddress
    } catch (err) {
      console.error('Failed to update address:', err)
      throw err
    } finally {
      setAddressLoading(false)
    }
  }

  async function deleteAddress(addressId) {
    if (!token) throw new Error('Not authenticated')
    try {
      setAddressLoading(true)
      const customerService = (await import('../api/customerService')).default
      await customerService.deleteAddress({ addressId })
      // Invalidate cache so next fetch gets fresh data
      const { CUSTOMER_ADDRESSES } = await import('../api/cacheKeys')
      const { invalidateCache } = await import('../api/cacheUtils')
      if (customer?._id || customer?.id) {
        invalidateCache(CUSTOMER_ADDRESSES(customer._id || customer.id))
      }
      // Remove locally
      setCustomer(prev => prev ? { ...prev, addresses: (prev.addresses || []).filter(a => a.addressId !== addressId) } : prev)
      try { localStorage.setItem('azad_customer', JSON.stringify({ ...(customer || {}), addresses: (customer?.addresses || []).filter(a => a.addressId !== addressId) })) } catch (e) {}
      return true
    } catch (err) {
      console.error('Failed to delete address:', err)
      throw err
    } finally {
      setAddressLoading(false)
    }
  }

  // Get currently marked default address (fallback to first)
  function getDefaultAddress() {
    if (!customer || !Array.isArray(customer.addresses)) return null
    return customer.addresses.find(a => a.isDefault) || customer.addresses[0] || null
  }

  // Set an address as default by addressId
  async function setDefaultAddress(addressId) {
    if (!token) throw new Error('Not authenticated')
    if (!addressId) throw new Error('addressId required')
    const current = customer?.addresses || []
    const exists = current.some(a => a.addressId === addressId)
    if (!exists) throw new Error('Address not found')
    // Use updateAddress logic to set isDefault true (backend will unset others)
    const updated = await updateAddress({ addressId, isDefault: true })
    // updated is array of addresses; ensure local state reflects isDefault flags
    setCustomer(prev => prev ? { ...prev, addresses: updated } : prev)
    try { localStorage.setItem('azad_customer', JSON.stringify({ ...(customer || {}), addresses: updated })) } catch (e) {}
    
    // Invalidate useAddress cache so all components see the update immediately
    const { CUSTOMER_ADDRESSES } = await import('../api/cacheKeys')
    const { invalidateCache } = await import('../api/cacheUtils')
    if (customer?._id || customer?.id) {
      invalidateCache(CUSTOMER_ADDRESSES(customer._id || customer.id))
    }
    
    return getDefaultAddress()
  }

  function logout() {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('azad_user')
      localStorage.removeItem('azad_customer')
    } catch (e) {}
    
    // Clear cart and order caches on logout
    invalidateCache('cart_') // Clear all cart caches
    invalidateCache(ORDERS_LIST)
    invalidateCache('order_') // Clear all individual order caches
    // Clear favorites caches on logout
    invalidateCache('favorites_')
    // Clear address caches on logout
    invalidateCache('addresses_')
    
    setToken(null)
    setUser(null)
    setCustomer(null)
    try { import('../api/client').then((m) => m.setAuthToken(null)).catch(() => {}) } catch (e) {}
  }

  const value = { 
    user, 
    token, 
    loading, 
    customer, 
    addressLoading,
    requestOtp, 
    verifyOtp, 
    createCustomer, 
    getCustomer, 
    updateCustomer, 
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    getDefaultAddress,
    setDefaultAddress,
    logout 
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
