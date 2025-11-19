import React, { useState, useEffect, useRef } from 'react'
import { Heart, Plus, Minus } from 'lucide-react'
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

// --- Sub-components for better organization ---

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
        <img
          src={mainImage}
          alt={format('productPage.gallery.mainImageAlt', { productName })}
          className="w-full h-full object-contain"
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
  const productIdForCart = product._id ?? product.id

  const formatCurrency = (amount) => new Intl.NumberFormat(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  const displayPrice = product.discountedPrice ?? product.price

  if (!product) return null

  return (
    <div className="secBg dividerBorder border-t p-1">
      <div className="mx-auto p-4">
        {qty === 0 ? (
          <button
            onClick={() => { if (inStock) addToCart(productIdForCart) }}
            disabled={!inStock}
            className="w-full min-h-12 px-6 py-3 btnPrimary rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {inStock ? t('productPage.actions.addToCart') : t('common.outOfStock')}
          </button>
        ) : (
          <div className="w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-4 rounded-lg secBg p-1 primBorder">
              <button
                onClick={() => decrementProduct(productIdForCart)}
                className="min-w-10 min-h-10 flex items-center justify-center secHoverBg primText font-medium rounded-md transition-all duration-200"
                aria-label={t('productPage.actions.decreaseQuantity')}
              >
                <Minus size={18} />
              </button>
              <div className="text-xl font-semibold primText min-w-[2ch] text-center">{qty}</div>
              <button
                onClick={() => addToCart(productIdForCart)}
                disabled={!inStock || (isFinite(availableStock) && qty >= availableStock)}
                className="min-w-10 min-h-10 flex items-center justify-center secHoverBg primText font-medium rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('productPage.actions.increaseQuantity')}
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="text-2xl font-bold primText">
              {t('common.currencySymbol')} {(parseFloat(displayPrice) * qty).toLocaleString()}
            </div>
          </div>
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
        <div className="aspect-square secBg rounded-md overflow-hidden flex-shrink-0 primBorder">
          <img src={image} alt={product.title} className="w-full h-full object-cover" />
        </div>
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

  useEffect(() => {
    if (productId) {
      fetchRelatedProducts(productId).then(res => {
        if (Array.isArray(res)) setRelated(res)
      })
    }
  }, [productId, fetchRelatedProducts])

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
  const incomingId = incoming?._id || incoming?.id
  const { data: fetchedProduct } = useProduct(incomingId, { immediate: !!incomingId && !incoming?.name })

  const fallback = { _id: 'SAMPLE001', title: 'Sample Product Title', price: 299, description: 'This is a sample product description...', image: '', inStock: true, category: 'Pantry', subcategories: ['Snacks', 'Organic'] }
  const product = incoming || fetchedProduct || fallback
  const productName = translateDBVal("Product", "name", product.name ?? product.title, lang)
  const images = (product.images?.length) ? product.images : [product.image]
  const availableStock = product.stockQuantity ?? (product.inStock ? Infinity : 0)
  const inStock = availableStock > 0
  const displayPrice = product.discountedPrice ?? product.price
  const originalPrice = product.originalPrice

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [product]);


  useEffect(() => {
    const found = cartItems.find((it) => it.itemCode === product._id)
    setQty(found ? found.quantity : 0)
  }, [product._id, cartItems])

  useEffect(() => {
    if (!product.subcategories) return;
    setSubcategoryNames([]);
    Promise.all(product.subcategories.map(async subId => getCategoryById(subId).then(res => res.name)))
      .then(names => setSubcategoryNames(names));
  }, [product.subcategories]);

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
      header={<HeaderWithName title={productName} rightAction={<FavoriteButton />} />}
      footer={<><ProductActionBar qty={qty} product={product} addToCart={addToCart} decrementProduct={decrementProduct} inStock={inStock} availableStock={availableStock} /><BottomNav /></>}
    >
      <main ref={mainContentRef} className="flex-1 primBg overflow-y-auto">
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
    </Layout>
  )
}