import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Search as SearchIcon, X, ChevronUp, ChevronDown } from 'lucide-react'
import ItemCard from '../component/ItemCard'
import { useProducts } from '../api'
import { useData } from '../context/DataContext'
import { useI18n } from '../context/I18nContext'
import useTranslations from '../hooks/useTranslations'

// --- Category Filter Modal Component ---
const CategoryModal = ({ isOpen, onClose, initialFilters, applyFilters, categories, t, lang, translateDBVal }) => {
  if (!isOpen) return null

  const [tempCategories, setTempCategories] = useState(initialFilters.categories)

  const specialFilters = [
    { _id: 'inStock', name: t('searchResults.filterPanel.inStockLabel') },
    { _id: 'onDiscount', name: t('searchResults.filterPanel.onDiscountLabel') },
  ]

  const handleToggleCategory = (catId) => {
    setTempCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    )
  }

  const handleApply = () => {
    applyFilters({ ...initialFilters, categories: tempCategories })
    onClose()
  }
  
  const handleClear = () => {
    setTempCategories([])
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

  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [currentPage, setCurrentPage] = useState(1)
  
  // Refactored filter state for new UI
  const [filters, setFilters] = useState({
    categories: [], // Can include 'inStock', 'onDiscount', and category IDs
    sortBy: 'name',
    sortOrder: 'asc'
  })

  // --- Core Logic (largely unchanged, adapted to new filter state) ---

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams(searchTerm.trim() ? { q: searchTerm.trim() } : {})
    setCurrentPage(1)
  }

  const apiParams = useMemo(() => {
    const p = {}
    if (searchTerm && searchTerm.trim()) p.name = searchTerm.trim()
    const realCategories = filters.categories.filter(c => c !== 'inStock' && c !== 'onDiscount')
    if (realCategories.length > 0) p.categories = realCategories.join(',')
    if (filters.categories.includes('inStock')) p.instock = true
    return p
  }, [searchTerm, filters.categories])

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

  const { categories } = useData()
  const sortedCategories = useMemo(() => {
    if (!Array.isArray(categories)) return []
    return categories.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [categories])
  
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

  const mapApiItemToCard = (it) => ({
    id: it._id, title: it.name, price: it.discountedPrice ?? it.price, originalPrice: it.price, category: it.category?.name, inStock: (it.stockQuantity - (it.reservedQuantity || 0) > 0), image: it.images?.[0]
  })

  const pageSize = 10
  const totalResults = sortedResults.length
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize))
  const currentResults = sortedResults.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const searchQuery = searchParams.get('q')

  useEffect(() => { setCurrentPage(1) }, [filters])

  return (
    <div className="min-h-screen primBg">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm dividerBorder">
        <form onSubmit={handleSearch} className="max-w-[430px] mx-auto p-1.5 sm:p-2 flex items-center gap-2">
          <button type="button" onClick={() => navigate(-1)} aria-label={t('searchResults.header.backButtonAriaLabel')} className="btnSecondary h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg">
            <ArrowLeft size={18} />
          </button>
          <div className="relative flex-1">
            <input type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('searchResults.header.placeholder')} className="inputField h-10 pr-10 text-sm" />
            <button type="submit" aria-label={t('searchResults.header.searchButtonAriaLabel')} className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center secText hover:accentPrimText transition-colors">
              <SearchIcon size={18} />
            </button>
          </div>
        </form>
      </header>

      <main className="pb-24">
        {/* New Filter & Sort Section */}
        <section className="p-4 space-y-4 dividerBorder">
            <div className="flex items-center gap-2">
                <button onClick={() => setCategoryModalOpen(true)} className="btnSecondary px-4 py-2 rounded-lg">
                    {t('searchResults.summary.filtersButton')}
                </button>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 py-0.5">
                    {selectedCategoryObjects.map(cat => (
                        <span key={cat._id} className="badgePrimary flex-shrink-0 text-xs py-1 px-2.5">
                            {cat._id === 'inStock' || cat._id === 'onDiscount' ? cat.name : translateDBVal("Category", "name", cat.name, lang)}
                        </span>
                    ))}
                    {selectedCategoryObjects.length > 0 && (
                      <button onClick={clearCategoryFilters} className="badgePrimary flex-shrink-0 !bg-red-500 !text-white hover:!bg-red-600 transition-colors text-xs py-1 px-2.5">
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
            <p className="primText font-medium truncate">
                {t(totalResults === 1 ? 'searchResults.summary.resultFound' : 'searchResults.summary.resultsFound').replace('{{count}}', totalResults)}
                {searchQuery && (
                    <span className="secText font-normal">
                        {' '}{t('searchResults.summary.for')}{' '}
                        <span className="font-semibold italic">"{searchQuery}"</span>
                    </span>
                )}
            </p>
        </section>

        {/* Results List */}
        <section className="p-4">
          <div className="space-y-4">
            {loadingProducts && <p className="text-center secText p-8">{t('searchResults.results.loading')}</p>}
            {productsError && <p className="text-center accentDangerText p-8">{t('searchResults.results.error')}</p>}
            {!loadingProducts && currentResults.length === 0 && (
              <p className="text-center secText p-8">{t('searchResults.results.noResults')}</p>
            )}
            {!loadingProducts && currentResults.map((item) => (
              <div key={item._id} onClick={() => navigate('/product', { state: { product: item } })}>
                <ItemCard item={mapApiItemToCard(item)} />
              </div>
            ))}
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

      <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setCategoryModalOpen(false)} initialFilters={filters} applyFilters={setFilters} categories={sortedCategories} t={t} lang={lang} translateDBVal={translateDBVal} />
    </div>
  )
}