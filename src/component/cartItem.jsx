import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import "./cartItem.css";

const Counter = ({ quantity, setQuantity }) => {
  const decrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
    else setQuantity(0);
  };

  const increment = () => setQuantity(quantity + 1);

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
  );
};

const CartItem = ({ item }) => {
  const [quantity, setQuantity] = useState(item.quantity);

  return (
    <div className="cart-item">
      {/* Image Section - 15% */}
      <div className="cart-item-image">
        <img
          src={item.itemPhoto}
          alt={item.itemName}
          className="cart-item-img"
        />
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
        <Counter quantity={quantity} setQuantity={setQuantity} />
      </div>
    </div>
  );
};

const CartItemList = ({ items }) => {
  return (
    <div className="cart-item-list">
      <div className="cart-items">
        {items.map((item) => (
          <CartItem key={item.itemCode} item={item} />
        ))}
      </div>
    </div>
  );
};

export default CartItemList;
