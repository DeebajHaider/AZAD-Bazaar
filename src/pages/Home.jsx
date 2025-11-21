import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Search, ShoppingBag, ChevronRight, Clock, Truck, CheckCircle, XCircle, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useOrdersContext } from '../context/OrderContext' // Added
import { useI18n } from '../context/I18nContext'
import useTranslations from '../hooks/useTranslations'
import { Layout } from '../Layout'
import BottomNav from '../component/BottomNav'
import ImageWithLoader from '../component/ImageWithLoader'
import dayjs from 'dayjs' // Assuming dayjs is installed as per other files

// --- Reusable Sub-components for the Home Screen ---

// Skeleton Placeholders
const CategoryCardSkeleton = () => (
  <div className="w-20 flex flex-col items-center justify-start gap-2 text-center">
    <div className="w-full aspect-square rounded-xl skeleton" />
    <div className="h-4 w-16 skeleton" />
  </div>
)

const BrandCardSkeleton = () => (
  <div className="w-24 flex-shrink-0">
    <div className="relative w-full aspect-square rounded-xl skeleton">
      <div className="absolute bottom-2 left-2 right-2 h-4 skeleton rounded-md" />
    </div>
  </div>
)

const RecentOrderSkeleton = () => (
  <div className="w-full h-[100px] secBg primBorder rounded-xl p-3 flex gap-3 items-center">
    <div className="w-[72px] h-[72px] skeleton rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex justify-between">
        <div className="h-4 w-20 skeleton" />
        <div className="h-4 w-16 skeleton" />
      </div>
      <div className="h-3 w-24 skeleton" />
      <div className="h-5 w-12 skeleton" />
    </div>
  </div>
)

