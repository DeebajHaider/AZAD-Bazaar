import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Search as SearchIcon, SlidersHorizontal } from 'lucide-react'
import ItemCard from '../component/ItemCard'
import { useProducts } from '../api'
import { useData } from '../context/DataContext'

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    priceRange: '',
    sortBy: 'relevance',
    discount: false,
    inStock: false,
    sortOrder: 'asc'
  })

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() })
      setCurrentPage(1)
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Build API params for backend
  const apiParams = useMemo(() => {
    const p = {}
    if (searchTerm && searchTerm.trim()) p.name = searchTerm.trim()
    if (filters.category) p.categories = filters.category
    if (filters.inStock) p.instock = true
    // We do final sorting client-side (so toggles work for asc/desc and discount sorting)
    return p
  }, [searchTerm, filters.category, filters.inStock, filters.sortBy])

  const { data: apiData, loading: loadingProducts, error: productsError, refetch } = useProducts(apiParams, { immediate: true })

  // Client-side post-filters (discount) and pagination because backend doesn't have discount filter
  const filteredResults = useMemo(() => {
    const items = Array.isArray(apiData) ? apiData.slice() : []
    let results = items
    if (filters.discount) {
      results = results.filter(it => {
        const price = it.discountedPrice ?? it.price ?? it.cost
        const original = it.price ?? it.originalPrice ?? price
        return typeof original === 'number' && typeof price === 'number' && price < original
      })
    }
    return results
  }, [apiData, filters.discount])

  // Client-side sorting (name, price, discount, brand)
  const sortedResults = useMemo(() => {
    const arr = filteredResults.slice()
    const dir = filters.sortOrder === 'asc' ? 1 : -1
    if (!filters.sortBy || filters.sortBy === 'relevance') return arr

    arr.sort((a, b) => {
      const getPrice = (it) => Number(it.discountedPrice ?? it.price ?? 0)
      const getOriginal = (it) => Number(it.price ?? it.originalPrice ?? getPrice(it))
      if (filters.sortBy === 'price') {
        return dir * (getPrice(a) - getPrice(b))
      }
      if (filters.sortBy === 'discount') {
        // Discount metric: (originalPrice - discountedPrice) / discountedPrice
        // If discountedPrice is 0 or missing, fall back to 1 to avoid division by zero.
        const pa = getPrice(a) || 1
        const pb = getPrice(b) || 1
        const da = (getOriginal(a) - pa) / pa
        const db = (getOriginal(b) - pb) / pb
        return dir * (da - db)
      }
      if (filters.sortBy === 'name') {
        const na = (a.name ?? a.title ?? '').toString().toLowerCase()
        const nb = (b.name ?? b.title ?? '').toString().toLowerCase()
        return dir * na.localeCompare(nb)
      }
      if (filters.sortBy === 'brand') {
        const ba = (a.brand && a.brand.name) ? a.brand.name : (a.brandName ?? '')
        const bb = (b.brand && b.brand.name) ? b.brand.name : (b.brandName ?? '')
        return dir * ba.toString().toLowerCase().localeCompare(bb.toString().toLowerCase())
      }
      return 0
    })
    return arr
  }, [filteredResults, filters.sortBy, filters.sortOrder])

  const { categories, brands } = useData()

  // Category visibility: show only root categories (no parents) initially, sorted by name.
  const sortedCategories = useMemo(() => {
    if (!Array.isArray(categories)) return []
    return categories.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [categories])

  const rootCategories = useMemo(() => sortedCategories.filter(c => !c.parentCategoryIds || c.parentCategoryIds.length === 0), [sortedCategories])
  const extraCategories = useMemo(() => sortedCategories.filter(c => c.parentCategoryIds && c.parentCategoryIds.length > 0), [sortedCategories])

  const [visibleCategories, setVisibleCategories] = useState(rootCategories)
  const [showMore, setShowMore] = useState(false)

  // Keep visibleCategories in sync when categories change (but preserve when showMore already clicked)
  useEffect(() => {
    setVisibleCategories(prev => (showMore ? [...rootCategories, ...extraCategories] : rootCategories))
  }, [rootCategories, extraCategories, showMore])

  const handleShowMore = () => {
    setVisibleCategories(prev => {
      // append extra categories after existing list
      const ids = new Set(prev.map(p => p._id ?? p.id))
      const toAppend = extraCategories.filter(c => !ids.has(c._id ?? c.id))
      return [...prev, ...toAppend]
    })
    setShowMore(true)
  }

  // Helpers
  const mapApiItemToCard = (it) => {
    return {
      id: it._id ?? it.id,
      title: it.name ?? it.title,
      price: it.discountedPrice ?? it.price,
      originalPrice: it.price ?? it.originalPrice,
      rating: it.rating,
      reviews: it.reviewsCount ?? it.reviews,
      category: it.category?.name ?? it.categoryName,
      inStock: (typeof it.stockQuantity === 'number') ? (it.stockQuantity - (it.reservedQuantity || 0) > 0) : it.inStock,
      stock: it.stockQuantity ?? it.stockCount ?? it.stock,
      image: Array.isArray(it.images) && it.images.length ? it.images[0] : (it.image || (it.photos && it.photos[0]))
    }
  }

  // Pagination (client-side)
  const pageSize = 10
  const totalResults = filteredResults.length
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize))
  const currentResults = sortedResults.slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize)

  // When filters change, reset to first page to avoid out-of-range currentPage
  useEffect(() => {
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.priceRange, filters.discount, filters.inStock, filters.sortBy, filters.sortOrder])

  // Filter panel will be rendered inline below the info area (dropdown style)

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      {/* Search Header */}
      <form onSubmit={handleSearch} className="sticky top-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] p-2 flex items-center gap-3 z-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1 bg-transparent border-none cursor-pointer text-[var(--color-text-primary)] flex items-center"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for items..."
            className="flex-1 py-2 px-4 bg-[var(--color-surface-alt)] rounded-md text-[var(--color-text-primary)] border-none outline-none text-base"
          />
          <button
            type="submit"
            className="flex items-center justify-center px-4 bg-[var(--color-primary-500)] text-white rounded-md hover:bg-[var(--color-primary-600)] transition-colors"
          >
            <SearchIcon size={20} />
          </button>
        </div>
      </form>

      {/* Search Info */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <p className="text-[var(--color-text-secondary)] mb-2">
          Search results for "{searchParams.get('q')}"
        </p>
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-[var(--color-text-muted)]">
            {totalResults} results found
          </p>
          <button
            onClick={() => setShowFilters(prev => !prev)}
            className="flex items-center gap-2 py-2 px-4 bg-[var(--color-surface-alt)] rounded-md hover:bg-[var(--color-gray-200)] transition-colors"
          >
            <SlidersHorizontal size={20} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Active filters badges */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.category && (
            <span className="text-sm bg-[var(--color-primary-500)] text-white px-3 py-1 rounded-md">Category: {(() => {
              const c = (categories || []).find(x => x._id === filters.category || x.id === filters.category)
              return c ? c.name : filters.category.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase())
            })()}</span>
          )}
          {filters.inStock && (
            <span className="text-sm bg-[var(--color-primary-500)] text-white px-3 py-1 rounded-md">In stock</span>
          )}
          {filters.discount && (
            <span className="text-sm bg-[var(--color-primary-500)] text-white px-3 py-1 rounded-md">On discount</span>
          )}
          {(filters.category || filters.inStock || filters.discount) && (
            <button
              onClick={() => { setFilters({ category: '', priceRange: '', sortBy: 'relevance', discount: false, inStock: false, sortOrder: 'asc' }); setCurrentPage(1) }}
              className="text-sm text-[var(--color-danger)] hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filters dropdown area */}
      {showFilters && (
        <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
                <label className="block text-sm mb-2 font-medium">Category</label>
                <div>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="form-select w-full"
                  >
                    <option value="">All Categories</option>
                    {(visibleCategories || []).map(c => (
                      <option key={c._id ?? c.id} value={c._id ?? c.id}>{c.name}</option>
                    ))}
                  </select>
                  {/* Show more control appended below the select */}
                  {extraCategories && extraCategories.length > 0 && !showMore && (
                    <div className="mt-2">
                      <button type="button" onClick={() => handleShowMore()} className="text-sm text-[var(--color-primary-500)]">Show more categories</button>
                    </div>
                  )}
                </div>
            </div>

            <div>
              <label className="block text-sm mb-2 font-medium">Options</label>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="text-sm">Only in stock</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.discount}
                  onChange={(e) => setFilters({ ...filters, discount: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="text-sm">Only discounted</span>
              </label>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => { setShowFilters(false); setCurrentPage(1) }}
              className="px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-md"
            >Apply</button>
            <button
              onClick={() => { setShowFilters(false) }}
              className="px-4 py-2 bg-[var(--color-surface-alt)] rounded-md"
            >Close</button>
          </div>
        </div>
      )}

      {/* Sorting options */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">Sort by:</span>
          <div className="inline-flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (filters.sortBy === 'price') {
                  setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
                } else {
                  setFilters({ ...filters, sortBy: 'price', sortOrder: 'asc' })
                }
              }}
              className={`px-3 py-1 rounded-md flex items-center gap-2 text-sm ${filters.sortBy === 'price' ? 'bg-[var(--color-primary-500)] text-white' : 'bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>
              <span>Price</span>
              {filters.sortBy === 'price' && (
                <span className="text-xs">{filters.sortOrder === 'asc' ? '▲' : '▼'}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (filters.sortBy === 'discount') {
                  setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
                } else {
                  setFilters({ ...filters, sortBy: 'discount', sortOrder: 'desc' })
                }
              }}
              className={`px-3 py-1 rounded-md flex items-center gap-2 text-sm ${filters.sortBy === 'discount' ? 'bg-[var(--color-primary-500)] text-white' : 'bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>
              <span>Discount</span>
              {filters.sortBy === 'discount' && (
                <span className="text-xs">{filters.sortOrder === 'asc' ? '▲' : '▼'}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (filters.sortBy === 'name') {
                  setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
                } else {
                  setFilters({ ...filters, sortBy: 'name', sortOrder: 'asc' })
                }
              }}
              className={`px-3 py-1 rounded-md flex items-center gap-2 text-sm ${filters.sortBy === 'name' ? 'bg-[var(--color-primary-500)] text-white' : 'bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>
              <span>Name</span>
              {filters.sortBy === 'name' && (
                <span className="text-xs">{filters.sortOrder === 'asc' ? '▲' : '▼'}</span>
              )}
            </button>

            {/* Rating sort removed because rating is not available */}
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="p-4">
        <div className="space-y-4">
          {loadingProducts && <div className="p-4">Loading products...</div>}
          {productsError && <div className="p-4 text-red-600">Error loading products</div>}
          {!loadingProducts && currentResults.map((item) => (
            <div key={item._id ?? item.id} onClick={() => navigate('/product', { state: { product: item } })}>
              <ItemCard item={mapApiItemToCard(item)} />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalResults > 0 && (
        <div className="flex justify-center items-center gap-2 p-4 border-t border-[var(--color-border)]">
          {/* Previous button */}
          <button
            onClick={() => {
              if (currentPage > 1) {
                setCurrentPage(currentPage - 1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-md ${
              currentPage === 1
                ? 'bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] cursor-not-allowed'
                : 'bg-[var(--color-surface-alt)] text-[var(--color-text-primary)] hover:bg-[var(--color-primary-500)] hover:text-white'
            }`}
          >
            ←
          </button>

          {/* Page numbers */}
          {(() => {
            const totalPages = Math.ceil(totalResults / pageSize)
            const pageNumbers = []
            
            // Always show first page
            pageNumbers.push(1)
            
            if (currentPage > 3) {
              pageNumbers.push('...')
            }
            
            // Show one page before current unless it's first/second page
            if (currentPage > 2) {
              pageNumbers.push(currentPage - 1)
            }
            
            // Show current page unless it's first or last
            if (currentPage !== 1 && currentPage !== totalPages) {
              pageNumbers.push(currentPage)
            }
            
            // Show one page after current unless it's last/second-to-last page
            if (currentPage < totalPages - 1) {
              pageNumbers.push(currentPage + 1)
            }
            
            if (currentPage < totalPages - 2) {
              pageNumbers.push('...')
            }
            
            // Always show last page
            if (totalPages > 1) {
              pageNumbers.push(totalPages)
            }
            
            return pageNumbers.map((pageNum, index) => (
              pageNum === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-[var(--color-text-muted)]">...</span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => {
                    setCurrentPage(pageNum)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === pageNum
                      ? 'bg-[var(--color-primary-500)] text-white'
                      : 'bg-[var(--color-surface-alt)] text-[var(--color-text-primary)] hover:bg-[var(--color-primary-500)] hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              )
            ))
          })()}

          {/* Next button */}
          <button
            onClick={() => {
              const totalPages = Math.ceil(totalResults / pageSize)
              if (currentPage < totalPages) {
                setCurrentPage(currentPage + 1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
              disabled={currentPage === Math.ceil(totalResults / pageSize)}
            className={`px-3 py-2 rounded-md ${
                currentPage === Math.ceil(totalResults / pageSize)
                ? 'bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] cursor-not-allowed'
                : 'bg-[var(--color-surface-alt)] text-[var(--color-text-primary)] hover:bg-[var(--color-primary-500)] hover:text-white'
            }`}
          >
            →
          </button>
        </div>
      )}

  {/* No floating panel — filters handled inline */}
    </div>
  )
}