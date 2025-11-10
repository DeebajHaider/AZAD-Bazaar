import React from 'react'

export default function ItemCard({ item }) {
  const isOut = !item.inStock

  return (
    <div className={`flex gap-4 p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] transition-colors ${isOut ? 'opacity-60 grayscale' : 'hover:border-[var(--color-primary-500)] cursor-pointer'}`}>
      <div className="w-24 h-24 bg-[var(--color-surface-alt)] rounded-md relative flex items-center justify-center overflow-hidden">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-md" />
        {isOut && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="bg-red-600 text-white px-2 py-1 rounded-md text-xs font-semibold">OUT OF STOCK</span>
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-medium mb-1">{item.title}</h3>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center text-yellow-500">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 .587l3.668 7.431L23.4 9.75l-5.6 5.458L19.334 24 12 20.013 4.666 24l1.534-8.792L.6 9.75l7.732-1.732L12 .587z"/></svg>
            <span className="ml-1 text-sm">{item.rating}</span>
          </div>
          <span className="text-[var(--color-text-muted)] text-sm">({item.reviews} reviews)</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold">Rs {item.price}</span>
          <span className="text-[var(--color-text-muted)] line-through text-sm">Rs {item.originalPrice}</span>
          <span className="text-[var(--color-success)] text-sm">{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF</span>
        </div>

        <p className="text-[var(--color-text-muted)] text-sm mt-1">{item.category}</p>
      </div>
    </div>
  )
}