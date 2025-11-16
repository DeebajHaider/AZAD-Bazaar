import React from 'react'
import { useI18n } from '../context/I18nContext'
import useTranslations from '../hooks/useTranslations'
export default function ItemCard({ item }) {
  const { loading, translateDBVal } = useTranslations();
  const { t, lang } = useI18n()
  
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
  
  return (
    <div
      className={`flex gap-4 p-4 secBg rounded-lg primBorder transition-all duration-200 ${
        isOut
          ? 'opacity-60 grayscale cursor-not-allowed'
          : 'hover:shadow-sm cursor-pointer'
      }`}
    >
      {/* Image container */}
      <div className="w-24 h-24 primBg primBorder rounded-md relative flex-shrink-0 flex items-center justify-center overflow-hidden">
        <img 
          src={item.image} 
          alt={format('itemCard.productImageAlt', { title: item.title })} 
          className="w-full h-full object-cover" 
        />
        {isOut && (
          <div className="absolute inset-0 bg-gray-900/60 dark:bg-slate-950/60 flex items-center justify-center">
            <span className="badgeDanger uppercase tracking-wider text-xs">
              {t('common.outOfStock')}
            </span>
          </div>
        )}
      </div>
      
      {/* Item details */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Title */}
        <h3 className="font-semibold text-base primText mb-1 line-clamp-2">
          {translateDBVal("Product", "name", item.title, lang)}
        </h3>
        
        {/* Price section */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-semibold text-lg primText">
            {t('common.currencySymbol')} {Number(item.price).toLocaleString()}
          </span>
          {item.originalPrice && (
            <span className="secText line-through text-sm">
              {t('common.currencySymbol')} {Number(item.originalPrice).toLocaleString()}
            </span>
          )}
        </div>
        
        {/* Category and Discount - IMPROVED */}
        <div className="flex items-center gap-2 mt-2">
          {/* Category badge - improved sizing and padding */}
          <span className="badgePrimary max-w-[120px] inline-block text-ellipsis overflow-hidden text-xs px-2 py-0.5 whitespace-nowrap">
            {translateDBVal("Category", "name", item.category, lang)}
          </span>
          
          {/* Discount badge - now styled as a proper badge instead of just text */}
          {item.originalPrice && discountPercent > 0 && (
            <span className="badgeSuccess text-xs px-2 py-0.5 whitespace-nowrap">
              {format('itemCard.discountOff', { percent: discountPercent })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
