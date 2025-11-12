import React, { useState } from 'react'
import { ArrowLeft, Search as SearchIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'

export default function Search() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const { t, setLang } = useI18n()

  // Ensure the language is set to Urdu for this page
  React.useEffect(() => {
    setLang('ur')
  }, [setLang])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      {/* Header */}
      <form onSubmit={handleSearch} className="sticky top-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] p-2 flex items-center gap-3 z-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1 bg-transparent border-none cursor-pointer text-[var(--color-text-primary)] flex items-center"
          aria-label={t('search.backButtonAriaLabel')}
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 flex gap-2">
          <input
            autoFocus
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search.placeholder')}
            className="flex-1 py-2 px-4 bg-[var(--color-surface-alt)] rounded-md text-[var(--color-text-primary)] border-none outline-none text-base"
          />
          <button
            type="submit"
            className="flex items-center justify-center px-4 bg-[var(--color-primary-500)] text-white rounded-md hover:bg-[var(--color-primary-600)] transition-colors"
            aria-label={t('search.submitButtonAriaLabel')}
          >
            <SearchIcon size={20} />
          </button>
        </div>
      </form>

      {/* Placeholder for search results */}
      <div className="p-4 text-center text-[var(--color-text-muted)]">
        {t('search.prompt')}
      </div>
    </div>
  )
}