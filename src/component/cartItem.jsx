import React from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { useI18n } from '../context/I18nContext';
import useTranslations from '../hooks/useTranslations';
import { useNavigate } from "react-router-dom";
import ImageWithLoader from "./ImageWithLoader";

/**
 * Counter Component
 * Now receives direct increment/decrement/remove handlers
 */
const Counter = ({ quantity, onIncrement, onDecrement, onRemove, itemName, disabled }) => {
  const { t } = useI18n();
  
  const handleDecrement = () => {
    if (disabled) return;
    if (quantity > 1) {
      onDecrement();
    } else {
      onRemove();
    }
  };

  const removeLabel = t('cartItem.removeAriaLabel') ? t('cartItem.removeAriaLabel').replace('{{itemName}}', itemName) : `Remove ${itemName}`;
  const decrementLabel = `Decrement quantity for ${itemName}`;
  const incrementLabel = `Increment quantity for ${itemName}`;

  return (
    <div className="flex items-center primBorder rounded-lg">
      <button
        onClick={handleDecrement}
        disabled={disabled}
        aria-label={quantity === 1 ? removeLabel : decrementLabel}
        className={`min-h-9 min-w-9 flex items-center justify-center rounded-l-md transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          quantity === 1 ? 'accentDangerText' : 'secText secHoverBg'
        }`}
      >
        {quantity === 1 ? <Trash2 size={18} className="text-white" /> : <Minus size={18} />}
      </button>

      <span className="w-8 text-center font-medium primText text-sm">
        {quantity}
      </span>

      <button
        onClick={onIncrement}
        disabled={disabled}
        aria-label={incrementLabel}
        className={`min-h-9 min-w-9 flex items-center justify-center secText secHoverBg rounded-r-md transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Plus size={18} />
      </button>
    </div>
  );
};

export const CartItemSkeleton = () => (
  <div className="flex items-center justify-between gap-4 card p-3">
    <div className="flex items-center gap-4 flex-1 min-w-0">
      <div className="w-16 h-16 flex-shrink-0 skeleton rounded-md"></div>
      <div className="flex-1 min-w-0 space-y-3">
        <div className="h-4 w-3/4 skeleton"></div>
        <div className="h-4 w-1/4 skeleton"></div>
      </div>
    </div>
    <div className="w-24 h-9 skeleton rounded-lg"></div>
  </div>
);

/**
 * CartItem Component
 * Receives increment/decrement/remove handlers directly
 * No quantity management logic here
 */
const CartItem = ({ item, onIncrement, onDecrement, onRemove, isUpdating }) => {
  const { translateDBVal } = useTranslations();
  const { lang, t } = useI18n();
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/product/${item.itemCode}`);
  };

  const itemName = translateDBVal("Product", "name", item.itemName, lang);

  return (
    <div className="flex items-center justify-between gap-4 card p-3">
      <div onClick={handleNavigate} className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
        {/* Image Section */}
        <ImageWithLoader
          src={item.itemPhoto}
          alt={itemName}
          containerClassName="w-16 h-16 flex-shrink-0 primBg primBorder rounded-md overflow-hidden"
          imageClassName="w-full h-full object-cover"
        />

        {/* Details Section */}
        <div className="flex-1 min-w-0">
          {/* Product Name - Full Width */}
          <p className="font-semibold primText truncate text-sm mb-2">
            {itemName}
          </p>
          
          {/* Price and Counter Row */}
          <div className="flex gap-3 items-center">
            {/* Left Column - Prices */}
            <div className="flex-1 flex flex-col gap-0">
              <span className="font-bold accentPrimText text-sm">
                {t('common.currencySymbol')} {Number(item.itemPrice).toLocaleString()}
              </span>
              {item.itemOldPrice && (
                <span className="text-xs secText line-through">
                  {t('common.currencySymbol')} {Number(item.itemOldPrice).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Column - Counter */}
      <div className="flex-shrink-0">
        <Counter
          quantity={item.quantity || 1}
          onIncrement={() => onIncrement(item.itemCode)}
          onDecrement={() => onDecrement(item.itemCode)}
          onRemove={() => onRemove(item.itemCode)}
          itemName={itemName}
          disabled={isUpdating}
        />
      </div>
    </div>
  );
};

/**
 * CartItemList Component
 * Passes through increment/decrement/remove handlers
 */
const CartItemList = ({ items, onIncrement, onDecrement, onRemove, updatingItems = [] }) => {
  return (
    <div className="space-y-3">
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