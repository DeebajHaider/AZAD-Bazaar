import React, { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)

const SAMPLE_INITIAL = [
  {
    itemCode: 'ITEM001',
    itemName: 'Bazaar Select Dar Chini 100g',
    itemPhoto: 'https://via.placeholder.com/80?text=Spice',
    itemPrice: 119,
    itemOldPrice: 159,
    quantity: 1,
  },
  {
    itemCode: 'ITEM002',
    itemName: 'Organic Turmeric Powder 200g',
    itemPhoto: 'https://via.placeholder.com/80?text=Turmeric',
    itemPrice: 299,
    itemOldPrice: 349,
    quantity: 2,
  },
  {
    itemCode: 'ITEM003',
    itemName: 'Clove Premium 50g',
    itemPhoto: 'https://via.placeholder.com/80?text=Clove',
    itemPrice: 199,
    itemOldPrice: 249,
    quantity: 3,
  },
]

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('azad_cart')
      if (raw) return JSON.parse(raw)
    } catch (e) {
      // ignore
    }
    return SAMPLE_INITIAL
  })

  useEffect(() => {
    try {
      localStorage.setItem('azad_cart', JSON.stringify(items))
    } catch (e) {
      // ignore
    }
  }, [items])

  function addItem(newItem) {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.itemCode === newItem.itemCode)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + (newItem.quantity || 1) }
        return copy
      }
      return [...prev, { ...newItem, quantity: newItem.quantity || 1 }]
    })
  }

  function updateQuantity(itemCode, quantity) {
    setItems((prev) => prev.map((it) => (it.itemCode === itemCode ? { ...it, quantity } : it)).filter(it => it.quantity > 0))
  }

  function removeItem(itemCode) {
    setItems((prev) => prev.filter((it) => it.itemCode !== itemCode))
  }

  function clearCart() {
    setItems([])
  }

  const total = items.reduce((sum, it) => sum + (Number(it.itemPrice) || 0) * (Number(it.quantity) || 0), 0)

  const savings = items.reduce((sum, it) => sum + ((Number(it.itemOldPrice) || 0) - (Number(it.itemPrice) || 0)) * (Number(it.quantity) || 0), 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, total, savings }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export default CartContext
