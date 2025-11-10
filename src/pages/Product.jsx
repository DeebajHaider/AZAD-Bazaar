import React from 'react'
import BottomNav from '../component/BottomNav'
import { useState } from 'react'
import { Heart, Plus, Minus, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Product() {
  const navigate = useNavigate()
  const [qty, setQty] = useState(0)
  const [liked, setLiked] = useState(false)
  const { addItem, updateQuantity } = useCart()

  const imgUrl = 'https://placehold.co/600x400?text=Product+Image'

  return (
    <>
      <main className="pb-40">
        {/* Top image - approx 1/3 of screen */}
        <div style={{height: '33vh', backgroundColor:'#fff'}}>
          <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <img src={imgUrl} alt="Product" style={{maxHeight:'100%', maxWidth:'100%', objectFit:'cover'}} />
          </div>
        </div>

        <div className="px-4 py-4" style={{background:'var(--color-bg)'}}>
          <button onClick={() => navigate(-1)} className="text-sm text-gray-600 mb-2"> 
            <ArrowLeft size={18} />
          </button>

          <h1 style={{fontSize:'var(--font-size-lg)', fontWeight:700, color:'var(--color-text-primary)'}}>Sample Product Title</h1>
          <div className="mt-2 text-gray-700" style={{fontSize:18, fontWeight:600}}>Rs. 299</div>

          <div className="mt-6 text-sm text-gray-600">
            This is a sample product description. Replace with real product details when available.
          </div>
        </div>

        {/* Bottom buttons - fixed above bottom nav */}
        <div className="fixed left-0 right-0 bottom-20 flex justify-center z-[1100] pointer-events-none">
          <div className="w-full max-w-3xl mx-auto px-4 flex items-center gap-3 pointer-events-auto">
            {/* Add to cart area - either button or counter */}
            <div style={{flex:1}}>
              {qty === 0 ? (
                <button
                  onClick={() => {
                    setQty(1)
                    // add to cart with quantity 1
                    addItem({
                      itemCode: 'SAMPLE001',
                      itemName: 'Sample Product Title',
                      itemPhoto: imgUrl,
                      itemPrice: 299,
                      itemOldPrice: 349,
                      quantity: 1,
                    })
                  }}
                  className="w-full text-white font-medium"
                  style={{background:'var(--primary-color)', padding:'12px', borderRadius:12, boxShadow:'var(--shadow-sm)'}}
                >
                  Add to Cart
                </button>
              ) : (
                <div className="w-full" style={{display:'flex'}}>
                  <button
                    onClick={() => {
                      const next = Math.max(0, qty - 1)
                      setQty(next)
                      if (next === 0) updateQuantity('SAMPLE001', 0)
                      else updateQuantity('SAMPLE001', next)
                    }}
                    style={{width:48, height:48, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:12, border:'1px solid var(--color-border)', background:'var(--color-surface)'}}
                  >
                    <Minus size={16} />
                  </button>
                  <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--color-surface)', borderTop:'1px solid var(--color-border)', borderBottom:'1px solid var(--color-border)'}}>
                    <div style={{fontSize:16, fontWeight:600}}>{qty}</div>
                  </div>
                  <button
                    onClick={() => {
                      const next = qty + 1
                      setQty(next)
                      updateQuantity('SAMPLE001', next)
                    }}
                    style={{width:48, height:48, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:12, border:'1px solid var(--color-border)', background:'var(--color-surface)'}}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Favorite/heart button */}
            <button
              onClick={() => setLiked(v => !v)}
              className="rounded-lg flex items-center justify-center"
              style={{width:48, height:48, borderRadius:12, background: liked ? 'rgba(59,130,246,0.15)' : 'var(--color-surface)', border: liked ? '1px solid var(--primary-color)' : '1px solid var(--color-border)', boxShadow:'var(--shadow-sm)'}}
            >
              <Heart size={18} style={{color: liked ? 'var(--primary-color)' : 'var(--color-text-secondary)'}} />
            </button>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
