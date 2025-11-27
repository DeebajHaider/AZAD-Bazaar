import React, { createContext, useContext, useState, useMemo } from 'react'
import useCartApi from '../hooks/useCart'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { token } = useAuth()
  const api = useCartApi(token)
  
  // Track loading state per product
  const [productLoadingStates, setProductLoadingStates] = useState({})

  // Helper to set loading state for a product
  const setProductLoading = (itemCode, isLoading) => {
    setProductLoadingStates(prev => ({
      ...prev,
      [itemCode]: isLoading
    }))
  }

  // Check if a product is loading
  const isProductLoading = (itemCode) => {
    return productLoadingStates[itemCode] || false
  }

  // Calculate total items for the badge
  const totalItemsCount = useMemo(() => {
    return (api.items || []).reduce((acc, item) => acc + (item.quantity || 0), 0)
  }, [api.items])

  async function addItem(newItem) {
    if (!newItem) return
    const productId = newItem.itemCode
    if (!productId) return
    
    setProductLoading(productId, true)
    try {
      return await api.addToCart(productId)
    } finally {
      setProductLoading(productId, false)
    }
  }

  async function updateQuantity(itemCode, quantity) {
    const current = (api.items.find((it) => it.itemCode === itemCode) || {}).quantity || 0
    if (quantity === current) return
    
    setProductLoading(itemCode, true)
    try {
      if (quantity > current) {
        for (let i = 0; i < quantity - current; i++) {
          await api.addToCart(itemCode)
        }
      } else {
        for (let i = 0; i < current - quantity; i++) {
          await api.decrementProduct(itemCode)
        }
      }
    } finally {
      setProductLoading(itemCode, false)
    }
  }

  async function removeItem(itemCode) {
    setProductLoading(itemCode, true)
    try {
      return await api.removeItem(itemCode)
    } finally {
      setProductLoading(itemCode, false)
    }
  }

  async function clearCart() {
    // Set all items as loading
    api.items.forEach(item => {
      setProductLoading(item.itemCode, true)
    })
    try {
      return await api.clearCart()
    } finally {
      setProductLoadingStates({})
    }
  }

  // Convenience method to add to cart directly
  async function addToCart(itemCode) {
    setProductLoading(itemCode, true)
    try {
      return await api.addToCart(itemCode)
    } finally {
      setProductLoading(itemCode, false)
    }
  }

  // Convenience method to decrement
  async function decrementProduct(itemCode) {
    setProductLoading(itemCode, true)
    try {
      return await api.decrementProduct(itemCode)
    } finally {
      setProductLoading(itemCode, false)
    }
  }

  const value = {
    items: api.items,
    loading: api.loading,
    error: api.error,
    addItem,
    addToCart,
    updateQuantity,
    decrementProduct,
    removeItem,
    clearCart,
    total: api.total,
    savings: api.savings,
    reload: api.load,
    // New methods for per-product loading
    isProductLoading,
    productLoadingStates,
    totalItemsCount
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export default CartContext