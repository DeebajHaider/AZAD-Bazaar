import React from 'react'
import {
  useParams,
  Link
} from 'react-router-dom'
import {
  Layout
} from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import BottomNav from '../component/BottomNav'
import {
  useI18n
} from '../context/I18nContext'
import useOrder from '../api/hooks/useOrder'
import OrderStatusStepper from '../component/OrderStatusStepper'
import ImageWithLoader from '../component/ImageWithLoader'

// Skeleton for the detail page
const OrderDetailSkeleton = () => (
  <div className="p-4 space-y-6 pb-24 animate-pulse">
    {/* Status Stepper Skeleton */}
    <div className="secBg primBorder rounded-lg p-4">
      <div className="h-16 w-full skeleton" />
    </div>

    {/* Items Section Skeleton */}
    <div className="secBg primBorder rounded-lg">
      <div className="p-4 dividerBorder"><div className="h-6 w-24 skeleton" /></div>
      <div className="p-4 space-y-4">
        <div className="flex gap-4"><div className="w-16 h-16 skeleton rounded-md" /><div className="flex-1 space-y-2"><div className="h-5 w-3/4 skeleton" /><div className="h-4 w-1/4 skeleton" /></div></div>
        <div className="flex gap-4"><div className="w-16 h-16 skeleton rounded-md" /><div className="flex-1 space-y-2"><div className="h-5 w-2/3 skeleton" /><div className="h-4 w-1/3 skeleton" /></div></div>
      </div>
    </div>

    {/* Billing Section Skeleton */}
    <div className="secBg primBorder rounded-lg p-4 space-y-3">
      <div className="h-6 w-28 skeleton mb-2" />
      <div className="flex justify-between"><div className="h-5 w-20 skeleton" /><div className="h-5 w-16 skeleton" /></div>
      <div className="pt-3 mt-1 dividerBorder border-t flex justify-between"><div className="h-6 w-20 skeleton" /><div className="h-6 w-24 skeleton" /></div>
    </div>
  </div>
);

export default function Order() {
  const {
    orderId
  } = useParams()
  const {
    order,
    loading,
    error
  } = useOrder(orderId)
  const {
    t,
    lang
  } = useI18n()

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0.00'
    return new Intl.NumberFormat(lang, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  if (loading) {
    return (
      <Layout
        header={<HeaderWithName title={t('order.title')} to="/orders" />}
        footer={<BottomNav />}
      >
        <main className="flex-1 overflow-y-auto primBg min-h-full"><OrderDetailSkeleton /></main>
      </Layout>
    )
  }
//TODO: Evey main in layout nees min-h-full, need to shortend orderid
  if (error || !order) {
    return (
      <Layout
        header={<HeaderWithName title={t('order.title')} to="/orders" />}
        footer={<BottomNav />}
      >
        <main className="flex flex-1 items-center justify-center primBg p-4 min-h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold accentDangerText">{t('common.error.title')}</h2>
            <p className="mt-2 secText">{error?.message || t('common.error.notFound')}</p>
          </div>
        </main>
      </Layout>
    )
  }

  const currentStatus = order?.statusHistory?.[order.statusHistory.length - 1]?.status;

  return (
    <Layout
      header={<HeaderWithName title={t('order.titleWithId').replace('{id}', orderId.slice(-6).toUpperCase())} to="/orders" />}
      footer={<BottomNav />}
    >
      <main className="flex-1 overflow-y-auto primBg p-4 min-h-full space-y-6">
        {/* Status Section */}
        <section className="secBg primBorder rounded-lg p-4">
          <OrderStatusStepper currentStatus={currentStatus} />
        </section>

        {/* Items Section */}
        <section className="secBg primBorder rounded-lg">
          <h2 className="text-lg font-semibold primText p-4 dividerBorder">
            {t('order.items.title')}
          </h2>
          <div className="p-4 space-y-4">
            {order.products.map(item => (
              <Link to={`/product`} state={{ productIdtoFetch: item.productId }} key={item.productId} className="flex gap-4 secHoverBg p-2 -m-2 rounded-lg">
                <ImageWithLoader
                  src={item.photo}
                  alt={item.name}
                  imageClassName="w-16 h-16 object-cover rounded-md"
                  containerClassName="primBorder rounded-md overflow-hidden"
                />
                <div className="flex-1">
                  <p className="font-semibold primText">{item.name}</p>
                  <p className="text-sm secText">
                    {t('order.items.quantity').replace('{count}', item.quantity)}
                  </p>
                </div>
                <p className="font-medium primText">
                  {t('common.currencySymbol')}{formatCurrency(item.price)}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Shipping & Payment Section */}
        <section className="secBg primBorder rounded-lg p-4 space-y-4">
            <div>
              <h3 className="text-base font-semibold primText mb-1">{t('order.shipping.title')}</h3>
              <p className="text-sm secText">{order.address.addressText}</p>
            </div>
             <div>
              <h3 className="text-base font-semibold primText mb-1">{t('order.payment.title')}</h3>
              <p className="text-sm secText capitalize">{order.paymentMethod.name}</p>
            </div>
        </section>

        {/* Billing Section */}
        <section className="secBg primBorder rounded-lg p-4 space-y-3">
          <h2 className="text-lg font-semibold primText mb-2">{t('checkout.billing.title')}</h2>
          <div className="flex justify-between text-base">
            <span className="secText">{t('checkout.billing.subtotal')}</span>
            <span className="font-medium primText">{t('common.currencySymbol')}{formatCurrency(order.subtotal)}</span>
          </div>
          {/* You can add other fees here if they exist in your order object */}
          <div className="pt-3 mt-1 dividerBorder border-t flex justify-between text-lg font-semibold">
            <span className="primText">{t('checkout.billing.total')}</span>
            <span className="primText">{t('common.currencySymbol')}{formatCurrency(order.totalPaid)}</span>
          </div>
        </section>
      </main>
    </Layout>
  )
}