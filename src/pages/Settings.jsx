import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, LogOut, Save } from 'lucide-react'
import BottomNav from '../component/BottomNav'

export default function Settings() {
  const { logout, customer, updateCustomer } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Populate form from global customer when available
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        address: (Array.isArray(customer.addresses) && customer.addresses[0]?.addressText) || ''
      })
    }
  }, [customer])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      if (!customer?._id) throw new Error('No customer available for update.')
      const payload = {
        name: formData.name,
        address: formData.address // Backend will handle normalization
      }
      await updateCustomer(customer._id, payload)
      setSuccess('Your changes have been saved.')
    } catch (err) {
      console.error('Update customer failed', err)
      setError(err.message || 'Failed to save changes.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    // Using a more modern confirm dialog would be better in a real app
    if (window.confirm('Are you sure you want to sign out?')) {
      logout()
      navigate('/')
    }
  }

  return (
    <>
      {/* Main container for the settings page */}
      {/* `flex-1` makes it take up remaining space, `overflow-y-auto` enables scrolling */}
      <main className="min-h-screen flex-1 overflow-y-auto bg-white dark:bg-slate-950">

        {/* Page Header */}
        <div className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4">
          <div className="max-w-[430px] mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="min-h-11 min-w-11 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-50 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-50">
              Settings
            </h1>
          </div>
        </div>
        {/* 
          Container for all settings sections.
          - `p-4` for screen padding.
          - `pb-24` to ensure content doesn't hide behind the BottomNav.
          - `space-y-6` provides consistent spacing between cards.
        */}
        <div className="p-4 pb-24 space-y-6">

          {/* Card: Appearance & Accessibility */}
          <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg">
            <h2 className="p-4 text-xl font-semibold text-gray-900 dark:text-slate-50 border-b border-gray-200 dark:border-slate-800">
              Appearance
            </h2>
            <button
              onClick={() => navigate('/accessibility')}
              className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-slate-50">Accessibility Settings</p>
                <p className="text-sm text-gray-600 dark:text-slate-400">Customize theme and display options</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-500" />
            </button>
          </div>

          {/* Card: Account Information Form */}
          <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg">
            <h2 className="p-4 text-xl font-semibold text-gray-900 dark:text-slate-50 border-b border-gray-200 dark:border-slate-800">
              Account Information
            </h2>
            <div className="p-4 space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-slate-50">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Phone Field (Read-only) */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-slate-50">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 cursor-not-allowed"
                  placeholder="Phone (read-only)"
                />
              </div>

              {/* Address Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-slate-50">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter your primary address"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 min-h-12 px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Card: Danger Zone / Sign Out */}
          <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 min-h-12 px-6 py-3 bg-transparent border border-red-500/50 dark:border-red-500/40 text-red-600 dark:text-red-500 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-200"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>

        </div>
      </main>

      <BottomNav />
    </>
  )
}