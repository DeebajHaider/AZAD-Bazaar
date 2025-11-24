// --- Category Filter Modal Component ---
import React, { useState } from 'react'
import { X } from 'lucide-react'

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

export default FilterModal