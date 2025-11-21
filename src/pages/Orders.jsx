import React from 'react'
import {
  Link
} from 'react-router-dom'
import {
  Layout
} from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import BottomNav from '../component/BottomNav'
import {
  useOrdersContext
} from '../context/OrderContext'
import {
  useI18n
} from '../context/I18nContext'
import OrderItemCard, {
  OrderItemCardSkeleton
} from '../component/OrderItemCard'
import {
  PackageSearch
} from 'lucide-react'

export default function Orders() {
  const {
    orders,
    loading,
    error
  } = useOrdersContext()
  const {
    t
  } = useI18n()

  const EmptyState = () => (
    <div className="flex flex-1 flex-col items-center justify-center text-center p-4">
      <PackageSearch className="w-24 h-24 secText opacity-50 mb-4" />
      <h2 className="text-xl font-semibold primText">{t('orders.empty.title')}</h2>
      <p className="mt-2 secText">{t('orders.empty.description')}</p>
    </div>
  )

  const ErrorState = () => (
    <div className="flex flex-1 flex-col items-center justify-center text-center p-4">
      <h2 className="text-xl font-semibold accentDangerText">{t('common.error.title')}</h2>
      <p className="mt-2 secText">{error?.message || t('common.error.description')}</p>
    </div>
  )

  return (
    <Layout
      header={<HeaderWithName title={t('orders.title')} to="/" />}
      footer={<BottomNav />}
    >
      <main className="flex-1 min-h-full overflow-y-auto primBg p-4 pb-24 space-y-4">
        {loading && (!orders || orders.length === 0) && (
          Array.from({ length: 5 }).map((_, i) => <OrderItemCardSkeleton key={i} />)
        )}

        {!loading && error && <ErrorState />}

        {!loading && !error && orders && orders.length > 0 && (
          orders.map(order => (
            <Link key={order._id} to={`/orders/${order._id}`} state={{ order }} className="block mb-4">
              <OrderItemCard order={order} />
            </Link>
          ))
        )}

        {!loading && !error && orders && orders.length === 0 && <EmptyState />}
      </main>
    </Layout>
  )
}