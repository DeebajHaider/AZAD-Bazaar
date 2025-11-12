import React from 'react'

export default function ItemCard({ item }) {
  const isOut = !item.inStock

  return (
    // Card container: Updated with new color system, borders, and hover effects.
    <div 
      className={`flex gap-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 transition-all duration-200 ${
        isOut 
          ? 'opacity-60 grayscale cursor-not-allowed' 
          : 'hover:border-blue-500 hover:shadow-sm cursor-pointer'
      }`}
    >
      {/* Image container: Uses a slightly different background for contrast (Suggestion #3) */}
      <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-md relative flex-shrink-0 flex items-center justify-center overflow-hidden">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        {isOut && (
          // Out of Stock overlay
          <div className="absolute inset-0 bg-gray-900/60 dark:bg-slate-950/60 flex items-center justify-center">
            <span className="bg-red-500 dark:bg-red-600 text-white px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Item details */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Title: Updated to font-semibold (Suggestion #1) and uses primary text colors */}
        <h3 className="font-semibold text-base text-gray-900 dark:text-slate-50 mb-1">
          {item.title}
        </h3>
        
        {/* Price section */}
        <div className="flex items-baseline gap-2 flex-wrap">
          {/* Current price: Uses primary text colors */}
          <span className="font-semibold text-lg text-gray-900 dark:text-slate-50">
            Rs {item.price}
          </span>
          {/* Original price: Uses secondary text colors */}
          {item.originalPrice && (
            <span className="text-gray-600 dark:text-slate-400 line-through text-sm">
              Rs {item.originalPrice}
            </span>
          )}
        </div>

        {/* Category and Discount */}
        <div className="flex items-center gap-3 mt-1.5">
          {/* Category: Uses secondary text colors */}
          <p className="text-gray-600 dark:text-slate-400 text-sm">
            {item.category}
          </p>
          {/* Discount: Uses success colors and font-medium (Suggestion #2) */}
          {item.originalPrice && (
            <span className="text-green-600 dark:text-green-500 text-sm font-medium">
              {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
            </span>
          )}
        </div>

      </div>
    </div>
  )
}