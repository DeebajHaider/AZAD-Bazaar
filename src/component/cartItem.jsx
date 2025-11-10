import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import "./cartItem.css";

const Counter = ({ quantity, onChange, onRemove }) => {
  const decrement = () => {
    if (quantity > 1) onChange(quantity - 1)
    else onRemove()
  }

  const increment = () => onChange(quantity + 1)

  return (
    <div className="counter">
      {quantity === 1 ? (
        <button onClick={decrement} className="counter-btn counter-btn-delete">
          <Trash2 size={18} />
        </button>
      ) : (
        <button onClick={decrement} className="counter-btn">
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
  const [quantity, setQuantity] = useState(item.quantity || 0)

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
        <img src={item.itemPhoto} alt={item.itemName} className="cart-item-img" />
      </div>

      {/* Middle Section - 60% */}
      <div className="cart-item-details">
        <p className="cart-item-name">{item.itemName}</p>
        <div className="cart-item-price">
          <span className="price-current">Rs. {item.itemPrice}</span>
          <span className="price-old">Rs. {item.itemOldPrice}</span>
        </div>
      </div>

      {/* Counter Section - 25% */}
      <div className="cart-item-counter">
        <Counter quantity={quantity} onChange={handleChange} onRemove={handleRemove} />
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
