import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Search, Cake } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useI18n } from '../context/I18nContext'
import useTranslations from '../hooks/useTranslations'
import { Layout } from '../Layout'
import BottomNav from '../component/BottomNav'
import { t } from 'i18next'

// --- Reusable Sub-components for the Home Screen ---

// Category Card (Unchanged from last version)
const CategoryCard = ({ category, onClick }) => {
  const { lang } = useI18n()
  const { translateDBVal } = useTranslations()

  let displayName = translateDBVal('Category', 'name', category.name, lang)
  if (lang === 'en' && displayName) {
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1)
  }

  return (
    <button onClick={onClick} className="w-20 flex flex-col items-center justify-start gap-2 text-center group">
      <div className="w-full aspect-square rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 overflow-hidden group-hover:ring-2 group-hover:ring-blue-500 transition-all duration-200">
        <img src={category.image} alt={displayName} className="w-full h-full object-cover" />
      </div>
      <span className="text-xs font-medium text-gray-900 dark:text-slate-50 leading-tight">{displayName}</span>
    </button>
  )
}

// MODIFIED: Brand card now has the name INSIDE the image with a gradient overlay
const BrandCard = ({ brand, onClick }) => {
  const imageUrl = brand.images?.[0]
  const { lang } = useI18n()
  const { translateDBVal } = useTranslations()

  return (
    <button onClick={onClick} className="w-24 flex-shrink-0 group">
      <div className="relative w-full aspect-square rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 overflow-hidden flex items-center justify-center transition-all duration-200 group-hover:border-blue-500">
        {imageUrl ? (
          <img src={imageUrl} alt={brand.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-2xl text-gray-400 dark:text-slate-600">{brand.name.charAt(0)}</span>
        )}
        {/* Gradient Overlay for Text */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2">
          <span className="text-white text-xs font-semibold w-full text-center truncate">
            {translateDBVal('Brand', 'name', brand.name, lang)}
          </span>
        </div>
      </div>
    </button>
  )
}


const InfoCard = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center gap-2 text-center hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm min-h-[90px]"
  >
    {children}
  </button>
)

// --- Main Home Screen Component ---

export default function Home() {
  const navigate = useNavigate()
  const { customer } = useAuth()
  const { categories, brands } = useData()
  const { t } = useI18n()

  const displayCategories = categories?.slice(0, 30) || []
  const displayBrands = brands?.slice(0, 30) || []

  const format = (key, vars = {}) => {
    let str = t(key)
    Object.keys(vars).forEach(k => {
      const re = new RegExp(`{{\\s*${k}\\s*}}`, 'g')
      str = String(str).replace(re, vars[k])
    })
    return str
  }

  return (
    <Layout footer={<BottomNav />}>
      {/* Header (Unchanged) */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-[430px] mx-auto p-4 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <button onClick={() => navigate('/settings')} className="flex-1 flex items-center gap-2 text-left min-w-0">
              <MapPin size={20} className="text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-600 dark:text-slate-400">{t('home.header.deliveryTo')}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-50 truncate">
                  {customer?.addresses?.[0]?.addressText || t('home.header.setAddressPrompt')}
                </p>
              </div>
            </button>
            <div className="flex-shrink-0">
              <img src="src/Azad-Bazaar.svg" alt="Azad Bazaar logo" className="h-8 w-auto" />
            </div>
          </div>
          <button onClick={() => navigate('/search-results?q=')} className="w-full h-12 flex items-center gap-3 px-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <Search size={18} className="text-gray-400 dark:text-slate-500" />
            <span className="text-gray-500 dark:text-slate-400">{t('home.header.searchPlaceholder')}</span>
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 p-4 space-y-8 pb-24">
        {/* Categories Section with 2-row horizontal scroll */}
        {displayCategories.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-50 mb-4">{t('home.categories.title')}</h2>
            <div className="grid grid-flow-col grid-rows-2 gap-x-4 gap-y-5 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {displayCategories.map(category => (
                <CategoryCard
                  key={category._id}
                  category={category}
                  onClick={() => navigate(`/search-results?category=${category._id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Promotional Card with larger logo */}
        <section className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-center min-h-[120px]">
          <img
            src="src/Azad-Bazaar.svg"
            alt="Azad Bazaar Offer"
            className="h-28 w-auto"
          />
        </section>

        {/* Popular Brands Section with 2-row horizontal scroll */}
        {displayBrands.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-50 mb-4">{t('home.popularBrands.title')}</h2>
            <div className="grid grid-flow-col grid-rows-2 gap-x-4 gap-y-5 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {displayBrands.map(brand => (
                <BrandCard key={brand._id} brand={brand} onClick={() => navigate(`/search-results?brand=${brand._id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Orders Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-50 mb-3">{t('home.recentOrders.title')}</h2>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3].map(i => (
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
      </main>
    </Layout>
  )
}