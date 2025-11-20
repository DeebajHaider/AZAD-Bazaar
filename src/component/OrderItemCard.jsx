import React from 'react'
import {
  ChevronRight
} from 'lucide-react'
import {
  useI18n
} from '../context/I18nContext'
import dayjs from 'dayjs' // A lightweight date library

// Skeleton component for loading state
export const OrderItemCardSkeleton = () => (
  <div className="secBg primBorder rounded-lg p-4 animate-pulse flex justify-between items-center">
    <div className="space-y-2">
      <div className="h-5 w-32 skeleton" />
      <div className="h-4 w-24 skeleton" />
      <div className="h-6 w-20 skeleton rounded-full" />
    </div>
    <div className="space-y-2 text-right">
      <div className="h-6 w-24 skeleton" />
      <div className="h-5 w-5 self-end skeleton rounded-full" />
    </div>
  </div>
)

export default function OrderItemCard({
  order
}) {
  const {
    t,
    lang
  } = useI18n()

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'badgeSuccess'
      case 'cancelled':
      case 'failed':
        return 'badgeDanger'
      case 'shipped':
        return 'badgePrimary'
      case 'confirmed':
      case 'processing':
        return 'badgeWarning' // Using Warning for in-progress states
      default:
        return 'secBg primBorder primText px-3 py-1 rounded-full text-sm font-medium' // Default neutral badge
    }
  }

  // Helper function to format currency
  const formatCurrency = (amount) => {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      console.warn('formatCurrency: Invalid amount received', amount);
      return '0.00';
    }
    return new Intl.NumberFormat(lang, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount)
  }

  if (!order || !order._id) {
    console.warn('OrderItemCard: Missing order data', order);
    // Render a placeholder or null if order data is incomplete
    return <OrderItemCardSkeleton />;
  }

  const totalAmount = order.totalPaid ?? 0;
  if (order.totalPaid === undefined || order.totalPaid === null) {
    console.warn('OrderItemCard: Missing order.totalPaid', order);
  }

  return (
    <div className="secBg primBorder rounded-lg p-4 flex justify-between items-center secHoverBg transition-colors duration-200">
      <div className="space-y-1.5">
        <h3 className="font-semibold primText">
          {t('orders.card.orderId').replace('{id}', order._id.slice(-6).toUpperCase())}
        </h3>
        <p className="text-sm secText">
          {dayjs(order.createdAt).format('MMMM D, YYYY')}
        </p>
        <div className={getStatusBadgeClass(order.status)}>
          {order.status ? t(`orders.status.${order.status.toLowerCase()}`, order.status) : null}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-lg font-bold primText">
            {t('common.currencySymbol')}{formatCurrency(totalAmount)}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 secText" />
      </div>
    </div>
  )
}