import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Search as SearchIcon, SlidersHorizontal } from 'lucide-react'
import ItemCard from '../component/ItemCard'

// Dummy data for demonstration
const DUMMY_RESULTS = [
  {
    id: 1,
    title: 'Fresh Potatoes (1kg)',
    price: 150,
    originalPrice: 180,
    rating: 4.5,
    reviews: 128,
    category: 'Vegetables',
    inStock: true,
    stock: 24,
    image: 'https://placehold.co/300x200'
  },
  {
    id: 2,
    title: 'Dove Soap Bar (Pack of 3)',
    price: 450,
    originalPrice: 550,
    rating: 4.8,
    reviews: 75,
    category: 'Personal Care',
    inStock: true,
    stock: 10,
    image: 'https://placehold.co/300x200'
  },
  {
    id: 3,
    title: 'Brown Rice (2kg)',
    price: 850,
    originalPrice: 950,
    rating: 4.2,
    reviews: 45,
    category: 'Grains',
    inStock: true,
    stock: 8,
    image: 'https://placehold.co/300x200'
  },
  {
    id: 4,
    title: 'Fresh Milk (1L)',
    price: 200,
    originalPrice: 200,
    rating: 4.6,
    reviews: 92,
    category: 'Dairy',
    inStock: false,
    stock: 0,
    image: 'https://placehold.co/300x200'
  },
  {
    id: 5,
    title: 'Chicken Breast (500g)',
    price: 550,
    originalPrice: 650,
    rating: 4.7,
    reviews: 63,
    category: 'Meat',
    inStock: true,
    stock: 6,
    image: 'https://placehold.co/300x200'
  },
  {
    id: 6,
    title: 'Toothpaste (150g)',
    price: 250,
    originalPrice: 300,
    rating: 4.4,
    reviews: 37,
    category: 'Personal Care',
    inStock: true,
    stock: 20,
    image: 'https://placehold.co/300x200'
  },
  {
    id: 7,
    title: 'Tomatoes (500g)',
    price: 80,
    originalPrice: 100,
    rating: 4.3,
    reviews: 82,
    category: 'Vegetables',
    inStock: true,
    stock: 30,
    image: 'https://placehold.co/300x200'
  },
  {
    id: 8,
    title: 'Bread Loaf',
    price: 120,
    originalPrice: 120,
    rating: 4.6,
    reviews: 156,
    category: 'Bakery',
    inStock: false,
    stock: 0,
    image: 'https://placehold.co/300x200'
  },
  {
    id: 9,
    title: 'Eggs (Dozen)',
    price: 300,
    originalPrice: 360,
    rating: 4.8,
    reviews: 203,
    category: 'Dairy',
    inStock: true,
    stock: 12,
    image: 'https://placehold.co/300x200'
  },
  {
    id: 10,
    title: 'Laundry Detergent (2L)',
    price: 1200,
    originalPrice: 1500,
    rating: 4.5,
    reviews: 167,
    category: 'Household',
    inStock: true,
    stock: 5,
    image: 'https://placehold.co/300x200'
  },
  {
    id: 11,
    title: 'Orange Juice (1L)',
    price: 350,
    originalPrice: 400,
    rating: 4.4,
    reviews: 89,
    category: 'Beverages',
    inStock: true,
    stock: 9,
    image: 'https://placehold.co/300x200'
  },
  {
    id: 12,
    title: 'Onions (1kg)',
    price: 90,
    originalPrice: 120,
    rating: 4.2,
    reviews: 71,
    category: 'Vegetables',
    inStock: true,
    stock: 40,
    image: 'https://placehold.co/300x200'
  },
  {
    id: 13,
    title: 'Toilet Paper (12 Rolls)',
    price: 800,
    originalPrice: 950,
    rating: 4.6,
    reviews: 245,
    category: 'Household',
    inStock: true,
    stock: 15,
    image: 'https://placehold.co/300x200'
  },
  {
    id: 14,
    title: 'Yogurt (500g)',
    price: 180,
    originalPrice: 200,
    rating: 4.7,
    reviews: 112,
    category: 'Dairy',
    inStock: true,
    stock: 22,
    image: 'https://placehold.co/300x200'
  },
  {
    id: 15,
    title: 'Banana (1kg)',
    price: 150,
    originalPrice: 180,
    rating: 4.3,
    reviews: 95,
    category: 'Fruits',
    inStock: true,
    stock: 18,
    image: 'https://placehold.co/300x200'
  },
  {
    id: 16,
    title: 'Hand Sanitizer (250ml)',
    price: 220,
    originalPrice: 280,
    rating: 4.5,
    reviews: 178,
    category: 'Personal Care',
    inStock: true,
    stock: 7,
    image: 'https://placehold.co/300x200'
  }
]

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    category: '',
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

  // Apply filters and sorting to results
  const getFilteredResults = () => {
    let results = [...DUMMY_RESULTS]

    // Apply category filter
    if (filters.category) {
      results = results.filter(item => 
        item.category.toLowerCase().replace(/[^a-z0-9]/g, '-') === filters.category
      )
    }

    // Apply price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(str => 
        str === 'plus' ? Infinity : Number(str)
      )
      results = results.filter(item => 
        item.price >= min && (max === Infinity || item.price <= max)
      )
    }


    // Apply discount filter
    if (filters.discount) {
      results = results.filter(item => item.price < item.originalPrice)
    }

    // Apply in-stock filter
    if (filters.inStock) {
      results = results.filter(item => item.inStock)
    }

    // Apply sorting using sortBy and sortOrder
    switch (filters.sortBy) {
      case 'price':
        results.sort((a, b) => (filters.sortOrder === 'asc' ? a.price - b.price : b.price - a.price))
        break
      case 'discount':
        // sort by percentage off
        results.sort((a, b) => {
          const da = (a.originalPrice - a.price) / a.originalPrice
          const db = (b.originalPrice - b.price) / b.originalPrice
          return filters.sortOrder === 'asc' ? da - db : db - da
        })
        break
      case 'rating':
        results.sort((a, b) => (filters.sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating))
        break
      case 'newest':
        // For dummy data, we'll just reverse the order as a simulation
        results.reverse()
        break
      default: // 'relevance' - keep original order
        break
    }

    return results
  }

  // Get results for current page
  const getCurrentPageResults = () => {
    const filteredResults = getFilteredResults()
    const startIndex = (currentPage - 1) * 5
    const endIndex = startIndex + 5
    return filteredResults.slice(startIndex, endIndex)
  }

  // Get total number of results after filtering
  const getTotalResults = () => {
    return getFilteredResults().length
  }

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
            {getTotalResults()} results found
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

      {/* Sorting, active filters and dropdown */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--color-text-secondary)]">Sort by:</span>
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
                className={`px-3 py-1 rounded-md flex items-center gap-2 ${filters.sortBy === 'price' ? 'bg-[var(--color-primary-500)] text-white' : 'bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>
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
                className={`px-3 py-1 rounded-md flex items-center gap-2 ${filters.sortBy === 'discount' ? 'bg-[var(--color-primary-500)] text-white' : 'bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>
                <span>Discount</span>
                {filters.sortBy === 'discount' && (
                  <span className="text-xs">{filters.sortOrder === 'asc' ? '▲' : '▼'}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (filters.sortBy === 'rating') {
                    setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
                  } else {
                    setFilters({ ...filters, sortBy: 'rating', sortOrder: 'desc' })
                  }
                }}
                className={`px-3 py-1 rounded-md flex items-center gap-2 ${filters.sortBy === 'rating' ? 'bg-[var(--color-primary-500)] text-white' : 'bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>
                <span>Rating</span>
                {filters.sortBy === 'rating' && (
                  <span className="text-xs">{filters.sortOrder === 'asc' ? '▲' : '▼'}</span>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Active filter badges */}
            {filters.category && (
              <span className="text-sm bg-[var(--color-surface-alt)] px-2 py-1 rounded-md">Category: {filters.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
            )}
            {filters.inStock && (
              <span className="text-sm bg-[var(--color-surface-alt)] px-2 py-1 rounded-md">In stock</span>
            )}
            {filters.discount && (
              <span className="text-sm bg-[var(--color-surface-alt)] px-2 py-1 rounded-md">On discount</span>
            )}
          </div>
        </div>

        {/* Filters now rendered below as a separate section (toggled) */}
      </div>

      {/* Filters Section (separate from sorting) */}
      {showFilters && (
        <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="form-select w-full"
              >
                <option value="">All Categories</option>
                <option value="vegetables">Vegetables</option>
                <option value="fruits">Fruits</option>
                <option value="dairy">Dairy</option>
                <option value="meat">Meat</option>
                <option value="grains">Grains</option>
                <option value="bakery">Bakery</option>
                <option value="beverages">Beverages</option>
                <option value="personal-care">Personal Care</option>
                <option value="household">Household</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span>Only show items in stock</span>
              </label>

              <label className="flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  checked={filters.discount}
                  onChange={(e) => setFilters({ ...filters, discount: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span>Only show discounted items</span>
              </label>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => { setShowFilters(false); setCurrentPage(1) }}
              className="px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-md"
            >Apply</button>
            <button
              onClick={() => { setFilters({ category: '', priceRange: '', sortBy: 'relevance', discount: false, inStock: false, sortOrder: 'asc' }); setCurrentPage(1) }}
              className="px-4 py-2 bg-[var(--color-surface-alt)] rounded-md"
            >Clear</button>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="p-4">
        <div className="space-y-4">
          {getCurrentPageResults().map((item) => (
            <div key={item.id} onClick={() => navigate('/product', { state: { product: item } })}>
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {getTotalResults() > 0 && (
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
            const totalPages = Math.ceil(getTotalResults() / 5)
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
              const totalPages = Math.ceil(getTotalResults() / 5)
              if (currentPage < totalPages) {
                setCurrentPage(currentPage + 1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            disabled={currentPage === Math.ceil(getTotalResults() / 5)}
            className={`px-3 py-2 rounded-md ${
              currentPage === Math.ceil(getTotalResults() / 5)
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