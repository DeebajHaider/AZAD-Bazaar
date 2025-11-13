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
    <div className="flex items-center border border-gray-200 dark:border-slate-800 rounded-lg">
      <button
        onClick={decrement}
        aria-label={quantity === 1 ? removeLabel : decrementLabel}
        className="min-h-10 min-w-10 flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-l-md transition-colors"
      >
        {quantity === 1 ? <Trash2 size={18} className="text-red-600 dark:text-red-500" /> : <Minus size={18} />}
      </button>

      <span className="w-10 text-center font-medium text-gray-900 dark:text-slate-50 text-sm">
        {quantity}
      </span>

      <button
        onClick={increment}
        aria-label={incrementLabel}
        className="min-h-10 min-w-10 flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-r-md transition-colors"
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
    <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-3">
      {/* Image Section */}
      <div className="w-16 h-16 flex-shrink-0 bg-white dark:bg-slate-800 rounded-md overflow-hidden">
        <img src={item.itemPhoto} alt={itemName} className="w-full h-full object-cover" />
      </div>

      {/* Details Section (flex-1 allows it to take up remaining space) */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-slate-50 truncate">
          {itemName}
        </p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-bold text-gray-900 dark:text-slate-50">
            {t('common.currencySymbol')} {item.itemPrice}
          </span>
          {item.itemOldPrice && (
            <span className="text-sm text-gray-600 dark:text-slate-400 line-through">
              {t('common.currencySymbol')} {item.itemOldPrice}
            </span>
          )}
        </div>
      </div>

      {/* Counter Section */}
      <div className="flex-shrink-0">
        <Counter
          quantity={quantity}
          onChange={handleChange}
          onRemove={handleRemove}
          itemName={itemName}
        />
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