import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Search as SearchIcon, X, ChevronUp, ChevronDown, Mic, Filter } from 'lucide-react'
import ItemCard from '../component/ItemCard'
import { useProducts, useBrands } from '../api'
import fuzzysort from 'fuzzysort';
import { useData } from '../context/DataContext'
import { useI18n } from '../context/I18nContext'
import useTranslations from '../hooks/useTranslations'
import { Layout } from '../Layout'
import BottomNav from '../component/BottomNav'
import useDebounce from '../hooks/useDebounce'
import MobilePagination from '../component/MobilePagination'
import FilterModal from '../component/FilterModal'

// Skeleton: Surface Container as base
const ItemCardSkeleton = () => (
  <div className="flex items-start gap-4 p-3 rounded-lg bg-md-surface-container animate-pulse">
    <div className="w-24 h-24 bg-md-surface-variant/50 rounded-md flex-shrink-0"></div>
    <div className="flex-1 space-y-2">
      <div className="h-5 w-3/4 bg-md-surface-variant/50 rounded"></div>
      <div className="h-4 w-1/4 bg-md-surface-variant/30 rounded"></div>
      <div className="h-6 w-1/2 bg-md-surface-variant/50 rounded"></div>
    </div>
  </div>
)

import VoiceInputModal from '../component/VoiceInputModal';

