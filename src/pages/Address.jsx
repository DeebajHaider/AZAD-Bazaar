import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Address() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">Delivery Address</h1>
      </div>

      {/* Placeholder for address form */}
      <div className="p-4 text-center text-gray-500">
        Address editing interface will be implemented here...
      </div>
    </div>
  )
}