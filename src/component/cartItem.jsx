import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./cartItem.css";
import { useI18n } from '../context/I18nContext'

const Counter = ({ quantity, onChange, onRemove, itemName }) => {
  const decrement = () => {
    if (quantity > 1) onChange(quantity - 1)
    else onRemove()
  }

  const increment = () => onChange(quantity + 1)

  const { t } = useI18n()
  const removeLabel = t('cartItem.removeAriaLabel') ? t('cartItem.removeAriaLabel').replace('{{itemName}}', itemName) : `Remove ${itemName}`

  return (
    <div className="counter">
      {quantity === 1 ? (
        <button onClick={decrement} className="counter-btn counter-btn-delete" aria-label={removeLabel}>
          <Trash2 size={18} />
        </button>
      ) : (
        <button onClick={decrement} className="counter-btn" aria-label={removeLabel}>
          −
        </button>
      )}
      <span className="counter-value">{quantity}</span>
      <button onClick={increment} className="counter-btn">
        +
      </button>
    </div>
  )
}

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const { t } = useI18n()
  const [quantity, setQuantity] = useState(item.quantity || 0)
  const navigate = useNavigate()

  // sync when parent updates
  React.useEffect(() => {
    setQuantity(item.quantity || 0)
  }, [item.quantity])

  const handleChange = (next) => {
    setQuantity(next)
    onQuantityChange && onQuantityChange(item.itemCode, next)
  }

  const handleRemove = () => {
    onRemove && onRemove(item.itemCode)
  }

  return (
    <div className="cart-item">
      {/* Image Section - 15% */}
      <div className="cart-item-image">
        <button
          type="button"
          onClick={() => navigate('/cart')}
          className="cart-item-link p-0 bg-transparent border-0"
          aria-label={t('cartItem.viewDetailsAriaLabel') ? t('cartItem.viewDetailsAriaLabel').replace('{{itemName}}', item.itemName) : `Open cart for ${item.itemName}`}
        >
          <img src={item.itemPhoto} alt={item.itemName} className="cart-item-img" />
        </button>
      </div>

      {/* Middle Section - 60% */}
      <div className="cart-item-details">
        <button
          type="button"
          onClick={() => navigate('/cart')}
          className="cart-item-name cart-item-link text-left"
          aria-label={t('cartItem.viewDetailsAriaLabel') ? t('cartItem.viewDetailsAriaLabel').replace('{{itemName}}', item.itemName) : `Open cart for ${item.itemName}`}
        >
          {item.itemName}
        </button>
        <div className="cart-item-price">
          <span className="price-current">{t('common.currencySymbol')}. {item.itemPrice}</span>
          <span className="price-old">{t('common.currencySymbol')}. {item.itemOldPrice}</span>
        </div>
      </div>

      {/* Counter Section - 25% */}
      <div className="cart-item-counter">
        <Counter quantity={quantity} onChange={handleChange} onRemove={handleRemove} itemName={item.itemName} />
      </div>
    </div>
  )
}

const CartItemList = ({ items, onQuantityChange, onRemove }) => {
  return (
    <div className="cart-item-list">
      <div className="cart-items">
        {items.map((item) => (
          <CartItem key={item.itemCode} item={item} onQuantityChange={onQuantityChange} onRemove={onRemove} />
        ))}
      </div>
    </div>
  )
}

export default CartItemList;
