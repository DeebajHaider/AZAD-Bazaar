import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import BottomNav from '../component/BottomNav'
import { useOrdersContext } from '../context/OrderContext'
import { useI18n } from '../context/I18nContext'
import OrderItemCard, { OrderItemCardSkeleton } from '../component/OrderItemCard'
import MobilePagination from '../component/MobilePagination'
import { PackageX, AlertCircle } from 'lucide-react'

export default function Orders() {
  const { orders, loading, error } = useOrdersContext()
  const { t } = useI18n()
  const [currentPage, setCurrentPage] = useState(1)

  // Improved Empty State with actionable button
  const EmptyState = () => (
    <div className="flex flex-1 flex-col items-center justify-center text-center p-8 min-h-[60vh]">
      {/* Icon: Surface Container Highest for neutral emphasis */}
      <div className="w-24 h-24 rounded-full bg-md-surface-container-highest flex items-center justify-center mb-6">
        <PackageX className="w-10 h-10 text-md-on-surface-variant/50" />
      </div>
      
      {/* Typography: On Surface (Title) vs Variant (Body) */}
      <h2 className="text-xl font-bold text-md-on-surface mb-2">{t('orders.empty.title')}</h2>
      <p className="text-sm text-md-on-surface-variant max-w-[250px] mx-auto mb-8 leading-relaxed">
        {t('orders.empty.description')}
      </p>
      
      {/* CTA: Primary Button */}
      <Link 
        to="/" 
        className="min-h-[48px] px-8 py-3 rounded-full bg-md-primary text-md-on-primary font-bold shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center"
      >
        {t('cart.empty.cta') || "Start Shopping"}
      </Link>
    </div>
  )

  // Improved Error State
  const ErrorState = () => (
    <div className="flex flex-1 flex-col items-center justify-center text-center p-6 mt-10">
      {/* Error Color Role */}
      <div className="w-16 h-16 rounded-full bg-md-error-container flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-md-on-error-container" />
      </div>
      <h2 className="text-lg font-bold text-md-on-surface mb-2">{t('common.error.title')}</h2>
      <p className="text-sm text-md-on-surface-variant mb-6 max-w-xs">{error?.message || t('common.error.description')}</p>
      
      {/* Retry: Tonal Button (Secondary Container) */}
      <button 
        onClick={() => window.location.reload()} 
        className="min-h-[40px] px-6 py-2 rounded-full bg-md-secondary-container text-md-on-secondary-container font-medium text-sm hover:opacity-80 transition-opacity"
      >
        {t('common.retry') || "Retry"}
      </button>
    </div>
  )

  // Sort orders by most recent (descending by createdAt)
  const sortedOrders = orders && Array.isArray(orders)
    ? [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  // Pagination logic
  const pageSize = 5
  const totalResults = sortedOrders.length
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize))
  const currentOrders = sortedOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <Layout
      header={<HeaderWithName title={t('orders.title')} to="/" />}
      footer={<BottomNav />}
    >
      <main className="flex-1 min-h-full overflow-y-auto bg-md-surface">
        <div className="max-w-[430px] mx-auto w-full p-4 space-y-4">
          
          {/* Loading State */}
          {loading && (
            Array.from({ length: 4 }).map((_, i) => <OrderItemCardSkeleton key={i} />)
          )}

          {/* Error State */}
          {!loading && error && <ErrorState />}

          {/* Orders List */}
          {!loading && !error && sortedOrders && sortedOrders.length > 0 && (
            currentOrders.map(order => (
              <Link 
                key={order._id} 
                to={`/orders/${order._id}`} 
                state={{ order }} 
                // Accessibility Ring matching Primary color
                className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-md-primary focus:ring-offset-2 focus:ring-offset-md-surface" 
              >
                <OrderItemCard order={order} />
              </Link>
            ))
          )}

          {/* Empty State */}
          {!loading && !error && sortedOrders && sortedOrders.length === 0 && <EmptyState />}
        </div>

        {/* Pagination */}
        {totalResults > pageSize && (
          <MobilePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </main>
    </Layout>
  )
}