import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Minus, ShoppingCart, Trash2, Loader2 } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import { useCart } from '../context/CartContext'
import useTranslations from '../hooks/useTranslations'
import ImageWithLoader from './ImageWithLoader'

// Updated Skeleton using MD3 colors
export const ItemCardSkeleton = () => (
  <div className="flex gap-3 p-3 rounded-lg bg-md-surface-container animate-pulse">
    {/* Col 1: Image */}
    <div className="w-24 h-full bg-md-surface-variant/50 rounded-md flex-shrink-0"></div>
    
    {/* Col 2: Text Info */}
    <div className="flex-1 flex flex-col justify-between py-1">
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-md-surface-variant/50 rounded"></div>
        <div className="h-4 w-12 bg-md-surface-variant/30 rounded-md"></div>
      </div>
      <div className="h-6 w-20 bg-md-surface-variant/50 rounded"></div>
    </div>

    {/* Col 3: Action Placeholder */}
    <div className="w-[40px] flex items-end justify-center pb-1">
      <div className="h-10 w-10 rounded-md bg-md-surface-variant/50"></div>
    </div>
  </div>
);

export default function ItemCard({ item }) {
  const { translateDBVal } = useTranslations()
  const { t, lang } = useI18n()
  
  const { items, addToCart, decrementProduct, isProductLoading } = useCart()
  const navigate = useNavigate()

  const cartItem = items.find((it) => it.itemCode === item.id)
  const qty = cartItem ? cartItem.quantity : 0
  
  const isLoading = isProductLoading(item.id)

  const format = (key, vars = {}) => {
    let str = t(key)
    Object.keys(vars).forEach(k => {
      const re = new RegExp(`{{\\s*${k}\\s*}}`, 'g')
      str = String(str).replace(re, vars[k])
    })
    return str
  }
  
  const isOut = !item.inStock
  const discountPercent = item.originalPrice 
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0

  const discountDisplay = discountPercent === 100 ? '100' : discountPercent.toString().padStart(2, '0');

  const isRTL = lang === 'ur' || lang === 'ar' || lang === 'fa' || lang === 'he';
  const badgePositionClass = isRTL ? 'top-0 right-0' : 'top-0 left-0';
  const badgeBorderRadius = isRTL
    ? { borderTopRightRadius: '0.5rem', borderBottomLeftRadius: '0.75rem' }
    : { borderTopLeftRadius: '0.5rem', borderBottomRightRadius: '0.75rem' };

  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isLoading) addToCart(item.id)
  }

  const handleRemove = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isLoading) decrementProduct(item.id)
  }

  // Touch target for the vertical buttons
  const touchTarget = "w-full h-[36px] flex items-center justify-center transition-colors duration-200"

  const handleNavigate = () => {
    if (!isOut) navigate(`/product/${item.id}`)
  }

  const handleKey = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isOut) {
      e.preventDefault(); handleNavigate()
    }
  }

  return (
    <div
      // MD3 Card: Surface Container Low
      className={`relative flex gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer
        ${isOut 
          ? 'bg-md-surface-container opacity-70 cursor-not-allowed' 
          : 'bg-md-surface-container hover:bg-md-surface-container-high hover:shadow-sm'
        }`}
      onClick={handleNavigate}
      onKeyDown={handleKey}
      role="link"
      tabIndex={0}
      aria-disabled={isOut}
      aria-label={format('itemCard.navigateToProduct', { title: item.title })}
    >
      
      {/* COLUMN 1: Image */}
      <div 
        className="block flex-shrink-0 relative w-24 sm:w-28 group self-start"
        tabIndex={-1}
      >
         <div className="aspect-square w-full rounded-md overflow-hidden bg-md-surface-container-highest flex items-center justify-center relative">
          <ImageWithLoader
            src={item.image}
            alt={format('itemCard.productImageAlt', { title: item.title })}
            imageClassName={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOut ? 'grayscale' : ''}`}
          />
          
          {/* Discount Badge: Tertiary Container (or custom Success/Error depending on brand) */}
          {/* Using a custom green for discount as it implies "saving money" - positive sentiment */}
          {item.originalPrice && discountPercent > 0 && !isOut && (
            <span
              className={`absolute ${badgePositionClass} bg-green-200 text-green-900 text-[10px] font-bold py-0.5 px-1.5 z-20 shadow-sm`}
              style={badgeBorderRadius}
            >
              {discountDisplay}%
            </span>
          )}
        </div>
      </div>

      {/* COLUMN 2: Info */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="block group flex-grow">
          <div className="space-y-1.5">
            <h3 className={`font-semibold text-md-on-surface leading-tight line-clamp-2 ${lang === 'ur' ? 'text-lg' : 'text-base'}`}>
              {translateDBVal("Product", "name", item.title, lang)}
            </h3>
            
            {/* Category Badge: Surface Variant text, no background or subtle */}
            <span className="inline-block text-xs font-medium text-md-on-surface-variant/80 px-1.5 py-0.5 rounded-md bg-md-surface-container-highest">
               {translateDBVal("Category", "name", item.category, lang)}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-auto pt-2 leading-none">
           {item.originalPrice && (
             <span className="text-md-on-surface-variant line-through text-xs block mb-1">
               {t('common.currencySymbol')} {Number(item.originalPrice).toLocaleString()}
             </span>
           )}
           <span className="font-bold text-lg text-md-on-surface block">
             {t('common.currencySymbol')} {Number(item.price).toLocaleString()}
           </span>
        </div>
      </div>

      {/* COLUMN 3: Action */}
      <div className="flex-shrink-0 flex flex-col items-end justify-end min-w-[40px]" onClick={(e) => e.stopPropagation()}>
        {isOut ? (
           <div className="flex items-center justify-center h-full">
             {/* Badge: Error Container */}
             <span className="bg-md-error-container text-md-on-error-container text-[10px] py-1 px-2 rounded-md uppercase font-bold text-center writing-mode-vertical">
               {t('common.outOfStock')}
             </span>
           </div>
        ) : qty === 0 ? (
          /* State A: Add Button */
          /* Tonal Button Style: Secondary Container */
          <button
            onClick={handleAdd}
            disabled={isLoading}
            aria-label={t('common.addToCart')}
            className={`min-w-[40px] min-h-[40px] rounded-md bg-md-secondary-container text-md-on-secondary-container hover:shadow-md active:scale-95 transition-all flex items-center justify-center relative ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" strokeWidth={2.5} />
            ) : (
              <ShoppingCart size={20} strokeWidth={2.5} />
            )}
          </button>
        ) : (
          /* State B: Vertical Stepper */
          /* Container: Surface Container Highest */
          <div className="flex flex-col items-center w-[40px] rounded-md bg-md-surface-container-highest shadow-sm overflow-hidden relative">
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-md-surface/60 rounded-md flex items-center justify-center z-20 backdrop-blur-[1px]">
                <Loader2 className="w-5 h-5 text-md-primary animate-spin" />
              </div>
            )}
            
            {/* Increase (Top) - Primary Color Touch */}
            <button
              onClick={handleAdd}
              disabled={isLoading}
              className={`${touchTarget} text-md-on-surface-variant hover:bg-md-primary/10 hover:text-md-primary ${
                isLoading ? 'cursor-not-allowed' : ''
              }`}
              aria-label="Increase quantity"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
            
            {/* Quantity Display */}
            <span className="h-[28px] w-full flex items-center justify-center font-bold text-md-on-surface text-sm select-none bg-md-surface">
               {qty}
            </span>

            {/* Decrease (Bottom) - Error Color Touch */}
            <button
              onClick={handleRemove}
              disabled={isLoading}
              className={`${touchTarget} text-md-on-surface-variant hover:bg-md-error/10 hover:text-md-error ${
                isLoading ? 'cursor-not-allowed' : ''
              }`}
              aria-label="Decrease quantity"
            >
              {qty === 1 ? <Trash2 size={16} /> : <Minus size={16} strokeWidth={3} />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}