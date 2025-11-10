import CartItemList from '../component/cartItem'
import BottomNav from '../component/BottomNav'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu } from 'lucide-react'

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

  const navigate = useNavigate()

  // Hardcoded free delivery target (assumption: 500 Rs).
  // If you want a different target, change this constant.
  const FREE_DELIVERY_TARGET = 500

  const total = cartItems.reduce(
    (sum, it) => sum + (Number(it.itemPrice) || 0) * (Number(it.quantity) || 0),
    0
  )

  const amountLeft = Math.max(FREE_DELIVERY_TARGET - total, 0)
  const progress = FREE_DELIVERY_TARGET === 0 ? 0 : Math.min(total / FREE_DELIVERY_TARGET, 1)

  return (
    <>
      <main style={{ padding: 0 }} className="pb-40">
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

        {/* Total savings section */}
        <div className="w-full px-4 py-3 bg-green-50 border-y">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Menu size={20} className="text-gray-600" />
              <div>
                <div className="text-sm text-gray-600">Total Savings</div>
                <div className="font-semibold text-green-600">
                  Rs. {cartItems.reduce((sum, item) => 
                    sum + ((item.itemOldPrice - item.itemPrice) * item.quantity), 0
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/')} 
              className="text-blue-600 font-medium text-sm"
            >
              Add more items
            </button>
          </div>
        </div>

        {/* Free delivery progress bar (fixed above the checkout button) */}
        <div className="absolute bottom-35 left-0 right-0 z-30 flex justify-center pointer-events-none">
          <div className="w-full pointer-events-auto">
            {/* Top border progress */}
            <div className="h-1 bg-gray-200 rounded-t-md overflow-hidden">
              <div
                className="h-1 bg-green-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            <div className="bg-white border rounded-b-md px-4 py-3 flex items-center gap-3">
              <ShoppingCart size={20} />
              <div className="text-sm text-gray-700">
                {amountLeft > 0
                  ? `Rs. ${amountLeft} away from free delivery`
                  : 'You have free delivery!'}
              </div>
            </div>
          </div>
        </div>

        {/* Checkout button fixed near bottom, above BottomNav */}
        <div className="fixed left-0 right-0 bottom-20 flex justify-center z-[1100] pointer-events-none" style={{left: '50%', transform: 'translateX(-50%)', width: 'var(--mobile-width)', maxWidth: '100%'}}>
          <button
            onClick={() => navigate('/checkout')}
            className="mx-4 w-[calc(100%-2rem)] max-w-3xl bg-blue-600 text-white py-3 rounded-lg text-center text-lg font-medium pointer-events-auto"
          >
            Checkout
          </button>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
