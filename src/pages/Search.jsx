import React, { useState } from 'react'
import { ArrowLeft, Search as SearchIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'

export default function Search() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const { t } = useI18n()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-md-surface text-md-on-surface">
      {/* Header: Surface Container */}
      <form 
        onSubmit={handleSearch} 
        className="sticky top-0 bg-md-surface-container border-b border-md-outline-variant/30 p-4 flex items-center gap-3 z-10 shadow-sm"
      >
        {/* Back Button: Standard Icon Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-md text-md-on-surface hover:bg-md-on-surface/10 transition-colors"
          aria-label={t('search.backButtonAriaLabel')}
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex-1 flex gap-3">
          {/* Input: Filled, Rounded Full (MD3 Search Bar) */}
          <input
            autoFocus
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search.placeholder')}
            className="flex-1 h-12 rounded-md bg-md-surface-container-highest px-5 text-md-on-surface placeholder:text-md-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-md-primary transition-all text-base"
          />
          
          {/* Submit: Primary Icon Button */}
          <button
            type="submit"
            className="w-12 h-12 flex items-center justify-center rounded-md bg-md-primary text-md-on-primary hover:shadow-md active:scale-95 transition-all"
            aria-label={t('search.submitButtonAriaLabel')}
          >
            <SearchIcon size={22} />
          </button>
        </div>
      </form>

      {/* Placeholder content */}
      <div className="p-8 text-center">
        <div className="w-20 h-20 mx-auto rounded-md bg-md-surface-container-highest flex items-center justify-center mb-4">
           <SearchIcon size={32} className="text-md-on-surface-variant/50" />
        </div>
        <p className="text-md-on-surface-variant text-base">
          {t('search.prompt')}
        </p>
      </div>
    </div>
  )
}