import React from "react";
import { Trash2, Plus, Minus, X, Loader2 } from "lucide-react";
import { useI18n } from '../context/I18nContext';
import useTranslations from '../hooks/useTranslations';
import { useNavigate } from "react-router-dom";
import ImageWithLoader from "./ImageWithLoader";

/**
 * Counter Component (Refined)
 * - Minus button disables at 1 instead of changing to remove
 * - Strictly handles Quantity Logic
 */
const Counter = ({ quantity, onIncrement, onDecrement, itemName, disabled }) => {
  const { t } = useI18n();

  // Disable decrement if quantity is 1 or if loading
  const isDecrementDisabled = quantity <= 1 || disabled;

  const decrementLabel = t('cart.a11y.decrement', { defaultValue: `Decrease quantity for ${itemName}` });
  const incrementLabel = t('cart.a11y.increment', { defaultValue: `Increase quantity for ${itemName}` });

  return (
    <div className="flex items-center primBorder rounded-lg h-9 bg-white dark:bg-slate-950">
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isDecrementDisabled) onDecrement();
        }}
        disabled={isDecrementDisabled}
        aria-label={decrementLabel}
        className={`w-9 h-full flex items-center justify-center rounded-l-md transition-colors focusRing
          ${isDecrementDisabled
            ? 'opacity-30 cursor-not-allowed text-gray-400'
            : 'secText hover:bg-gray-100 dark:hover:bg-slate-800 active:bg-gray-200'
          }`}
      >
        <Minus size={16} />
      </button>

      <span
        className="w-8 text-center font-medium primText text-sm tabular-nums select-none"
        aria-live="polite"
      >
        {quantity}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onIncrement();
        }}
        disabled={disabled}
        aria-label={incrementLabel}
        className={`w-9 h-full flex items-center justify-center secText rounded-r-md transition-colors focusRing
          ${disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-100 dark:hover:bg-slate-800 active:bg-gray-200'
          }`}
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export const CartItemSkeleton = () => (
  <div className="card p-3 relative flex gap-3 h-[104px]">
    <div className="w-20 h-20 flex-shrink-0 skeleton rounded-md"></div>
    <div className="flex-1 space-y-3 py-1">
      <div className="h-4 w-3/4 skeleton"></div>
      <div className="h-4 w-1/4 skeleton"></div>
    </div>
    <div className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 w-24 h-9 skeleton rounded-lg"></div>
  </div>
);

/**
 * CartItem Component
 * - Added dedicated Top-Right Remove Button
 * - RTL Support via Tailwind logical classes
 */
const CartItem = ({ item, onIncrement, onDecrement, onRemove, isUpdating }) => {
  const { translateDBVal } = useTranslations();
  const { lang, t } = useI18n();
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/product/${item.itemCode}`);
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking remove
    onRemove(item.itemCode);
  };

  const itemName = translateDBVal("Product", "name", item.itemName, lang);

  // Determine if RTL for manual logic if needed, 
  // though Tailwind 'rtl:' classes usually handle this if dir="rtl" is set on HTML
  const isRTL = lang === 'ur' || lang === 'ar';

  return (
    <div
      onClick={!isUpdating ? handleNavigate : undefined}
      className={`group relative flex items-start gap-3 card p-3 transition-all duration-200 ${
        isUpdating ? 'cursor-not-allowed' : 'hover:shadow-md cursor-pointer'
      }`}
    >

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 rounded-lg flex items-center justify-center z-20">
          <Loader2 className="w-6 h-6 accentPrimText animate-spin" />
        </div>
      )}

      {/* 
        --- DEDICATED REMOVE BUTTON --- 
        Positioned absolutely to the top-right (or top-left in RTL).
        Using 'pe' (padding-end) on the text container ensures text doesn't overlap this button.
      */}
      <button
        onClick={handleRemoveClick}
        disabled={isUpdating}
        aria-label={t('cart.actions.remove', { defaultValue: 'Remove item' })}
        className={`absolute top-2 right-2 rtl:right-auto rtl:left-2 p-2 rounded-full accentDangerText transition-colors focusRing z-10 ${
          isUpdating ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Trash2 size={18} />
      </button>

      {/* Image Section */}
      <div className="flex-shrink-0 relative">
        <ImageWithLoader
          src={item.itemPhoto}
          alt={itemName}
          containerClassName="w-20 h-20 bg-white dark:bg-slate-950 primBorder rounded-md overflow-hidden"
          imageClassName="w-full h-full object-contain p-1"
        />
        {/* Optional: Low stock indicator overlay could go here */}
      </div>

      {/* Details Section */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch min-h-[80px]">

        {/* Header: Name (with padding-end to avoid delete button) */}
        <div className="pe-8 rtl:ps-8 rtl:text-right rtl:pe-0 rtl:pr-0">
          <h3 className="font-semibold primText text-sm leading-tight line-clamp-2 rtl:text-right">
            {itemName}
          </h3>
        </div>

        {/* Footer: Price & Controls */}
        <div className="flex items-end justify-between gap-2 mt-2">

          {/* Price Block */}
          <div className="flex flex-col">
            {item.itemOldPrice && (
              <span className="text-[11px] secText line-through">
                {t('common.currencySymbol')} {Number(item.itemOldPrice).toLocaleString()}
              </span>
            )}
            <span className="font-bold accentPrimText text-base">
              {t('common.currencySymbol')} {Number(item.itemPrice).toLocaleString()}
            </span>
          </div>

          {/* Counter Block - onClick stopPropagation is handled inside Counter */}
          <div className="flex-shrink-0">
            <Counter
              quantity={item.quantity || 1}
              onIncrement={() => onIncrement(item.itemCode)}
              onDecrement={() => onDecrement(item.itemCode)}
              itemName={itemName}
              disabled={isUpdating}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * CartItemList Component
 */
const CartItemList = ({ items, onIncrement, onDecrement, onRemove, updatingItems = [] }) => {
  return (
    <div className="space-y-3 pb-safe">
      {items.map((item) => (
        <CartItem
          key={item.itemCode}
          item={item}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          onRemove={onRemove}
          isUpdating={updatingItems.includes(item.itemCode)}
        />
      ))}
    </div>
  );
};

export default CartItemList;