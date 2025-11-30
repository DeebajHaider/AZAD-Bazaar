import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, CreditCard, ChevronRight, Receipt, ShoppingBag } from 'lucide-react'
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import BottomNav from '../component/BottomNav'
import { useI18n } from '../context/I18nContext'
import useTranslations from '../hooks/useTranslations'
import useOrder from '../api/hooks/useOrder'
import OrderStatusStepper from '../component/OrderStatusStepper'
import ImageWithLoader from '../component/ImageWithLoader'
import { useAuth } from '../context/AuthContext'

// Skeleton Layout
const OrderDetailSkeleton = () => (
  <div className="p-3 space-y-3 min-h-full animate-pulse max-w-[430px] mx-auto">
    {/* Status Skeleton */}
    <div className="bg-md-surface-container rounded-md p-4">
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-md-surface-variant/50 flex-shrink-0" />
            <div className="space-y-2 pt-1 flex-1">
              <div className="h-3 w-24 bg-md-surface-variant/50 rounded" />
              {i === 1 && <div className="h-3 w-20 bg-md-surface-variant/30 rounded" />}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Info Skeleton */}
    <div className="bg-md-surface-container rounded-md p-3 space-y-3">
        <div className="h-10 w-full bg-md-surface-variant/30 rounded-md" />
        <div className="h-10 w-full bg-md-surface-variant/30 rounded-md" />
    </div>

    {/* Items Skeleton */}
    <div className="bg-md-surface-container rounded-md p-3">
      <div className="h-4 w-20 bg-md-surface-variant/50 rounded mb-3" />
      <div className="flex gap-3">
        <div className="w-12 h-12 bg-md-surface-variant/50 rounded-md" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-3/4 bg-md-surface-variant/50 rounded" />
          <div className="h-3 w-1/4 bg-md-surface-variant/30 rounded" />
        </div>
      </div>
    </div>
  </div>
);