// Header component with search form and voice input
// MD3: Surface Container background for top bar area
const SearchHeader = ({ searchTerm, setSearchTerm, handleSearch, t, navigate, onVoiceClick, isVoiceOpen, lang }) => {
  const isRTL = lang === 'ar' || lang === 'he' || lang === 'fa' || lang === 'ur';
  const inputPadding = isRTL ? 'pl-12' : 'pr-12'; // Adjusted padding for cleaner look
  // Search Icon is now inside the input on the start side usually, but keeping your layout:
  // Your layout: Back < Input (with Mic inside) > 
  // Let's refine the input style to be "Filled" (Surface Container Highest) and rounded-md.

  return (
    <header className="bg-md-surface-container p-4 shadow-sm z-10 sticky top-0">
      <div className="max-w-[430px] mx-auto">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          {/* Back Button */}
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            aria-label={t('searchResults.header.backButtonAriaLabel')} 
            className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-md-on-surface/10 text-md-on-surface transition-colors flex-shrink-0"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="relative flex-1 group">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchResults.header.placeholder')}
              // MD3 Search Bar: Rounded Full, Surface Container Highest
              className={`w-full h-12 rounded-md bg-md-surface-container-highest text-md-on-surface placeholder:text-md-on-surface-variant px-5 text-base focus:outline-none focus:ring-2 focus:ring-md-primary transition-all ${isRTL ? 'pl-12' : 'pr-12'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />

            {/* Mic Button (End side) */}
            <button
              type="button"
              aria-label={t('searchResults.header.voiceButtonAriaLabel') || 'Voice Search'}
              onClick={onVoiceClick}
              className={`absolute top-1 bottom-1 ${isRTL ? 'left-1' : 'right-1'} w-10 h-10 flex items-center justify-center rounded-md hover:bg-md-on-surface-variant/10 text-md-primary transition-colors`}
            >
              <Mic size={20} />
            </button>
            
            {/* We typically rely on "Enter" or the mobile keyboard "Go" for search submission in this UI style, 
                but if you need a visible search icon inside, it's usually at the start. 
                I'll keep it simple as per MD3 guidelines which often just show the input. 
                If you really need a submit button, it could replace the mic when typing? 
                For now, preserving your functional structure but cleaning visuals.
            */}
          </div>
        </form>
      </div>
    </header>
  );
}

// --- Main Search Results Component ---

export default function SearchResults() {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { translateDBVal } = useTranslations()

  const [isFilterModalOpen, setFilterModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [currentPage, setCurrentPage] = useState(1)
  const [isVoiceModalOpen, setVoiceModalOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('voice') === '1') {
      setVoiceModalOpen(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('voice');
      setTimeout(() => setSearchParams(newParams, { replace: true }), 0);
    }
  }, [searchParams, setSearchParams]);

  const [filters, setFilters] = useState(() => {
    const initialCategories = searchParams.get('category') ? [searchParams.get('category')] : []
    const initialBrands = searchParams.get('brand') ? [searchParams.get('brand')] : []
    return {
      categories: initialCategories,
      brands: initialBrands,
      sortBy: 'name',
      sortOrder: 'asc'
    }
  })

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (debouncedSearchTerm.trim()) {
      newSearchParams.set('q', debouncedSearchTerm.trim());
    } else {
      newSearchParams.delete('q');
    }
    setSearchParams(newSearchParams, { replace: true });
    setCurrentPage(1);
  }, [debouncedSearchTerm, setSearchParams]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams)
    let wasModified = false
    if (newSearchParams.has('category')) {
      newSearchParams.delete('category')
      wasModified = true
    }
    if (newSearchParams.has('brand')) {
      newSearchParams.delete('brand')
      wasModified = true
    }
    if (wasModified) {
      setSearchParams(newSearchParams, { replace: true })
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const trimmed = searchTerm.trim();
    const newSearchParams = new URLSearchParams(searchParams);
    if (trimmed) {
      newSearchParams.set('q', trimmed);
    } else {
      newSearchParams.delete('q');
    }
    setSearchParams(newSearchParams, { replace: true });
    setCurrentPage(1)
    setSearchTerm(trimmed); 
  }

  const handleVoiceConfirm = (transcript) => {
    const trimmed = transcript.trim();
    if (trimmed) {
      setSearchTerm(trimmed);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('q', trimmed);
      setSearchParams(newSearchParams, { replace: true });
      setCurrentPage(1);
    }
  }

  const apiParams = useMemo(() => {
    const p = {}
    const realCategories = filters.categories.filter(c => c !== 'inStock' && c !== 'onDiscount')
    if (realCategories.length > 0) p.categories = realCategories.join(',')
    if (filters.brands.length > 0) p.brands = filters.brands.join(',')
    if (filters.categories.includes('inStock')) p.instock = true
    return p
  }, [filters.categories, filters.brands])

  const { data: apiData, loading: loadingProducts, error: productsError } = useProducts(apiParams, { immediate: true })

  const filteredResults = useMemo(() => {
    let results = Array.isArray(apiData) ? apiData.slice() : []
    if (filters.categories.includes('onDiscount')) {
      results = results.filter(it => (it.discountedPrice ?? it.price) < (it.price ?? it.originalPrice))
    }
    const search = searchParams.get('q')?.trim();
    if (search) {
      const langCode = lang;
      const normalizedSearch = search.normalize('NFC').toLowerCase();
      const withTranslated = results.map(item => {
        const translated = (translateDBVal('Product', 'name', item.name, langCode) || item.name || '').normalize('NFC');
        return { item, translated, translatedLower: translated.toLowerCase() };
      });
      const fuzzy = fuzzysort.go(normalizedSearch, withTranslated, { key: 'translated', threshold: -90 });
      const fuzzyIds = new Set(fuzzy.map(f => f.obj.item._id));
      const substringMatches = withTranslated.filter(({ translatedLower }) => translatedLower.includes(normalizedSearch)).map(({ item }) => item._id);
      const allIds = new Set([...fuzzyIds, ...substringMatches]);
      results = results.filter(it => allIds.has(it._id));
    }
    return results;
  }, [apiData, filters.categories, searchParams, lang, translateDBVal])

  const sortedResults = useMemo(() => {
    const arr = filteredResults.slice()
    const dir = filters.sortOrder === 'asc' ? 1 : -1
    if (!filters.sortBy) return arr
    arr.sort((a, b) => {
      const getPrice = (it) => Number(it.discountedPrice ?? it.price ?? 0)
      if (filters.sortBy === 'price') return dir * (getPrice(a) - getPrice(b))
      if (filters.sortBy === 'discount') {
        const getOriginal = (it) => Number(it.price ?? it.originalPrice ?? getPrice(it))
        const da = (getOriginal(a) - getPrice(a)) / (getOriginal(a) || 1)
        const db = (getOriginal(b) - getPrice(b)) / (getOriginal(b) || 1)
        return dir * (db - da)
      }
      if (filters.sortBy === 'name') return dir * (a.name ?? a.title ?? '').localeCompare(b.name ?? b.title ?? '')
      return 0
    })
    return arr
  }, [filteredResults, filters.sortBy, filters.sortOrder])

  const { mainCategories } = useData()
  const { data: allBrands } = useBrands()

  const sortedCategories = useMemo(() => {
    if (!Array.isArray(mainCategories)) return []
    return mainCategories.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [mainCategories])

  const sortedBrands = useMemo(() => {
    if (!Array.isArray(allBrands)) return []
    return allBrands.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [allBrands])

  const selectedCategoryObjects = useMemo(() => {
    const specialMap = {
      inStock: { _id: 'inStock', name: t('searchResults.filterPanel.inStockLabel') },
      onDiscount: { _id: 'onDiscount', name: t('searchResults.filterPanel.onDiscountLabel') },
    }
    return filters.categories.map(id => {
      if (specialMap[id]) return specialMap[id]
      return sortedCategories.find(c => c._id === id)
    }).filter(Boolean)
  }, [filters.categories, sortedCategories, t, lang])

  const selectedBrandObjects = useMemo(() => {
    return filters.brands.map(id => {
      return sortedBrands.find(c => c._id === id)
    }).filter(Boolean)
  }, [filters.brands, sortedBrands])

  const handleSortClick = (sortBy) => {
    if (filters.sortBy === sortBy) {
      setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
    } else {
      setFilters({ ...filters, sortBy: sortBy, sortOrder: sortBy === 'discount' ? 'desc' : 'asc' })
    }
  }

  const clearCategoryFilters = () => { setFilters(prev => ({ ...prev, categories: [] })) }
  const clearBrandFilters = () => { setFilters(prev => ({ ...prev, brands: [] })) }

  const mapApiItemToCard = (it) => ({
    id: it._id,
    title: it.name,
    price: it.discountedPrice ?? it.price,
    originalPrice: it.originalPrice ?? it.price,
    category: it.category?.name,
    inStock: (it.stockQuantity - (it.reservedQuantity || 0) > 0),
    image: it.images?.[0]
  })

  const pageSize = 10
  const totalResults = sortedResults.length
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize))
  const currentResults = sortedResults.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const searchQuery = searchParams.get('q')

  useEffect(() => { setCurrentPage(1) }, [filters])

  // Main content component
  const SearchContent = () => (
    <main className="flex-1 overflow-y-auto bg-md-surface min-h-full">
      {/* New Filter & Sort Section */}
      <section className="p-4 space-y-4 border-b border-md-outline-variant/30">
        <div className="flex items-center gap-2">
          {/* Filter Button: Tonal Button (Secondary Container) */}
          <button 
            onClick={() => setFilterModalOpen(true)} 
            className="h-9 px-4 rounded-md bg-md-secondary-container text-md-on-secondary-container font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Filter size={16} />
            {t('searchResults.summary.filtersButton')}
          </button>
          
          {/* Active Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 py-0.5">
            {selectedCategoryObjects.map(cat => (
              <span key={cat._id} className="h-7 inline-flex items-center px-2.5 rounded-md bg-md-secondary-container text-md-on-secondary-container text-xs font-medium whitespace-nowrap">
                {cat._id === 'inStock' || cat._id === 'onDiscount' ? cat.name : translateDBVal("Category", "name", cat.name, lang)}
              </span>
            ))}
            {selectedBrandObjects.map(brand => (
              <span key={brand._id} className="h-7 inline-flex items-center px-2.5 rounded-md bg-md-secondary-container text-md-on-secondary-container text-xs font-medium whitespace-nowrap">
                {translateDBVal("Brand", "name", brand.name, lang)}
              </span>
            ))}
            {(selectedCategoryObjects.length > 0 || selectedBrandObjects.length > 0) && (
              <button 
                onClick={() => { clearCategoryFilters(); clearBrandFilters(); }} 
                className="h-7 inline-flex items-center px-2.5 rounded-md bg-md-error text-md-on-error hover:bg-md-error/90 transition-colors text-xs font-bold whitespace-nowrap"
              >
                {t('common.clear')}
              </button>
            )}
          </div>
        </div>
        
        {/* Sort Options */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-md-on-surface-variant font-medium text-xs uppercase tracking-wide">{t('searchResults.sorting.label')}</span>
          <div className="flex gap-2">
            {['name', 'price', 'discount'].map(key => (
              <button 
                key={key} 
                onClick={() => handleSortClick(key)} 
                className={`
                  h-8 px-3 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-1.5 border
                  ${filters.sortBy === key 
                    ? 'bg-md-secondary-container border-md-secondary-container text-md-on-secondary-container' // Active Sort
                    : 'bg-md-surface border-md-outline-variant text-md-on-surface hover:bg-md-surface-container-high' // Inactive Sort
                  }
                `}
              >
                {t(`searchResults.sorting.${key}`)}
                {filters.sortBy === key && (
                  filters.sortOrder === 'asc' ?
                    <ChevronUp size={14} className="flex-shrink-0" /> :
                    <ChevronDown size={14} className="flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Info */}
      <section className="px-4 pt-4 pb-2">
        {loadingProducts ? (
          <p className="text-md-on-surface font-medium flex items-center gap-2">
            <span>{t('common.loading') || 'Loading'}</span>
            <span className="inline-flex gap-0.5">
              <span className="animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s' }}>.</span>
            </span>
          </p>
        ) : (
          <p className="text-md-on-surface font-medium truncate">
            {t(totalResults === 1 ? 'searchResults.summary.resultFound' : 'searchResults.summary.resultsFound').replace('{{count}}', totalResults)}
            {searchQuery && (
              <span className="text-md-on-surface-variant font-normal">
                {' '}{t('searchResults.summary.for')}{' '}
                <span className="font-semibold italic text-md-on-surface">"{searchQuery}"</span>
              </span>
            )}
          </p>
        )}
      </section>

      {/* Results List */}
      <section className="p-4">
        <div className="space-y-3">
          {loadingProducts ? (
            Array.from({ length: 5 }).map((_, i) => <ItemCardSkeleton key={i} />)
          ) : productsError ? (
            <p className="text-center text-md-error p-8">{t('searchResults.results.error')}</p>
          ) : currentResults.length === 0 ? (
            <p className="text-center text-md-on-surface-variant p-8 italic">{t('searchResults.results.noResults')}</p>
          ) : (
            currentResults.map((item) => (
              <div key={item._id}>
                <ItemCard item={mapApiItemToCard(item)} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Pagination */}
      {totalResults > pageSize && (
        <MobilePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </main>
  )

  return (
    <Layout
      header={
        <>
          <SearchHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
            t={t}
            navigate={navigate}
            onVoiceClick={() => setVoiceModalOpen(true)}
            isVoiceOpen={isVoiceModalOpen}
            lang={lang}
          />
          <VoiceInputModal
            isOpen={isVoiceModalOpen}
            onClose={() => setVoiceModalOpen(false)}
            onConfirm={handleVoiceConfirm}
            confirmLabel={t('voiceModal.actions.confirmSearch')}
          />
        </>
      }
      footer={<BottomNav />}
    >
      <SearchContent />
      <FilterModal isOpen={isFilterModalOpen} onClose={() => setFilterModalOpen(false)} initialFilters={filters} applyFilters={setFilters} categories={sortedCategories} brands={sortedBrands} t={t} lang={lang} translateDBVal={translateDBVal} />
    </Layout>
  )
}