import React, { useMemo } from 'react';
import { Heart, ShoppingCart, Trash2, AlertCircle, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Contexts & Hooks
import { useFavoritesContext } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';
import { useProduct } from '../api';
import useTranslations from '../hooks/useTranslations';

// Components
import BottomNav from '../component/BottomNav';
import { Layout } from '../Layout';
import HeaderWithName from '../component/HeaderWithName';
import ImageWithLoader from '../component/ImageWithLoader';

// ==========================================
// 1. Skeleton Component (Loading State)
// ==========================================
// MD3: Surface Container as base
const FavoriteItemSkeleton = () => (
  <div className="flex gap-3 p-3 rounded-md bg-md-surface-container animate-pulse">
    {/* Image Placeholder */}
    <div className="w-24 h-24 bg-md-surface-variant/50 rounded-md flex-shrink-0" />
    
    {/* Content Placeholder */}
    <div className="flex-1 flex flex-col justify-between py-1">
      <div className="space-y-2">
        <div className="h-4 w-3/4 bg-md-surface-variant/50 rounded" />
        <div className="h-3 w-1/2 bg-md-surface-variant/30 rounded" />
      </div>
      
      <div className="flex justify-between items-end">
        <div className="h-5 w-20 bg-md-surface-variant/50 rounded" />
        <div className="flex gap-2">
           <div className="w-9 h-9 bg-md-surface-variant/50 rounded-md" />
           <div className="w-9 h-9 bg-md-surface-variant/50 rounded-md" />
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

  const { data: product, loading, error } = useProduct(id, { immediate: true });

  if (loading) return <FavoriteItemSkeleton />;

  // Error/Not Found State
  if (error || !product) {
    return (
        <div className="flex items-center justify-between gap-3 p-4 rounded-md bg-md-surface-container opacity-70">
            <div className="flex items-center gap-2 text-md-error">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{t('favorites.itemUnavailable') || 'Item unavailable'}</span>
            </div>
            <button 
                onClick={() => onRemove(id)}
                className="text-xs underline text-md-on-surface-variant hover:text-md-error"
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
        // MD3 Card: Surface Container Low -> High on hover
        className="group relative flex gap-3 p-3 rounded-md transition-all duration-200 cursor-pointer bg-md-surface-container hover:bg-md-surface-container-high hover:shadow-sm"
    >
      {/* Image Section: Surface Container Highest */}
      <div className="relative w-24 h-24 flex-shrink-0 bg-md-surface-container-highest rounded-md overflow-hidden">
        <ImageWithLoader 
            src={imageSrc} 
            alt={displayName}
            imageClassName={`w-full h-full object-contain p-1 transition-transform duration-500 group-hover:scale-105 ${!inStock ? 'grayscale opacity-50' : 'mix-blend-multiply dark:mix-blend-normal'}`}
            containerClassName="w-full h-full"
        />
        {!inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="bg-md-error-container text-md-on-error-container text-[10px] px-1.5 py-0.5 rounded-md font-bold shadow-sm">
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
                <h3 className="font-semibold text-md-on-surface text-sm leading-tight line-clamp-2 mb-1 group-hover:text-md-primary transition-colors">
                    {displayName}
                </h3>
            </div>
            {product.category && (
                <span className="text-xs text-md-on-surface-variant/80 font-medium">
                    {translateDBVal("Category", "name", product.category.name || product.category, lang)}
                </span>
            )}
        </div>

        {/* Price & Actions */}
        <div className="flex items-end justify-between mt-2">
            <div className="flex flex-col">
                {product.originalPrice > displayPrice && (
                    <span className="text-[10px] text-md-on-surface-variant line-through">
                        {t('common.currencySymbol')}{product.originalPrice.toLocaleString()}
                    </span>
                )}
                <span className="text-lg font-bold text-md-on-surface leading-none">
                    {t('common.currencySymbol')}{displayPrice.toLocaleString()}
                </span>
            </div>

            <div className="flex gap-2">
                {/* Remove Button: Outlined Tonal */}
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(id); }}
                    className="w-9 h-9 rounded-md border border-md-outline-variant text-md-on-surface-variant hover:bg-md-error-container hover:text-md-on-error-container hover:border-transparent flex items-center justify-center transition-all"
                    aria-label={t('favorites.removeAria') || "Remove from favorites"}
                >
                    <Trash2 size={18} />
                </button>

                {/* Add to Cart Button: Primary */}
                <button
                    onClick={handleAddToCart}
                    disabled={!inStock || cartLoading}
                    className={`w-9 h-9 rounded-md flex items-center justify-center transition-all shadow-sm active:scale-95 ${
                        inStock 
                        ? 'bg-md-primary text-md-on-primary hover:shadow-md' 
                        : 'bg-md-surface-container-highest text-md-on-surface-variant/50 cursor-not-allowed'
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
    <div className="w-20 h-20 bg-md-surface-container-highest rounded-md flex items-center justify-center mb-6 border border-md-outline-variant/30">
      <Heart className="w-10 h-10 text-md-on-surface-variant/50" fill="currentColor" />
    </div>
    <h2 className="text-xl font-bold text-md-on-surface mb-2">
      {t('favorites.empty.title') || "No Favorites Yet"}
    </h2>
    <p className="text-sm text-md-on-surface-variant max-w-[260px] mb-8 leading-relaxed">
      {t('favorites.empty.description') || "Save items you love here to check them out later."}
    </p>
    <Link 
      to="/" 
      className="min-h-[48px] px-8 rounded-md bg-md-primary text-md-on-primary font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-transform active:scale-95"
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

  const items = useMemo(() => Array.isArray(favorites) ? favorites : [], [favorites]);

  return (
    <Layout 
      footer={<BottomNav />} 
      header={
        <HeaderWithName 
          title={t('favorites.title') || "My Favorites"} 
          to={-1} 
          rightAction={
                items.length > 0 && (
                    <span className="text-xs font-bold bg-md-secondary-container text-md-on-secondary-container px-2 py-1 rounded-md min-w-[24px] text-center">
                        {items.length}
                    </span>
                )
            }
        /> 
      }
    >
      <main className="min-h-screen flex-1 overflow-y-auto bg-md-surface">
        {contextLoading ? (
            <div className="p-4 space-y-4">
                {[1,2,3].map(i => <FavoriteItemSkeleton key={i} />)}
            </div>
        ) : items.length === 0 ? (
            <EmptyFavorites t={t} />
        ) : (
            <div className="max-w-[430px] mx-auto p-4 pb-24 space-y-4">
                <div className="space-y-3">
                    {items.map((id) => (
                        <FavoriteItemCard 
                            key={String(id)} 
                            id={id} 
                            onRemove={remove} 
                        />
                    ))}
                </div>

                <div className="text-center pt-4">
                    <p className="text-xs text-md-on-surface-variant/60">
                        {t('favorites.footerNote') || "Prices and availability are subject to change."}
                    </p>
                </div>
            </div>
        )}
      </main>
    </Layout>
  );
}