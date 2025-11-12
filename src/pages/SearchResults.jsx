import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Search as SearchIcon, SlidersHorizontal } from 'lucide-react'
import ItemCard from '../component/ItemCard'
import { useProducts } from '../api'
import { useData } from '../context/DataContext'
import { useI18n } from '../context/I18nContext'
import useTranslations from '../hooks/useTranslations'

// Reusable component for Sort Buttons for cleaner code
const SortButton = ({ sortKey, label, currentSort, currentOrder, onClick }) => {
  const isActive = currentSort === sortKey
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 px-4 py-2 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-blue-500 text-white shadow-sm'
          : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-50 hover:bg-gray-200 dark:hover:bg-slate-700'
      }`}
    >
      <span>{label}</span>
      {isActive && (
        <span className="text-xs opacity-80">{currentOrder === 'asc' ? '▲' : '▼'}</span>
      )}
    </button>
  )
}

export default function SearchResults() {
  const { t, lang } = useI18n()

  // Simple template formatter for "{{var}}" tokens in locale strings
  const fmt = (template, vars = {}) => {
    if (!template || typeof template !== 'string') return template ?? ''
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : ''))
  }

  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    sortBy: 'relevance',
    discount: false,
    inStock: false,
    sortOrder: 'asc'
  })
  const { translateDBVal } = useTranslations()

  // --- Logic remains the same, only JSX and styling are updated below ---

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() })
      setCurrentPage(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const apiParams = useMemo(() => {
    const p = {}
    if (searchTerm && searchTerm.trim()) p.name = searchTerm.trim()
    if (filters.category) p.categories = filters.category
    if (filters.inStock) p.instock = true
    return p
  }, [searchTerm, filters.category, filters.inStock])

  const { data: apiData, loading: loadingProducts, error: productsError } = useProducts(apiParams, { immediate: true })

  const filteredResults = useMemo(() => {
    let results = Array.isArray(apiData) ? apiData.slice() : []
    if (filters.discount) {
      results = results.filter(it => (it.discountedPrice ?? it.price) < (it.price ?? it.originalPrice))
    }
    return results
  }, [apiData, filters.discount])

  const sortedResults = useMemo(() => {
    const arr = filteredResults.slice()
    const dir = filters.sortOrder === 'asc' ? 1 : -1
    if (!filters.sortBy || filters.sortBy === 'relevance') return arr
    arr.sort((a, b) => {
      const getPrice = (it) => Number(it.discountedPrice ?? it.price ?? 0)
      if (filters.sortBy === 'price') return dir * (getPrice(a) - getPrice(b))
      if (filters.sortBy === 'discount') {
        const getOriginal = (it) => Number(it.price ?? it.originalPrice ?? getPrice(it))
        const da = (getOriginal(a) - getPrice(a)) / (getPrice(a) || 1)
        const db = (getOriginal(b) - getPrice(b)) / (getPrice(b) || 1)
        return dir * (da - db)
      }
      if (filters.sortBy === 'name') return dir * (a.name ?? a.title ?? '').localeCompare(b.name ?? b.title ?? '')
      return 0
    })
    return arr
  }, [filteredResults, filters.sortBy, filters.sortOrder])

  const { categories } = useData()
  const sortedCategories = useMemo(() => {
    if (!Array.isArray(categories)) return []
    return categories.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [categories])

  const mapApiItemToCard = (it) => ({
    id: it._id ?? it.id,
    title: it.name ?? it.title,
    price: it.discountedPrice ?? it.price,
    originalPrice: it.price ?? it.originalPrice,
    category: it.category?.name ?? it.categoryName,
    inStock: (typeof it.stockQuantity === 'number') ? (it.stockQuantity - (it.reservedQuantity || 0) > 0) : it.inStock,
    image: Array.isArray(it.images) && it.images.length ? it.images[0] : (it.image || (it.photos && it.photos[0]))
  })

  const pageSize = 10
  const totalResults = sortedResults.length
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize))
  const currentResults = sortedResults.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => { setCurrentPage(1) }, [filters])

  const hasActiveFilters = filters.category || filters.inStock || filters.discount
  
  const handleSortClick = (sortBy) => {
    if (filters.sortBy === sortBy) {
      setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
    } else {
      setFilters({ ...filters, sortBy: sortBy, sortOrder: sortBy === 'discount' ? 'desc' : 'asc' })
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      
      {/* Page Header: Standardized to match Settings/Accessibility pages. */}
      <header className="sticky top-0 z-20 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800">
        <form onSubmit={handleSearch} className="max-w-[430px] mx-auto p-2 sm:p-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={t('searchResults.header.backButtonAriaLabel')}
            className="min-h-11 min-w-11 flex-shrink-0 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-50 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="relative flex-1">
            {/* Input Field: Styled according to the design guidelines. */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchResults.header.placeholder')}
              className="w-full pl-4 pr-12 h-12 border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <button
              type="submit"
              aria-label={t('searchResults.header.searchButtonAriaLabel')}
              className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-500 transition-colors"
            >
              <SearchIcon size={20} />
            </button>
          </div>
        </form>
      </header>

      <main className="pb-24">
        {/* Search Info & Filter Toggle */}
        <section className="p-4 border-b border-gray-200 dark:border-slate-800">
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
            {fmt(t('searchResults.summary.showingResultsFor'), { query: searchParams.get('q') ?? '' })}
          </p>
          <div className="flex justify-between items-center gap-3">
            <p className="font-medium text-gray-900 dark:text-slate-50">
              {fmt(t(totalResults === 1 ? 'searchResults.summary.resultsFound_one' : 'searchResults.summary.resultsFound_other'), { count: totalResults })}
            </p>
            {/* Filter Toggle: Styled as a secondary button. */}
            <button
              onClick={() => setShowFilters(prev => !prev)}
              className="min-h-11 px-4 py-2 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-50 font-medium rounded-lg transition-all duration-200"
            >
              <SlidersHorizontal size={18} />
              <span>{t('searchResults.summary.filtersButton')}</span>
            </button>
          </div>
        </section>

        {/* Filters Panel: Appears as a distinct card when active. */}
        {showFilters && (
          <section className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-slate-50">{t('searchResults.filterPanel.categoryLabel')}</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('searchResults.filterPanel.allCategories')}</option>
                  {(sortedCategories || []).map(c => (
                    <option key={c._id ?? c.id} value={c._id ?? c.id}>{translateDBVal("Category", "name", c.name, lang)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-50">{t('searchResults.filterPanel.inStockLabel')}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.discount}
                    onChange={(e) => setFilters({ ...filters, discount: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-50">{t('searchResults.filterPanel.onDiscountLabel')}</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full min-h-12 px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200"
                >{t('searchResults.filterPanel.applyButton')}</button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full min-h-12 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-50 font-medium rounded-lg transition-all duration-200"
                >{t('searchResults.filterPanel.closeButton')}</button>
              </div>
            </div>
          </section>
        )}

        {/* Active Filters & Sorting */}
        <section className="p-4 border-b border-gray-200 dark:border-slate-800 space-y-4">
          {/* Active Filter Pills: Using rounded-full for a modern look. */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-600 dark:text-slate-400">{t('searchResults.activeFilters.label')}</span>
              {filters.category && (
                <span className="text-xs font-medium bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-slate-200 px-3 py-1.5 rounded-full">
                 {translateDBVal("Category", "name", categories.find(c => c._id === filters.category)?.name, lang) || t('searchResults.activeFilters.categoryFallback')}
                </span>
              )}
              {filters.inStock && <span className="text-xs font-medium bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-slate-200 px-3 py-1.5 rounded-full">{t('searchResults.activeFilters.inStock')}</span>}
              {filters.discount && <span className="text-xs font-medium bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-slate-200 px-3 py-1.5 rounded-full">{t('searchResults.activeFilters.discount')}</span>}
              <button
                onClick={() => setFilters({ category: '', sortBy: 'relevance', discount: false, inStock: false, sortOrder: 'asc' })}
                className="text-sm text-red-600 dark:text-red-500 hover:underline ml-auto"
              >
                {t('searchResults.activeFilters.clearAllButton')}
              </button>
            </div>
          )}

          {/* Sort Toggles */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-slate-50">{t('searchResults.sorting.label')}</label>
            <div className="flex gap-2 flex-wrap">
              <SortButton sortKey="price" label={t('searchResults.sorting.price')} currentSort={filters.sortBy} currentOrder={filters.sortOrder} onClick={() => handleSortClick('price')} />
              <SortButton sortKey="discount" label={t('searchResults.sorting.discount')} currentSort={filters.sortBy} currentOrder={filters.sortOrder} onClick={() => handleSortClick('discount')} />
              <SortButton sortKey="name" label={t('searchResults.sorting.name')} currentSort={filters.sortBy} currentOrder={filters.sortOrder} onClick={() => handleSortClick('name')} />
            </div>
          </div>
        </section>

        {/* Results List */}
        <section className="p-4">
          <div className="space-y-4">
            {loadingProducts && <p className="text-center text-gray-600 dark:text-slate-400 p-8">{t('searchResults.results.loading')}</p>}
            {productsError && <p className="text-center text-red-600 dark:text-red-500 p-8">{t('searchResults.results.error')}</p>}
            {!loadingProducts && currentResults.length === 0 && (
              <p className="text-center text-gray-600 dark:text-slate-400 p-8">{t('searchResults.results.noResults')}</p>
            )}
            {!loadingProducts && currentResults.map((item) => (
              <div key={item._id ?? item.id} onClick={() => navigate('/product', { state: { product: item } })}>
                <ItemCard item={mapApiItemToCard(item)} />
              </div>
            ))}
          </div>
        </section>

        {/* Pagination: Standardized active, inactive, and disabled states. */}
        {totalResults > pageSize && (
          <nav className="flex justify-center items-center gap-2 p-4 mt-4 border-t border-gray-200 dark:border-slate-800">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label={t('searchResults.pagination.previousButtonAriaLabel')}
              className="min-h-11 min-w-11 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-50 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >←</button>
            
            <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
              {fmt(t('searchResults.pagination.pageInfo'), { currentPage, totalPages })}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label={t('searchResults.pagination.nextButtonAriaLabel')}
              className="min-h-11 min-w-11 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-50 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >→</button>
          </nav>
        )}
      </main>
    </div>
  )
}