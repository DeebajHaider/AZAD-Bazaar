import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import paymentService from '../api/paymentService'
import { useAuth } from './AuthContext'

const PaymentDataContext = createContext(null)

export function PaymentDataProvider({ children }) {
  const { token } = useAuth()

  // State for mobile wallets
  const [mobileWallets, setMobileWallets] = useState([])
  const [mobileWalletsLoading, setMobileWalletsLoading] = useState(false)
  const [mobileWalletsError, setMobileWalletsError] = useState(null)

  // State for credit cards
  const [creditCards, setCreditCards] = useState([])
  const [creditCardsLoading, setCreditCardsLoading] = useState(false)
  const [creditCardsError, setCreditCardsError] = useState(null)

  // ========== Mobile Wallets Methods ==========

  /**
   * Fetch mobile wallets from the server
   */
  const fetchMobileWallets = useCallback(async () => {
    if (!token) {
      setMobileWallets([])
      return
    }

    setMobileWalletsLoading(true)
    setMobileWalletsError(null)

    try {
      const wallets = await paymentService.getMobileWallets()
      setMobileWallets(wallets)
    } catch (err) {
      console.error('Error fetching mobile wallets:', err)
      setMobileWalletsError(err.message || 'Failed to fetch mobile wallets')
      setMobileWallets([])
    } finally {
      setMobileWalletsLoading(false)
    }
  }, [token])

  /**
   * Add a new mobile wallet
   * @param {Object} payload - { provider: 'Jazzcash' | 'Easypaisa', mobileNumber: string }
   */
  const addMobileWallet = useCallback(async (payload) => {
    if (!token) throw new Error('Authentication required')

    setMobileWalletsLoading(true)
    setMobileWalletsError(null)

    try {
      const wallets = await paymentService.addMobileWallet(payload)
      setMobileWallets(wallets)
      // Refresh from server to ensure consistency
      await fetchMobileWallets()
      return wallets
    } catch (err) {
      console.error('Error adding mobile wallet:', err)
      setMobileWalletsError(err.message || 'Failed to add mobile wallet')
      throw err
    } finally {
      setMobileWalletsLoading(false)
    }
  }, [token, fetchMobileWallets])

  /**
   * Update an existing mobile wallet
   * @param {Object} payload - { provider: 'Jazzcash' | 'Easypaisa', mobileNumber: string }
   */
  const updateMobileWallet = useCallback(async (payload) => {
    if (!token) throw new Error('Authentication required')

    setMobileWalletsLoading(true)
    setMobileWalletsError(null)

    try {
      const wallets = await paymentService.updateMobileWallet(payload)
      setMobileWallets(wallets)
      // Refresh from server to ensure consistency
      await fetchMobileWallets()
      return wallets
    } catch (err) {
      console.error('Error updating mobile wallet:', err)
      setMobileWalletsError(err.message || 'Failed to update mobile wallet')
      throw err
    } finally {
      setMobileWalletsLoading(false)
    }
  }, [token, fetchMobileWallets])

  /**
   * Delete a mobile wallet by provider
   * @param {string} provider - 'Jazzcash' | 'Easypaisa'
   */
  const deleteMobileWallet = useCallback(async (provider) => {
    if (!token) throw new Error('Authentication required')

    setMobileWalletsLoading(true)
    setMobileWalletsError(null)

    try {
      const wallets = await paymentService.deleteMobileWallet({ provider })
      setMobileWallets(wallets)
      // Refresh from server to ensure consistency
      await fetchMobileWallets()
      return wallets
    } catch (err) {
      console.error('Error deleting mobile wallet:', err)
      setMobileWalletsError(err.message || 'Failed to delete mobile wallet')
      throw err
    } finally {
      setMobileWalletsLoading(false)
    }
  }, [token, fetchMobileWallets])

  // ========== Credit Cards Methods ==========

  /**
   * Fetch credit cards from the server
   */
  const fetchCreditCards = useCallback(async () => {
    if (!token) {
      setCreditCards([])
      return
    }

    setCreditCardsLoading(true)
    setCreditCardsError(null)

    try {
      const cards = await paymentService.getCreditCards()
      setCreditCards(cards)
    } catch (err) {
      console.error('Error fetching credit cards:', err)
      setCreditCardsError(err.message || 'Failed to fetch credit cards')
      setCreditCards([])
    } finally {
      setCreditCardsLoading(false)
    }
  }, [token])

  /**
   * Add a new credit card
   * @param {Object} payload - { last4Digits: string, brand: string, expiryMonth: number, expiryYear: number, isDefault: boolean }
   */
  const addCreditCard = useCallback(async (payload) => {
    if (!token) throw new Error('Authentication required')

    setCreditCardsLoading(true)
    setCreditCardsError(null)

    try {
      const cards = await paymentService.addCreditCard(payload)
      setCreditCards(cards)
      // Refresh from server to ensure consistency
      await fetchCreditCards()
      return cards
    } catch (err) {
      console.error('Error adding credit card:', err)
      setCreditCardsError(err.message || 'Failed to add credit card')
      throw err
    } finally {
      setCreditCardsLoading(false)
    }
  }, [token, fetchCreditCards])

  /**
   * Delete a credit card by card ID
   * @param {string} cardId - The ID of the card to delete
   */
  const deleteCreditCard = useCallback(async (cardId) => {
    if (!token) throw new Error('Authentication required')

    setCreditCardsLoading(true)
    setCreditCardsError(null)

    try {
      const cards = await paymentService.deleteCreditCard({ cardId })
      setCreditCards(cards)
      // Refresh from server to ensure consistency
      await fetchCreditCards()
      return cards
    } catch (err) {
      console.error('Error deleting credit card:', err)
      setCreditCardsError(err.message || 'Failed to delete credit card')
      throw err
    } finally {
      setCreditCardsLoading(false)
    }
  }, [token, fetchCreditCards])

  // ========== Initial Data Fetching ==========

  /**
   * Load all payment data on mount or when token changes
   */
  useEffect(() => {
    if (token) {
      fetchMobileWallets()
      fetchCreditCards()
    } else {
      // Clear data when logged out
      setMobileWallets([])
      setCreditCards([])
      setMobileWalletsError(null)
      setCreditCardsError(null)
    }
  }, [token, fetchMobileWallets, fetchCreditCards])

  /**
   * Refresh all payment data
   */
  const refreshPaymentData = useCallback(async () => {
    if (!token) return
    await Promise.all([fetchMobileWallets(), fetchCreditCards()])
  }, [token, fetchMobileWallets, fetchCreditCards])

  /**
   * Clear all payment caches
   */
  const clearPaymentCaches = useCallback(() => {
    paymentService.invalidatePaymentCaches()
  }, [])

  const value = {
    // Mobile Wallets
    mobileWallets,
    mobileWalletsLoading,
    mobileWalletsError,
    addMobileWallet,
    updateMobileWallet,
    deleteMobileWallet,
    fetchMobileWallets,

    // Credit Cards
    creditCards,
    creditCardsLoading,
    creditCardsError,
    addCreditCard,
    deleteCreditCard,
    fetchCreditCards,

    // General
    refreshPaymentData,
    clearPaymentCaches
  }

  return <PaymentDataContext.Provider value={value}>{children}</PaymentDataContext.Provider>
}

/**
 * Hook to use payment data context
 */
export function usePaymentData() {
  const ctx = useContext(PaymentDataContext)
  if (!ctx) {
    throw new Error('usePaymentData must be used within PaymentDataProvider')
  }
  return ctx
}

/**
 * Hook to use mobile wallets specifically
 */
export function useMobileWallets() {
  const ctx = usePaymentData()
  return {
    mobileWallets: ctx.mobileWallets,
    loading: ctx.mobileWalletsLoading,
    error: ctx.mobileWalletsError,
    addMobileWallet: ctx.addMobileWallet,
    updateMobileWallet: ctx.updateMobileWallet,
    deleteMobileWallet: ctx.deleteMobileWallet,
    refresh: ctx.fetchMobileWallets
  }
}

/**
 * Hook to use credit cards specifically
 */
export function useCreditCards() {
  const ctx = usePaymentData()
  return {
    creditCards: ctx.creditCards,
    loading: ctx.creditCardsLoading,
    error: ctx.creditCardsError,
    addCreditCard: ctx.addCreditCard,
    deleteCreditCard: ctx.deleteCreditCard,
    refresh: ctx.fetchCreditCards
  }
}

export default PaymentDataContext
