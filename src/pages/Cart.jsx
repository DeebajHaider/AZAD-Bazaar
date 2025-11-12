import CartItemList from '../component/cartItem'
import BottomNav from '../component/BottomNav'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useI18n } from '../context/I18nContext'

export default function Cart() {
  const { items: cartItems, clearCart, updateQuantity, removeItem, total, savings, loading } = useCart()
  const { t } = useI18n()

  const navigate = useNavigate()

  return (
    <>
      <main style={{ padding: 0, background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
        <div style={{position:'sticky', top:0, background:'var(--color-surface)', zIndex:10, padding:'var(--space-3) var(--space-4)', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--color-border)'}}>
          <h2 style={{fontSize:'var(--font-size-xl)', fontWeight:600, margin:0, color:'var(--color-text-primary)'}}>{t('cart.title')}</h2>
          <button
            onClick={clearCart}
            style={{fontSize:'var(--font-size-sm)', color:'var(--color-danger)', fontWeight:500, background:'none', border:'none', cursor:'pointer'}}
          >
            {t('cart.actions.clear')}
          </button>
        </div>

        {/* Scrollable cart items area */}
        <div style={{flex: 1, overflowY: 'auto', scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch'}}>
          <style>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <CartItemList
            items={cartItems}
            onQuantityChange={(itemCode, next) => {
              // delegate to context updateQuantity which will call API and refresh
              updateQuantity(itemCode, next)
            }}
            onRemove={(itemCode) => {
              // remove fully
              removeItem(itemCode)
            }}
          />
        </div>

        {/* Checkout button at the bottom */}
        <div style={{padding:'var(--space-4)', background:'var(--color-surface)', borderTop:'1px solid var(--color-border)', display:'flex', justifyContent:'center'}}>
          <button
            onClick={() => navigate('/checkout')}
            style={{width:'100%', background:'var(--color-primary-500)', color:'white', padding:'12px 16px', borderRadius:'var(--radius-md)', textAlign:'center', fontSize:'var(--font-size-lg)', fontWeight:500, border:'none', cursor:'pointer', transition:'background 0.2s ease', boxSizing: 'border-box'}}
            onMouseEnter={(e) => e.target.style.background = 'var(--color-primary-600)'}
            onMouseLeave={(e) => e.target.style.background = 'var(--color-primary-500)'}
          >
            {t('cart.actions.checkout')}
          </button>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
