import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useI18n } from '../context/I18nContext'
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import CartItemList from '../component/CartItem' // Assuming this component is already styled
import BottomNav from '../component/BottomNav'

export default function Cart() {
  const { items: cartItems, clearCart, updateQuantity, removeItem, total, savings } = useCart()
  const { t } = useI18n()
  const navigate = useNavigate()

  // Right-aligned header button for clearing the cart
  const ClearCartButton = () => (
    <button
      onClick={clearCart}
      className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 underline underline-offset-2 transition-colors"
    >
      {t('cart.actions.clear')}
    </button>
  )

  // View to display when the cart is empty
  const EmptyCartView = () => (
    <div className="flex flex-1 flex-col items-center justify-center text-center min-h-full">
      <ShoppingCart className="w-24 h-24 text-gray-300 dark:text-slate-700 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-50">
        {t('cart.empty.title')}
      </h2>
      <p className="mt-2 text-gray-600 dark:text-slate-400">
        {t('cart.empty.description')}
      </p>
      <button
        onClick={() => navigate('/')}
        className="mt-6 min-h-12 px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200"
      >
        {t('cart.empty.cta')}
      </button>
    </div>
  )

  // View for displaying cart items and the checkout summary
  const CartContents = () => (
    <>
      {/* Scrollable list of cart items */}
      {/* `flex-1` makes this div take all available vertical space */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <CartItemList
          items={cartItems}
          onQuantityChange={(itemCode, next) => updateQuantity(itemCode, next)}
          onRemove={(itemCode) => removeItem(itemCode)}
        />
      </div>

      {/* Checkout Summary Footer */}

    </>
  )

  return (
    <Layout
      footer={
        <>
          {cartItems.length > 0 &&
            <div className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 p-4 space-y-4">
              <div className="space-y-2">
                {/* Savings Row - only shown if there are savings */}
                {savings > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-slate-400">{t('cart.summary.savings')}</span>
                    <span className="font-medium text-green-600 dark:text-green-500">
                      - {t('common.currencySymbol')} {savings.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Subtotal Row */}
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-gray-900 dark:text-slate-50">{t('cart.summary.subtotal')}</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-slate-50">
                    {t('common.currencySymbol')} {total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full min-h-12 px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200"
              >
                {t('cart.actions.checkout')}refer
              </button>
            </div>}
          <BottomNav /></>}
      header={
        <HeaderWithName
          title={t('cart.title')}
          to="/"
          overwriteNavButton={<></>} // Hides the back button as per original code
          rightAction={cartItems.length > 0 ? <ClearCartButton /> : null} // Only show clear button if cart has items
        />
      }
    >
      {/* The main content area is a flex column to position the summary at the bottom */}
      <main className="flex flex-1 flex-col bg-white dark:bg-slate-950 min-h-full">
        {cartItems.length > 0 ? <CartContents /> : <EmptyCartView />}
      </main>
    </Layout>
  )
}