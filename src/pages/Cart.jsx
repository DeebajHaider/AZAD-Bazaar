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
      <main style={{ padding: 0, background: 'var(--color-bg)' }} className="pb-40">
        <div style={{position:'sticky', top:0, background:'var(--color-surface)', zIndex:10, padding:'var(--space-3) var(--space-4)', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--color-border)'}}>
          <h2 style={{fontSize:'var(--font-size-xl)', fontWeight:600, margin:0, color:'var(--color-text-primary)'}}>Cart</h2>
          <button
            onClick={handleClearCart}
            style={{fontSize:'var(--font-size-sm)', color:'var(--color-danger)', fontWeight:500, background:'none', border:'none', cursor:'pointer'}}
          >
            Clear Cart
          </button>
        </div>

        <CartItemList items={cartItems} />

        {/* Total savings section */}
        <div style={{width:'100%', padding:'var(--space-3) var(--space-4)', background:'var(--color-success-light)', borderTop:'1px solid var(--color-border)', borderBottom:'1px solid var(--color-border)', color:'var(--color-text-primary)'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div style={{display:'flex', alignItems:'center', gap:'var(--space-2)'}}>
              <Menu size={20} style={{color:'var(--color-text-secondary)'}} />
              <div>
                <div style={{fontSize:'var(--font-size-sm)', color:'var(--color-text-secondary)'}}>Total Savings</div>
                <div style={{fontWeight:600, color:'var(--color-success)'}}>
                  Rs. {cartItems.reduce((sum, item) => 
                    sum + ((item.itemOldPrice - item.itemPrice) * item.quantity), 0
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/')} 
              style={{color:'var(--color-primary-500)', fontWeight:500, fontSize:'var(--font-size-sm)', background:'none', border:'none', cursor:'pointer'}}
            >
              Add more items
            </button>
          </div>
        </div>

        {/* Free delivery progress bar (fixed above the checkout button) */}
        <div style={{position:'absolute', bottom:140, left:0, right:0, zIndex:30, display:'flex', justifyContent:'center', pointerEvents:'none'}}>
          <div style={{width:'100%', pointerEvents:'auto'}}>
            {/* Top border progress */}
            <div style={{height:'4px', background:'var(--color-border)', borderTopLeftRadius:'var(--radius-md)', borderTopRightRadius:'var(--radius-md)', overflow:'hidden'}}>
              <div
                style={{height:'4px', background:'var(--color-success)', width:`${progress * 100}%`, transition:'width 0.3s ease'}}
              />
            </div>

            <div style={{background:'var(--color-surface)', border:'1px solid var(--color-border)', borderBottomLeftRadius:'var(--radius-md)', borderBottomRightRadius:'var(--radius-md)', padding:'var(--space-3) var(--space-4)', display:'flex', alignItems:'center', gap:'var(--space-3)', color:'var(--color-text-primary)'}}>
              <ShoppingCart size={20} />
              <div style={{fontSize:'var(--font-size-sm)', color:'var(--color-text-secondary)'}}>
                {amountLeft > 0
                  ? `Rs. ${amountLeft} away from free delivery`
                  : 'You have free delivery!'}
              </div>
            </div>
          </div>
        </div>

        {/* Checkout button fixed near bottom, above BottomNav */}
        <div style={{position:'fixed', bottom:'80px', left:'50%', transform:'translateX(-50%)', display:'flex', justifyContent:'center', zIndex:1100, pointerEvents:'none', width:'var(--mobile-width)', maxWidth:'100%'}}>
          <button
            onClick={() => navigate('/checkout')}
            style={{margin:'0 var(--space-4)', width:'calc(100% - 2 * var(--space-4))', maxWidth:'calc(var(--mobile-width) - 2 * var(--space-4))', background:'var(--color-primary-500)', color:'white', padding:'var(--space-3)', borderRadius:'var(--radius-md)', textAlign:'center', fontSize:'var(--font-size-lg)', fontWeight:500, pointerEvents:'auto', border:'none', cursor:'pointer', transition:'background 0.2s ease'}}
            onMouseEnter={(e) => e.target.style.background = 'var(--color-primary-600)'}
            onMouseLeave={(e) => e.target.style.background = 'var(--color-primary-500)'}
          >
            Checkout
          </button>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
