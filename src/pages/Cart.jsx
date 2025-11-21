import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useI18n } from '../context/I18nContext'
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import CartItemList, { CartItemSkeleton } from '../component/cartItem'
import BottomNav from '../component/BottomNav'

export default function Cart() {
  const { items: cartItems, clearCart, updateQuantity, removeItem, total, savings, loading } = useCart()
  const { t, lang } = useI18n()
  const navigate = useNavigate()

  // Helper function to format currency with commas
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(lang, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Cart icon to display in header
  const CartIcon = () => (
    <div className="min-h-11 min-w-11 flex items-center justify-center rounded-lg secBg primBorder">
      <ShoppingCart className="  accentPrimText" />
    </div>
  )

  // Header button for clearing the cart
  const ClearCartButton = () => (
    <button
      onClick={clearCart}
      className="text-sm font-medium accentDangerText underline underline-offset-2 transition-opacity hover:opacity-80"
    >
      {t('cart.actions.clear')}
    </button>
  )

  // View to display when the cart is empty
  const EmptyCartView = () => (
    <div className="flex flex-1 flex-col items-center justify-center text-center p-4">
      <ShoppingCart className="w-24 h-24 secText opacity-50 mb-4" />
      <h2 className="text-xl font-semibold primText">
        {t('cart.empty.title')}
      </h2>
      <p className="mt-2 secText">
        {t('cart.empty.description')}
      </p>
      <button
        onClick={() => navigate('/')}
        className="mt-6 min-h-12 px-6 py-3 btnPrimary rounded-lg transition-all duration-200"
      >
        {t('cart.empty.cta')}
      </button>
    </div>
  )

  // View for displaying cart items
  const CartContents = () => (
    // Add padding to the bottom to ensure the last item is not hidden by the sticky footer
    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-full">
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <CartItemSkeleton key={i} />)}
        </div>
      ) : (
        <CartItemList
          items={cartItems}
          onQuantityChange={(itemCode, next) => updateQuantity(itemCode, next)}
          onRemove={(itemCode) => removeItem(itemCode)}
        />
      )}
    </div>
  )

  // Sticky footer for checkout summary
  const CartSummaryFooter = () => (
    <div className="secBg dividerBorder border-t p-4">
      <div className="space-y-4">
        <div className="space-y-2">
          {savings > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="secText">{t('cart.summary.savings')}</span>
              <span className="font-medium accentSuccessText">
                - {t('common.currencySymbol')}{formatCurrency(savings)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-baseline">
            <span className="font-semibold primText">{t('cart.summary.subtotal')}</span>
            <span className="text-xl font-bold primText">
              {t('common.currencySymbol')}{formatCurrency(total)}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full min-h-12 px-6 py-3 btnPrimary rounded-lg transition-all duration-200"
        >
          {t('cart.actions.checkout')}
        </button>
      </div>
    </div>
  )

  return (
    <Layout
      footer={<>{cartItems.length > 0 && <CartSummaryFooter />}<BottomNav /></>}
      header={
        <HeaderWithName
          title={t('cart.title')}
          to="/"
          overwriteNavButton={<CartIcon />}
          rightAction={cartItems.length > 0 ? <ClearCartButton /> : null}
        />
      }
    >
      <main className="flex flex-1 flex-col primBg min-h-full">
        {cartItems.length > 0 ? <CartContents /> : <EmptyCartView />}
      </main>
    </Layout>
  )
}