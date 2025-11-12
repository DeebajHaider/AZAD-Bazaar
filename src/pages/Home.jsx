import React from 'react'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../component/BottomNav'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'
import { 
  MapPin, Search,
  Apple, Carrot, Cookie, Milk, Coffee,
  Fish, Egg, Beef, Cake, ChefHat, Wine
} from 'lucide-react'

// Category configuration remains the same
const categories = [
  { name: 'Fruits', icon: Apple, query: 'fruits' },
  { name: 'Vegetables', icon: Carrot, query: 'vegetables' },
  { name: 'Snacks', icon: Cookie, query: 'snacks' },
  { name: 'Dairy', icon: Milk, query: 'dairy' },
  { name: 'Beverages', icon: Coffee, query: 'beverages' },
  { name: 'Seafood', icon: Fish, query: 'seafood' },
  { name: 'Eggs', icon: Egg, query: 'eggs' },
  { name: 'Meat', icon: Beef, query: 'meat' },
  { name: 'Desserts', icon: Cake, query: 'desserts' },
  { name: 'Ready Meals', icon: ChefHat, query: 'ready-meals' },
  { name: 'Drinks', icon: Wine, query: 'drinks' }
];

// Reusable Card component for categories, brands, etc.
const InfoCard = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center gap-2 text-center hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm min-h-[90px]"
  >
    {children}
  </button>
);

export default function Home() {
  const navigate = useNavigate()
  const { customer } = useAuth()
  const [voucherCode, setVoucherCode] = React.useState('')
  const [appliedVoucher, setAppliedVoucher] = React.useState(null)

  const voucherMap = { 'AZAD10': 10, 'AZAD20': 20 }
  const { t } = useI18n()

  // simple formatter for translations containing {{placeholders}}
  const format = (key, vars = {}) => {
    let str = t(key)
    Object.keys(vars).forEach(k => {
      const re = new RegExp(`{{\\s*${k}\\s*}}`, 'g')
      str = String(str).replace(re, vars[k])
    })
    return str
  }

  const handleApplyVoucher = () => {
    const pct = voucherMap[voucherCode.trim()]
    if (pct) {
      setAppliedVoucher({ code: voucherCode.trim(), pct })
    } else {
      setAppliedVoucher({ invalid: true })
    }
  }
  
  return (
    <>
      {/* Consolidated Sticky Header for Address and Search */}
      <header className="sticky top-0 z-20 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-[430px] mx-auto p-3 space-y-3">
          {/* Site Logo - replace the src with your production logo URL */}
          <div className="flex items-center justify-center">
            <img
              src="src\Azad-Bazaar-transparent.png"
              alt="Azad Bazaar logo"
              style={{ height: 40, objectFit: 'contain' }}
            />
          </div>
          {/* Address Bar */}
          <button 
            onClick={() => navigate('/settings')} // Navigate to settings to change address
            className="w-full flex items-start gap-2 text-left"
          >
            <MapPin size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600 dark:text-slate-400">{t('home.header.deliveryTo')}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-slate-50 truncate">
                {(customer?.addresses?.[0]?.addressText) || t('home.header.setAddressPrompt')}
              </p>
            </div>
          </button>

          {/* Search Bar: Styled to look like an input field */}
          <button 
            onClick={() => navigate('/search-results?q=')}
            className="w-full h-12 flex items-center gap-3 px-4 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-left"
          >
            <Search size={18} className="text-gray-400 dark:text-slate-500" />
            <span className="text-gray-500 dark:text-slate-400">{t('home.header.searchPlaceholder')}</span>
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 p-4 space-y-6 pb-24">
        
        {/* Categories Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-50 mb-3">{t('home.categories.title')}</h2>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((category) => (
              <InfoCard
                key={category.query}
                onClick={() => navigate(`/search-results?q=&category=${category.query}`)}
              >
                <category.icon size={24} className="text-blue-500" />
                <span className="text-xs font-medium text-gray-900 dark:text-slate-50">
                  {t('home.categories.items.' + category.query)}
                </span>
              </InfoCard>
            ))}
          </div>
        </section>

        {/* Voucher Section */}
        <section className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50 mb-3">{t('home.voucher.title')}</h3>
          <div className="flex gap-2">
            <input
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              placeholder={t('home.voucher.placeholder')}
              className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleApplyVoucher}
              className="min-h-12 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg"
            >
              {t('home.voucher.applyButton')}
            </button>
          </div>
          <div className="mt-2 min-h-[20px] text-sm">
            {appliedVoucher?.invalid && <p className="text-red-600 dark:text-red-500">{t('home.voucher.invalidMessage')}</p>}
            {appliedVoucher?.pct && <p className="text-green-600 dark:text-green-500">{format('home.voucher.successMessage', { pct: appliedVoucher.pct })}</p>}
          </div>
        </section>

        {/* Recent Orders Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-50 mb-3">{t('home.recentOrders.title')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3].map((i) => (
              <InfoCard key={i} onClick={() => navigate('/cart')}>
                <Cake size={20} className="text-blue-500" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-50">
                    {format('home.recentOrders.orderTitle', { orderNumber: 100 + i })}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-slate-400">{t('home.recentOrders.status')}</p>
                </div>
              </InfoCard>
            ))}
          </div>
        </section>

        {/* Popular Brands Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-50 mb-3">{t('home.popularBrands.title')}</h2>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, idx) => (
              <InfoCard key={idx}>
                <span className="font-semibold text-gray-900 dark:text-slate-50">
                  {format('home.popularBrands.brandName', { brandNumber: idx + 1 })}
                </span>
              </InfoCard>
            ))}
          </div>
        </section>

      </main>
      <BottomNav />
    </>
  )
}