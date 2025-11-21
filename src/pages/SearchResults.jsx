import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Search as SearchIcon, X, ChevronUp, ChevronDown } from 'lucide-react'
import ItemCard from '../component/ItemCard'
import { useProducts, useBrands } from '../api'
import { useData } from '../context/DataContext'
import { useI18n } from '../context/I18nContext'
import useTranslations from '../hooks/useTranslations'
import { Layout } from '../Layout'
import BottomNav from '../component/BottomNav'
import useDebounce from '../hooks/useDebounce'

const ItemCardSkeleton = () => (
  <div className="flex items-start gap-4 p-3 rounded-lg secBg primBorder">
    <div className="w-24 h-24 skeleton rounded-md flex-shrink-0"></div>
    <div className="flex-1 space-y-2">
      <div className="h-5 w-3/4 skeleton"></div>
      <div className="h-4 w-1/4 skeleton"></div>
      <div className="h-6 w-1/2 skeleton"></div>
    </div>
  </div>
)

// Header component with search form
const SearchHeader = ({ searchTerm, setSearchTerm, handleSearch, t, navigate }) => (
  <header className="secBg dividerBorder p-4">
    <div className="max-w-[430px] mx-auto">
      <form onSubmit={handleSearch} className="flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} aria-label={t('searchResults.header.backButtonAriaLabel')} className="min-h-11 min-w-11 flex items-center justify-center rounded-lg btnSecondary flex-shrink-0">
          <ArrowLeft size={20} />
        </button>
        <div className="relative flex-1">
          <input type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('searchResults.header.placeholder')} className="inputField h-11 pr-11 text-sm w-full" />
          <button type="submit" aria-label={t('searchResults.header.searchButtonAriaLabel')} className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center secText hover:accentPrimText transition-colors">
            <SearchIcon size={20} />
          </button>
        </div>
      </form>
    </div>
  </header>
)

