import React, { useState, useMemo } from 'react'
import { X, Search, Filter, Mic } from 'lucide-react'
import VoiceInputModal from './VoiceInputModal'

const FilterModal = ({ isOpen, onClose, initialFilters, applyFilters, categories, brands, t, lang, translateDBVal }) => {
  if (!isOpen) return null

  const [tempCategories, setTempCategories] = useState(initialFilters.categories)
  const [tempBrands, setTempBrands] = useState(initialFilters.brands)
  const [searchQuery, setSearchQuery] = useState('')
  const [isVoiceModalOpen, setVoiceModalOpen] = useState(false)

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

  const handleVoiceConfirm = (transcript) => {
    const trimmed = transcript.trim()
    if (trimmed) setSearchQuery(trimmed)
    setVoiceModalOpen(false)
  }

  return (
    // Outer backdrop: Flat dark overlay, no blur
    <div 
      className="fixed inset-0 z-50 flex justify-center items-end bg-black/60 transition-opacity" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="filter-title"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div 
        className="secBg w-full max-w-[430px] rounded-t-2xl flex flex-col max-h-[60vh] animate-in slide-in-from-bottom duration-200" 
        onClick={e => e.stopPropagation()}
      >
        {/* --- Drag Handle --- */}
        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-12 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        </div>

        {/* --- Header Section (Sticky) --- */}
        <header className="px-5 pb-2 flex-shrink-0 space-y-3">
          <div className="flex justify-between items-center">
             <h2 id="filter-title" className="text-lg font-bold primText flex items-center gap-2">
               <Filter size={18} className="accentPrimText"/>
               {t('searchResults.filterPanel.title')}
             </h2>
             <button 
               onClick={onClose} 
               aria-label={t('common.close')} 
               className="btnSecondary rounded-full !p-0 h-9 w-9 flex items-center justify-center focusRing"
             >
               <X size={18} />
             </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 secText pointer-events-none" size={18} />
            <input
              type="text"
              placeholder={t('searchResults.header.placeholder') || "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              // Using standard inputField class
              className="inputField !pl-10 pr-20 py-2 text-sm"
              aria-label="Search categories and brands"
            />
            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-full secHoverBg secText hover:primText transition-colors"
                aria-label={t('common.clear')}
              >
                <X size={14} />
              </button>
            )}
            {/* Voice Search Button */}
            <button
              onClick={() => setVoiceModalOpen(true)}
              aria-label={t('searchResults.header.voiceButtonAriaLabel')}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full accentPrimBg flex items-center justify-center hover:opacity-90 transition-colors"
            >
              <Mic size={16} className="primText text-white dark:text-white" />
            </button>
          </div>
          <div className="border-b dividerBorder"></div>
        </header>

        {/* --- Main Content (Scrollable) --- */}
        <main className="overflow-y-auto px-5 py-2 space-y-5 flex-grow">
            {/* Quick Filters */}
            {!searchQuery && (
              <div className="animate-in slide-in-from-left-2 duration-300">
                  <h3 className="text-xs font-bold uppercase tracking-wider secText mb-2">
                    {t('searchResults.filterPanel.quickFilters')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                      {specialFilters.map(filter => {
                          const isSelected = tempCategories.includes(filter._id)
                          return (
                            <button 
                              key={filter._id} 
                              onClick={() => handleToggleCategory(filter._id)} 
                              // Using modeChooseButton classes for consistent selected/unselected states
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                                isSelected ? 'modeChooseButton-selected' : 'modeChooseButton-unselected'
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
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider secText">
                    {t('searchResults.filterPanel.categoryLabel')}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {visibleCategories.length > 0 ? (
                      visibleCategories.map(cat => {
                           const isSelected = tempCategories.includes(cat._id)
                           return (
                             <button 
                               key={cat._id} 
                               onClick={() => handleToggleCategory(cat._id)} 
                               className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                                 isSelected ? 'modeChooseButton-selected' : 'modeChooseButton-unselected'
                               }`}
                             >
                               {getName(cat, "Category")}
                             </button>
                           )
                      })
                    ) : (
                      <p className="text-sm secText italic w-full text-center py-4">
                        {t('searchResults.results.noResults') || "No match"}
                      </p>
                    )}
                </div>
            </div>

            {/* Brands */}
            <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider secText">
                    {t('searchResults.filterPanel.brandLabel')}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {visibleBrands.length > 0 ? (
                      visibleBrands.map(brand => {
                           const isSelected = tempBrands.includes(brand._id)
                           return (
                             <button 
                               key={brand._id} 
                               onClick={() => handleToggleBrand(brand._id)} 
                               className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                                 isSelected ? 'modeChooseButton-selected' : 'modeChooseButton-unselected'
                               }`}
                             >
                               {getName(brand, "Brand")}
                             </button>
                           )
                      })
                    ) : (
                      <p className="text-sm secText italic w-full text-center py-4">
                         {t('searchResults.results.noResults') || "No match"}
                      </p>
                    )}
                </div>
            </div>
            {/* Spacer for scroll */}
            <div className="h-4"></div>
        </main>

        {/* --- Footer (Fixed at bottom of modal) --- */}
        <footer className="flex gap-3 p-4 pt-3 border-t dividerBorder flex-shrink-0 bg-inherit pb-safe">
           <button 
             onClick={handleClear} 
             className="flex-1 min-h-[48px] btnSecondary rounded-lg font-medium active:scale-[0.98] transition-transform focusRing"
           >
             {t('searchResults.activeFilters.clearAllButton')}
           </button>
           <button 
             onClick={handleApply} 
             className="flex-[2] min-h-[48px] btnPrimary rounded-lg font-semibold active:scale-[0.98] transition-transform focusRing"
           >
             {t('searchResults.filterPanel.applyButton')}
           </button>
        </footer>

        {/* Voice Input Modal (moved inside modal container) */}
        <VoiceInputModal
          isOpen={isVoiceModalOpen}
          onClose={() => setVoiceModalOpen(false)}
          onConfirm={handleVoiceConfirm}
          confirmLabel={t('voiceModal.actions.confirmSearch')}
        />
      </div>
    </div>
  )
}

export default FilterModal