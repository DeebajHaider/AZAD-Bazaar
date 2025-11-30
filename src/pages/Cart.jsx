import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useI18n } from '../context/I18nContext'
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import CartItemList, { CartItemSkeleton } from '../component/cartItem'
import BottomNav from '../component/BottomNav'

export default function Cart() {
  const { items: cartItems, clearCart, addToCart, decrementProduct, removeItem, total, savings, loading, productLoadingStates } = useCart()
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  
  // Show skeleton only on initial load (when loading and no items yet)
  const showSkeleton = loading && cartItems.length === 0

  // Helper function to format currency with commas
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(lang, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Direct handlers for cart operations
  const handleIncrement = (itemCode) => {
    console.log('Increment:', itemCode);
    addToCart(itemCode);
  };

  const handleDecrement = (itemCode) => {
    console.log('Decrement:', itemCode);
    decrementProduct(itemCode);
  };

  const handleRemove = (itemCode) => {
    console.log('Remove:', itemCode);
    removeItem(itemCode);
  };

  // Cart icon to display in header
  // Matches the style of the Back button in HeaderWithName (Secondary Container)
  const CartIcon = () => (
    <div className="min-h-11 min-w-11 flex items-center justify-center rounded-md bg-md-secondary-container text-md-on-secondary-container">
      <ShoppingCart size={20} />
    </div>
  )

  // Header button for clearing the cart
  // Uses Error color for destructive action
  const ClearCartButton = () => (
    <button
      onClick={clearCart}
      className="text-sm font-medium text-md-error hover:text-md-error/80 underline underline-offset-2 transition-opacity"
    >
      {t('cart.actions.clear')}
    </button>
  )

  // View to display when the cart is empty
  const EmptyCartView = () => (
    <div className="flex flex-1 flex-col items-center justify-center text-center p-4">
      <div className="w-24 h-24 rounded-full bg-md-surface-container-highest flex items-center justify-center mb-4">
        <ShoppingCart className="w-10 h-10 text-md-on-surface-variant/50" />
      </div>
      <h2 className="text-xl font-bold text-md-on-surface">
        {t('cart.empty.title')}
      </h2>
      <p className="mt-2 text-md-on-surface-variant max-w-[250px]">
        {t('cart.empty.description')}
      </p>
      <button
        onClick={() => navigate('/')}
        className="mt-6 min-h-12 px-8 py-3 bg-md-primary text-md-on-primary font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200"
      >
        {t('cart.empty.cta')}
      </button>
    </div>
  )

  // View for displaying cart items
  const CartContents = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-full">
      {showSkeleton ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <CartItemSkeleton key={i} />)}
        </div>
      ) : (
        <CartItemList
          items={cartItems}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onRemove={handleRemove}
          updatingItems={Object.keys(productLoadingStates).filter(key => productLoadingStates[key])}
        />
      )}
    </div>
  )

  // Sticky footer for checkout summary
  // Uses Surface Container Low/Surface for background + subtle Outline Variant border
  const CartSummaryFooter = () => (
    <div className="bg-md-surface border-t border-md-outline-variant p-4">
      <div className="space-y-4">
        <div className="space-y-2">
          {savings > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-md-on-surface-variant">{t('cart.summary.savings')}</span>
              {/* Green is standard for savings, distinct from Primary/Error */}
              <span className="font-bold text-green-700 dark:text-green-300">
                - {t('common.currencySymbol')}{formatCurrency(savings)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-baseline">
            <span className="font-semibold text-md-on-surface">{t('cart.summary.subtotal')}</span>
            <span className="text-xl font-bold text-md-on-surface">
              {t('common.currencySymbol')}{formatCurrency(total)}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full min-h-12 px-6 py-3 bg-md-primary text-md-on-primary font-semibold rounded-md shadow-sm hover:shadow-md active:opacity-90 transition-all duration-200"
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
      <main className="flex flex-1 flex-col bg-md-surface min-h-full">
        {cartItems.length > 0 ? <CartContents /> : <EmptyCartView />}
      </main>
    </Layout>
  )
}