// --- Category Filter Modal Component ---
const FilterModal = ({ isOpen, onClose, initialFilters, applyFilters, categories, brands, t, lang, translateDBVal }) => {
  if (!isOpen) return null

  const [tempCategories, setTempCategories] = useState(initialFilters.categories)
  const [tempBrands, setTempBrands] = useState(initialFilters.brands)

  const specialFilters = [
    { _id: 'inStock', name: t('searchResults.filterPanel.inStockLabel') },
    { _id: 'onDiscount', name: t('searchResults.filterPanel.onDiscountLabel') },
  ]

  const handleToggleCategory = (catId) => {
    setTempCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    )
  }

  const handleToggleBrand = (brandId) => {
    setTempBrands(prev =>
      prev.includes(brandId) ? prev.filter(id => id !== brandId) : [...prev, brandId]
    )
  }

  const handleApply = () => {
    applyFilters({ ...initialFilters, categories: tempCategories, brands: tempBrands })
    onClose()
  }
  
  const handleClear = () => {
    setTempCategories([])
    setTempBrands([])
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="secBg rounded-2xl p-4 space-y-4 max-h-[85vh] flex flex-col max-w-[430px] w-full" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center pb-3 dividerBorder flex-shrink-0">
           <h2 className="text-xl font-bold primText">{t('searchResults.filterPanel.title')}</h2>
           <button onClick={onClose} aria-label={t('common.close')} className="btnSecondary rounded-full !p-0 h-10 w-10 flex items-center justify-center">
             <X size={20} />
           </button>
        </header>
        
        <main className="overflow-y-auto space-y-4 flex-grow">
            {/* Appended Special Filters as per request */}
            <div>
                <h3 className="font-semibold primText mb-2">{t('searchResults.filterPanel.quickFilters')}</h3>
                <div className="flex flex-wrap gap-2">
                    {specialFilters.map(filter => {
                        const isSelected = tempCategories.includes(filter._id)
                        return (
                          <button key={filter._id} onClick={() => handleToggleCategory(filter._id)} className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${isSelected ? 'modeChooseButton-selected' : 'modeChooseButton-unselected'}`}>
                            {filter.name}
                          </button>
                        )
                    })}
                </div>
            </div>

            {/* Product Categories */}
            <div>
                <h3 className="font-semibold primText mb-2">{t('searchResults.filterPanel.categoryLabel')}</h3>
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => {
                         const isSelected = tempCategories.includes(cat._id)
                         return (
                           <button key={cat._id} onClick={() => handleToggleCategory(cat._id)} className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${isSelected ? 'modeChooseButton-selected' : 'modeChooseButton-unselected'}`}>
                             {translateDBVal("Category", "name", cat.name, lang)}
                           </button>
                         )
                    })}
                </div>
            </div>

            {/* Product Brands */}
            <div>
                <h3 className="font-semibold primText mb-2">{t('searchResults.filterPanel.brandLabel')}</h3>
                <div className="flex flex-wrap gap-2">
                    {brands.map(brand => {
                         const isSelected = tempBrands.includes(brand._id)
                         return (
                           <button key={brand._id} onClick={() => handleToggleBrand(brand._id)} className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${isSelected ? 'modeChooseButton-selected' : 'modeChooseButton-unselected'}`}>
                             {translateDBVal("Brand", "name", brand.name, lang)}
                           </button>
                         )
                    })}
                </div>
            </div>
        </main>

        <footer className="flex gap-3 pt-3 border-t dividerBorder flex-shrink-0">
           <button onClick={handleClear} className="w-full min-h-12 btnSecondary rounded-lg">{t('searchResults.activeFilters.clearAllButton')}</button>
           <button onClick={handleApply} className="w-full min-h-12 btnPrimary rounded-lg">{t('searchResults.filterPanel.applyButton')}</button>
        </footer>
      </div>
    </div>
  )
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
  
  // Refactored filter state for new UI
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

  // --- Core Logic (largely unchanged, adapted to new filter state) ---

  const handleSearch = (e) => {
    e.preventDefault()
    // Force immediate search, bypassing debounce
    const newSearchParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      newSearchParams.set('q', searchTerm.trim());
    } else {
      newSearchParams.delete('q');
    }
    setSearchParams(newSearchParams, { replace: true });
    setCurrentPage(1)
  }

  const apiParams = useMemo(() => {
    const p = {}
    const query = searchParams.get('q')
    if (query) p.name = query
    const realCategories = filters.categories.filter(c => c !== 'inStock' && c !== 'onDiscount')
    if (realCategories.length > 0) p.categories = realCategories.join(',')
    if (filters.brands.length > 0) p.brands = filters.brands.join(',')
    if (filters.categories.includes('inStock')) p.instock = true
    return p
  }, [searchParams, filters.categories, filters.brands])

  const { data: apiData, loading: loadingProducts, error: productsError } = useProducts(apiParams, { immediate: true })

  const filteredResults = useMemo(() => {
    let results = Array.isArray(apiData) ? apiData.slice() : []
    if (filters.categories.includes('onDiscount')) {
      results = results.filter(it => (it.discountedPrice ?? it.price) < (it.price ?? it.originalPrice))
    }
    return results
  }, [apiData, filters.categories])

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

  const clearCategoryFilters = () => {
    setFilters(prev => ({ ...prev, categories: [] }))
  }

  const clearBrandFilters = () => {
    setFilters(prev => ({ ...prev, brands: [] }))
  }

  const mapApiItemToCard = (it) => ({
    id: it._id,
    title: it.name,
    // displayed price: prefer discountedPrice, fall back to price
    price: it.discountedPrice ?? it.price,
    // originalPrice may be provided as `originalPrice`; fall back to `price` when absent
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
    <main className="flex-1 overflow-y-auto primBg min-h-full">
      {/* New Filter & Sort Section */}
      <section className="p-4 space-y-4 dividerBorder">
        <div className="flex items-center gap-2">
          <button onClick={() => setFilterModalOpen(true)} className="btnSecondary px-4 py-2 rounded-lg">
            {t('searchResults.summary.filtersButton')}
          </button>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 py-0.5">
            {selectedCategoryObjects.map(cat => (
              <span key={cat._id} className="badgePrimary flex-shrink-0 text-xs py-1 px-2.5">
                {cat._id === 'inStock' || cat._id === 'onDiscount' ? cat.name : translateDBVal("Category", "name", cat.name, lang)}
              </span>
            ))}
            {selectedBrandObjects.map(brand => (
              <span key={brand._id} className="badgePrimary flex-shrink-0 text-xs py-1 px-2.5">
                {translateDBVal("Brand", "name", brand.name, lang)}
              </span>
            ))}
            {(selectedCategoryObjects.length > 0 || selectedBrandObjects.length > 0) && (
              <button onClick={() => { clearCategoryFilters(); clearBrandFilters(); }} className="badgePrimary flex-shrink-0 !bg-red-500 !text-white hover:!bg-red-600 transition-colors text-xs py-1 px-2.5">
                {t('common.clear')}
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="primText font-medium text-sm">{t('searchResults.sorting.label')}</span>
          <div className="flex gap-2">
            {['name', 'price', 'discount'].map(key => (
              <button key={key} onClick={() => handleSortClick(key)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1.5 ${filters.sortBy === key ? 'accentPrimBg text-white' : 'secBg primText primBorder secHoverBg'}`}>
                {t(`searchResults.sorting.${key}`)}
                {filters.sortBy === key && (
                  filters.sortOrder === 'asc' ? 
                    <ChevronUp size={16} className="flex-shrink-0" /> : 
                    <ChevronDown size={16} className="flex-shrink-0" />
                )}
              </button> 
            ))}
          </div>
        </div>
      </section>

      {/* Results Info */}
      <section className="px-4 pt-4 pb-2">
        {loadingProducts ? (
          <p className="primText font-medium flex items-center gap-2">
            <span>{t('common.loading') || 'Loading'}</span>
            <span className="inline-flex gap-0.5">
              <span className="animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s' }}>.</span>
            </span>
          </p>
        ) : (
          <p className="primText font-medium truncate">
            {t(totalResults === 1 ? 'searchResults.summary.resultFound' : 'searchResults.summary.resultsFound').replace('{{count}}', totalResults)}
            {searchQuery && (
              <span className="secText font-normal">
                {' '}{t('searchResults.summary.for')}{' '}
                <span className="font-semibold italic">"{searchQuery}"</span>
              </span>
            )}
          </p>
        )}
      </section>

      {/* Results List */}
      <section className="p-4">
        <div className="space-y-4">
          {loadingProducts ? (
            Array.from({ length: 5 }).map((_, i) => <ItemCardSkeleton key={i} />)
          ) : productsError ? (
            <p className="text-center accentDangerText p-8">{t('searchResults.results.error')}</p>
          ) : currentResults.length === 0 ? (
            <p className="text-center secText p-8">{t('searchResults.results.noResults')}</p>
          ) : (
            currentResults.map((item) => (
              <div key={item._id} onClick={() => navigate('/product', { state: { product: item } })}>
                <ItemCard item={mapApiItemToCard(item)} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Pagination */}
      {totalResults > pageSize && (
        <nav className="flex justify-center items-center gap-2 p-4 mt-4 dividerBorder">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} aria-label={t('searchResults.pagination.previousButtonAriaLabel')} className="btnSecondary min-h-11 min-w-11 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">←</button>
          <span className="text-sm font-medium secText">
            {t('searchResults.pagination.pageInfo').replace('{{currentPage}}', currentPage).replace('{{totalPages}}', totalPages)}
          </span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} aria-label={t('searchResults.pagination.nextButtonAriaLabel')} className="btnSecondary min-h-11 min-w-11 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">→</button>
        </nav>
      )}
    </main>
  )

  return (
    <Layout
      header={<SearchHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleSearch={handleSearch} t={t} navigate={navigate} />}
      footer={<BottomNav />}
    >
      <SearchContent />
      <FilterModal isOpen={isFilterModalOpen} onClose={() => setFilterModalOpen(false)} initialFilters={filters} applyFilters={setFilters} categories={sortedCategories} brands={sortedBrands} t={t} lang={lang} translateDBVal={translateDBVal} />
    </Layout>
  )
}