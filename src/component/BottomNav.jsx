import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Settings, Search, Package } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useCart } from '../context/CartContext';

// Helper component for Icons with "Pop" animation on count increase
const BadgeIcon = ({ icon: Icon, count, isCart }) => {
  const [isBumping, setIsBumping] = useState(false);
  const prevCountRef = useRef(count);

  useEffect(() => {
    // Only animate if count INCREASES
    if (count > prevCountRef.current) {
      setIsBumping(true);
      const timer = setTimeout(() => {
        setIsBumping(false);
      }, 200); // 200ms duration for a snappy feel
      return () => clearTimeout(timer);
    }
    // Update ref for next render
    prevCountRef.current = count;
  }, [count]);

  return (
    <div 
      className={`
        relative inline-flex transition-transform duration-200 ease-out
        ${isBumping ? 'scale-125 -rotate-6' : 'scale-100'} 
      `}
    >
      {/* 
         If animating, we also switch the icon color briefly to the accent color 
         to make it flash 
      */}
      <Icon 
        size={24} 
        className={`transition-colors duration-200 ${isBumping && isCart ? 'accentPrimText' : ''}`} 
      />
      
      {count > 0 && (
        <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[16px] h-4 text-[10px] font-bold leading-none text-white accentDangerBg rounded-full px-1 border border-white dark:border-slate-900 shadow-sm">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
};

const NavItem = ({ to, icon, label, badgeCount, isCart }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  // Base classes
  const baseClasses = "flex flex-col items-center justify-center gap-1 w-full min-h-12 py-2 rounded-lg transition-all duration-200";
  
  // Active state
  const activeClasses = "modeChooseButton-selected font-medium";
  
  // Inactive state
  const inactiveClasses = "secText hover:primText border-2 border-transparent";

  const ariaLabel = badgeCount > 0 ? `${label}, ${badgeCount} items` : label;

  return (
    <Link 
      to={to} 
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      aria-current={isActive ? 'page' : undefined}
      aria-label={ariaLabel}
    >
      <BadgeIcon 
        icon={icon} 
        count={badgeCount} 
        isCart={isCart} // Pass this so we know to animate color too
      />
      <span className="text-xs">{label}</span>
    </Link>
  );
};

export default function BottomNav() {
  const { t } = useI18n();
  const { totalItemsCount } = useCart();

  return (
    <header className="bottom-0 left-0 right-0 primBg primBorder sticky z-50">
      <nav 
        className="max-w-[430px] mx-auto flex justify-around items-center h-16 px-4 gap-2"
        aria-label={t('bottomNav.ariaLabel')}
      >
        <NavItem to="/" icon={Home} label={t('bottomNav.home')} />
        <NavItem to="/search-results" icon={Search} label={t('bottomNav.search')} />
        
        {/* Cart Item - Has the badge and animation logic */}
        <NavItem 
          to="/cart" 
          icon={ShoppingCart} 
          label={t('bottomNav.cart')} 
          badgeCount={totalItemsCount}
          isCart={true} 
        />
        
        <NavItem to="/orders" icon={Package} label={t('bottomNav.orders')} />
        <NavItem to="/settings" icon={Settings} label={t('bottomNav.settings')} />
      </nav>
    </header>
  );
}