import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Search, ShoppingBag, Truck, CheckCircle, XCircle, Package, Mic, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useOrdersContext } from '../context/OrderContext'
import { useI18n } from '../context/I18nContext'
import useTranslations from '../hooks/useTranslations'
import { Layout } from '../Layout'
import BottomNav from '../component/BottomNav'
import ImageWithLoader from '../component/ImageWithLoader'
import dayjs from 'dayjs'
import AddressSelectionModal from '../component/AddressSelectionModal';

// --- Reusable Sub-components ---

// MD3 Skeleton: Uses Surface Variant for subtle loading states
const CategoryCardSkeleton = () => (
  <div className="w-20 flex flex-col items-center justify-start gap-2 text-center">
    <div className="w-full aspect-square rounded-md bg-md-surface-variant/50 animate-pulse" />
    <div className="h-4 w-16 bg-md-surface-variant/50 rounded-md animate-pulse" />
  </div>
)

const BrandCardSkeleton = () => (
  <div className="w-24 flex-shrink-0">
    <div className="relative w-full aspect-square rounded-2xl bg-md-surface-variant/50 animate-pulse" />
  </div>
)

const RecentOrderSkeleton = () => (
  <div className="w-full h-[100px] bg-md-surface-container rounded-xl p-3 flex gap-3 items-center animate-pulse">
    <div className="w-[72px] h-[72px] bg-md-surface-variant/50 rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex justify-between">
        <div className="h-4 w-20 bg-md-surface-variant/50 rounded" />
        <div className="h-4 w-16 bg-md-surface-variant/50 rounded" />
      </div>
      <div className="h-3 w-24 bg-md-surface-variant/30 rounded" />
      <div className="h-5 w-12 bg-md-surface-variant/30 rounded" />
    </div>
  </div>
)

