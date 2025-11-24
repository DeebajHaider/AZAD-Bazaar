import React, { useMemo } from 'react';
import { Heart, ShoppingCart, Trash2, AlertCircle, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Contexts & Hooks
import { useFavoritesContext } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';
import { useProduct } from '../api'; // Your provided hook
import useTranslations from '../hooks/useTranslations';

// Components
import BottomNav from '../component/BottomNav';
import { Layout } from '../Layout';
import HeaderWithName from '../component/HeaderWithName';
import ImageWithLoader from '../component/ImageWithLoader';

// ==========================================
// 1. Skeleton Component (Loading State)
// ==========================================
const FavoriteItemSkeleton = () => (
  <div className="card p-3 flex gap-3 animate-pulse">
    {/* Image Placeholder */}
    <div className="w-24 h-24 skeleton rounded-md flex-shrink-0" />
    
    {/* Content Placeholder */}
    <div className="flex-1 flex flex-col justify-between py-1">
      <div className="space-y-2">
        <div className="h-4 w-3/4 skeleton rounded" />
        <div className="h-3 w-1/2 skeleton rounded" />
      </div>
      
      <div className="flex justify-between items-end">
        <div className="h-5 w-20 skeleton rounded" />
        <div className="flex gap-2">
           <div className="w-9 h-9 skeleton rounded-lg" />
           <div className="w-9 h-9 skeleton rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// 2. Favorite Item Card (Individual Logic)
// ==========================================
const FavoriteItemCard = ({ id, onRemove }) => {
  const { t, lang } = useI18n();
  const { translateDBVal } = useTranslations();
  const { addToCart, loading: cartLoading } = useCart();
  const navigate = useNavigate();

  // Use the provided hook to fetch specific product data
  const { data: product, loading, error } = useProduct(id, { immediate: true });

  // Loading State
  if (loading) return <FavoriteItemSkeleton />;

  // Error/Not Found State (Graceful Fallback)
  if (error || !product) {
    return (
        <div className="card p-4 flex items-center justify-between gap-3 opacity-70">
            <div className="flex items-center gap-2 text-red-500">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{t('favorites.itemUnavailable') || 'Item unavailable'}</span>
            </div>
            <button 
                onClick={() => onRemove(id)}
                className="text-xs underline secText hover:text-red-500"
            >
                {t('common.remove') || 'Remove'}
            </button>
        </div>
    );
  }

  // --- Data Prep ---
  const displayName = translateDBVal("Product", "name", product.name ?? product.title, lang);
  const displayPrice = product.discountedPrice ?? product.price;
  const inStock = (product.stockQuantity ?? (product.inStock ? 99 : 0)) > 0;
  // Safe image fallback
  const imageSrc = product.images?.[0] || product.image;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product._id || product.id);
  };

  const handleNavigate = () => {
    navigate('/product' + `/${product._id || product.id}`);
  };

  return (
    <div 
        onClick={handleNavigate}
        className="card p-3 flex gap-3 group transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative w-24 h-24 flex-shrink-0 bg-white dark:bg-slate-800 rounded-md overflow-hidden primBorder">
        <ImageWithLoader 
            src={imageSrc} 
            alt={displayName}
            imageClassName={`w-full h-full object-contain p-1 transition-transform duration-500 group-hover:scale-105 ${!inStock ? 'grayscale opacity-50' : ''}`}
            containerClassName="w-full h-full"
        />
        {!inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <span className="badgeDanger text-[10px] px-1.5 py-0.5 shadow-sm">
                    {t('common.outOfStock') || 'Out of Stock'}
                </span>
            </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        
        {/* Title & Category */}
        <div>
            <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold primText text-sm leading-tight line-clamp-2 mb-1">
                    {displayName}
                </h3>
            </div>
            {product.category && (
                <span className="badgeCategory">
                    {translateDBVal("Category", "name", product.category.name || product.category, lang)}
                </span>
            )}
        </div>

        {/* Price & Actions */}
        <div className="flex items-end justify-between mt-2">
            <div className="flex flex-col">
                {product.originalPrice > displayPrice && (
                    <span className="text-[10px] secText line-through">
                        {t('common.currencySymbol')}{product.originalPrice.toLocaleString()}
                    </span>
                )}
                <span className="text-lg font-bold accentPrimText leading-none">
                    {t('common.currencySymbol')}{displayPrice.toLocaleString()}
                </span>
            </div>

            <div className="flex gap-2">
                {/* Remove Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(id); }}
                    className="w-9 h-9 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 flex items-center justify-center transition-colors"
                    aria-label={t('favorites.removeAria') || "Remove from favorites"}
                >
                    <Trash2 size={18} />
                </button>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={!inStock || cartLoading}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all shadow-sm ${
                        inStock 
                        ? 'btnPrimary' 
                        : 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
                    }`}
                    aria-label={t('common.addToCart')}
                >
                    <ShoppingCart size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. Empty State Component
// ==========================================
const EmptyFavorites = ({ t }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4">
    <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-gray-200 dark:border-slate-800">
      <Heart className="w-10 h-10 text-gray-300 dark:text-slate-600" fill="currentColor" />
    </div>
    <h2 className="text-xl font-bold primText mb-2">
      {t('favorites.empty.title') || "No Favorites Yet"}
    </h2>
    <p className="text-sm secText max-w-[260px] mb-8">
      {t('favorites.empty.description') || "Save items you love here to check them out later."}
    </p>
    <Link 
      to="/" 
      className="btnPrimary min-h-12 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-transform active:scale-95"
    >
      <span>{t('favorites.empty.cta') || "Start Shopping"}</span>
      <ArrowRight size={18} />
    </Link>
  </div>
);

// ==========================================
// 4. Main Page Component
// ==========================================
export default function Favorites() {
  const { favorites, remove, loading: contextLoading } = useFavoritesContext();
  const { t } = useI18n();

  // Ensure items is always an array
  const items = useMemo(() => Array.isArray(favorites) ? favorites : [], [favorites]);

  return (
    <Layout 
      footer={<BottomNav />} 
      header={
        <HeaderWithName 
            title={t('favorites.title') || "My Favorites"} 
            to="/" 
            rightAction={
                items.length > 0 && (
                    <span className="text-xs font-medium secBg primBorder px-2 py-1 rounded-full secText">
                        {items.length}
                    </span>
                )
            }
        /> 
      }
    >
      <main className="min-h-screen flex-1 overflow-y-auto primBg">
        {contextLoading ? (
            // Initial context loading (rarely seen if ids are local)
            <div className="p-4 space-y-4">
                {[1,2,3].map(i => <FavoriteItemSkeleton key={i} />)}
            </div>
        ) : items.length === 0 ? (
            <EmptyFavorites t={t} />
        ) : (
            <div className="max-w-[430px] mx-auto p-4 pb-24 space-y-4">
                {/* Optional: Clear All could go here if needed */}
                
                <div className="space-y-3">
                    {items.map((id) => (
                        <FavoriteItemCard 
                            key={String(id)} 
                            id={id} 
                            onRemove={remove} 
                        />
                    ))}
                </div>

                {/* Subtle Footer Note */}
                <div className="text-center pt-4">
                    <p className="text-xs secText opacity-60">
                        {t('favorites.footerNote') || "Prices and availability are subject to change."}
                    </p>
                </div>
            </div>
        )}
      </main>
    </Layout>
  );
}