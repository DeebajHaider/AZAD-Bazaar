import React from 'react'
import BottomNav from '../component/BottomNav'
import { useState, useEffect } from 'react'
import { Heart, Plus, Minus, ArrowLeft } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useProduct } from '../api'

export default function Product() {
  const navigate = useNavigate()
  const [qty, setQty] = useState(0)
  const [liked, setLiked] = useState(false)
  const { addToCart, decrementProduct, items: cartItems, loading: cartLoading } = useCart()

  const location = useLocation()
  const incoming = location.state && location.state.product ? location.state.product : null

  // If incoming product doesn't have details, try to fetch by id
  const incomingId = incoming && (incoming._id || incoming.id)
  const { data: fetchedProduct } = useProduct(incomingId, { immediate: !!incomingId && !incoming?.name })

  const fallback = {
    id: 'SAMPLE001',
    title: 'Sample Product Title',
    price: 299,
    originalPrice: 349,
    image: 'https://via.placeholder.com/600x400?text=Product',
    description: 'This is a sample product description. Replace with real product details when available.',
    inStock: true,
    stockCount: 10
  }

  const product = incoming || fetchedProduct || fallback

  // Normalize images: prefer product.images (array), then product.photos, then product.image
  const images = (Array.isArray(product.images) && product.images.length)
    ? product.images
    : (Array.isArray(product.photos) && product.photos.length)
      ? product.photos
      : [product.image]

  const [activeIndex, setActiveIndex] = useState(0)

  // Reset active index when product changes
  useEffect(() => setActiveIndex(0), [product._id, product.id])

  // Auto-advance image slider when there are multiple images (2s gap)
  useEffect(() => {
    if (!Array.isArray(images) || images.length <= 1) return
    const id = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % images.length)
    }, 2000)
    return () => clearInterval(id)
  }, [images])

  const mainImage = images[activeIndex] || images[0]

  const productIdForCart = product._id ?? product.id ?? product.sku ?? 'SAMPLE001'
  // Compute available stock based on backend `Product` model fields
  const availableStock = (typeof product.stockQuantity === 'number')
    ? Math.max(0, product.stockQuantity - (product.reservedQuantity || 0))
    : (product.inStock ? Infinity : 0)
  const inStock = availableStock > 0
  const displayPrice = product.discountedPrice ?? product.originalPrice ?? product.price

  // Sync local qty with cart when product or cart changes
  React.useEffect(() => {
    const pid = productIdForCart
    const found = cartItems.find((it) => it.itemCode === pid)
    setQty(found ? found.quantity : 0)
  }, [productIdForCart, cartItems])

  return (
    <>
      <main className="pb-40">
        {/* Top image gallery - approx 1/3 of screen */}
        <div style={{height: '33vh', backgroundColor:'#fff'}}>
          <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column'}}>
            <img src={mainImage} alt="Product" style={{maxHeight:'100%', maxWidth:'100%', objectFit:'contain'}} />
            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{marginTop:8, display:'flex', gap:8, overflowX:'auto', padding:'0 12px'}}>
                {images.map((src, idx) => (
                  <button key={idx} onClick={() => setActiveIndex(idx)} style={{border: activeIndex === idx ? '2px solid var(--primary-color)' : '1px solid var(--color-border)', padding:2, borderRadius:8, background:'transparent'}}>
                    <img src={src} alt={`thumb-${idx}`} style={{width:64, height:64, objectFit:'cover', display:'block', borderRadius:6}} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-4" style={{background:'var(--color-bg)'}}>
          <button onClick={() => navigate(-1)} className="text-sm text-gray-600 mb-2"> 
            <ArrowLeft size={18} />
          </button>

          <h1 style={{fontSize:'var(--font-size-lg)', fontWeight:700, color:'var(--color-text-primary)'}}>{product.name ?? product.title}</h1>
          <div className="mt-2 flex items-center gap-3">
            <div className="text-gray-700" style={{fontSize:18, fontWeight:600}}>Rs. {displayPrice}</div>
            {!inStock && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
                Out of Stock
              </span>
            )}
            {inStock && (isFinite(availableStock) && availableStock <= 5) && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                Only {availableStock} left
              </span>
            )}
          </div>

          <div className="mt-6 text-sm text-gray-600">{product.description}</div>
        </div>


        {/* Bottom buttons - fixed above bottom nav */}
        <div className="absolute left-0 right-0 bottom-20 flex justify-center z-[1100] pointer-events-none">
          <div className="w-full max-w-3xl mx-auto px-4 flex items-center gap-3 pointer-events-auto">
            {/* Add to cart area - either button or counter */}
            <div style={{flex:1}}>
              {qty === 0 ? (
                <button
                  onClick={() => {
                    if (!inStock) return;
                    setQty(1)
                    // add to cart via API
                    addToCart(productIdForCart)
                  }}
                  disabled={!product.isActive || !inStock}
                  className={`w-full text-white font-medium ${!inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{background:'var(--primary-color)', padding:'12px', borderRadius:12, boxShadow:'var(--shadow-sm)'}}
                >
                  {inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              ) : (
                <div className="w-full" style={{display:'flex'}}>
                  <button
                    onClick={() => {
                        const next = Math.max(0, qty - 1)
                        setQty(next)
                        // call decrement API once (will remove if quantity becomes 0)
                        decrementProduct(productIdForCart)
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
                      if (!inStock || (isFinite(availableStock) && next > availableStock)) return;
                      setQty(next)
                      // increment via API
                      addToCart(productIdForCart)
                    }}
                    disabled={!inStock || (isFinite(availableStock) && qty >= availableStock)}
                    style={{
                      width:48, 
                      height:48, 
                      display:'flex', 
                      alignItems:'center', 
                      justifyContent:'center', 
                      borderRadius:12, 
                      border:'1px solid var(--color-border)', 
                      background:'var(--color-surface)',
                      opacity: (!inStock || (isFinite(availableStock) && qty >= availableStock)) ? '0.5' : '1',
                      cursor: (!inStock || (isFinite(availableStock) && qty >= availableStock)) ? 'not-allowed' : 'pointer'
                    }}
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
