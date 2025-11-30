import React, { useState, useEffect, useRef } from 'react'
import { Heart, Plus, Minus, Loader2, Share2, ShoppingCart } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useProduct } from '../api'
import { useFavoritesContext } from "../context/FavoritesContext";
import { useData } from '../context/DataContext'
import { useI18n } from '../context/I18nContext'
import useTranslations from '../hooks/useTranslations'
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import BottomNav from '../component/BottomNav'
import { getCategoryById } from '../api/categoryService'
import ImageWithLoader from '../component/ImageWithLoader'
import { showToast } from '../utils/toast'

// --- Sub-components ---

// Skeleton: Surface Container Base
const RelatedProductCardSkeleton = () => (
  <div className="w-40 flex-shrink-0 snap-start">
    <div className="bg-md-surface-container p-3 flex flex-col h-[260px] space-y-3 rounded-md animate-pulse">
      <div className="aspect-square w-full bg-md-surface-variant/50 rounded-md" />
      <div className="flex-1 flex flex-col space-y-2">
        <div className="h-3.5 w-full bg-md-surface-variant/50 rounded" />
        <div className="h-3.5 w-2/3 bg-md-surface-variant/30 rounded" />
        <div className="flex-grow" />
        <div className="flex items-center justify-between">
          <div className="h-5 w-16 bg-md-surface-variant/50 rounded" />
          <div className="h-4 w-8 bg-md-surface-variant/30 rounded" />
        </div>
      </div>
    </div>
  </div>
);

