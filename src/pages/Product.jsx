import React, { useState, useEffect, useRef } from 'react'
import { Heart, Plus, Minus, Loader2 } from 'lucide-react'
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

// --- Sub-components for better organization ---

const RelatedProductCardSkeleton = () => (
  <div className="w-36 flex-shrink-0">
    <div className="card transition-shadow duration-200 hover:shadow-md flex flex-col h-64">
      <div className="aspect-square skeleton rounded-md" />
      <div className="pt-2 flex-1 flex flex-col space-y-2">
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-2/3 skeleton" />
        <div className="flex-grow" />
        <div className="h-6 w-1/2 skeleton" />
      </div>
    </div>
  </div>
);

const RelatedProductsSkeleton = () => {
  const { t } = useI18n();
  return (
    <div className="py-6">
      <h2 className="text-xl font-semibold primText mb-3 px-4">
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
    <div className="relative w-full h-56 max-h-64 skeleton" />
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-24 skeleton rounded-full" />
        <div className="h-6 w-20 skeleton rounded-full" />
      </div>
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2">
          <div className="h-8 w-32 skeleton" />
          <div className="h-6 w-24 skeleton" />
        </div>
        <div className="h-8 w-28 skeleton rounded-md" />
      </div>
      <div className="space-y-2 pt-4">
        <div className="h-6 w-40 skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-3/4 skeleton" />
      </div>
    </div>
  </div>
)

const ProductGallery = ({ images, productName, format }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  useEffect(() => setActiveIndex(0), [images])

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => setActiveIndex(prev => (prev + 1) % images.length), 3000)
    return () => clearInterval(id)
  }, [images.length])

  const mainImage = images[activeIndex] || images[0]

  return (
    <div className="relative w-full h-56 max-h-64 secBg primBorder">
      {mainImage ? (
        <ImageWithLoader
          src={mainImage}
          alt={format('productPage.gallery.mainImageAlt', { productName })}
          imageClassName="w-full h-full object-contain"
          containerClassName="w-full h-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center secText">
          {/* Placeholder for empty image state */}
        </div>
      )}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              aria-label={format('productPage.gallery.thumbnailAlt', { index: idx + 1, productName })}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-4 accentPrimBg' : 'secBg primBorder'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const ProductActionBar = ({ qty, product, addToCart, decrementProduct, inStock, availableStock }) => {
  const { t, lang } = useI18n()
  const [actionLoading, setActionLoading] = useState(false)
  
  if (!product) return null
  
  const productIdForCart = product._id ?? product.id
  const displayPrice = product.discountedPrice ?? product.price

  const runWithLoading = (fn) => {
    if (!fn) return
    let finished = false
    setActionLoading(true)
    try {
      const result = fn()
      if (result && typeof result.then === 'function') {
        result.finally(() => setActionLoading(false))
        finished = true
      }
    } catch (e) {
      // swallow for now
    } finally {
      if (!finished) {
        // ensure a perceptible loading state even for sync updates
        setTimeout(() => setActionLoading(false), 300)
      }
    }
  }

  const totalAmount = (parseFloat(displayPrice) * qty)
  const addDisabled = !inStock || (isFinite(availableStock) && qty >= availableStock) || actionLoading
  const decDisabled = actionLoading

  return (
    <div className="secBg dividerBorder border-t p-1">
      <div className="mx-auto p-4 space-y-1">
        {qty === 0 ? (
          <button
            onClick={() => { if (inStock) runWithLoading(() => addToCart(productIdForCart)) }}
            disabled={!inStock || actionLoading}
            className="w-full min-h-12 px-6 py-3 btnPrimary rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {actionLoading ? <Loader2 size={18} className="animate-spin" /> : null}
            {inStock ? t('productPage.actions.addToCart') : t('common.outOfStock')}
          </button>
        ) : (
          <>
            <div className="flex items-center justify-between w-full">
              <span className="text-sm secText">{t('productPage.labels.totalAmount')}</span>
              <span className="text-lg font-bold primText">{t('common.currencySymbol')} {totalAmount.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-10 gap-3 items-center">
              <div className="col-span-3 flex items-center gap-2 rounded-lg secBg p-1 primBorder justify-center">
                <button
                  onClick={() => runWithLoading(() => decrementProduct(productIdForCart))}
                  disabled={decDisabled}
                  className="flex-1 min-h-11 flex items-center justify-center secHoverBg primText secBorder font-medium rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t('productPage.actions.decreaseQuantity')}
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Minus size={18} />}
                </button>
                <div className="text-lg font-semibold primText min-w-[2ch] text-center">{qty}</div>
                <button
                  onClick={() => runWithLoading(() => addToCart(productIdForCart))}
                  disabled={addDisabled}
                  className="flex-1 min-h-11 flex items-center justify-center secHoverBg primText font-medium rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t('productPage.actions.increaseQuantity')}
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                </button>
              </div>
              <button
                onClick={() => runWithLoading(() => addToCart(productIdForCart))}
                disabled={addDisabled}
                className="col-span-7 min-h-12 btnPrimary rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                aria-label={t('productPage.actions.increaseQuantity')}
              >
                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                {t('productPage.actions.addMoreToCart')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const RelatedProductCard = ({ product }) => {
  const { t, lang } = useI18n()
  const { translateDBVal } = useTranslations()
  const displayPrice = product.discountedPrice ?? product.price
  const image = (product.images && product.images.length) ? product.images[0] : product.image

  return (
    <Link to={`/product`} state={{ product }} className="block w-36 flex-shrink-0 focusRing rounded-lg">
      <div className="card transition-shadow duration-200 hover:shadow-md flex flex-col h-64">
        <ImageWithLoader
          src={image}
          alt={product.title}
          containerClassName="aspect-square secBg rounded-md overflow-hidden flex-shrink-0 primBorder"
          imageClassName="w-full h-full object-cover"
        />
        <div className="pt-2 flex-1 flex flex-col">
          <h3 className="text-sm font-medium primText line-clamp-2 min-h-10">{translateDBVal("Product", "name", product.name ?? product.title, lang)}</h3>
          <div className="flex flex-col mt-auto">
            {product.originalPrice && (
              <span className="text-xs secText line-through">
                {t('common.currencySymbol')} {product.originalPrice.toLocaleString()}
              </span>
            )}
            <span className="text-base font-semibold primText">
              {t('common.currencySymbol')} {displayPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

const RelatedProducts = ({ productId }) => {
  const { t } = useI18n()
  const { fetchRelatedProducts } = useData()
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

  if (loading) {
    return <RelatedProductsSkeleton />;
  }

  if (!related || related.length === 0) return null

  return (
    <div className="py-6">
      <h2 className="text-xl font-semibold primText mb-3 px-4">
        {t('productPage.relatedProducts.title')}
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide">
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
  if (incomingId){
    console.log("Fetching product with ID:", incomingId);
  }
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

  const FavoriteButton = () => (
    <button
      onClick={() => setLiked(v => !v)}
      aria-label={liked ? t('productPage.actions.unfavoriteAriaLabel') : t('productPage.actions.favoriteAriaLabel')}
      className="min-h-11 min-w-11 flex items-center justify-center rounded-lg btnSecondary"
    >
      <Heart size={20} className={`transition-all ${liked ? 'fill-current accentDangerText' : 'secText'}`} />
    </button>
  )

  return (
    <Layout
      ref={mainContentRef}
      header={<HeaderWithName title={productLoading ? '...' : productName} rightAction={<FavoriteButton />} />}
      footer={<><ProductActionBar qty={qty} product={product} addToCart={addToCart} decrementProduct={decrementProduct} inStock={inStock} availableStock={availableStock} /><BottomNav /></>}
    >
      {(productLoading || !product) ? (
        <ProductPageSkeleton />
      ) : (
        <main ref={mainContentRef} className="flex-1 primBg overflow-y-auto min-h-full">
          <ProductGallery images={images} productName={productName} format={format} />

          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2 rounded-lg">
              {product.category && <span className="badgePrimary">{translateDBVal("Category", "name", product.category.name ?? product.category, lang)}</span>}
              {subcategoryNames.map(sub => <span key={sub} className="badgePrimary bg-gray-500 dark:bg-gray-600">{translateDBVal("Category", "name", sub, lang)}</span>)}
            </div>

            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold primText">{t('common.currencySymbol')} {displayPrice.toLocaleString()}</span>
                  {originalPrice && <span className="text-base secText line-through">{t('common.currencySymbol')} {originalPrice.toLocaleString()}</span>}
                </div>
              </div>
              <div className="flex-shrink-0">
                {!inStock ? (<span className="badgeDanger">{t('common.outOfStock')}</span>
                ) : (isFinite(availableStock) && availableStock <= 5) && (
                  <span className="badgeWarning">{format('productPage.stockStatus.lowStock_other', { count: availableStock })}</span>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold primText mb-2">{t('productPage.description.title')}</h2>
              <p className="text-base secText">{translateDBVal("Product", "description", product.description, lang)}</p>
            </div>
          </div>

          <div className="dividerBorder border-t mt-2">
            <RelatedProducts productId={product._id || product.id} />
          </div>
        </main>
      )}
    </Layout>
  )
}