export default function Order() {
  const { token } = useAuth();
  const { orderId } = useParams()
  const { order, loading, error } = useOrder(orderId, token)
  const { t, lang } = useI18n()
  const { translateDBVal } = useTranslations()

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0.00'
    return new Intl.NumberFormat(lang, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  if (loading) {
    return (
      <Layout header={<HeaderWithName title={t('order.title')} to="/orders" />} footer={<BottomNav />}>
        <main className="flex-1 overflow-y-auto bg-md-surface min-h-full"><OrderDetailSkeleton /></main>
      </Layout>
    )
  }

  if (error || !order) {
    return (
      <Layout header={<HeaderWithName title={t('order.title')} to="/orders" />} footer={<BottomNav />}>
        <main className="flex flex-1 items-center justify-center bg-md-surface p-4 min-h-full">
          <div className="text-center max-w-xs">
            <div className="w-16 h-16 bg-md-error-container rounded-full flex items-center justify-center mx-auto mb-4">
               <Receipt className="w-8 h-8 text-md-on-error-container" />
            </div>
            <h2 className="text-xl font-bold text-md-on-surface mb-2">{t('common.error.title')}</h2>
            <p className="text-md-on-surface-variant text-sm">{error?.message || t('common.error.notFound')}</p>
          </div>
        </main>
      </Layout>
    )
  }

  const currentStatus = order?.statusHistory?.[order.statusHistory.length - 1]?.status || order.status;

  const renderPaymentInfo = (paymentMethod) => {
    if (!paymentMethod) return t('order.payment.unknown');
    const { type, provider, name, details, last4Digits } = paymentMethod;
    if (type === 'mobile_wallet') {
      let info = provider ? provider : t('order.payment.mobileWallet');
      if (details) info += ` (${details})`;
      return info;
    }
    if (type === 'cash') return name || t('order.payment.cash');
    if (type === 'card_on_delivery') return name || t('order.payment.cardOnDelivery');
    if (type === 'credit_card') {
      if (details) return details;
      let info = provider ? provider : t('order.payment.creditCard');
      if (last4Digits) info += ` •••• ${last4Digits}`;
      return info;
    }
    return name || provider || t('order.payment.unknown');
  };

  const orderIdShort = order._id.slice(-6).toUpperCase();
  let orderHeader = t('orders.card.orderId');
  if (orderHeader.includes('{id}')) {
    orderHeader = orderHeader.replace('{id}', orderIdShort);
  } else {
    orderHeader = `${orderHeader} #${orderIdShort}`;
  }

  return (
    <Layout
      header={<HeaderWithName title={orderHeader} to="/orders" />}
      footer={<BottomNav />}
    >
      <main className="flex-1 overflow-y-auto bg-md-surface min-h-full">
        {/* Container */}
        <div className="max-w-[430px] mx-auto p-3 space-y-3 ">
          
          {/* 1. Tracking / Status Section */}
          <section className="bg-md-surface-container rounded-md p-4 shadow-sm border border-transparent">
            <h2 className="text-xs font-bold text-md-on-surface-variant uppercase tracking-wider mb-3">
                {t('order.tracking.title')}
            </h2>
            <OrderStatusStepper 
              currentStatus={currentStatus} 
              history={order.statusHistory} 
            />
          </section>

          {/* 2. Delivery & Payment Info */}
          <section className="bg-md-surface-container rounded-md overflow-hidden shadow-sm">
            {/* Address */}
            <div className="p-3.5 flex gap-3 items-start border-b border-md-outline-variant/30">
              <div className="mt-0.5 p-1.5 rounded-full bg-md-secondary-container text-md-on-secondary-container flex-shrink-0">
                <MapPin size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-medium text-md-on-surface-variant mb-0.5">{t('order.shipping.title')}</h3>
                <p className="text-md-on-surface font-medium text-sm leading-snug break-words">
                  {order.address.label && <span className="font-bold mr-1">{order.address.label}:</span>}
                  {order.address.addressText}
                </p>
              </div>
            </div>

            {/* Payment */}
            <div className="p-3.5 flex gap-3 items-center">
              {/* Payment Icon: Tertiary Container */}
              <div className="p-1.5 rounded-full bg-md-tertiary-container text-md-on-tertiary-container flex-shrink-0">
                <CreditCard size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-medium text-md-on-surface-variant mb-0.5">{t('order.payment.title')}</h3>
                <p className="text-md-on-surface font-medium text-sm capitalize truncate">
                  {renderPaymentInfo(order.paymentMethod)}
                </p>
              </div>
            </div>
          </section>

          {/* 3. Items List */}
          <section className="bg-md-surface-container rounded-md overflow-hidden shadow-sm">
            {/* Header: Surface Container High */}
            <div className="px-3.5 py-3 border-b border-md-outline-variant/30 flex items-center gap-2 bg-md-surface-container-high">
               <ShoppingBag size={16} className="text-md-on-surface-variant" />
               <h2 className="text-sm font-semibold text-md-on-surface">
                  {t('order.items.title')} <span className="text-md-on-surface-variant font-normal">({order.products.length})</span>
               </h2>
            </div>
            
            <div className="divide-y divide-md-outline-variant/30">
              {order.products.map((item) => (
                <Link 
                  to={`/product/${item.productId}`}
                  key={item.productId} 
                  className="flex gap-3 p-3 hover:bg-md-surface-container-high transition-colors group active:bg-md-surface-container-highest"
                >
                  {/* Image: Surface Container Highest */}
                  <ImageWithLoader
                    src={item.photo}
                    alt={item.name}
                    containerClassName="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-md-surface-container-highest"
                    imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-medium text-md-on-surface text-sm truncate leading-tight">{translateDBVal("Product", "name", item.name, lang)}</p>
                      <p className="font-bold text-md-primary text-sm whitespace-nowrap">
                        {t('common.currencySymbol')}{formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center mt-1">
                       {/* Quantity Badge: Surface Container Highest */}
                       <span className="text-xs bg-md-surface-container-highest border border-md-outline-variant/30 px-1.5 py-0.5 rounded text-md-on-surface-variant">
                         x{item.quantity}
                       </span>
                    </div>
                  </div>
                  <div className="self-center pl-1">
                    <ChevronRight size={18} className="text-md-on-surface-variant/50 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 4. Order Summary / Billing */}
          <section className="bg-md-surface-container rounded-md p-4 space-y-2.5 shadow-sm">
            <h2 className="text-xs font-bold text-md-on-surface-variant uppercase tracking-wider mb-2">{t('checkout.billing.title')}</h2>
            
            <div className="flex justify-between text-sm">
              <span className="text-md-on-surface-variant">{t('checkout.billing.subtotal')}</span>
              <span className="font-medium text-md-on-surface">{t('common.currencySymbol')}{formatCurrency(order.subtotal)}</span>
            </div>

            {order.discountApplied > 0 && (
               <div className="flex justify-between text-sm">
                <span className="text-md-on-surface-variant">{t('checkout.summary.discount')}</span>
                <span className="font-medium text-green-700 dark:text-green-300">
                  - {t('common.currencySymbol')}{formatCurrency(order.discountApplied)}
                </span>
              </div>
            )}

            <div className="border-t-2 border-dotted border-md-outline-variant/30 my-1" />

            <div className="flex justify-between items-center pt-1">
              <span className="font-bold text-md-on-surface text-base">{t('checkout.billing.total')}</span>
              <span className="font-bold text-lg text-md-primary">
                {t('common.currencySymbol')}{formatCurrency(order.totalPaid)}
              </span>
            </div>
          </section>
          
        </div>
      </main>
    </Layout>
  )
}