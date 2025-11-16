import React, { useState, useEffect } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { useI18n } from '../context/I18nContext';
import useTranslations from '../hooks/useTranslations';

/**
 * Counter Component (Redesigned)
 * - Larger, touch-friendly buttons (min-w-10, min-h-10) meeting the 44px guideline.
 * - Visually grouped with a border and rounded corners.
 * - Uses Minus icon for decrementing for better visual consistency.
 */
const Counter = ({ quantity, onChange, onRemove, itemName }) => {
  const { t } = useI18n();
  const decrement = () => {
    if (quantity > 1) onChange(quantity - 1);
    else onRemove();
  };
  const increment = () => onChange(quantity + 1);

  const removeLabel = t('cartItem.removeAriaLabel') ? t('cartItem.removeAriaLabel').replace('{{itemName}}', itemName) : `Remove ${itemName}`;
  const decrementLabel = `Decrement quantity for ${itemName}`; // You can add keys for these if needed
  const incrementLabel = `Increment quantity for ${itemName}`; // You can add keys for these if needed

  return (
    <div className="flex items-center primBorder rounded-lg ">
      <button
        onClick={decrement}
        aria-label={quantity === 1 ? removeLabel : decrementLabel}
        className={`min-h-9 min-w-9 flex items-center justify-center rounded-l-md transition-colors ${
          quantity === 1 ? 'accentDangerText' : 'secText secHoverBg'
        }`}
      >
        {quantity === 1 ? <Trash2 size={18} className="text-white" /> : <Minus size={18} />}
      </button>

      <span className="w-8 text-center font-medium primText text-sm">
        {quantity}
      </span>

      <button
        onClick={increment}
        aria-label={incrementLabel}
        className="min-h-9 min-w-9  flex items-center justify-center secText secHoverBg rounded-r-md transition-colors"
      >
        <Plus size={18} />
      </button>
    </div>
  );
};


/**
 * CartItem Component (Redesigned)
 * - Follows the "Card Component" pattern from your guidelines.
 * - Uses a robust flexbox layout instead of fixed percentages.
 * - Typography and colors match the design system.
 * - Removed confusing navigation back to the cart page.
 */
const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const { translateDBVal } = useTranslations();
  const { lang, t } = useI18n();
  const [quantity, setQuantity] = useState(item.quantity || 1);

  // Sync quantity from parent props
  useEffect(() => {
    setQuantity(item.quantity || 1);
  }, [item.quantity]);

  const handleChange = (nextQuantity) => {
    setQuantity(nextQuantity);
    onQuantityChange?.(item.itemCode, nextQuantity);
  };

  const handleRemove = () => {
    onRemove?.(item.itemCode);
  };

  const itemName = translateDBVal("Product", "name", item.itemName, lang);

  return (
    <div className="flex items-center gap-4 card p-3">
      {/* Image Section */}
      <div className="w-16 h-16 flex-shrink-0 primBg primBorder rounded-md overflow-hidden">
        <img src={item.itemPhoto} alt={itemName} className="w-full h-full object-cover" />
      </div>

      {/* Details Section */}
      <div className="flex-1 min-w-0 flex flex-col">
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
              <span className="text-xs  secText line-through">
                {t('common.currencySymbol')} {Number(item.itemOldPrice).toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Right Column - Counter */}
          <div className="flex-shrink-0">
            <Counter
              quantity={quantity}
              onChange={handleChange}
              onRemove={handleRemove}
              itemName={itemName}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * CartItemList Component (Simplified)
 * - Now a simple wrapper that adds vertical spacing between items.
 */
const CartItemList = ({ items, onQuantityChange, onRemove }) => {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <CartItem key={item.itemCode} item={item} onQuantityChange={onQuantityChange} onRemove={onRemove} />
      ))}
    </div>
  );
};


export default CartItemList;