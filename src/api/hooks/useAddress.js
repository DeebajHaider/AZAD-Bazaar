import { useEffect, useState } from 'react'
import customerService from '../customerService'
import { CUSTOMER_ADDRESSES } from '../cacheKeys'
import { getFromCache, setInCache, invalidateCache } from '../cacheUtils'
import { useAuth } from '../../context/AuthContext'

export function useAddress() {
  const { customer, token } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const customerId = customer?._id || customer?.id

  useEffect(() => {
    console.log("useAddress effect running, token:", !!token, "customerId:", customerId)
    
    if (!token || !customerId) {
      console.log("No token or customerId, setting addresses to empty")
      setAddresses([])
      setLoading(false)
      return
    }

    let mounted = true

    const fetchAddresses = async () => {
      try {
        console.log("fetchAddresses starting...")
        setLoading(true)
        setError(null)

        // Check cache first
        const cacheKey = CUSTOMER_ADDRESSES(customerId)
        const cached = await getFromCache(cacheKey)
        console.log("Cache check for", cacheKey, "result:", cached)
        if (cached) {
          if (mounted) {
            console.log("Using cached addresses:", cached)
            setAddresses(cached)
            setLoading(false)
          }
          return
        }

        // Fetch from API
        console.log("Fetching addresses from API...")
        const data = await customerService.getAddresses()
        console.log("Received addresses from API:", data)
        if (mounted) {
          setAddresses(data)
          await setInCache(cacheKey, data)
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to fetch addresses:', err)
        if (mounted) {
          setError(err.message || 'Failed to fetch addresses')
          setLoading(false)
        }
      }
    }

    fetchAddresses()

    return () => {
      mounted = false
    }
  }, [token, customerId])

  const addAddress = async (addressData) => {
    try {
      const updatedAddresses = await customerService.addAddress(addressData)
      
      // Update local state with the full array from server
      setAddresses(updatedAddresses)
      
      // Update cache
      if (customerId) {
        const cacheKey = CUSTOMER_ADDRESSES(customerId)
        await setInCache(cacheKey, updatedAddresses)
      }
      
      return updatedAddresses
    } catch (err) {
      console.error('Failed to add address:', err)
      throw err
    }
  }

  const updateAddress = async (addressData) => {
    try {
      const updatedAddresses = await customerService.updateAddress(addressData)
      
      // Update local state with the full array from server
      setAddresses(updatedAddresses)
      
      // Update cache
      if (customerId) {
        const cacheKey = CUSTOMER_ADDRESSES(customerId)
        await setInCache(cacheKey, updatedAddresses)
      }
      
      return updatedAddresses
    } catch (err) {
      console.error('Failed to update address:', err)
      throw err
    }
  }

  const deleteAddress = async (addressId) => {
    try {
      const updatedAddresses = await customerService.deleteAddress({ addressId })
      
      // Update local state with the full array from server
      setAddresses(updatedAddresses)
      
      // Update cache
      if (customerId) {
        const cacheKey = CUSTOMER_ADDRESSES(customerId)
        await setInCache(cacheKey, updatedAddresses)
      }
      
      return true
    } catch (err) {
      console.error('Failed to delete address:', err)
      throw err
    }
  }

  const refreshAddresses = async () => {
    if (!token || !customerId) return

    try {
      setLoading(true)
      setError(null)
      
      // Invalidate cache
      await invalidateCache(CUSTOMER_ADDRESSES(customerId))
      
      // Fetch fresh data
      const data = await customerService.getAddresses()
      setAddresses(data)
      
      // Update cache
      await setInCache(CUSTOMER_ADDRESSES(customerId), data)
      setLoading(false)
      
      return data
    } catch (err) {
      console.error('Failed to refresh addresses:', err)
      setError(err.message || 'Failed to refresh addresses')
      setLoading(false)
      throw err
    }
  }

  return {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    refreshAddresses
  }
}

export default useAddress
