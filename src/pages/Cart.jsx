import CartItemList from '../component/cartItem'
import BottomNav from '../component/BottomNav'
import { useState } from 'react'

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    {
      itemCode: "ITEM001",
      itemName: "Bazaar Select Dar Chini 100g",
      itemPhoto: "https://placehold.co/80",
      itemPrice: 119,
      itemOldPrice: 159,
      quantity: 1,
    },
    {
      itemCode: "ITEM002",
      itemName: "Organic Turmeric Powder 200g",
      itemPhoto: "https://placehold.co/80",
      itemPrice: 299,
      itemOldPrice: 349,
      quantity: 2,
    },
    {
      itemCode: "ITEM003",
      itemName: "Clove Premium 50g",
      itemPhoto: "https://placehold.co/80",
      itemPrice: 199,
      itemOldPrice: 249,
      quantity: 3,
    },
  ]);

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <>
      <main style={{padding:0}}>
        <div className="sticky top-0 bg-white z-10 px-4 py-3 flex justify-between items-center border-b">
          <h2 className="text-xl font-semibold">Cart</h2>
          <button 
            onClick={handleClearCart}
            className="text-sm text-red-500 font-medium"
          >
            Clear Cart
          </button>
        </div>
        <CartItemList items={cartItems} />
      </main>
      <BottomNav />
    </>
  )
}
