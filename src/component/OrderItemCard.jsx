import React from 'react'
import { ChevronRight, Package, Clock, Calendar } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import dayjs from 'dayjs'
import ImageWithLoader from './ImageWithLoader' // Assuming you have this from previous context, or use standard img

// Skeleton matches the new visual layout
export const OrderItemCardSkeleton = () => (
  <div className="card p-4 animate-pulse">
    {/* Header: ID and Status */}
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2">
        <div className="h-4 w-20 skeleton" />
        <div className="h-3 w-24 skeleton" />
      </div>
      <div className="h-6 w-20 skeleton rounded-full" />
    </div>
    
    {/* Middle: Images */}
    <div className="flex gap-2 mb-4">
      <div className="w-16 h-16 skeleton rounded-md" />
      <div className="w-16 h-16 skeleton rounded-md" />
      <div className="w-16 h-16 skeleton rounded-md" />
    </div>

    {/* Footer: Price */}
    <div className="dividerBorder border-t pt-3 flex justify-between items-center">
      <div className="h-4 w-16 skeleton" />
      <div className="h-5 w-24 skeleton" />
    </div>
  </div>
)

export default function OrderItemCard({ order }) {
  const { t, lang } = useI18n()

  if (!order || !order._id) return <OrderItemCardSkeleton />

  // --- Helpers ---

  const getStatusBadgeClass = (status) => {
    const s = status?.toLowerCase()
    if (s === 'delivered') return 'badgeSuccess'
    if (['cancelled', 'failed', 'canceled'].includes(s)) return 'badgeDanger'
    if (s === 'shipped') return 'badgePrimary'
    return 'badgeWarning' // processing, confirmed, pending
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(lang, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0)
  }

  // --- Data Prep ---
  
  const productCount = order.products?.reduce((acc, curr) => acc + curr.quantity, 0) || 0
  const displayImages = order.products?.slice(0, 3) || []
  const remainingCount = (order.products?.length || 0) - 3

  // Accessibility Label construction
  const statusText = order.status ? t(`orders.status.${order.status.toLowerCase()}`, order.status) : ''
  const ariaLabel = `${t('orders.card.orderId')} ${order._id.slice(-6)}, ${statusText}, ${t('common.total')} ${formatCurrency(order.totalPaid)}`

  return (
    <div 
      className="card group transition-all duration-200 active:scale-[0.99] hover:shadow-md"
      aria-label={ariaLabel}
    >
      {/* --- Top Row: Header Info --- */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
          <span className="text-xs font-bold secText uppercase tracking-wider mb-1">
            {t('orders.card.orderId').replace('{id}', `#${order._id.slice(-6).toUpperCase()}`)}
          </span>
          <div className="flex items-center gap-1 text-xs secText">
            <Calendar size={12} />
            <span>{dayjs(order.createdAt).format('MMM D, YYYY • HH:mm')}</span>
          </div>
        </div>
        
        <span className={`${getStatusBadgeClass(order.status)} shadow-sm`}>
          {statusText}
        </span>
      </div>

      {/* --- Middle Row: Product Thumbnails --- */}
      {/* This section gives visual context to the order */}
      <div className="flex items-center gap-3 mb-4 overflow-hidden">
        {displayImages.length > 0 ? (
          displayImages.map((prod, index) => (
            <div 
              key={index} 
              className="relative w-14 h-14 rounded-lg primBorder bg-white dark:bg-slate-800 overflow-hidden flex-shrink-0"
            >
              {prod.photo ? (
                <img 
                  src={prod.photo} 
                  alt={prod.name} 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <Package size={20} className="secText opacity-50" />
                </div>
              )}
              
              {/* Badge for quantity if > 1 on specific item */}
              {prod.quantity > 1 && (
                <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-tl-md">
                  x{prod.quantity}
                </div>
              )}
            </div>
          ))
        ) : (
           <div className="w-14 h-14 rounded-lg primBorder flex items-center justify-center bg-gray-50 dark:bg-slate-800">
             <Package size={24} className="secText opacity-40" />
           </div>
        )}

        {/* Overflow Counter */}
        {remainingCount > 0 && (
          <div className="w-14 h-14 rounded-lg primBorder secBg flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold secText">+{remainingCount}</span>
          </div>
        )}
      </div>

      {/* --- Bottom Row: Totals & Action --- */}
      <div className="flex justify-between items-center pt-3 dividerBorder border-t">
        <div className="flex flex-col">
          <span className="text-xs secText">
             {productCount} {productCount === 1 ? t('common.item') : t('common.items')}
          </span>
          <span className="text-lg font-bold primText">
            {t('common.currencySymbol')}{formatCurrency(order.totalPaid)}
          </span>
        </div>

        <div className="flex items-center gap-1 text-sm font-medium accentPrimText group-hover:underline">
          {t('orders.card.viewDetails')}
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  )
}