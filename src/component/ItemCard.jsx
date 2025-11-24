import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import { useCart } from '../context/CartContext'
import useTranslations from '../hooks/useTranslations'
import ImageWithLoader from './ImageWithLoader'

// Updated Skeleton to match the new 3-column layout
export const ItemCardSkeleton = () => (
  <div className="flex gap-3 p-3 rounded-lg secBg primBorder h-[120px] animate-pulse">
    {/* Col 1: Image */}
    <div className="w-24 h-full skeleton rounded-md flex-shrink-0"></div>
    
    {/* Col 2: Text Info */}
    <div className="flex-1 flex flex-col justify-between py-1">
      <div className="space-y-2">
        <div className="h-5 w-3/4 skeleton rounded"></div>
        <div className="h-4 w-12 skeleton rounded-full"></div>
      </div>
      <div className="h-6 w-20 skeleton rounded"></div>
    </div>

    {/* Col 3: Action Placeholder */}
    <div className="w-[40px] flex items-end justify-center pb-1">
      <div className="h-10 w-10 rounded-full skeleton"></div>
    </div>
  </div>
);

export default function ItemCard({ item }) {
  const { translateDBVal } = useTranslations()
  const { t, lang } = useI18n()
  
  const { items, addToCart, decrementProduct, loading: cartLoading } = useCart()

  const cartItem = items.find((it) => it.itemCode === item.id)
  const qty = cartItem ? cartItem.quantity : 0

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

  // Format discount: always 2 digits unless 100
  const discountDisplay = discountPercent === 100
    ? '100'
    : discountPercent.toString().padStart(2, '0');

  // Determine badge position and border radius for RTL/LTR
  const isRTL = lang === 'ur' || lang === 'ar' || lang === 'fa' || lang === 'he';
  const badgePositionClass = isRTL ? 'top-0 right-0' : 'top-0 left-0';
  const badgeBorderRadius = isRTL
    ? { borderTopRightRadius: '0.5rem', borderBottomLeftRadius: '0.75rem', borderBottomRightRadius: 0, borderTopLeftRadius: 0, paddingLeft: 4, paddingRight: 4 }
    : { borderTopLeftRadius: '0.5rem', borderBottomRightRadius: '0.75rem', borderBottomLeftRadius: 0, borderTopRightRadius: 0, paddingLeft: 4, paddingRight: 4 };

  const handleAdd = (e) => {
    e.preventDefault() 
    e.stopPropagation()
    addToCart(item.id)
  }

  const handleRemove = (e) => {
    e.preventDefault()
    e.stopPropagation()
    decrementProduct(item.id)
  }

  // Touch target for the vertical buttons
  const touchTarget = "w-full h-[36px] flex items-center justify-center transition-colors duration-200"

  return (
    <div className={`card p-3 flex gap-3 transition-all duration-200 ${isOut ? 'opacity-70' : 'hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900'}`}>
      
      {/* COLUMN 1: Image (Fixed Width) */}
      <Link 
        to={isOut ? '#' : `/product/${item.id}`} 
        className="block flex-shrink-0 relative w-24 sm:w-28 group self-start"
        tabIndex={-1}
      >
         <div className="aspect-square w-full rounded-lg overflow-hidden primBorder primBg flex items-center justify-center relative">
          <ImageWithLoader
            src={item.image}
            alt={format('itemCard.productImageAlt', { title: item.title })}
            imageClassName={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOut ? 'grayscale' : ''}`}
          />
          
          {/* Discount Badge - Top left (LTR) or Top right (RTL), with correct border radius */}
          {item.originalPrice && discountPercent > 0 && !isOut && (
            <span
              className={`absolute ${badgePositionClass} badgeSuccess text-[10px] font-bold py-0.5 z-20 shadow-sm`}
              style={badgeBorderRadius}
            >
              {discountDisplay}%
            </span>
          )}
        </div>
      </Link>

      {/* COLUMN 2: Info (Flexible width) */}
      <div className="flex-1 flex flex-col min-w-0">
        <Link 
          to={isOut ? '#' : `/product/${item.id}`} 
          className="block group flex-grow"
        >
          <div className="space-y-1.5">
            <h3 className={`font-semibold primText leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${lang === 'ur' ? 'text-lg' : 'text-base'}`}>
              {translateDBVal("Product", "name", item.title, lang)}
            </h3>
            
            <span className="badgeCategory">
               {translateDBVal("Category", "name", item.category, lang)}
            </span>
          </div>
        </Link>

        {/* Price sits at the bottom of Col 2 */}
        <div className="mt-auto pt-2 leading-none">
           {item.originalPrice && (
             <span className="secText line-through text-xs block mb-1">
               {t('common.currencySymbol')} {Number(item.originalPrice).toLocaleString()}
             </span>
           )}
           <span className="font-bold text-lg primText block">
             {t('common.currencySymbol')} {Number(item.price).toLocaleString()}
           </span>
        </div>
      </div>

      {/* COLUMN 3: Action (Fixed width, Aligned Right) */}
      <div className="flex-shrink-0 flex flex-col items-end justify-end min-w-[40px]" onClick={(e) => e.stopPropagation()}>
        {isOut ? (
           <div className="flex items-center justify-center h-full">
             <span className="badgeDanger text-[10px] py-1 px-2 uppercase font-bold text-center writing-mode-vertical">
               {t('common.outOfStock')}
             </span>
           </div>
        ) : qty === 0 ? (
          /* State A: Round Add Button */
          <button
            onClick={handleAdd}
            disabled={cartLoading}
            aria-label={t('common.addToCart')}
            className="min-w-[40px] min-h-[40px] btnCartAction rounded-full shadow-sm flex items-center justify-center"
          >
             <ShoppingCart size={20} strokeWidth={2.5} />
          </button>
        ) : (
          /* State B: Vertical Pill Stepper */
          /* HCI Note: Vertical stacking maps perfectly to Up/Down logic */
          <div className="flex flex-col items-center w-[40px] rounded-2xl primBorder secBg shadow-sm overflow-hidden">
            {/* Increase (Top) */}
            <button
              onClick={handleAdd}
              className={`${touchTarget} hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 secText border-b dividerBorder`}
              aria-label="Increase quantity"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
            
            {/* Quantity Display (Middle) */}
            <span className="h-[30px] flex items-center justify-center font-bold primText text-sm select-none w-full bg-white dark:bg-slate-950/50">
               {qty}
            </span>

            {/* Decrease (Bottom) */}
            <button
              onClick={handleRemove}
              className={`${touchTarget} hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 secText border-t dividerBorder`}
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