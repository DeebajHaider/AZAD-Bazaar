import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Settings } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

// Sub-component for each navigation item
const NavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  // Base classes for all items
  const baseClasses = "flex flex-col items-center justify-center gap-1 w-full min-h-12 py-2 rounded-lg transition-all duration-200";
  
  // Classes for the active item, using the system's "selected" class
  // Note: modeChooseButton-selected does not have its own border, it relies on the unselected state to provide it.
  // To prevent layout shift, we add a transparent border to the inactive state.
  const activeClasses = "modeChooseButton-selected font-medium";
  
  // Classes for inactive items
  const inactiveClasses = "secText hover:primText border-2 border-transparent";

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
  const { t } = useI18n();

  return (
    // Outer container handles the fixed positioning and background color.
    // Use design tokens from index.css for background and border.
    <header className="bottom-0 left-0 right-0 primBg primBorder">
      <nav 
        className="max-w-[430px] mx-auto flex justify-around items-center h-16 px-4 gap-2" // Added gap-2 for spacing
        aria-label={t('bottomNav.ariaLabel')}
      >
        <NavItem to="/" icon={Home} label={t('bottomNav.home')} />
        <NavItem to="/cart" icon={ShoppingCart} label={t('bottomNav.cart')} />
        <NavItem to="/settings" icon={Settings} label={t('bottomNav.settings')} />
      </nav>
    </header>
  );
}