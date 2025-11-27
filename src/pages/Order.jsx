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

// Skeleton Layout - Adjusted to be more compact (w-12 images, p-3 paddings)
const OrderDetailSkeleton = () => (
  <div className="p-3 space-y-3 min-h-full animate-pulse max-w-[430px] mx-auto">
    {/* Status Skeleton */}
    <div className="secBg primBorder rounded-lg p-4">
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-6 h-6 rounded-full skeleton flex-shrink-0" />
            <div className="space-y-2 pt-1 flex-1">
              <div className="h-3 w-24 skeleton" />
              {i === 1 && <div className="h-3 w-20 skeleton" />}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Info Skeleton */}
    <div className="secBg primBorder rounded-lg p-3 space-y-3">
        <div className="h-10 w-full skeleton rounded-lg" />
        <div className="h-10 w-full skeleton rounded-lg" />
    </div>

    {/* Items Skeleton */}
    <div className="secBg primBorder rounded-lg p-3">
      <div className="h-4 w-20 skeleton mb-3" />
      <div className="flex gap-3">
        <div className="w-12 h-12 skeleton rounded-md" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-3/4 skeleton" />
          <div className="h-3 w-1/4 skeleton" />
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
        <main className="flex-1 overflow-y-auto primBg min-h-full"><OrderDetailSkeleton /></main>
      </Layout>
    )
  }

  if (error || !order) {
    return (
      <Layout header={<HeaderWithName title={t('order.title')} to="/orders" />} footer={<BottomNav />}>
        <main className="flex flex-1 items-center justify-center primBg p-4 min-h-full">
          <div className="text-center max-w-xs">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
               <Receipt className="w-8 h-8 accentDangerText" />
            </div>
            <h2 className="text-xl font-bold primText mb-2">{t('common.error.title')}</h2>
            <p className="secText text-sm">{error?.message || t('common.error.notFound')}</p>
          </div>
        </main>
      </Layout>
    )
  }

  const currentStatus = order?.statusHistory?.[order.statusHistory.length - 1]?.status || order.status;

  // Helper to render payment info
  const renderPaymentInfo = (paymentMethod) => {
    if (!paymentMethod) return t('order.payment.unknown');
    const { type, provider, name, details, last4Digits } = paymentMethod;
    // Mobile Wallet
    if (type === 'mobile_wallet') {
      let info = provider ? provider : t('order.payment.mobileWallet');
      if (details) info += ` (${details})`;
      return info;
    }
    // Cash
    if (type === 'cash') {
      return name || t('order.payment.cash');
    }
    // Card on Delivery
    if (type === 'card_on_delivery') {
      return name || t('order.payment.cardOnDelivery');
    }
    // Credit Card
    if (type === 'credit_card') {
      if (details) return details;
      let info = provider ? provider : t('order.payment.creditCard');
      if (last4Digits) info += ` •••• ${last4Digits}`;
      return info;
    }
    // Fallback
    return name || provider || t('order.payment.unknown');
  };

  return (
    <Layout
      header={<HeaderWithName title={`${t('orders.card.orderId')} #${order._id.slice(-6).toUpperCase()}`} to="/orders" />}
      footer={<BottomNav />}
    >
      <main className="flex-1 overflow-y-auto primBg min-h-full">
        {/* Reduced global padding (p-3) and spacing (space-y-3) */}
        <div className="max-w-[430px] mx-auto p-3 space-y-3 ">
          {/* 1. Tracking / Status Section */}
          <section className="secBg primBorder rounded-xl p-4 shadow-sm">
            <h2 className="text-xs font-bold secText uppercase tracking-wider mb-3">
                {t('order.tracking.title')}
            </h2>
            <OrderStatusStepper 
              currentStatus={currentStatus} 
              history={order.statusHistory} 
            />
          </section>

          {/* 2. Delivery & Payment Info */}
          <section className="secBg primBorder rounded-xl overflow-hidden">
            {/* Address - Reduced padding to p-3.5 */}
            <div className="p-3.5 flex gap-3 items-start dividerBorder">
              <div className="mt-0.5 p-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
                <MapPin size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-medium secText mb-0.5">{t('order.shipping.title')}</h3>
                <p className="primText font-medium text-sm leading-snug break-words">
                  {order.address.label && <span className="font-bold mr-1">{order.address.label}:</span>}
                  {order.address.addressText}
                </p>
              </div>
            </div>

            {/* Payment - Reduced padding to p-3.5 */}
            <div className="p-3.5 flex gap-3 items-center">
              <div className="p-1.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex-shrink-0">
                <CreditCard size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-medium secText mb-0.5">{t('order.payment.title')}</h3>
                <p className="primText font-medium text-sm capitalize truncate">
                  {renderPaymentInfo(order.paymentMethod)}
                </p>
              </div>
            </div>
          </section>

          {/* 3. Items List */}
          <section className="secBg primBorder rounded-xl overflow-hidden">
            <div className="px-3.5 py-3 dividerBorder flex items-center gap-2 bg-gray-50/50 dark:bg-slate-800/30">
               <ShoppingBag size={16} className="secText" />
               <h2 className="text-sm font-semibold primText">
                  {t('order.items.title')} <span className="secText font-normal">({order.products.length})</span>
               </h2>
            </div>
            
            <div className="dividerBorder">
              {order.products.map((item) => (
                <Link 
                  to={`/product/${item.productId}`}
                  key={item.productId} 
                  // Reduced padding: p-3 instead of p-4
                  className="flex dividerBorder gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group active:scale-[0.99]"
                >
                  {/* Smaller Image: w-12 h-12 (48px) instead of w-16 */}
                  <ImageWithLoader
                    src={item.photo}
                    alt={item.name}
                    containerClassName="w-12 h-12 flex-shrink-0 primBorder rounded-md overflow-hidden bg-white"
                    imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-medium primText text-sm truncate leading-tight">{translateDBVal("Product", "name", item.name, lang)}</p>
                      <p className="font-bold accentPrimText text-sm whitespace-nowrap">
                        {t('common.currencySymbol')}{formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center mt-1">
                       <span className="text-xs secBg primBorder px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">
                         x{item.quantity}
                       </span>
                    </div>
                  </div>
                  <div className="self-center pl-1">
                    <ChevronRight size={18} className="secText group-hover:translate-x-1 transition-transform opacity-50" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 4. Order Summary / Billing */}
          <section className="secBg primBorder rounded-xl p-4 space-y-2.5">
            <h2 className="text-xs font-bold secText uppercase tracking-wider mb-2">{t('checkout.billing.title')}</h2>
            
            <div className="flex justify-between text-sm">
              <span className="secText">{t('checkout.billing.subtotal')}</span>
              <span className="font-medium primText">{t('common.currencySymbol')}{formatCurrency(order.subtotal)}</span>
            </div>

            {order.discountApplied > 0 && (
               <div className="flex justify-between text-sm">
                <span className="secText">{t('checkout.summary.discount')}</span>
                <span className="font-medium accentSuccessText">
                  - {t('common.currencySymbol')}{formatCurrency(order.discountApplied)}
                </span>
              </div>
            )}

            <div className="border-t-2 border-dotted border-gray-200 dark:border-slate-700 my-1" />

            <div className="flex justify-between items-center pt-1">
              <span className="font-bold primText text-base">{t('checkout.billing.total')}</span>
              <span className="font-bold text-lg accentPrimText">
                {t('common.currencySymbol')}{formatCurrency(order.totalPaid)}
              </span>
            </div>
          </section>
          
        </div>
      </main>
    </Layout>
  )
}