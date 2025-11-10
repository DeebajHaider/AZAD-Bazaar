import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, ShoppingCart, CreditCard, Settings } from 'lucide-react'

const NavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation()
  const isActive = location.pathname === to
  
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center gap-1 text-xs ${
        isActive ? 'text-blue-600' : 'text-gray-600'
      }`}
    >
      <Icon size={40} />
      <span>{label}</span>
    </Link>
  )
}

export default function BottomNav() {
  return (
    <nav className="fixed left-0 right-0 bottom-0 flex justify-around items-center p-3 bg-white border-t border-gray-100 shadow-sm z-[1000]">
      <NavItem to="/" icon={Home} label="Home" />
      <NavItem to="/cart" icon={ShoppingCart} label="Cart" />
      <NavItem to="/checkout" icon={CreditCard} label="Checkout" />
      <NavItem to="/settings" icon={Settings} label="Settings" />
    </nav>
  )
}
