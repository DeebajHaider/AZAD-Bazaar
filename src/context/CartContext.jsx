import React, { createContext, useContext } from 'react'
import useCartApi from '../hooks/useCart'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  // use the API-backed hook internally
  const { token } = useAuth()
  const api = useCartApi(token)

  // expose a compatible API similar to the previous CartContext
  // addItem expects an object with itemCode === productId string
  async function addItem(newItem) {
    if (!newItem) return
    const productId = newItem.itemCode
    if (!productId) return
    return api.addToCart(productId)
  }

  // updateQuantity will increment or decrement until the desired quantity is reached
  async function updateQuantity(itemCode, quantity) {
    const current = (api.items.find((it) => it.itemCode === itemCode) || {}).quantity || 0
    if (quantity === current) return
    if (quantity > current) {
      for (let i = 0; i < quantity - current; i++) await api.addToCart(itemCode)
    } else {
      for (let i = 0; i < current - quantity; i++) await api.decrementProduct(itemCode)
    }
    // api.load() is called inside addToCart/decrementProduct, so state will refresh
  }

  // removeItem: remove fully using direct API if available
  async function removeItem(itemCode) {
    if (api.removeProduct) {
      await api.removeProduct(itemCode)
    } else {
      // fallback: decrement until gone
      const current = (api.items.find((it) => it.itemCode === itemCode) || {}).quantity || 0
      for (let i = 0; i < current; i++) await api.decrementProduct(itemCode)
    }
  }

  async function clearCart() {
    return api.clearCart()
  }

  const value = {
    items: api.items,
    loading: api.loading,
    error: api.error,
    addItem,
    addToCart: api.addToCart,
    updateQuantity,
    decrementProduct: api.decrementProduct,
    removeItem,
    clearCart,
    total: api.total,
    savings: api.savings,
    reload: api.load
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export default CartContext
