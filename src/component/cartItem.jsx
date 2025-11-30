import React from "react";
import { Trash2, Plus, Minus, Loader2 } from "lucide-react";
import { useI18n } from '../context/I18nContext';
import useTranslations from '../hooks/useTranslations';
import { useNavigate } from "react-router-dom";
import ImageWithLoader from "./ImageWithLoader";

/**
 * Counter Component
 * - Uses Outline Variant for borders to define the touch area.
 * - Uses Surface color to distinguish from the Card background.
 */
const Counter = ({ quantity, onIncrement, onDecrement, itemName, disabled }) => {
  const { t } = useI18n();

  const isDecrementDisabled = quantity <= 1 || disabled;
  const decrementLabel = t('cart.a11y.decrement', { defaultValue: `Decrease quantity for ${itemName}` });
  const incrementLabel = t('cart.a11y.increment', { defaultValue: `Increase quantity for ${itemName}` });

  return (
    // MD3: Outlined input group style
    // border-md-outline-variant: Subtle border
    // bg-md-surface: Sits on top of the card's "surface-container"
    <div className="flex items-center border border-md-outline-variant rounded-md h-9 bg-md-surface overflow-hidden">
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isDecrementDisabled) onDecrement();
        }}
        disabled={isDecrementDisabled}
        aria-label={decrementLabel}
        className={`w-9 h-full flex items-center justify-center transition-colors
          ${isDecrementDisabled
            ? 'opacity-30 cursor-not-allowed text-md-on-surface-variant'
            : 'text-md-on-surface-variant hover:bg-md-surface-variant/20 active:bg-md-surface-variant/40'
          }`}
      >
        <Minus size={16} />
      </button>

      {/* Quantity Text: High Emphasis */}
      <span
        className="w-8 text-center font-medium text-md-on-surface text-sm tabular-nums select-none"
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
        className={`w-9 h-full flex items-center justify-center transition-colors
          ${disabled
            ? 'opacity-50 cursor-not-allowed text-md-on-surface-variant'
            : 'text-md-on-surface-variant hover:bg-md-surface-variant/20 active:bg-md-surface-variant/40'
          }`}
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export const CartItemSkeleton = () => (
  // MD3 Skeleton: Surface Container as base, Surface Variant for pulse
  <div className="p-3 relative flex gap-3 h-[104px] bg-md-surface-container rounded-md">
    <div className="w-20 h-20 flex-shrink-0 bg-md-surface-variant/50 animate-pulse rounded-md"></div>
    <div className="flex-1 space-y-3 py-1">
      <div className="h-4 w-3/4 bg-md-surface-variant/50 animate-pulse rounded"></div>
      <div className="h-4 w-1/4 bg-md-surface-variant/50 animate-pulse rounded"></div>
    </div>
    <div className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 w-24 h-9 bg-md-surface-variant/50 animate-pulse rounded-md"></div>
  </div>
);

/**
 * CartItem Component
 */
const CartItem = ({ item, onIncrement, onDecrement, onRemove, isUpdating }) => {
  const { translateDBVal } = useTranslations();
  const { lang, t } = useI18n();
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/product/${item.itemCode}`);
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onRemove(item.itemCode);
  };

  const itemName = translateDBVal("Product", "name", item.itemName, lang);

  return (
    <div
      onClick={!isUpdating ? handleNavigate : undefined}
      // MD3 Card:
      // bg-md-surface-container: Creates depth against the main background
      // text-md-on-surface: Base text color
      className={`group relative flex items-start gap-3 p-3 rounded-md transition-all duration-200 bg-md-surface-container border border-transparent ${
        isUpdating ? 'cursor-not-allowed' : 'hover:shadow-md cursor-pointer hover:bg-md-surface-container-high'
      }`}
    >

      {/* Loading Overlay - Scrim */}
      {isUpdating && (
        <div className="absolute inset-0 bg-md-surface/60 rounded-md flex items-center justify-center z-20 backdrop-blur-[1px]">
          <Loader2 className="w-6 h-6 text-md-primary animate-spin" />
        </div>
      )}

      {/* 
        REMOVE BUTTON
        - Default: Error color text
        - Hover: Error Container background (Material standard for destructive icon buttons)
      */}
      <button
        onClick={handleRemoveClick}
        disabled={isUpdating}
        aria-label={t('cart.actions.remove', { defaultValue: 'Remove item' })}
        className={`absolute top-2 right-2 rtl:right-auto rtl:left-2 p-2 rounded-full text-md-error transition-colors z-10 ${
          isUpdating 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-md-error-container hover:text-md-on-error-container active:scale-95'
        }`}
      >
        <Trash2 size={18} />
      </button>

      {/* Image Section */}
      <div className="flex-shrink-0 relative">
        <ImageWithLoader
          src={item.itemPhoto}
          alt={itemName}
          // Container Highest provides a nice frame for images
          containerClassName="w-20 h-20 bg-md-surface-container-highest rounded-md overflow-hidden"
          imageClassName="w-full h-full object-contain p-1 mix-blend-multiply dark:mix-blend-normal"
        />
      </div>

      {/* Details Section */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch min-h-[80px]">

        {/* Header: Name */}
        <div className="pe-8 rtl:ps-8 rtl:text-right rtl:pe-0 rtl:pr-0">
          <h3 className="font-semibold text-md-on-surface text-sm leading-tight line-clamp-2 rtl:text-right">
            {itemName}
          </h3>
        </div>

        {/* Footer: Price & Controls */}
        <div className="flex items-end justify-between gap-2 mt-2">

          {/* Price Block */}
          <div className="flex flex-col">
            {item.itemOldPrice && (
              <span className="text-[11px] text-md-on-surface-variant line-through">
                {t('common.currencySymbol')} {Number(item.itemOldPrice).toLocaleString()}
              </span>
            )}
            <span className="font-bold text-md-on-surface text-base">
              {t('common.currencySymbol')} {Number(item.itemPrice).toLocaleString()}
            </span>
          </div>

          {/* Counter Block */}
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