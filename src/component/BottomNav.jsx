import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, ShoppingCart, CreditCard, Settings } from 'lucide-react'

const NavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation()
  const isActive = location.pathname === to
  const color = isActive ? 'var(--primary-color)' : 'var(--text-secondary)'

  return (
    <Link 
      to={to} 
      style={{ color, textDecoration: 'none' }}
      className="flex flex-col items-center gap-1 text-xs"
    >
      <Icon size={20} color={color} />
      <span style={{fontSize:12}}>{label}</span>
    </Link>
  )
}

export default function BottomNav() {
  const navStyle = {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: 0,
    width: 'var(--mobile-width)',
    maxWidth: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '10px 12px',
    borderTop: '1px solid var(--border-color)',
    background: 'var(--surface-color)',
    boxShadow: '0 -1px 6px rgba(0,0,0,0.03)',
    zIndex: 1000,
  }

  return (
    <nav style={navStyle} aria-label="Bottom navigation">
      <NavItem to="/" icon={Home} label="Home" />
      <NavItem to="/cart" icon={ShoppingCart} label="Cart" />
      <NavItem to="/checkout" icon={CreditCard} label="Checkout" />
      <NavItem to="/settings" icon={Settings} label="Settings" />
    </nav>
  )
}
