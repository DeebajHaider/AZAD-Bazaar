import React, { useState } from "react";
import { Trash2 } from "lucide-react";

const Counter = ({ quantity, setQuantity }) => {
  const decrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
    else setQuantity(0); // can remove item here if needed
  };

  const increment = () => setQuantity(quantity + 1);

  return (
    <div className="flex items-center justify-center border rounded-lg px-2 py-1 w-24">
      {quantity === 1 ? (
        <button onClick={decrement} className="text-red-500">
          <Trash2 size={18} />
        </button>
      ) : (
        <button onClick={decrement} className="text-gray-600 text-lg">
          −
        </button>
      )}
      <span className="mx-3 text-sm text-gray-600">{quantity}</span>
      <button onClick={increment} className="text-gray-600 text-lg">
        +
      </button>
    </div>
  );
};

const CartItem = ({ item }) => {
  const [quantity, setQuantity] = useState(item.quantity);

  return (
    <div className="flex items-center bg-white rounded-lg shadow-sm w-full py-3 px-2 mb-2">
      {/* Image Section - 15% */}
      <div className="w-[15%] flex justify-center items-center">
        <img
          src={item.itemPhoto}
          alt={item.itemName}
          className="w-12 h-12 object-cover rounded-md border"
        />
      </div>

      {/* Middle Section - 60% */}
      <div className="w-[60%] flex flex-col justify-center">
        <p className="text-sm font-medium text-gray-800">{item.itemName}</p>
        <div className="flex items-center space-x-2">
          <span className="text-gray-900 font-semibold text-base">
            Rs. {item.itemPrice}
          </span>
          <span className="text-gray-400 line-through text-sm">
            Rs. {item.itemOldPrice}
          </span>
        </div>
      </div>

      {/* Counter Section - 25% */}
      <div className="w-[25%] flex justify-center items-center">
        <Counter quantity={quantity} setQuantity={setQuantity} />
      </div>
    </div>
  );
};

const CartItemList = ({ items }) => {
  return (
    <div className="w-full p-4">
      <div className="space-y-2">
        {items.map((item) => (
          <CartItem key={item.itemCode} item={item} />
        ))}
      </div>
    </div>
  );
};

export default CartItemList;