// --- Order Image Grid ---
const OrderImageGrid = ({ products }) => {
  const displayProducts = products.slice(0, 4);
  const count = displayProducts.length;

  const getGridClass = () => {
    if (count === 1) return 'grid-cols-1 grid-rows-1';
    if (count === 2) return 'grid-cols-2 grid-rows-1';
    return 'grid-cols-2 grid-rows-2';
  };

  return (
    // Used outline-variant for a very subtle border instead of primBorder
    <div className={`w-[72px] h-[72px] rounded-xl overflow-hidden border border-md-outline-variant/20 flex-shrink-0 bg-md-surface-container-highest grid gap-[1px] ${getGridClass()}`}>
      {displayProducts.map((prod, idx) => {
        const isThreeItemsLayout = count === 3;
        const itemClass = isThreeItemsLayout && idx === 0
          ? "row-span-2 h-full"
          : "h-full w-full";

        return (
          <div key={idx} className={`relative overflow-hidden ${itemClass}`}>
            {prod.photo ? (
              <img src={prod.photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-md-surface-variant">
                <Package size={12} className="text-md-on-surface-variant" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

const RecentOrderCard = ({ order, onClick, t, lang }) => {
  const currency = t('common.currencySymbol') || '$';
  const createdAt = dayjs(order.createdAt);
  const deliveryTarget = createdAt.add(5, 'day');
  const now = dayjs();
  const daysLeft = deliveryTarget.diff(now, 'day');
  const currentStatus = order.statusHistory?.[order.statusHistory.length - 1]?.status || order.status || 'pending';

  // HCI: Using Container Colors for status to ensure contrast and semantic meaning
  const getStatusConfig = (status) => {
    const s = status.toLowerCase();
    
    // Success State
    if (s === 'delivered') return { 
      color: 'text-green-800 dark:text-green-100', 
      bg: 'bg-green-100 dark:bg-green-900', 
      icon: CheckCircle, 
      label: t('orders.status.delivered') 
    };
    
    // Error State - Mapped to MD3 Error Roles
    if (['cancelled', 'failed'].includes(s)) return { 
      color: 'text-md-on-error-container', 
      bg: 'bg-md-error-container', 
      icon: XCircle, 
      label: t('orders.status.cancelled') 
    };
    
    // Info State (Shipped) - Mapped to Secondary Container
    if (s === 'shipped') return { 
      color: 'text-md-on-secondary-container', 
      bg: 'bg-md-secondary-container', 
      icon: Truck, 
      label: t('orders.status.shipped') 
    };
    
    // Warning/Processing State - Mapped to Tertiary Container
    return { 
      color: 'text-md-on-tertiary-container', 
      bg: 'bg-md-tertiary-container', 
      icon: Clock, 
      label: t('orders.status.processing') 
    };
  };

  const config = getStatusConfig(currentStatus);
  const StatusIcon = config.icon;

  const formattedTotal = new Intl.NumberFormat(lang, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(order.totalPaid);

  return (
    <button
      onClick={onClick}
      // MD3 Card: Surface Container Low (lighter than main surface), No Border, Ripple effect on hover
      className="w-full bg-md-surface-container hover:bg-md-surface-container transition-colors rounded-xl p-3 flex gap-4 items-start text-left group"
    >
      <OrderImageGrid products={order.products} />

      <div className="flex-1 min-w-0 flex flex-col justify-between h-[72px]">
        {/* Status Badge */}
        <div className="flex justify-between items-start">
          <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md ${config.bg} ${config.color}`}>
            <StatusIcon size={12} />
            <span>{config.label}</span>
          </div>
        </div>

        {/* Delivery Context - Surface Variant Text */}
        <div className="text-xs text-md-on-surface-variant truncate mt-1">
          {currentStatus === 'delivered' ? (
            <span>{t('orders.deliveredOn')} {dayjs(order.updatedAt).format('MMM D')}</span>
          ) : currentStatus === 'cancelled' ? (
            <span>{t('orders.cancelled')}</span>
          ) : daysLeft > 0 ? (
             <span className="flex items-center gap-1">{t('home.recentOrders.arrivingInDays', { daysLeft })}</span>
          ) : (
            <span>{t('home.recentOrders.arrivingSoon')}</span>
          )}
        </div>

        {/* Bottom: Price (High Emphasis) & ID (Low Emphasis) */}
        <div className="flex justify-between items-end mt-auto">
          <span className="font-bold text-md-on-surface text-sm">
            {currency} {formattedTotal}
          </span>
          <span className="text-[11px] text-md-on-surface-variant opacity-70 font-mono tracking-wide">
            #{order._id.slice(-6).toUpperCase()}
          </span>
        </div>
      </div>
    </button>
  )
}

// Category Card - Mapped to Surface Container High for elevation
const CategoryCard = ({ category, onClick }) => {
  const { lang } = useI18n()
  const { translateDBVal } = useTranslations()

  let displayName = translateDBVal('Category', 'name', category.name, lang)
  if (lang === 'en' && displayName) displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1)

  return (
    <button onClick={onClick} className="w-20 flex flex-col items-center gap-2 group">
      <div className="w-full aspect-square rounded-md bg-md-surface-container-high hover:bg-md-surface-container-highest transition-colors overflow-hidden p-0">
        <ImageWithLoader
          src={category.image}
          alt={displayName}
          containerClassName="w-full h-full"
          imageClassName="w-full h-full object-cover"
        />
      </div>
      <span className="text-xs font-medium text-md-on-surface-variant group-hover:text-md-on-surface leading-tight text-center line-clamp-2">
        {displayName}
      </span>
    </button>
  )
}

// Brand Card
const BrandCard = ({ brand, onClick }) => {
  const imageUrl = brand.images?.[0]
  const { lang } = useI18n()
  const { translateDBVal } = useTranslations()

  return (
    <button onClick={onClick} className="w-24 flex-shrink-0 group">
      <div className="relative w-full aspect-square rounded-2xl bg-md-surface-container-high hover:bg-md-surface-container-highest overflow-hidden flex items-center justify-center transition-all">
        {imageUrl ? (
          <ImageWithLoader src={imageUrl} alt={brand.name} containerClassName="w-full h-full" imageClassName="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-2xl text-md-primary">{brand.name.charAt(0)}</span>
        )}
        {/* Scrim for text visibility */}
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
          <span className="text-white text-xs font-semibold w-full text-center truncate">
            {translateDBVal('Brand', 'name', brand.name, lang)}
          </span>
        </div>
      </div>
    </button>
  )
}

// --- Main Home Screen ---

export default function Home() {
  const navigate = useNavigate()
  const { customer, getDefaultAddress } = useAuth()
  const { mainCategories, brands, loading: dataLoading } = useData()
  const { orders, loading: ordersLoading } = useOrdersContext()
  const { t, lang } = useI18n()
  const [isAddressModalOpen, setAddressModalOpen] = useState(false);

  const displayCategories = mainCategories?.slice(0, 30) || []
  const displayBrands = brands?.slice(0, 30) || []
  const recentOrders = orders ? [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3) : [];

  return (
    <>
      <Layout footer={<BottomNav />}>
        {/* Header: Surface color to blend with body, sticky */}
        <header className="sticky top-0 z-20 bg-md-surface/95 backdrop-blur-md">
          <div className="max-w-[430px] mx-auto p-4 space-y-4">
            
            {/* Location Section */}
            <div className="flex items-center justify-between gap-4">
              <button onClick={() => setAddressModalOpen(true)} className="flex-1 flex items-center gap-3 text-left min-w-0 active:opacity-70 transition-opacity">
                {/* Icon is Primary Color */}
                <MapPin size={24} className="text-md-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-md-on-surface-variant uppercase tracking-wider">{t('home.header.deliveryTo')}</p>
                  <p className="text-sm font-semibold text-md-on-surface truncate">
                    {(() => {
                      const def = getDefaultAddress && getDefaultAddress()
                      return def?.addressText || t('home.header.setAddressPrompt')
                    })()}
                  </p>
                </div>
                <div className="text-md-on-surface-variant">
                   <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </button>
              <div className="flex-shrink-0">
                <ImageWithLoader src="/Azad-Bazaar.svg" alt="Logo" imageClassName="h-8 w-auto" />
              </div>
            </div>

            {/* Search Bar - MD3: "Surface Container High" (Filled style) */}
            <div className="relative w-full group">
              <button
                onClick={() => navigate('/search-results?q=')}
                className="w-full h-[52px] flex items-center gap-4 px-4 bg-md-surface-container-high rounded-md text-left transition-colors hover:bg-md-surface-container-highest"
                style={{ paddingRight: 56 }}
              >
                <Search size={20} className="text-md-on-surface-variant" />
                <span className="text-md-on-surface-variant text-base">{t('home.header.searchPlaceholder')}</span>
              </button>
              
              {/* Voice Button - Primary Container FAB style */}
              <button
                type="button"
                onClick={() => navigate('/search-results?q=&voice=1')}
                className="absolute right-1 top-1 h-[44px] w-[44px] flex items-center justify-center bg-md-secondary-container rounded-md hover:opacity-90 transition-opacity"
              >
                <Mic size={20} className="text-md-on-secondary-container" />
              </button>
            </div>
          </div>
        </header>

        {/* Main: Surface Background */}
        <main className="flex-1 overflow-y-auto bg-md-surface p-4 space-y-8 min-h-full pb">
          
          {/* Categories Section */}
          <section>
            <h2 className="text-lg font-bold text-md-on-surface mb-4 pl-1">{t('home.categories.title')}</h2>
            <div className="grid grid-flow-col grid-rows-2 gap-x-6 gap-y-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {dataLoading ? (
                Array.from({ length: 8 }).map((_, i) => <CategoryCardSkeleton key={i} />)
              ) : (
                displayCategories.map(category => (
                  <CategoryCard
                    key={category._id}
                    category={category}
                    onClick={() => navigate(`/search-results?category=${category._id}`)}
                  />
                ))
              )}
            </div>
          </section>

          {/* Promotional Banner - Using Primary Container for Emphasis */}
          <section className="bg-md-secondary-container rounded-2xl p-6 flex items-center justify-center min-h-[140px] shadow-sm">
             <div className="flex flex-col items-center gap-2">
                <ImageWithLoader src="/Azad-Bazaar.svg" alt="Offer" imageClassName="h-16 w-auto opacity-90" />
                <span className="text-md-on-secondary-container text-sm font-medium">Flash Sales Live Now</span>
             </div>
          </section>

          {/* Recent Orders */}
          <section>
            <div className="flex justify-between items-center mb-4 pl-1">
              <h2 className="text-lg font-bold text-md-on-surface">{t('home.recentOrders.title')}</h2>
              {recentOrders.length > 0 && (
                <button
                  onClick={() => navigate('/orders')}
                  className="text-sm font-medium text-md-primary hover:text-md-inverse-primary transition-colors py-1 px-2 rounded-md hover:bg-md-primary-container/10"
                >
                  {t('home.recentOrders.viewAll') || 'View All'}
                </button>
              )}
            </div>

            {ordersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => <RecentOrderSkeleton key={i} />)}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <RecentOrderCard
                    key={order._id}
                    order={order}
                    t={t}
                    lang={lang}
                    onClick={() => navigate(`/orders/${order._id}`)}
                  />
                ))}
              </div>
            ) : (
              /* Empty State - Surface Container */
              <div className="bg-md-surface-container rounded-2xl p-8 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-md bg-md-secondary-container flex items-center justify-center">
                  <ShoppingBag className="text-md-on-secondary-container w-8 h-8" />
                </div>
                <div>
                  <p className="text-base font-semibold text-md-on-surface">{t('home.recentOrders.emptyTitle') || "No orders yet"}</p>
                  <p className="text-sm text-md-on-surface-variant mt-1 max-w-[200px] mx-auto">
                    {t('home.recentOrders.emptyDesc') || "Start shopping to see your orders here."}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/search-results')}
                  className="mt-2 bg-md-primary text-md-on-primary font-medium text-sm px-8 py-3 rounded-md hover:shadow-lg transition-all"
                >
                  {t('home.recentOrders.startShopping') || "Start Shopping"}
                </button>
              </div>
            )}
          </section>

          {/* Popular Brands */}
          <section>
            <h2 className="text-lg font-bold text-md-on-surface mb-4 pl-1">{t('home.popularBrands.title')}</h2>
            <div className="grid grid-flow-col grid-rows-2 gap-x-4 gap-y-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {dataLoading ? (
                Array.from({ length: 8 }).map((_, i) => <BrandCardSkeleton key={i} />)
              ) : (
                displayBrands.map(brand => (
                  <BrandCard key={brand._id} brand={brand} onClick={() => navigate(`/search-results?brand=${brand._id}`)} />
                ))
              )}
            </div>
          </section>

        </main>
      </Layout>
      <AddressSelectionModal
        isOpen={isAddressModalOpen}
        onClose={() => setAddressModalOpen(false)}
      />
    </>
  )
}