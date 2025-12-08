import React, { useState, useMemo, useEffect } from 'react'
import { X, Search, Filter, Mic, Check } from 'lucide-react'
import VoiceInputModal from './VoiceInputModal'

const FilterModal = ({ isOpen, onClose, initialFilters, applyFilters, categories, brands, t, lang, translateDBVal }) => {
  // Removed early return to allow CSS animations
  // if (!isOpen) return null

  const [tempCategories, setTempCategories] = useState(initialFilters.categories)
  const [tempBrands, setTempBrands] = useState(initialFilters.brands)
  const [searchQuery, setSearchQuery] = useState('')
  const [isVoiceModalOpen, setVoiceModalOpen] = useState(false)

  // Sync state when modal opens (mimics unmount/remount behavior)
  useEffect(() => {
    if (isOpen) {
      setTempCategories(initialFilters.categories)
      setTempBrands(initialFilters.brands)
      setSearchQuery('')
    }
  }, [isOpen, initialFilters])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

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

  // --- Chip Component ---
  // Reusable component for consistent filter chip styling
  const FilterChip = ({ label, isSelected, onClick }) => (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
        ${isSelected 
          ? 'bg-md-primary-container text-md-on-primary-container shadow-sm' 
          : 'bg-md-surface-container-low text-md-on-surface hover:bg-md-surface-container-high'
        }
      `}
    >
      {isSelected && <Check size={14} className="flex-shrink-0" />}
      <span>{label}</span>
    </button>
  );

  return (
    <>
      {/* Backdrop - Scrim Color */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
        }
        aria-hidden={!isOpen}
      />

      {/* Bottom Sheet Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
        onClick={(e) => e.stopPropagation()}
        className={`fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto 
          bg-md-surface-container-high rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out
          flex flex-col max-h-[75vh]
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}`
        }
      >
        {/* --- Drag Handle --- */}
        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-12 h-1 rounded-md bg-md-on-surface-variant/40"></div>
        </div>

        {/* --- Header Section (Sticky) --- */}
        <header className="px-5 pb-2 flex-shrink-0 space-y-4">
          <div className="flex justify-between items-center">
             <h2 id="filter-title" className="text-xl font-bold text-md-on-surface flex items-center gap-2">
               <Filter size={20} className="text-md-primary"/>
               {t('searchResults.filterPanel.title')}
             </h2>
             <button 
               onClick={onClose} 
               aria-label={t('common.close')} 
               className="w-8 h-8 rounded-md flex items-center justify-center bg-md-surface-container hover:bg-md-surface-container-highest transition-colors text-md-on-surface-variant"
             >
               <X size={18} />
             </button>
          </div>

          {/* Search Input: Filled Style */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-md-on-surface-variant/70 pointer-events-none" size={18} />
            <input
              type="text"
              placeholder={t('searchResults.header.placeholder') || "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 rounded-md bg-md-surface-container-highest pl-10 pr-20 text-sm text-md-on-surface placeholder:text-md-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-md-primary transition-all"
              aria-label="Search categories and brands"
            />
            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-md text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-on-surface-variant/10 transition-colors"
                aria-label={t('common.clear')}
              >
                <X size={14} />
              </button>
            )}
            {/* Voice Search Button */}
            <button
              onClick={() => setVoiceModalOpen(true)}
              aria-label={t('searchResults.header.voiceButtonAriaLabel')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md bg-md-primary flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <Mic size={16} className="text-md-on-primary" />
            </button>
          </div>
          <div className="border-b border-md-outline-variant/30"></div>
        </header>

        {/* --- Main Content (Scrollable) --- */}
        <main className="overflow-y-auto px-5 py-2 space-y-6 flex-grow">
            {/* Quick Filters */}
            {!searchQuery && (
              <div className="animate-in slide-in-from-left-2 duration-300">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-md-on-surface-variant mb-3">
                    {t('searchResults.filterPanel.quickFilters')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                      {specialFilters.map(filter => (
                        <FilterChip 
                          key={filter._id}
                          label={filter.name}
                          isSelected={tempCategories.includes(filter._id)}
                          onClick={() => handleToggleCategory(filter._id)}
                        />
                      ))}
                  </div>
              </div>
            )}

            {/* Categories */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-md-on-surface-variant mb-3">
                  {t('searchResults.filterPanel.categoryLabel')}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {visibleCategories.length > 0 ? (
                      visibleCategories.map(cat => (
                         <FilterChip
                           key={cat._id}
                           label={getName(cat, "Category")}
                           isSelected={tempCategories.includes(cat._id)}
                           onClick={() => handleToggleCategory(cat._id)}
                         />
                      ))
                    ) : (
                      <p className="text-sm text-md-on-surface-variant/70 italic w-full text-center py-2">
                        {t('searchResults.results.noResults') || "No match"}
                      </p>
                    )}
                </div>
            </div>

            {/* Brands */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-md-on-surface-variant mb-3">
                  {t('searchResults.filterPanel.brandLabel')}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {visibleBrands.length > 0 ? (
                      visibleBrands.map(brand => (
                         <FilterChip
                           key={brand._id}
                           label={getName(brand, "Brand")}
                           isSelected={tempBrands.includes(brand._id)}
                           onClick={() => handleToggleBrand(brand._id)}
                         />
                      ))
                    ) : (
                      <p className="text-sm text-md-on-surface-variant/70 italic w-full text-center py-2">
                         {t('searchResults.results.noResults') || "No match"}
                      </p>
                    )}
                </div>
            </div>
            {/* Spacer for scroll */}
            <div className="h-4"></div>
        </main>

        {/* --- Footer (Fixed) --- */}
        <footer className="flex gap-3 p-5 border-t border-md-outline-variant/30 flex-shrink-0 bg-md-surface-container-high pb-safe">
           {/* Clear: Tonal Button (Secondary) */}
           <button 
             onClick={handleClear} 
             className="flex-1 min-h-[48px] rounded-md bg-md-secondary-container text-md-on-secondary-container font-semibold text-sm active:scale-[0.98] transition-transform hover:opacity-90"
           >
             {t('searchResults.activeFilters.clearAllButton')}
           </button>
           {/* Apply: Primary Button */}
           <button 
             onClick={handleApply} 
             className="flex-[2] min-h-[48px] rounded-md bg-md-primary text-md-on-primary font-semibold text-sm shadow-md active:scale-[0.98] transition-transform hover:shadow-lg"
           >
             {t('searchResults.filterPanel.applyButton')}
           </button>
        </footer>
      </div>
      {/* Voice Input Modal */}
        <VoiceInputModal
          isOpen={isVoiceModalOpen}
          onClose={() => setVoiceModalOpen(false)}
          onConfirm={handleVoiceConfirm}
          confirmLabel={t('voiceModal.actions.confirmSearch')}
        />

    </>
  )
}

export default FilterModal