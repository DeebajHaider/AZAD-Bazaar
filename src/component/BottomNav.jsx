import React from 'react'
import { Link } from 'react-router-dom'

export default function BottomNav() {
  const navStyle = {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '10px 12px',
    borderTop: '1px solid #eee',
    background: '#fff',
    boxShadow: '0 -1px 6px rgba(0,0,0,0.03)',
    zIndex: 1000,
  }

  const linkStyle = { textDecoration: 'none', color: '#222' }

  return (
    <nav style={navStyle} aria-label="Bottom navigation">
      <Link style={linkStyle} to="/">Home</Link>
      <Link style={linkStyle} to="/cart">Cart</Link>
      <Link style={linkStyle} to="/checkout">Checkout</Link>
      <Link style={linkStyle} to="/settings">Settings</Link>
    </nav>
  )
}