const RelatedProductsSkeleton = () => {
  const { t } = useI18n();
  return (
    <div className="py-6">
      <h2 className="text-lg font-bold text-md-on-surface mb-3 px-4">
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
  <div className="flex-1 bg-md-surface overflow-y-auto min-h-full animate-pulse">
    <div className="relative w-full h-72 bg-md-surface-variant/30" />
    <div className="p-4 space-y-6">
      {/* Price & Stock */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-32 bg-md-surface-variant/50 rounded" />
        <div className="h-6 w-20 bg-md-surface-variant/30 rounded-md" />
      </div>
      
      {/* Description/Cat Area */}
      <div className="space-y-3">
         <div className="h-5 w-1/4 bg-md-surface-variant/50 rounded" />
         <div className="space-y-2">
            <div className="h-4 w-full bg-md-surface-variant/30 rounded" />
            <div className="h-4 w-full bg-md-surface-variant/30 rounded" />
            <div className="h-4 w-3/4 bg-md-surface-variant/30 rounded" />
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
    // Gallery Container: Surface Container Low
    <div className="relative w-full h-72 bg-md-surface-container-low border-b border-md-outline-variant/30">
      {mainImage ? (
        <ImageWithLoader
          src={mainImage}
          alt={format('productPage.gallery.mainImageAlt', { productName })}
          imageClassName="w-full h-full object-contain p-4"
          containerClassName="w-full h-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-md-on-surface-variant">
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
              className={`h-1.5 rounded-md transition-all duration-300 shadow-sm ${activeIndex === idx ? 'w-6 bg-md-primary' : 'w-1.5 bg-md-on-surface-variant/40'}`}
              aria-label={`View image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// --- ACTION BAR ---
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
    // Sticky Footer: Surface + Border Top
    <div className="bg-md-surface border-t border-md-outline-variant p-3 pb-safe"> 
      
      {qty === 0 ? (
        /* STATE 1: Add To Cart Button (Primary) */
        <button
          onClick={() => { if (inStock) runWithLoading(() => addToCart(productIdForCart)) }}
          disabled={!inStock || actionLoading}
          className="w-full min-h-[52px] bg-md-primary text-md-on-primary rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between px-6 hover:shadow-lg"
        >
           <span className="font-bold text-base">
             {inStock ? t('productPage.actions.addToCart') : t('common.outOfStock')}
           </span>
           {/* Price Chip inside button: Surface/20 overlay */}
           <span className="font-medium bg-white/20 px-2 py-1 rounded text-sm">
             {t('common.currencySymbol')} {displayPrice.toLocaleString()}
           </span>
           {actionLoading && <Loader2 size={18} className="animate-spin absolute left-1/2 -ml-2.5" />}
        </button>
      ) : (
        /* STATE 2: Quantity Stepper */
        <div className="flex items-center gap-4 h-[52px]">
          {/* Left: Total Price */}
          <div className="flex-1 flex flex-col justify-center pl-2">
             <span className="text-xs text-md-on-surface-variant">{t('productPage.labels.totalAmount')}</span>
             <span className="text-xl font-bold text-md-on-surface">
               {t('common.currencySymbol')}{totalAmount.toLocaleString()}
             </span>
          </div>

          {/* Right: Stepper Controls - Surface Container High */}
          <div className="flex items-center gap-3 bg-md-surface-container-high rounded-xl p-1 shadow-sm h-full border border-md-outline-variant/30">
            <button
              onClick={() => runWithLoading(() => decrementProduct(productIdForCart))}
              disabled={decDisabled}
              // Minus: Tonal/Ghost
              className="w-12 h-full flex items-center justify-center rounded-lg text-md-on-surface-variant hover:bg-md-surface-container-highest transition-colors active:bg-md-surface-variant/50"
              aria-label="Decrease"
            >
              {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Minus size={20} />}
            </button>
            
            <div className="w-8 text-center font-bold text-lg text-md-on-surface tabular-nums">
              {qty}
            </div>
            
            <button
              onClick={() => runWithLoading(() => addToCart(productIdForCart))}
              disabled={addDisabled}
              // Plus: Primary Tonal
              className="w-12 h-full flex items-center justify-center bg-md-primary text-md-on-primary rounded-lg hover:shadow-md active:scale-95 transition-all shadow-sm"
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
  const percentOff = originalPrice && originalPrice > displayPrice 
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) 
    : 0

  const image = (product.images && product.images.length) ? product.images[0] : product.image

  return (
    <Link 
      to={`/product/${product._id || product.id}`}
      className="group block w-40 flex-shrink-0 snap-start rounded-lg focus:outline-none focus:ring-2 focus:ring-md-primary"
    >
      {/* Card: Surface Container */}
      <div className="bg-md-surface-container p-3 h-[260px] flex flex-col transition-all duration-200 rounded-lg hover:bg-md-surface-container-high hover:shadow-sm active:scale-[0.98]">
        
        {/* Image Container: Surface Container Highest */}
        <div className="relative aspect-square w-full mb-3 bg-md-surface-container-highest rounded-md overflow-hidden">
          <ImageWithLoader
            src={image}
            alt={product.title}
            containerClassName="w-full h-full"
            imageClassName="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105 mix-blend-multiply dark:mix-blend-normal"
          />
          {/* Discount Badge: Error (Red) for visibility */}
          {percentOff > 0 && (
            <div className="absolute top-1 left-1 bg-md-error text-md-on-error text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
              -{percentOff}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-sm font-medium text-md-on-surface line-clamp-2 mb-1 leading-tight group-hover:text-md-primary transition-colors">
            {translateDBVal("Product", "name", product.name ?? product.title, lang)}
          </h3>
          
          <div className="mt-auto pt-2">
            {originalPrice > displayPrice && (
              <span className="text-xs text-md-on-surface-variant line-through block">
                {t('common.currencySymbol')}{originalPrice.toLocaleString()}
              </span>
            )}
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-md-on-surface">
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
    <div className="py-4 border-t border-md-outline-variant/30 mt-4 bg-md-surface-container-low/50">
      <h2 className="text-lg font-bold text-md-on-surface mb-3 px-4">
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
  const { productId } = useParams()
  const [qty, setQty] = useState(0)
  const { add, remove, isFavorite, loading: favLoading } = useFavoritesContext()
  const [subcategoryNames, setSubcategoryNames] = useState([]);
  const mainContentRef = useRef(null);

  const { data: fetchedProduct, loading: productLoading } = useProduct(productId, { immediate: !!productId })

  const product = fetchedProduct
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

  const HeaderActions = () => {
    const pid = product?._id ?? product?.id
    const liked = pid ? isFavorite(pid) : false
    const toggleFav = async () => {
      if (!pid || favLoading) return
      try {
        if (liked) {await remove(pid); showToast(t('productPage.actions.removedFromFavorites'))}
        else {await add(pid); showToast(t('productPage.actions.addedToFavorites'))}
      } catch (e) {
        console.error('Favorite toggle failed', e)
      }
    }
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={toggleFav}
          disabled={!pid || favLoading}
          aria-pressed={liked}
          aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
          className="p-2 rounded-md hover:bg-md-surface-container-high transition-colors disabled:opacity-60"
        >
          <Heart size={22} className={`transition-all ${liked ? 'fill-md-error text-md-error' : 'text-md-on-surface-variant'}`} />
        </button>
      </div>
    )
  }
  

  return (
    <Layout
      ref={mainContentRef}
      header={<HeaderWithName title={productLoading ? '' : productName} rightAction={<HeaderActions />} />}
      footer={<><ProductActionBar qty={qty} product={product} addToCart={addToCart} decrementProduct={decrementProduct} inStock={inStock} availableStock={availableStock} /><BottomNav /></>}
    >
      {(productLoading || !product) ? (
        <ProductPageSkeleton />
      ) : (
        <main ref={mainContentRef} className="flex-1 bg-md-surface overflow-y-auto min-h-full">
          <ProductGallery images={images} productName={productName} format={format} />

          <div className="p-5 pb-16">
            {/* Price & Stock Section */}
            <div className="flex justify-between items-start mb-6">
              <div>
                 {originalPrice && (
                    <span className="text-sm text-md-on-surface-variant line-through block mb-0.5">
                      {t('common.currencySymbol')} {originalPrice.toLocaleString()}
                    </span>
                 )}
                 <div className="flex items-center gap-3">
                   <span className="text-3xl font-bold text-md-on-surface tracking-tight">
                     {t('common.currencySymbol')} {displayPrice.toLocaleString()}
                   </span>
                   {originalPrice && (
                     // Sales Badge: Error Container (to grab attention, standard sales color)
                     <span className="bg-md-error-container text-md-on-error-container text-xs font-bold px-2 py-0.5 rounded-md">
                        {Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}% OFF
                     </span>
                   )}
                 </div>
              </div>

              <div className="flex-shrink-0 pt-1">
                {!inStock ? (
                  <span className="bg-md-error text-md-on-error text-[10px] uppercase font-bold px-2 py-1 rounded-md">{t('common.outOfStock')}</span>
                ) : (isFinite(availableStock) && availableStock <= 5) && (
                  // Warning: Tertiary Container
                  <span className="bg-md-tertiary-container text-md-on-tertiary-container text-[10px] font-bold px-2 py-1 rounded-md">{format('productPage.stockStatus.lowStock_other', { count: availableStock })}</span>
                )}
              </div>
            </div>

            {/* Category Header & Description */}
            <div className="space-y-3">
               <div className="flex flex-wrap items-baseline gap-2 pb-2 border-b border-md-outline-variant/30">
                  {/* Main Category: Primary Color */}
                  {product.category && (
                    <span className="text-sm font-bold text-md-primary uppercase tracking-wider">
                       {translateDBVal("Category", "name", product.category.name ?? product.category, lang)}
                    </span>
                  )}
                  
                  {product.category && subcategoryNames.length > 0 && (
                    <span className="text-md-on-surface-variant/50">/</span>
                  )}

                  {/* Sub Categories: Secondary Container Tags */}
                  {subcategoryNames.map(sub => (
                    <span key={sub} className="text-xs font-medium text-md-on-secondary-container bg-md-secondary-container px-2 py-0.5 rounded-md">
                      {translateDBVal("Category", "name", sub, lang)}
                    </span>
                  ))}
               </div>

               {/* Description Text: On Surface Variant (Medium Emphasis) */}
               <p className="text-base leading-relaxed text-md-on-surface-variant">
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