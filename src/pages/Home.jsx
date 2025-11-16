import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Search, Cake } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useI18n } from '../context/I18nContext'
import useTranslations from '../hooks/useTranslations'
import { Layout } from '../Layout'
import BottomNav from '../component/BottomNav'

// --- Reusable Sub-components for the Home Screen ---

// Category Card: Improved hover/focus state for better feedback.
const CategoryCard = ({ category, onClick }) => {
  const { lang } = useI18n()
  const { translateDBVal } = useTranslations()

  let displayName = translateDBVal('Category', 'name', category.name, lang)
  if (lang === 'en' && displayName) {
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1)
  }

  return (
    <button onClick={onClick} className="w-20 flex flex-col items-center justify-start gap-2 text-center group focusRing rounded-lg">
      <div className="w-full aspect-square rounded-xl secBg primBorder secHoverBg overflow-hidden transition-all duration-200">
        <img src={category.image} alt={displayName} className="w-full h-full object-cover" />
      </div>
      <span className="text-xs font-medium primText leading-tight">{displayName}</span>
    </button>
  )
}

// Brand Card: Switched to an opacity hover effect, which is better for image cards.
const BrandCard = ({ brand, onClick }) => {
  const imageUrl = brand.images?.[0]
  const { lang } = useI18n()
  const { translateDBVal } = useTranslations()

  return (
    <button onClick={onClick} className="w-24 flex-shrink-0 group focusRing rounded-lg">
      <div className="relative w-full aspect-square rounded-xl secBg primBorder overflow-hidden flex items-center justify-center transition-all duration-200 group-hover:opacity-80">
        {imageUrl ? (
          <img src={imageUrl} alt={brand.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-2xl secText">{brand.name.charAt(0)}</span>
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

// Info Card: Corrected the hover state implementation.
const InfoCard = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="secBg primBorder secHoverBg rounded-xl p-3 flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 shadow-sm min-h-[90px] focusRing"
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
      {/* Header */}
      <header className="sticky top-0 z-20 primBg backdrop-blur-sm dividerBorder">
        <div className="max-w-[430px] mx-auto p-4 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <button onClick={() => navigate('/settings')} className="flex-1 flex items-center gap-2 text-left min-w-0 focusRing rounded-md">
              <MapPin size={20} className="accentPrimText flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs secText">{t('home.header.deliveryTo')}</p>
                <p className="text-sm font-medium primText truncate">
                  {customer?.addresses?.[0]?.addressText || t('home.header.setAddressPrompt')}
                </p>
              </div>
            </button>
            <div className="flex-shrink-0">
              <img src="src/Azad-Bazaar.svg" alt="Azad Bazaar logo" className="h-8 w-auto" />
            </div>
          </div>
          <button onClick={() => navigate('/search-results?q=')} className="w-full h-12 flex items-center gap-3 px-4 secBg primBorder secHoverBg rounded-lg text-left transition-colors focusRing">
            <Search size={18} className="secText" />
            <span className="secText">{t('home.header.searchPlaceholder')}</span>
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto primBg p-4 space-y-8 pb-24">
        {/* Categories Section */}
        {displayCategories.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold primText mb-4">{t('home.categories.title')}</h2>
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

        {/* Promotional Card */}
        <section className="secBg primBorder rounded-xl p-4 flex items-center justify-center min-h-[120px]">
          <img
            src="src/Azad-Bazaar.svg"
            alt="Azad Bazaar Offer"
            className="h-28 w-auto"
          />
        </section>

        {/* Popular Brands Section */}
        {displayBrands.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold primText mb-4">{t('home.popularBrands.title')}</h2>
            <div className="grid grid-flow-col grid-rows-2 gap-x-4 gap-y-5 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {displayBrands.map(brand => (
                <BrandCard key={brand._id} brand={brand} onClick={() => navigate(`/search-results?brand=${brand._id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Orders Section */}
        <section>
          <h2 className="text-xl font-semibold primText mb-3">{t('home.recentOrders.title')}</h2>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3].map(i => (
              <InfoCard key={i} onClick={() => navigate('/cart')}>
                <Cake size={20} className="accentPrimText" />
                <div className="text-left">
                  <p className="text-sm font-semibold primText">
                    {format('home.recentOrders.orderTitle', { orderNumber: 100 + i })}
                  </p>
                  <p className="text-xs secText">{t('home.recentOrders.status')}</p>
                </div>
              </InfoCard>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  )
}