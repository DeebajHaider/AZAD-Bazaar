import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Search as SearchIcon, SlidersHorizontal, Star, X } from 'lucide-react'

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
    image: 'https://placeholder.co/300x200'
  },
  {
    id: 2,
    title: 'Dove Soap Bar (Pack of 3)',
    price: 450,
    originalPrice: 550,
    rating: 4.8,
    reviews: 75,
    category: 'Personal Care',
    image: 'https://placeholder.co/300x200'
  },
  {
    id: 3,
    title: 'Brown Rice (2kg)',
    price: 850,
    originalPrice: 950,
    rating: 4.2,
    reviews: 45,
    category: 'Grains',
    image: 'https://placeholder.co/300x200'
  },
  {
    id: 4,
    title: 'Fresh Milk (1L)',
    price: 200,
    originalPrice: 200,
    rating: 4.6,
    reviews: 92,
    category: 'Dairy',
    image: 'https://placeholder.co/300x200'
  },
  {
    id: 5,
    title: 'Chicken Breast (500g)',
    price: 550,
    originalPrice: 650,
    rating: 4.7,
    reviews: 63,
    category: 'Meat',
    image: 'https://placeholder.co/300x200'
  },
  {
    id: 6,
    title: 'Toothpaste (150g)',
    price: 250,
    originalPrice: 300,
    rating: 4.4,
    reviews: 37,
    category: 'Personal Care',
    image: 'https://placeholder.co/300x200'
  },
  {
    id: 7,
    title: 'Tomatoes (500g)',
    price: 80,
    originalPrice: 100,
    rating: 4.3,
    reviews: 82,
    category: 'Vegetables',
    image: 'https://placeholder.co/300x200'
  },
  {
    id: 8,
    title: 'Bread Loaf',
    price: 120,
    originalPrice: 120,
    rating: 4.6,
    reviews: 156,
    category: 'Bakery',
    image: 'https://placeholder.co/300x200'
  },
  {
    id: 9,
    title: 'Eggs (Dozen)',
    price: 300,
    originalPrice: 360,
    rating: 4.8,
    reviews: 203,
    category: 'Dairy',
    image: 'https://placeholder.co/300x200'
  },
  {
    id: 10,
    title: 'Laundry Detergent (2L)',
    price: 1200,
    originalPrice: 1500,
    rating: 4.5,
    reviews: 167,
    category: 'Household',
    image: 'https://placeholder.co/300x200'
  },
  {
    id: 11,
    title: 'Orange Juice (1L)',
    price: 350,
    originalPrice: 400,
    rating: 4.4,
    reviews: 89,
    category: 'Beverages',
    image: 'https://placeholder.co/300x200'
  },
  {
    id: 12,
    title: 'Onions (1kg)',
    price: 90,
    originalPrice: 120,
    rating: 4.2,
    reviews: 71,
    category: 'Vegetables',
    image: 'https://placeholder.co/300x200'
  },
  {
    id: 13,
    title: 'Toilet Paper (12 Rolls)',
    price: 800,
    originalPrice: 950,
    rating: 4.6,
    reviews: 245,
    category: 'Household',
    image: 'https://placeholder.co/300x200'
  },
  {
    id: 14,
    title: 'Yogurt (500g)',
    price: 180,
    originalPrice: 200,
    rating: 4.7,
    reviews: 112,
    category: 'Dairy',
    image: 'https://placeholder.co/300x200'
  },
  {
    id: 15,
    title: 'Banana (1kg)',
    price: 150,
    originalPrice: 180,
    rating: 4.3,
    reviews: 95,
    category: 'Fruits',
    image: 'https://placeholder.co/300x200'
  },
  {
    id: 16,
    title: 'Hand Sanitizer (250ml)',
    price: 220,
    originalPrice: 280,
    rating: 4.5,
    reviews: 178,
    category: 'Personal Care',
    image: 'https://placeholder.co/300x200'
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
    discount: false
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

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low-high':
        results.sort((a, b) => a.price - b.price)
        break
      case 'price-high-low':
        results.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        results.sort((a, b) => b.rating - a.rating)
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

  const FilterPanel = () => (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="absolute right-0 top-0 h-full w-[80%] max-w-md bg-[var(--color-surface)] p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Filters & Sort</h3>
          <button
            onClick={() => setShowFilters(false)}
            className="p-2 hover:bg-[var(--color-surface-alt)] rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Sort Options */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Sort By</h4>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="form-select w-full"
          >
            <option value="relevance">Relevance</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Category</h4>
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

        {/* Price Range */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Price Range</h4>
          <select
            value={filters.priceRange}
            onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
            className="form-select w-full"
          >
            <option value="">All Prices</option>
            <option value="0-200">Under Rs 200</option>
            <option value="200-500">Rs 200 - Rs 500</option>
            <option value="500-1000">Rs 500 - Rs 1000</option>
            <option value="1000-plus">Rs 1000+</option>
          </select>
        </div>

        {/* Discount Filter */}
        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.discount}
              onChange={(e) => setFilters({ ...filters, discount: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300"
            />
            <span>On Discount</span>
          </label>
        </div>

        {/* Apply Button */}
        <button
          onClick={() => setShowFilters(false)}
          className="w-full bg-[var(--color-primary-500)] text-white py-3 rounded-md hover:bg-[var(--color-primary-600)] transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )

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
        <div className="flex justify-between items-center">
          <p className="text-[var(--color-text-muted)]">
            {getTotalResults()} results found
          </p>
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 py-2 px-4 bg-[var(--color-surface-alt)] rounded-md hover:bg-[var(--color-gray-200)] transition-colors"
          >
            <SlidersHorizontal size={20} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="p-4">
        <div className="space-y-4">
          {getCurrentPageResults().map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary-500)] transition-colors cursor-pointer"
            >
              <div className="w-24 h-24 bg-[var(--color-surface-alt)] rounded-md flex items-center justify-center">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-md" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">{item.title}</h3>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center text-yellow-500">
                    <Star size={16} fill="currentColor" />
                    <span className="ml-1">{item.rating}</span>
                  </div>
                  <span className="text-[var(--color-text-muted)] text-sm">
                    ({item.reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Rs {item.price}</span>
                  <span className="text-[var(--color-text-muted)] line-through text-sm">
                    Rs {item.originalPrice}
                  </span>
                  <span className="text-[var(--color-success)] text-sm">
                    {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                  </span>
                </div>
                <p className="text-[var(--color-text-muted)] text-sm mt-1">{item.category}</p>
              </div>
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

      {/* Filter Panel */}
      {showFilters && <FilterPanel />}
    </div>
  )
}