// --- Component: Order Image Grid ---
// Handles the visual representation of 1-4 items in a compact grid
const OrderImageGrid = ({ products }) => {
  const displayProducts = products.slice(0, 4);
  const count = displayProducts.length;

  const getGridClass = () => {
    if (count === 1) return 'grid-cols-1 grid-rows-1';
    if (count === 2) return 'grid-cols-2 grid-rows-1';
    if (count === 3) return 'grid-cols-2 grid-rows-2'; // Logic handled in render
    return 'grid-cols-2 grid-rows-2';
  };

  return (
    <div className={`w-[72px] h-[72px] rounded-lg overflow-hidden primBorder flex-shrink-0 bg-white dark:bg-slate-800 grid gap-[1px] ${getGridClass()}`}>
      {displayProducts.map((prod, idx) => {
        // Special layout for 3 items: First item takes full height on left
        const isThreeItemsLayout = count === 3;
        const itemClass = isThreeItemsLayout && idx === 0 
          ? "row-span-2 h-full" 
          : "h-full w-full";

        return (
          <div key={idx} className={`relative overflow-hidden ${itemClass}`}>
             {prod.photo ? (
               <img src={prod.photo} alt="" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                 <Package size={12} className="secText opacity-50" />
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
  
  // Calculate dates
  const createdAt = dayjs(order.createdAt);
  const deliveryTarget = createdAt.add(5, 'day');
  const now = dayjs();
  const daysLeft = deliveryTarget.diff(now, 'day');
  
  // Status Logic
  const currentStatus = order.statusHistory?.[order.statusHistory.length - 1]?.status || order.status || 'pending';
  
  const getStatusConfig = (status) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return { color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle, label: t('orders.status.delivered') };
    if (['cancelled', 'failed'].includes(s)) return { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', icon: XCircle, label: t('orders.status.cancelled') };
    if (s === 'shipped') return { color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: Truck, label: t('orders.status.shipped') };
    return { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: Clock, label: t('orders.status.processing') };
  };

  const config = getStatusConfig(currentStatus);
  const StatusIcon = config.icon;

  // Formatting Cost
  const formattedTotal = new Intl.NumberFormat(lang, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(order.totalPaid);

  return (
    <button 
      onClick={onClick}
      className="w-full secBg primBorder secHoverBg rounded-xl p-3 flex gap-3 items-start text-left transition-all duration-200 active:scale-[0.99] group focusRing"
      aria-label={`${config.label}, ${currency}${formattedTotal}, ${t('home.recentOrders.orderTitle', { orderNumber: order._id.slice(-4) })}`}
    >
      {/* Image Grid (Visual Anchor) */}
      <OrderImageGrid products={order.products} />

      {/* Info Section */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-[72px]">
        
        {/* Top: Status Badge (Primary Focus) */}
        <div className="flex justify-between items-start">
           <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase px-2 py-1 rounded-md ${config.bg} ${config.color}`}>
             <StatusIcon size={12} />
             <span>{config.label}</span>
           </div>
        </div>

        {/* Middle: Delivery Context (Natural Reading Flow) */}
        <div className="text-xs secText truncate mt-1">
          {currentStatus === 'delivered' ? (
             <span>{t('orders.deliveredOn')} {dayjs(order.updatedAt).format('MMM D')}</span>
          ) : currentStatus === 'cancelled' ? (
             <span>{t('orders.cancelled')}</span>
          ) : daysLeft > 0 ? (
             (() => {
               const raw = t('home.recentOrders.arrivingInDays') || 'Arriving in {{count}} days'
               const text = raw.replace('{{count}}', daysLeft)
               return (
                 <span className="flex items-center gap-1">{text}</span>
               )
             })()
          ) : (
             <span>{t('home.recentOrders.arrivingSoon')}</span>
          )}
        </div>

        {/* Bottom: Price & Subtle ID */}
        <div className="flex justify-between items-end mt-auto">
          <span className="font-bold primText text-sm">
            {currency} {formattedTotal}
          </span>
          
          {/* Demoted Order ID (Tertiary Info) */}
          <span className="text-[11px] secText opacity-60 font-mono tracking-wide">
            #{order._id.slice(-6).toUpperCase()}
          </span>
        </div>
      </div>
    </button>
  )
}


// Category Card
const CategoryCard = ({ category, onClick }) => {
  const { lang } = useI18n()
  const { translateDBVal } = useTranslations()

  let displayName = translateDBVal('Category', 'name', category.name, lang)
  if (lang === 'en' && displayName) {
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1)
  }

  return (
    <button onClick={onClick} className="w-20 flex flex-col items-center justify-start gap-2 text-center group focusRing rounded-lg">
      <ImageWithLoader
        src={category.image}
        alt={displayName}
        containerClassName="w-full aspect-square rounded-xl secBg primBorder secHoverBg overflow-hidden transition-all duration-200"
        imageClassName="w-full h-full object-cover"
      />
      <span className="text-xs font-medium primText leading-tight">{displayName}</span>
    </button>
  )
}

// Brand Card
const BrandCard = ({ brand, onClick }) => {
  const imageUrl = brand.images?.[0]
  const { lang } = useI18n()
  const { translateDBVal } = useTranslations()

  return (
    <button onClick={onClick} className="w-24 flex-shrink-0 group focusRing rounded-lg">
      <div className="relative w-full aspect-square rounded-xl secBg primBorder overflow-hidden flex items-center justify-center transition-all duration-200 group-hover:opacity-80">
        {imageUrl ? (
          <ImageWithLoader
            src={imageUrl}
            alt={brand.name}
            containerClassName="w-full h-full"
            imageClassName="w-full h-full object-cover"
          />
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

// --- Main Home Screen Component ---

export default function Home() {
  const navigate = useNavigate()
  const { customer } = useAuth()
  const { mainCategories, brands, loading: dataLoading } = useData()
  const { orders, loading: ordersLoading, error: ordersError } = useOrdersContext() // Fetching real orders
  const { t, lang } = useI18n()

  const displayCategories = mainCategories?.slice(0, 30) || []
  const displayBrands = brands?.slice(0, 30) || []
  
  // Process Orders: Sort by Date Descending and take top 3
  const recentOrders = orders 
    ? [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3) 
    : [];

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
              <ImageWithLoader src="/Azad-Bazaar.svg" alt="Azad Bazaar logo" imageClassName="h-8 w-auto" />
            </div>
          </div>
          <button onClick={() => navigate('/search-results?q=')} className="w-full h-12 flex items-center gap-3 px-4 secBg primBorder secHoverBg rounded-lg text-left transition-colors focusRing">
            <Search size={18} className="secText" />
            <span className="secText">{t('home.header.searchPlaceholder')}</span>
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto primBg p-4 space-y-8 min-h-full">
        {/* Categories Section */}
        <section>
          <h2 className="text-xl font-semibold primText mb-4">{t('home.categories.title')}</h2>
          <div className="grid grid-flow-col grid-rows-2 gap-x-4 gap-y-5 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
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

        {/* Promotional Card */}
        <section className="secBg primBorder rounded-xl p-4 flex items-center justify-center min-h-[120px]">
          <ImageWithLoader
            src="/Azad-Bazaar.svg"
            alt="Azad Bazaar Offer"
            imageClassName="h-28 w-auto"
          />
        </section>

        {/* Recent Orders Section (Redesigned) */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-xl font-semibold primText">{t('home.recentOrders.title')}</h2>
            {recentOrders.length > 0 && (
              <button 
                onClick={() => navigate('/orders')} 
                className="text-xs font-medium accentPrimText hover:underline pb-1"
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
            /* Empty State CTA */
            <div className="secBg primBorder rounded-xl p-6 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <ShoppingBag className="accentPrimText w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold primText">{t('home.recentOrders.emptyTitle') || "No orders yet"}</p>
                <p className="text-xs secText mt-1">{t('home.recentOrders.emptyDesc') || "Start shopping to see your orders here."}</p>
              </div>
              <button 
                onClick={() => navigate('/search-results')}
                className="mt-2 btnPrimary text-sm px-6 py-2.5 rounded-lg w-full max-w-[200px]"
              >
                {t('home.recentOrders.startShopping') || "Start Shopping"}
              </button>
            </div>
          )}
        </section>

        {/* Popular Brands Section */}
        <section>
          <h2 className="text-xl font-semibold primText mb-4">{t('home.popularBrands.title')}</h2>
          <div className="grid grid-flow-col grid-rows-2 gap-x-4 gap-y-5 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
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
  )
}