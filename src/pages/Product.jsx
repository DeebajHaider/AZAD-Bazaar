import React, { useState, useEffect, useRef } from 'react'
import { Heart, Plus, Minus, Loader2, Share2, ShoppingCart } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useProduct } from '../api'
import { useData } from '../context/DataContext'
import { useI18n } from '../context/I18nContext'
import useTranslations from '../hooks/useTranslations'
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import BottomNav from '../component/BottomNav'
import { getCategoryById } from '../api/categoryService'
import ImageWithLoader from '../component/ImageWithLoader'

// --- Sub-components ---

const RelatedProductCardSkeleton = () => (
  <div className="w-40 flex-shrink-0 snap-start">
    <div className="card p-3 flex flex-col h-[260px] space-y-3">
      <div className="aspect-square w-full skeleton rounded-md" />
      <div className="flex-1 flex flex-col space-y-2">
        <div className="h-3.5 w-full skeleton rounded" />
        <div className="h-3.5 w-2/3 skeleton rounded" />
        <div className="flex-grow" />
        <div className="flex items-center justify-between">
          <div className="h-5 w-16 skeleton rounded" />
          <div className="h-4 w-8 skeleton rounded" />
        </div>
      </div>
    </div>
  </div>
);

const RelatedProductsSkeleton = () => {
  const { t } = useI18n();
  return (
    <div className="py-6">
      <h2 className="text-lg font-semibold primText mb-3 px-4">
        {t('productPage.relatedProducts.title')}
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide">
        {Array.from({ length: 4 }).map((_, i) => (
          <RelatedProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
};

const ProductPageSkeleton = () => (
  <div className="flex-1 primBg overflow-y-auto">
    <div className="relative w-full h-72 skeleton" />
    <div className="p-4 space-y-6">
      {/* Price & Stock */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-32 skeleton" />
        <div className="h-6 w-20 skeleton rounded-full" />
      </div>
      
      {/* Description/Cat Area */}
      <div className="space-y-3">
         <div className="h-5 w-1/4 skeleton" />
         <div className="space-y-2">
            <div className="h-4 w-full skeleton" />
            <div className="h-4 w-full skeleton" />
            <div className="h-4 w-3/4 skeleton" />
         </div>
      </div>
    </div>
  </div>
)

// --- Image Gallery ---
const ProductGallery = ({ images, productName, format }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  useEffect(() => setActiveIndex(0), [images])

  const mainImage = images[activeIndex] || images[0]

  return (
    <div className="relative w-full h-72 secBg primBorder border-b">
      {mainImage ? (
        <ImageWithLoader
          src={mainImage}
          alt={format('productPage.gallery.mainImageAlt', { productName })}
          imageClassName="w-full h-full object-contain p-4"
          containerClassName="w-full h-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center secText">
          {/* Placeholder */}
        </div>
      )}
      
      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2 z-10">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${activeIndex === idx ? 'w-6 accentPrimBg' : 'w-1.5 bg-gray-300 dark:bg-gray-600'}`}
              aria-label={`View image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// --- IMPROVED ACTION BAR ---
const ProductActionBar = ({ qty, product, addToCart, decrementProduct, inStock, availableStock }) => {
  const { t } = useI18n()
  const [actionLoading, setActionLoading] = useState(false)
  
  if (!product) return null
  
  const productIdForCart = product._id ?? product.id
  const displayPrice = product.discountedPrice ?? product.price

  const runWithLoading = async (fn) => {
    if (!fn) return
    setActionLoading(true)
    try {
      const result = fn()
      if (result && typeof result.then === 'function') {
        await result
      }
    } catch (e) {
      console.error('Product action error:', e)
    } finally {
      setTimeout(() => setActionLoading(false), 300)
    }
  }

  const totalAmount = (parseFloat(displayPrice) * qty)
  const addDisabled = !inStock || (isFinite(availableStock) && qty >= availableStock) || actionLoading
  const decDisabled = actionLoading

  return (
    <div className="secBg dividerBorder border-t p-3 pb-safe"> 
      {/* pb-safe handles iPhone home bar if configured in Tailwind, otherwise p-3 is fine */}
      
      {qty === 0 ? (
        /* STATE 1: Add To Cart Button */
        <button
          onClick={() => { if (inStock) runWithLoading(() => addToCart(productIdForCart)) }}
          disabled={!inStock || actionLoading}
          className="w-full min-h-[52px] btnPrimary rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between px-6"
        >
           <span className="font-semibold text-base">
             {inStock ? t('productPage.actions.addToCart') : t('common.outOfStock')}
           </span>
           <span className="font-medium bg-white/20 px-2 py-1 rounded text-sm">
             {t('common.currencySymbol')} {displayPrice.toLocaleString()}
           </span>
           {actionLoading && <Loader2 size={18} className="animate-spin absolute left-1/2 -ml-2.5" />}
        </button>
      ) : (
        /* STATE 2: Quantity Stepper */
        <div className="flex items-center gap-4 h-[52px]">
          {/* Left: Total Price Feedback */}
          <div className="flex-1 flex flex-col justify-center pl-2">
             <span className="text-xs secText">{t('productPage.labels.totalAmount')}</span>
             <span className="text-xl font-bold primText">
               {t('common.currencySymbol')}{totalAmount.toLocaleString()}
             </span>
          </div>

          {/* Right: Stepper Controls */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-950 primBorder rounded-xl p-1 shadow-sm h-full">
            <button
              onClick={() => runWithLoading(() => decrementProduct(productIdForCart))}
              disabled={decDisabled}
              className="w-12 h-full flex items-center justify-center secHoverBg rounded-lg text-gray-600 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
              aria-label="Decrease"
            >
              {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Minus size={20} />}
            </button>
            
            <div className="w-8 text-center font-bold text-lg primText tabular-nums">
              {qty}
            </div>
            
            <button
              onClick={() => runWithLoading(() => addToCart(productIdForCart))}
              disabled={addDisabled}
              className="w-12 h-full flex items-center justify-center accentPrimBg text-white rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-sm"
              aria-label="Increase"
            >
              {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const RelatedProductCard = ({ product }) => {
  const { t, lang } = useI18n()
  const { translateDBVal } = useTranslations()
  
  const displayPrice = product.discountedPrice ?? product.price
  const originalPrice = product.originalPrice
  // Calculate percentage off if applicable
  const percentOff = originalPrice && originalPrice > displayPrice 
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) 
    : 0

  // Fallback logic for image
  const image = (product.images && product.images.length) ? product.images[0] : product.image

  return (
    <Link 
      to={`/product`} 
      state={{ product }} 
      className="group block w-40 flex-shrink-0 snap-start focusRing rounded-lg"
    >
      <div className="card p-3 h-[260px] flex flex-col transition-all duration-200 group-hover:border-blue-500 dark:group-hover:border-blue-400 relative group-active:scale-[0.98]">
        
        {/* Image Container */}
        <div className="relative aspect-square w-full mb-3 bg-white dark:bg-white/5 rounded-md overflow-hidden">
          <ImageWithLoader
            src={image}
            alt={product.title}
            containerClassName="w-full h-full"
            imageClassName="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
          {/* Discount Badge Overlay - High Visibility */}
          {percentOff > 0 && (
            <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
              -{percentOff}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-sm font-medium primText line-clamp-2 mb-1 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {translateDBVal("Product", "name", product.name ?? product.title, lang)}
          </h3>
          
          <div className="mt-auto pt-2">
            {originalPrice > displayPrice && (
              <span className="text-xs secText line-through block">
                {t('common.currencySymbol')}{originalPrice.toLocaleString()}
              </span>
            )}
            <div className="flex items-center justify-between">
              <span className="text-base font-bold primText">
                {t('common.currencySymbol')}<span className="text-lg">{displayPrice.toLocaleString()}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

const RelatedProducts = ({ productId }) => {
  const { fetchRelatedProducts } = useData()
  const { t } = useI18n();
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      setLoading(true);
      fetchRelatedProducts(productId).then(res => {
        if (Array.isArray(res)) setRelated(res)
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [productId, fetchRelatedProducts])

  if (loading) return <RelatedProductsSkeleton />;
  if (!related || related.length === 0) return null

  return (
    <div className="py-4 border-t dividerBorder mt-4 bg-gray-50/50 dark:bg-slate-900/20">
      <h2 className="text-lg font-bold primText mb-3 px-4">
        {t('productPage.relatedProducts.title')}
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-4 px-4 scrollbar-hide">
        {related.map(p => <RelatedProductCard key={p._id || p.id} product={p} />)}
      </div>
    </div>
  )
}

// --- Main Product Page Component ---
export default function Product() {
  const { t, lang } = useI18n()
  const { translateDBVal } = useTranslations()
  const { addToCart, decrementProduct, items: cartItems } = useCart()
  const location = useLocation()
  const [qty, setQty] = useState(0)
  const [liked, setLiked] = useState(false)
  const [subcategoryNames, setSubcategoryNames] = useState([]);
  const mainContentRef = useRef(null);

  const incoming = location.state?.product || null
  const incomingId = incoming?._id || incoming?.id || location?.state?.productIdtoFetch
  const { data: fetchedProduct, loading: productLoading } = useProduct(incomingId, { immediate: !!incomingId && !incoming?.name })

  const product = incoming || fetchedProduct
  const productName = product ? translateDBVal("Product", "name", product.name ?? product.title, lang) : ''
  const images = product?.images?.length ? product.images : (product?.image ? [product.image] : [])
  const availableStock = product?.stockQuantity ?? (product?.inStock ? Infinity : 0)
  const inStock = availableStock > 0
  const displayPrice = product?.discountedPrice ?? product?.price
  const originalPrice = product?.originalPrice

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const found = cartItems.find((it) => it.itemCode === product._id)
    setQty(found ? found.quantity : 0)
  }, [product?._id, cartItems, product])

  useEffect(() => {
    if (!product?.subcategories) return;
    setSubcategoryNames([]);
    Promise.all(product.subcategories.map(async subId => getCategoryById(subId).then(res => res.name)))
      .then(names => setSubcategoryNames(names));
  }, [product?.subcategories]);

  const format = (key, vars = {}) => t(key, vars)

  const HeaderActions = () => (
    <div className="flex items-center gap-1">
      <button onClick={() => setLiked(v => !v)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
        <Heart size={22} className={`transition-all ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`} />
      </button>
    </div>
  )
  

  return (
    <Layout
      ref={mainContentRef}
      header={<HeaderWithName title={productLoading ? '' : productName} rightAction={<HeaderActions />} />}
      footer={<><ProductActionBar qty={qty} product={product} addToCart={addToCart} decrementProduct={decrementProduct} inStock={inStock} availableStock={availableStock} /><BottomNav /></>}
    >
      {(productLoading || !product) ? (
        <ProductPageSkeleton />
      ) : (
        <main ref={mainContentRef} className="flex-1 primBg overflow-y-auto min-h-full">
          <ProductGallery images={images} productName={productName} format={format} />

          <div className="p-5 pb-20">
            {/* Price & Stock Section */}
            <div className="flex justify-between items-start mb-6">
              <div>
                 {originalPrice && (
                    <span className="text-sm secText line-through block mb-0.5">
                      {t('common.currencySymbol')} {originalPrice.toLocaleString()}
                    </span>
                 )}
                 <div className="flex items-center gap-3">
                   <span className="text-3xl font-bold primText tracking-tight">
                     {t('common.currencySymbol')} {displayPrice.toLocaleString()}
                   </span>
                   {originalPrice && (
                     <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-md">
                        {Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}% OFF
                     </span>
                   )}
                 </div>
              </div>

              <div className="flex-shrink-0 pt-1">
                {!inStock ? (<span className="badgeDanger">{t('common.outOfStock')}</span>
                ) : (isFinite(availableStock) && availableStock <= 5) && (
                  <span className="badgeWarning">{format('productPage.stockStatus.lowStock_other', { count: availableStock })}</span>
                )}
              </div>
            </div>

            {/* Integrated Category Header & Description */}
            {/* This replaces the literal "Description" header with useful Metadata */}
            <div className="space-y-3">
               <div className="flex flex-wrap items-baseline gap-2 pb-2 border-b dividerBorder">
                  {/* Main Category: Highlighted */}
                  {product.category && (
                    <span className="text-sm font-bold accentPrimText uppercase tracking-wider">
                       {translateDBVal("Category", "name", product.category.name ?? product.category, lang)}
                    </span>
                  )}
                  
                  {/* Separator if subs exist */}
                  {product.category && subcategoryNames.length > 0 && (
                    <span className="text-gray-300 dark:text-gray-700">/</span>
                  )}

                  {/* Sub Categories: Subtle Tags */}
                  {subcategoryNames.map(sub => (
                    <span key={sub} className="text-xs font-medium secText bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {translateDBVal("Category", "name", sub, lang)}
                    </span>
                  ))}
               </div>

               {/* Description Text */}
               <p className="text-base leading-relaxed secText">
                 {translateDBVal("Product", "description", product.description, lang)}
               </p>
            </div>
          </div>

          {/* Related Products */}
          <RelatedProducts productId={product._id || product.id} />
        </main>
      )}
    </Layout>
  )
}