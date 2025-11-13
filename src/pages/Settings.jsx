import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, LogOut, Save } from 'lucide-react'
import BottomNav from '../component/BottomNav'
import { useI18n } from '../context/I18nContext'
import { Layout } from '../Layout' // <-- ADDED: import Layout used by SettingsLayout
import HeaderWithName from '../component/HeaderWithName'

export default function Settings() {
  const { logout, customer, updateCustomer } = useAuth()
  const navigate = useNavigate()
  const { t, lang, setLang } = useI18n()
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' })
  const [isSaving, setIsSaving] = useState(false)

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
      if (!customer?._id) throw new Error(t('settings.notifications.noCustomerError'))
      const payload = {
        name: formData.name,
        address: formData.address // Backend will handle normalization
      }
      await updateCustomer(customer._id, payload)
      setSuccess(t('settings.notifications.updateSuccess'))
    } catch (err) {
      console.error('Update customer failed', err)
      setError(err.message || t('settings.notifications.updateFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    // Using a more modern confirm dialog would be better in a real app
    if (window.confirm(t('settings.signOut.confirmDialog'))) {
      logout()
      navigate('/')
    }
  }

  return (
    <Layout footer={<BottomNav />} header={<HeaderWithName title={t('settings.title')} to="/" />}>
      {/* Main container for the settings page */}
      {/* `flex-1` makes it take up remaining space, `overflow-y-auto` enables scrolling */}
      <main className="min-h-screen flex-1 overflow-y-auto bg-white dark:bg-slate-950">
        <div className="p-4 pb-24 space-y-6">

          {/* Card: Appearance & Accessibility */}
          <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg">
            <h2 className="p-4 text-xl font-semibold text-gray-900 dark:text-slate-50 border-b border-gray-200 dark:border-slate-800">
              {t('settings.appearance.title')}
            </h2>
            <button
              onClick={() => navigate('/accessibility')}
              className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-slate-50">{t('settings.appearance.accessibility.title')}</p>
                <p className="text-sm text-gray-600 dark:text-slate-400">{t('settings.appearance.accessibility.description')}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-500" />
            </button>

            {/* Language Selection (visual hierarchy updated to match Accessibility) */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800">
              <p className="font-medium text-gray-900 dark:text-slate-50">    {t('settings.appearance.language.title')}</p>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">   {t('settings.appearance.language.description')}         </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {setLang('en'); document.getElementsByTagName('html')[0].setAttribute("dir", "ltr");}}
                  className={`min-h-16 px-4 py-3 rounded-lg border-2 font-medium transition-all duration-200 ${lang === 'en'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                    }`}
                >
                  {t('settings.appearance.language.options.en')}
                </button>

                <button
                  onClick={() => {setLang('ur'); document.getElementsByTagName('html')[0].setAttribute("dir", "rtl"); }}
                  className={`min-h-16 px-4 py-3 rounded-lg border-2 font-medium transition-all duration-200 ${lang === 'ur'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50 hover:border-gray-300 dark:hover:border-slate-700'
                    }`}
                >
                  {t('settings.appearance.language.options.ur')}
                </button>
              </div>
            </div>
          </div>

          {/* Card: Account Information Form */}
          <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg">
            <h2 className="p-4 text-xl font-semibold text-gray-900 dark:text-slate-50 border-b border-gray-200 dark:border-slate-800">
              {t('settings.account.title')}
            </h2>
            <div className="p-4 space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-slate-50">
                  {t('settings.account.form.fullName.label')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t('settings.account.form.fullName.placeholder')}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Phone Field (Read-only) */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-slate-50">
                  {t('settings.account.form.phone.label')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 cursor-not-allowed"
                  placeholder={t('settings.account.form.phone.placeholder')}
                />
              </div>

              {/* Address Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-slate-50">
                  {t('settings.account.form.address.label')}
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder={t('settings.account.form.address.placeholder')}
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
                {isSaving ? t('settings.account.form.saveButton.saving') : t('settings.account.form.saveButton.default')}
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
              {t('settings.signOut.button')}
            </button>
          </div>

        </div>
      </main>
    </Layout>
  )
}