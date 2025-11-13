import React, { useState, useEffect } from 'react'
import { Heart, Plus, Minus } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom' // Import Link for navigation
import { useCart } from '../context/CartContext'
import { useProduct } from '../api'
import { useI18n } from '../context/I18nContext'
import useTranslations from '../hooks/useTranslations'
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import BottomNav from '../component/BottomNav'
import { getCategoryById } from '../api/categoryService'

// --- Sub-components for better organization ---

// Component for the image gallery at the top
const ProductGallery = ({ images, productName, format }) => {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => setActiveIndex(0), [images])

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % images.length)
    }, 3000)
    return () => clearInterval(id)
  }, [images.length])

  const mainImage = images[activeIndex] || images[0]

  return (
    // MODIFIED: Reduced height for a smaller image (fixed height)
    <div className="relative w-full h-56 max-h-64 bg-gray-100 dark:bg-slate-900">
      {mainImage ? (
        <img
          src={mainImage}
          alt={format('productPage.gallery.mainImageAlt', { productName })}
              className="w-full h-full object-contain"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-slate-600">
        </div>
      )}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              aria-label={format('productPage.gallery.thumbnailAlt', { index: idx + 1, productName })}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-4 bg-blue-500' : 'bg-gray-300 dark:bg-slate-700'
                }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Component for the fixed action bar at the bottom
