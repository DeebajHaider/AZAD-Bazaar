import React from 'react'
import { ArrowLeft, Search as SearchIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Search() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <input
            autoFocus
            type="text"
            placeholder="Search for items..."
            className="w-full px-4 py-2 bg-gray-100 rounded-lg text-gray-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Placeholder for search results */}
      <div className="p-4 text-center text-gray-500">
        Start typing to search...
      </div>
    </div>
  )
}