import React from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import BottomNav from '../component/BottomNav'
import { useOrdersContext } from '../context/OrderContext'
import { useI18n } from '../context/I18nContext'
import OrderItemCard, { OrderItemCardSkeleton } from '../component/OrderItemCard'
import { PackageX, AlertCircle } from 'lucide-react'

export default function Orders() {
  const { orders, loading, error } = useOrdersContext()
  const { t } = useI18n()

  // Improved Empty State with actionable button
  const EmptyState = () => (
    <div className="flex flex-1 flex-col items-center justify-center text-center p-8 min-h-[60vh]">
      <div className="w-20 h-20 secBg rounded-full flex items-center justify-center mb-4">
        <PackageX className="w-10 h-10 secText opacity-60" />
      </div>
      <h2 className="text-xl font-bold primText mb-2">{t('orders.empty.title')}</h2>
      <p className="text-sm secText max-w-[250px] mx-auto mb-6">
        {t('orders.empty.description')}
      </p>
      <Link 
        to="/" 
        className="btnPrimary px-6 py-3 rounded-lg shadow-sm min-h-12 flex items-center"
      >
        {t('cart.empty.cta') || "Start Shopping"}
      </Link>
    </div>
  )

  // Improved Error State
  const ErrorState = () => (
    <div className="flex flex-1 flex-col items-center justify-center text-center p-6 mt-10">
      <AlertCircle className="w-12 h-12 accentDangerText mb-4" />
      <h2 className="text-lg font-semibold primText mb-2">{t('common.error.title')}</h2>
      <p className="text-sm secText mb-4">{error?.message || t('common.error.description')}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="btnSecondary px-4 py-2 rounded-lg text-sm"
      >
        {t('common.retry') || "Retry"}
      </button>
    </div>
  )

  return (
    <Layout
      header={<HeaderWithName title={t('orders.title')} to="/" />}
      footer={<BottomNav />}
    >
      <main className="flex-1 min-h-full overflow-y-auto primBg">
        {/* Add a subtle background variation for list area if needed, currently keeping generic primBg */}
        <div className="max-w-[430px] mx-auto w-full p-4 space-y-4">
          
          {/* Loading State */}
          {loading && (
            Array.from({ length: 4 }).map((_, i) => <OrderItemCardSkeleton key={i} />)
          )}

          {/* Error State */}
          {!loading && error && <ErrorState />}

          {/* Orders List */}
          {!loading && !error && orders && orders.length > 0 && (
            orders.map(order => (
              <Link 
                key={order._id} 
                to={`/orders/${order._id}`} 
                state={{ order }} 
                className="block focusRing rounded-lg" // Accessibility focus ring
              >
                <OrderItemCard order={order} />
              </Link>
            ))
          )}

          {/* Empty State */}
          {!loading && !error && orders && orders.length === 0 && <EmptyState />}
        </div>
      </main>
    </Layout>
  )
}