const ProductActionBar = ({ qty, product, addToCart, decrementProduct, inStock, availableStock }) => {
  const { t } = useI18n()
  const productIdForCart = product._id ?? product.id

  if (!product) return null

  return (
    <div className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 p-1">
      <div className="mx-auto p-4">
        {qty === 0 ? (
          <button
            onClick={() => {
              if (!inStock) return
              addToCart(productIdForCart)
            }}
            disabled={!inStock}
            className="w-full min-h-12 px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {inStock ? t('productPage.actions.addToCart') : t('common.outOfStock')}
          </button>
        ) : (
          <div className="w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-4 rounded-lg bg-gray-100 dark:bg-slate-800 p-1">
              <button
                onClick={() => decrementProduct(productIdForCart)}
                className="min-w-10 min-h-10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-50 font-medium rounded-md transition-all duration-200"
                aria-label={t('productPage.actions.decreaseQuantity')}
              >
                <Minus size={18} />
              </button>
              <div className="text-xl font-semibold text-gray-900 dark:text-slate-50 min-w-[2ch] text-center">{qty}</div>
              <button
                onClick={() => addToCart(productIdForCart)}
                disabled={!inStock || (isFinite(availableStock) && qty >= availableStock)}
                className="min-w-10 min-h-10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-50 font-medium rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('productPage.actions.increaseQuantity')}
              >
                <Plus size={18} />
              </button>
            </div>
            {/* The primary button can still be shown, or replaced with a total price. For now, this is cleaner. */}
            <div className="text-2xl font-bold text-gray-900 dark:text-slate-50">
              {t('common.currencySymbol')} {(product.price * qty).toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// NEW: Component for a single card in the related products list
const RelatedProductCard = ({ product }) => {
  const { t, lang } = useI18n()
  const { translateDBVal } = useTranslations()
  return (
    <Link to={`/product/${product.id}`} state={{ product }} className="block w-36 flex-shrink-0">
      <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden transition-all duration-200 hover:border-blue-500 hover:shadow-sm">
        <div className="aspect-square bg-gray-100 dark:bg-slate-800">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
        </div>
        <div className="p-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-slate-50 truncate">{ translateDBVal("Product", "name", product.title, lang)}</h3>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-base font-semibold text-gray-900 dark:text-slate-50">
              {t('common.currencySymbol')} {product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-500 dark:text-slate-400 line-through">
                {t('common.currencySymbol')} {product.originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

// NEW: Component for the entire related products section
const RelatedProducts = () => {
  const { t } = useI18n()

  // Hardcoded data as requested
  const sampleRelatedProducts = [
    { id: 'REL001', title: 'Fresh Organic Apples', price: 4.99, originalPrice: 6.99, image: 'https://via.placeholder.com/200x200?text=Apple' },
    { id: 'REL002', title: 'Whole Wheat Bread', price: 3.49, image: 'https://via.placeholder.com/200x200?text=Bread' },
    { id: 'REL003', title: 'Almond Milk (Unsweetened)', price: 2.99, originalPrice: 3.50, image: 'https://via.placeholder.com/200x200?text=Milk' },
    { id: 'REL004', title: 'Cage-Free Brown Eggs', price: 5.99, image: 'https://via.placeholder.com/200x200?text=Eggs' },
    { id: 'REL005', title: 'Greek Yogurt', price: 1.50, image: 'https://via.placeholder.com/200x200?text=Yogurt' }
  ]

  return (
    <div className="py-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-50 mb-3 px-4">
        {t('productPage.relatedProducts.title')}
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide">
        {sampleRelatedProducts.map(p => <RelatedProductCard key={p.id} product={p} />)}
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


  const incoming = location.state?.product || null
  const incomingId = incoming?._id || incoming?.id
  const { data: fetchedProduct } = useProduct(incomingId, { immediate: !!incomingId && !incoming?.name })

  // MODIFIED: Added category and subcategories to fallback data
  const fallback = {
    _id: 'SAMPLE001',
    title: 'Sample Product Title',
    price: 299,
    description: 'This is a sample product description. It provides details about the item, its features, and benefits. It is here to demonstrate how longer text wraps and flows within the designated component area.',
    image: 'https://via.placeholder.com/400x400?text=Product',
    inStock: true,
    category: 'Pantry',
    subcategories: ['Snacks', 'Organic']
  }

  const product = incoming || fetchedProduct || fallback
  const productName = translateDBVal("Product", "name", product.name ?? product.title, lang)
  const images = (product.images?.length) ? product.images : [product.image]
  const availableStock = product.stockQuantity ?? (product.inStock ? Infinity : 0)
  const inStock = availableStock > 0
  const displayPrice = product.discountedPrice ?? product.price
  const originalPrice = product.originalPrice

  useEffect(() => {
    const found = cartItems.find((it) => it.itemCode === product._id)
    setQty(found ? found.quantity : 0)
  }, [product._id, cartItems])

  const format = (key, vars = {}) => {
    let str = t(key)
    Object.keys(vars).forEach(k => str = str.replace(`{{${k}}}`, vars[k]))
    return str
  }

  const FavoriteButton = () => (
    <button
      onClick={() => setLiked(v => !v)}
      aria-label={liked ? t('productPage.actions.unfavoriteAriaLabel') : t('productPage.actions.favoriteAriaLabel')}
      className="min-h-11 min-w-11 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200"
    >
      <Heart
        size={20}
        className={`transition-all ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-slate-400'}`}
      />
    </button>
  )

  useEffect(() => {
    if (!product.subcategories) return;

    setSubcategoryNames([]); // reset before fetching new ones

    Promise.all(product.subcategories.map(async subcategoryId => {
      const res = await getCategoryById(subcategoryId);
      return res.name;
    })).then(names => {
      setSubcategoryNames(names);
    });

  }, [product.subcategories]);
  return (
    <Layout
      header={<HeaderWithName title={productName} rightAction={<FavoriteButton />} />}
      footer={
        <>
          <ProductActionBar
            qty={qty}
            product={product}
            addToCart={addToCart}
            decrementProduct={decrementProduct}
            inStock={inStock}
            availableStock={availableStock}
          />
          <BottomNav /> 
          </>}
    >
      <main className="flex flex-1 flex-col bg-white dark:bg-slate-950 min-h-full">
        <div className="flex-1  overflow-y-auto ">
          <ProductGallery images={images} productName={productName} format={format} />

          <div className="p-4 space-y-4">
            {/* NEW: Category Badges */}
            <div className="flex flex-wrap gap-2">
              {product.category && (
                <span className="px-2.5 py-1 text-xs font-medium text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/50 rounded-full">
                  {translateDBVal(
                    "Category",
                    "name",
                    typeof product.category === 'string' ? product.category : (product.category.name ?? product.category._id ?? ''),
                    lang
                  )}
                </span>
              )}
              {subcategoryNames.map(sub => {
                // we need to get categry name with this id
                return (
                  <span key={sub} className="px-2.5 py-1 text-xs font-medium text-gray-800 bg-gray-100 dark:text-slate-300 dark:bg-slate-800 rounded-full">
                    {translateDBVal("Category", "name", sub, lang)}
                  </span>
                )
              })}
            </div>

            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-slate-50">
                    {t('common.currencySymbol')} {displayPrice}
                  </span>
                  {originalPrice && (
                    <span className="text-base text-gray-500 dark:text-slate-400 line-through">
                      {t('common.currencySymbol')} {originalPrice}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                {!inStock ? (
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                    {t('common.outOfStock')}
                  </span>
                ) : (isFinite(availableStock) && availableStock <= 5) && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    {format('productPage.stockStatus.lowStock_other', { count: availableStock })}
                  </span>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-50 mb-2">
                {t('productPage.description.title')}
              </h2>
              <p className="text-base text-gray-600 dark:text-slate-400">
                {translateDBVal("Product", "description", product.description, lang)}
              </p>
              {/* Spacer with physical height ~2cm to add visual separation */}
              <div style={{ height: '1cm' }} />
            </div>
          </div>

          {/* NEW: Related Products Section */}
          <div className="border-t border-gray-200 dark:border-slate-800 mt-2">
            <RelatedProducts />
          </div>
        </div>
      </main>


    </Layout>
  )
}
