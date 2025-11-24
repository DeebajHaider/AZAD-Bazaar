import React, { useState, useMemo } from 'react'
import { X, Search, Filter } from 'lucide-react'

const FilterModal = ({ isOpen, onClose, initialFilters, applyFilters, categories, brands, t, lang, translateDBVal }) => {
  if (!isOpen) return null

  const [tempCategories, setTempCategories] = useState(initialFilters.categories)
  const [tempBrands, setTempBrands] = useState(initialFilters.brands)
  const [searchQuery, setSearchQuery] = useState('')

  // --- Helpers ---
  const getName = (item, type) => translateDBVal(type, "name", item.name, lang) || ''

  const specialFilters = [
    { _id: 'inStock', name: t('searchResults.filterPanel.inStockLabel') },
    { _id: 'onDiscount', name: t('searchResults.filterPanel.onDiscountLabel') },
  ]

  // --- Logic: Sort & Filter ---
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => getName(a, "Category").localeCompare(getName(b, "Category"), lang))
  }, [categories, lang, translateDBVal])

  const sortedBrands = useMemo(() => {
    return [...brands].sort((a, b) => getName(a, "Brand").localeCompare(getName(b, "Brand"), lang))
  }, [brands, lang, translateDBVal])

  const visibleCategories = useMemo(() => {
    if (!searchQuery.trim()) return sortedCategories
    return sortedCategories.filter(cat => 
      getName(cat, "Category").toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [sortedCategories, searchQuery, lang, translateDBVal])

  const visibleBrands = useMemo(() => {
    if (!searchQuery.trim()) return sortedBrands
    return sortedBrands.filter(brand => 
      getName(brand, "Brand").toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [sortedBrands, searchQuery, lang, translateDBVal])

  // --- Handlers ---
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
    setSearchQuery('')
  }

  return (
    // Outer backdrop: Added safe-area padding and darkened background
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/60  transition-opacity" role="dialog" aria-modal="true" aria-labelledby="filter-title">
      
      {/* Modal Container: 
          - w-[calc(100%-32px)]: Ensures 16px margin on left/right even on small screens
          - max-w-[400px]: Keeps it from getting too wide on tablet/desktop (smaller than the main 430px app width for floating effect)
      */}
      <div 
        className="secBg rounded-2xl max-h-[85vh] flex flex-col w-[calc(100%-32px)] max-w-[400px] shadow-2xl animate-in fade-in zoom-in duration-200 ring-1 ring-black/5" 
        onClick={e => e.stopPropagation()}
      >
        
        {/* --- Header Section (Sticky) --- */}
        <header className="p-4 pb-0 flex-shrink-0 space-y-3">
          <div className="flex justify-between items-center">
             <h2 id="filter-title" className="text-xl font-bold primText flex items-center gap-2">
               <Filter size={20} className="accentPrimText"/>
               {t('searchResults.filterPanel.title')}
             </h2>
             <button 
               onClick={onClose} 
               aria-label={t('common.close')} 
               className="btnSecondary rounded-full !p-0 h-10 w-10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
             >
               <X size={20} />
             </button>
          </div>

          {/* Search Input */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 secText pointer-events-none group-focus-within:accentPrimText transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={t('searchResults.header.placeholder') || "Search filters..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              // FIXED: Added !pl-11 (approx 44px) to override the default inputField padding, ensuring text doesn't overlap icon
              className="inputField !pl-11 pr-9 py-2.5 h-11 text-sm bg-gray-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-950 transition-all shadow-sm"
              aria-label="Search categories and brands"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 secText hover:primText transition-colors"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          
          <div className="border-b dividerBorder pt-1"></div>
        </header>

        {/* --- Main Content (Scrollable) --- */}
        <main className="overflow-y-auto p-4 space-y-6 flex-grow scrollbar-hide">
            
            {/* Quick Filters (Only shown when not searching) */}
            {!searchQuery && (
              <div className="animate-in slide-in-from-left-2 duration-300">
                  <h3 className="text-xs font-bold uppercase tracking-wider secText mb-3">
                    {t('searchResults.filterPanel.quickFilters')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                      {specialFilters.map(filter => {
                          const isSelected = tempCategories.includes(filter._id)
                          return (
                            <button 
                              key={filter._id} 
                              onClick={() => handleToggleCategory(filter._id)} 
                              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${
                                isSelected ? 'modeChooseButton-selected shadow-sm border-transparent' : 'modeChooseButton-unselected'
                              }`}
                            >
                              {filter.name}
                            </button>
                          )
                      })}
                  </div>
              </div>
            )}

            {/* Categories */}
            <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider secText">
                    {t('searchResults.filterPanel.categoryLabel')}
                  </h3>
                  {visibleCategories.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full secBg primBorder secText font-mono">
                      {visibleCategories.length}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                    {visibleCategories.length > 0 ? (
                      visibleCategories.map(cat => {
                           const isSelected = tempCategories.includes(cat._id)
                           return (
                             <button 
                               key={cat._id} 
                               onClick={() => handleToggleCategory(cat._id)} 
                               className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${
                                 isSelected ? 'modeChooseButton-selected shadow-sm border-transparent' : 'modeChooseButton-unselected'
                               }`}
                             >
                               {getName(cat, "Category")}
                             </button>
                           )
                      })
                    ) : (
                      <div className="w-full py-4 flex flex-col items-center justify-center text-center opacity-60">
                        <p className="text-sm secText italic">
                          {t('searchResults.results.noResults') || "No categories match your search"}
                        </p>
                      </div>
                    )}
                </div>
            </div>

            {/* Brands */}
            <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider secText">
                    {t('searchResults.filterPanel.brandLabel')}
                  </h3>
                  {visibleBrands.length > 0 && (
                     <span className="text-[10px] px-2 py-0.5 rounded-full secBg primBorder secText font-mono">
                       {visibleBrands.length}
                     </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                    {visibleBrands.length > 0 ? (
                      visibleBrands.map(brand => {
                           const isSelected = tempBrands.includes(brand._id)
                           return (
                             <button 
                               key={brand._id} 
                               onClick={() => handleToggleBrand(brand._id)} 
                               className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${
                                 isSelected ? 'modeChooseButton-selected shadow-sm border-transparent' : 'modeChooseButton-unselected'
                               }`}
                             >
                               {getName(brand, "Brand")}
                             </button>
                           )
                      })
                    ) : (
                      <div className="w-full py-4 flex flex-col items-center justify-center text-center opacity-60">
                        <p className="text-sm secText italic">
                          {t('searchResults.results.noResults') || "No brands match your search"}
                        </p>
                      </div>
                    )}
                </div>
            </div>
        </main>

        {/* --- Footer --- */}
        <footer className="flex gap-3 p-4 pt-3 border-t dividerBorder flex-shrink-0 bg-inherit rounded-b-2xl">
           <button 
             onClick={handleClear} 
             className="flex-1 min-h-[48px] btnSecondary rounded-xl font-medium active:scale-[0.98] transition-transform"
           >
             {t('searchResults.activeFilters.clearAllButton')}
           </button>
           <button 
             onClick={handleApply} 
             className="flex-[2] min-h-[48px] btnPrimary rounded-xl font-semibold shadow-md active:scale-[0.98] transition-transform"
           >
             {t('searchResults.filterPanel.applyButton')}
           </button>
        </footer>
      </div>
    </div>
  )
}

export default FilterModal