import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Settings } from 'lucide-react';

// Sub-component for each navigation item
const NavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  // Base classes for all items
  const baseClasses = "flex flex-col items-center justify-center gap-1 w-full min-h-12 py-2 rounded-lg transition-all duration-200";
  
  // Classes for the active item (with the "pill" background)
  const activeClasses = "bg-blue-50 dark:bg-slate-800 text-blue-500 dark:text-blue-500 font-medium";
  
  // Classes for inactive items
  const inactiveClasses = "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200";

  return (
    <Link 
      to={to} 
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon size={24} />
      <span className="text-xs">{label}</span>
    </Link>
  );
};

// Main BottomNav component
export default function BottomNav() {
  return (
    // Outer container handles the fixed positioning and background color.
    // A subtle top border provides separation from the page content.
    <header className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
      
      <nav 
        className="max-w-[430px] mx-auto flex justify-around items-center h-16 px-4"
        aria-label="Bottom navigation"
      >
        <NavItem to="/" icon={Home} label="Home" />
        <NavItem to="/cart" icon={ShoppingCart} label="Cart" />
        <NavItem to="/settings" icon={Settings} label="Settings" />
      </nav>
    </header>
  );
}