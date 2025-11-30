import React from 'react'
import { ChevronRight, Package, Calendar } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import dayjs from 'dayjs'
// Assuming ImageWithLoader is available
import ImageWithLoader from './ImageWithLoader'

// Skeleton: Matches the MD3 structure
export const OrderItemCardSkeleton = () => (
  <div className="p-4 rounded-md bg-md-surface-container animate-pulse">
    {/* Header: ID and Status */}
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2">
        <div className="h-4 w-20 bg-md-surface-variant/50 rounded" />
        <div className="h-3 w-24 bg-md-surface-variant/30 rounded" />
      </div>
      <div className="h-6 w-20 bg-md-surface-variant/50 rounded-md" />
    </div>
    
    {/* Middle: Images */}
    <div className="flex gap-2 mb-4">
      <div className="w-16 h-16 bg-md-surface-variant/30 rounded-md" />
      <div className="w-16 h-16 bg-md-surface-variant/30 rounded-md" />
      <div className="w-16 h-16 bg-md-surface-variant/30 rounded-md" />
    </div>

    {/* Footer: Price */}
    <div className="border-t border-md-outline-variant/30 pt-3 flex justify-between items-center">
      <div className="h-4 w-16 bg-md-surface-variant/50 rounded" />
      <div className="h-5 w-24 bg-md-surface-variant/50 rounded" />
    </div>
  </div>
)

export default function OrderItemCard({ order }) {
  const { t, lang } = useI18n()

  if (!order || !order._id) return <OrderItemCardSkeleton />

  // --- Helpers ---

  // MD3: Use Container colors for status badges to ensure contrast
  const getStatusBadgeClass = (status) => {
    const s = status?.toLowerCase()
    
    // Success (Green)
    if (s === 'delivered') return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
    
    // Error (Error Container)
    if (['cancelled', 'failed', 'canceled'].includes(s)) return 'bg-md-error-container text-md-on-error-container'
    
    // Info/Moving (Secondary Container)
    if (s === 'shipped') return 'bg-md-secondary-container text-md-on-secondary-container'
    
    // Warning/Processing (Tertiary Container)
    return 'bg-md-tertiary-container text-md-on-tertiary-container'
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

  const statusText = order.status ? t(`orders.status.${order.status.toLowerCase()}`, order.status) : ''
  const ariaLabel = `${t('orders.card.orderId')} ${order._id.slice(-6)}, ${statusText}, ${t('common.total')} ${formatCurrency(order.totalPaid)}`

  return (
    <div 
      // MD3 Card: Surface Container -> Hover: Surface Container High
      className="group p-4 rounded-md bg-md-surface-container transition-all duration-200 active:scale-[0.99] hover:bg-md-surface-container-high cursor-pointer shadow-sm hover:shadow-md"
      aria-label={ariaLabel}
    >
      {/* --- Top Row: Header Info --- */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-md-on-surface-variant uppercase tracking-wider mb-1">
            {t('orders.card.orderId').replace('{id}', `#${order._id.slice(-6).toUpperCase()}`)}
          </span>
          <div className="flex items-center gap-1 text-xs text-md-on-surface-variant/80">
            <Calendar size={12} />
            <span>{dayjs(order.createdAt).format('MMM D, YYYY • HH:mm')}</span>
          </div>
        </div>
        
        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${getStatusBadgeClass(order.status)}`}>
          {statusText}
        </span>
      </div>

      {/* --- Middle Row: Product Thumbnails --- */}
      <div className="flex items-center gap-3 mb-4 overflow-hidden">
        {displayImages.length > 0 ? (
          displayImages.map((prod, index) => (
            <div 
              key={index} 
              // Image Container: Surface Container Highest to frame the image
              className="relative w-14 h-14 rounded-md bg-md-surface-container-highest overflow-hidden flex-shrink-0 border border-md-outline-variant/20"
            >
              {prod.photo ? (
                <img 
                  src={prod.photo} 
                  alt={prod.name} 
                  className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" 
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={20} className="text-md-on-surface-variant/40" />
                </div>
              )}
              
              {/* Quantity Badge: Scrim (Black/70) is standard for image overlays */}
              {prod.quantity > 1 && (
                <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-tl-md backdrop-blur-[1px]">
                  x{prod.quantity}
                </div>
              )}
            </div>
          ))
        ) : (
           <div className="w-14 h-14 rounded-md bg-md-surface-container-highest flex items-center justify-center">
             <Package size={24} className="text-md-on-surface-variant/40" />
           </div>
        )}

        {/* Overflow Counter */}
        {remainingCount > 0 && (
          <div className="w-14 h-14 rounded-md bg-md-surface-container-highest flex items-center justify-center flex-shrink-0 border border-md-outline-variant/20">
            <span className="text-xs font-semibold text-md-on-surface-variant">+{remainingCount}</span>
          </div>
        )}
      </div>

      {/* --- Bottom Row: Totals & Action --- */}
      <div className="flex justify-between items-center pt-3 border-t border-md-outline-variant/30">
        <div className="flex flex-col">
          <span className="text-xs text-md-on-surface-variant">
             {productCount} {productCount === 1 ? t('common.item') : t('common.items')}
          </span>
          <span className="text-lg font-bold text-md-on-surface">
            {t('common.currencySymbol')}{formatCurrency(order.totalPaid)}
          </span>
        </div>

        <div className="flex items-center gap-1 text-sm font-bold text-md-primary group-hover:text-md-on-surface transition-colors">
          {t('orders.card.viewDetails')}
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  )
}