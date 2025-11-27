import client from './client'
import { getFromCache, setInCache, invalidateCache } from './cacheUtils'
import { MOBILE_WALLETS, CREDIT_CARDS } from './cacheKeys'

const getToken = () => {
  try {
    return localStorage.getItem('token') || ''
  } catch (e) {
    return ''
  }
}

const paymentService = {
  // ========== Mobile Wallets ==========
  
  /**
   * Get all mobile wallets for the current user
   * @returns {Promise<Array>} Array of mobile wallet objects
   */
  getMobileWallets: async () => {
    const token = getToken()
    const cacheKey = MOBILE_WALLETS(token)
    
    // Check cache first
    const cached = await getFromCache(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch from server
    const resp = await client.get('/mobile-wallets')
    const wallets = resp.data.mobileWallets || []
    
    // Cache the result
    await setInCache(cacheKey, wallets)
    
    return wallets
  },

  /**
   * Add a new mobile wallet
   * @param {Object} payload - { provider: 'Jazzcash' | 'Easypaisa', mobileNumber: string }
   * @returns {Promise<Array>} Updated array of mobile wallets
   */
  addMobileWallet: async (payload) => {
    const resp = await client.post('/mobile-wallets', payload)
    const wallets = resp.data.mobileWallets || []
    
    // Invalidate cache
    await paymentService.invalidateMobileWalletsCache()
    
    return wallets
  },

  /**
   * Update an existing mobile wallet
   * @param {Object} payload - { provider: 'Jazzcash' | 'Easypaisa', mobileNumber: string }
   * @returns {Promise<Array>} Updated array of mobile wallets
   */
  updateMobileWallet: async (payload) => {
    const resp = await client.put('/mobile-wallets', payload)
    const wallets = resp.data.mobileWallets || []
    
    // Invalidate cache
    await paymentService.invalidateMobileWalletsCache()
    
    return wallets
  },

  /**
   * Delete a mobile wallet by provider
   * @param {Object} payload - { provider: 'Jazzcash' | 'Easypaisa' }
   * @returns {Promise<Array>} Updated array of mobile wallets
   */
  deleteMobileWallet: async (payload) => {
    const resp = await client.delete('/mobile-wallets', { data: payload })
    const wallets = resp.data.mobileWallets || []
    
    // Invalidate cache
    await paymentService.invalidateMobileWalletsCache()
    
    return wallets
  },

  /**
   * Invalidate mobile wallets cache
   */
  invalidateMobileWalletsCache: async () => {
    const token = getToken()
    const cacheKey = MOBILE_WALLETS(token)
    await invalidateCache(cacheKey)
  },

  // ========== Credit Cards ==========

  /**
   * Get all credit cards for the current user
   * @returns {Promise<Array>} Array of credit card objects
   */
  getCreditCards: async () => {
    const token = getToken()
    const cacheKey = CREDIT_CARDS(token)
    
    // Check cache first
    const cached = await getFromCache(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch from server
    const resp = await client.get('/credit-cards')
    const cards = resp.data.creditCards || []
    
    // Cache the result
    await setInCache(cacheKey, cards)
    
    return cards
  },

  /**
   * Add a new credit card
   * @param {Object} payload - { last4Digits: string, brand: string, expiryMonth: number, expiryYear: number, isDefault: boolean }
   * @returns {Promise<Array>} Updated array of credit cards
   */
  addCreditCard: async (payload) => {
    const resp = await client.post('/credit-cards', payload)
    const cards = resp.data.creditCards || []
    
    // Invalidate cache
    await paymentService.invalidateCreditCardsCache()
    
    return cards
  },

  /**
   * Delete a credit card by card ID
   * @param {Object} payload - { cardId: string }
   * @returns {Promise<Array>} Updated array of credit cards
   */
  deleteCreditCard: async (payload) => {
    const resp = await client.delete('/credit-cards', { data: payload })
    const cards = resp.data.creditCards || []
    
    // Invalidate cache
    await paymentService.invalidateCreditCardsCache()
    
    return cards
  },

  /**
   * Invalidate credit cards cache
   */
  invalidateCreditCardsCache: async () => {
    const token = getToken()
    const cacheKey = CREDIT_CARDS(token)
    await invalidateCache(cacheKey)
  },

  /**
   * Invalidate all payment-related caches
   */
  invalidatePaymentCaches: async () => {
    await Promise.all([
      paymentService.invalidateMobileWalletsCache(),
      paymentService.invalidateCreditCardsCache()
    ])
  }
}

export default paymentService
