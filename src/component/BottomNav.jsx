import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, ShoppingCart, Settings } from 'lucide-react'

const NavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation()
  const isActive = location.pathname === to
  const color = isActive ? 'var(--color-primary-500)' : 'var(--color-text-secondary)'

  return (
    <Link 
      to={to} 
      style={{ color, textDecoration: 'none' }}
      className="flex flex-col items-center gap-1 text-xs"
    >
      <Icon size={20} color={color} />
      <span style={{fontSize:'var(--font-size-xs)'}}>{label}</span>
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
    padding: 'var(--space-2) var(--space-3)',
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    boxShadow: 'var(--shadow-nav)',
    zIndex: 1000,
  }

  return (
    <nav style={navStyle} aria-label="Bottom navigation">
      <NavItem to="/" icon={Home} label="Home" />
      <NavItem to="/cart" icon={ShoppingCart} label="Cart" />
      <NavItem to="/settings" icon={Settings} label="Settings" />
    </nav>
  )
}
