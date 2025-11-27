import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, LogOut, Save, Info, Mic, Heart, MapPin, RefreshCcw } from 'lucide-react'
import { useAddress } from '../api/hooks/useAddress'
import BottomNav from '../component/BottomNav'
import { useI18n } from '../context/I18nContext'
import { Layout } from '../Layout' // <-- ADDED: import Layout used by SettingsLayout
import HeaderWithName from '../component/HeaderWithName'
import { useAccessibility } from '../context/AccessibilityContext'
import VoiceInputModal from '../component/VoiceInputModal'

const AccountInfoSkeleton = () => (
  <form className="secBg primBorder rounded-lg animate-pulse">
    <h2 className="p-4 text-xl font-semibold primText dividerBorder">
      <div className="h-7 w-40 skeleton" />
    </h2>
    <div className="p-4 space-y-4">
      {/* Name Field */}
      <div className="space-y-2">
        <div className="h-4 w-24 skeleton" />
        <div className="h-11 w-full skeleton rounded-lg" />
      </div>

      {/* Phone Field (Read-only) */}
      <div className="space-y-2">
        <div className="h-4 w-20 skeleton" />
        <div className="h-11 w-full skeleton rounded-lg" />
      </div>

      {/* Default Address (read-only display) */}
      <div className="space-y-2">
        <div className="h-4 w-32 skeleton" />
        <div className="h-14 w-full skeleton rounded-lg" />
      </div>

      {/* Manage Address Button */}
      <div className="h-12 w-full skeleton rounded-lg" />
      {/* Manage Favorites Button */}
      <div className="h-12 w-full skeleton rounded-lg" />
      {/* Save Button (Name only) */}
      <div className="h-12 w-full skeleton rounded-lg" />
    </div>
  </form>
);

export default function Settings() {
  // Removed getDefaultAddress reliance (was causing stale default address)
  const { logout, customer, updateCustomer, loading: authLoading } = useAuth()
  const { addresses, refreshAddresses } = useAddress()
  // Auto refresh addresses ONCE when Settings mounts (avoid infinite loop due to unstable function reference)
  useEffect(() => {
  (async () => {
        try { await refreshAddresses() } catch (e) { /* silent */ }
      })()
  }, [])
  const navigate = useNavigate()
  const { t, lang, setLang } = useI18n()
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Accessibility voice input mode
  const { ascMode } = useAccessibility()
  const isVoiceInput = typeof ascMode === 'string' && ascMode.includes('voiceInput')

  // Voice modal state
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)
  const [voiceTarget, setVoiceTarget] = useState(null) // 'name' or 'address'

  // Language direction
  const isRTL = lang === 'ar' || lang === 'he' || lang === 'fa' || lang === 'ur'

  // Populate form (name/phone only). Address handled separately via getDefaultAddress()
  useEffect(() => {
    if (customer) {
      setFormData(prev => ({
        ...prev,
        name: customer.name || '',
        phone: customer.phone || ''
      }))
    }
  }, [customer])

  // Derive default address from latest addresses provided by useAddress hook
  const defaultAddress = Array.isArray(addresses) ? (addresses.find(a => a.isDefault) || addresses[0] || null) : null

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle voice confirm for narrator mode
  const handleVoiceConfirm = useCallback((transcript) => {
    if (!voiceTarget) return;
    setFormData(prev => ({ ...prev, [voiceTarget]: transcript }))
    setVoiceModalOpen(false)
    setVoiceTarget(null)
  }, [voiceTarget])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      if (!customer?._id) throw new Error(t('settings.notifications.noCustomerError'))
      // Only update name here. Address management moved to /address page.
      const payload = { name: formData.name }
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
      <main className="min-h-screen flex-1 overflow-y-auto primBg">
        <div className="p-4 space-y-6">

          {/* Card: Appearance & Accessibility */}
          <div className="secBg primBorder rounded-lg">
            <h2 className="p-4 text-xl font-semibold primText  dividerBorder">
              {t('settings.appearance.title')}
            </h2>
            <button
              onClick={() => navigate('/accessibility')}
              className="flex items-center justify-between w-full p-4 text-left"
            >
              <div>
                <p className="font-medium primText ">{t('settings.appearance.accessibility.title')}</p>
                <p className="text-sm secText">{t('settings.appearance.accessibility.description')}</p>
              </div>
              <ChevronRight className="w-5 h-5 secText" />
            </button>

            {/* Language Selection (visual hierarchy updated to match Accessibility) */}
            <div className="p-4 dividerBorder">
              <p className="font-medium primText ">    {t('settings.appearance.language.title')}</p>
              <p className="text-sm secText mb-3">   {t('settings.appearance.language.description')}         </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setLang('en') }}
                  className={`min-h-16 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${lang === 'en'
                    ? 'modeChooseButton-selected'
                    : 'modeChooseButton-unselected'
                    }`}
                >
                  {t('settings.appearance.language.options.en')}
                </button>

                <button
                  onClick={() => { setLang('ur') }}
                  className={`min-h-16 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${lang === 'ur'
                    ? 'modeChooseButton-selected'
                    : 'modeChooseButton-unselected'
                    }`}
                >
                  {t('settings.appearance.language.options.ur')}
                </button>
              </div>
            </div>
          </div>

          {authLoading ? <AccountInfoSkeleton /> : (
            <form onSubmit={handleSubmit} className="secBg primBorder rounded-lg">
              <h2 className="p-4 text-xl font-semibold primText  dividerBorder">
                {t('settings.account.title')}
              </h2>
              <div className="p-4 space-y-4">
                {/* Name Field */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-2 primText ">
                    {t('settings.account.form.fullName.label')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('settings.account.form.fullName.placeholder')}
                    className="inputField transition-all duration-200 pr-12 rtl:pl-12" // add space for button
                  />
                  {isVoiceInput && (
                    <button
                      type="button"
                      aria-label={t('voiceModal.actions.openForName') || 'Voice input for name'}
                      onClick={() => { setVoiceTarget('name'); setVoiceModalOpen(true); }}
                      className={`absolute top-1.5 ${isRTL ? 'left-2' : 'right-2'} z-10 flex items-center justify-center w-9 h-9 rounded-full accentPrimBg hover:opacity-90 transition-colors`}
                      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                    >
                      <Mic size={20} className="primText" />
                    </button>
                  )}
                </div>

                {/* Phone Field (Read-only) */}
                <div>
                  <label className="block text-sm font-medium mb-2 primText ">
                    {t('settings.account.form.phone.label')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    readOnly
                    className="w-full px-4 py-3 primBorder rounded-lg secBg secText cursor-not-allowed"
                    placeholder={t('settings.account.form.phone.placeholder')}
                  />
                </div>

                {/* Default Address (Read-only Display) */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-2 primText ">
                    {t('settings.account.form.address.defaultLabel') || t('settings.account.form.address.label')}
                  </label>
                  <div className="w-full px-4 py-3 primBorder rounded-lg secBg secText text-sm">
                    {defaultAddress?.addressText || t('settings.account.form.address.placeholder')}
                  </div>
                </div>

                {/* Manage Address Button */}
                <button
                  type="button"
                  onClick={() => navigate('/address')}
                  className="w-full flex items-center justify-center gap-2 min-h-12 px-6 py-3 btnSecondary rounded-lg transition-all duration-200"
                >
                  <MapPin size={18} />
                  {t('settings.account.form.address.manageButton') || 'Manage Address'}
                </button>

                {/* Manage Payments Button */}
                <button
                  type="button"
                  onClick={() => navigate('/manage-payments')}
                  className="w-full flex items-center justify-center gap-2 min-h-12 px-6 py-3 btnSecondary rounded-lg transition-all duration-200"
                >
                  <Info size={18} />
                  {t('settings.managePayments.button')}
                </button>

                {/* Manage Favorites Button */}
                <button
                  type="button"
                  onClick={() => navigate('/favorites')}
                  className="w-full flex items-center justify-center gap-2 min-h-12 px-6 py-3 btnSecondary rounded-lg transition-all duration-200"
                >
                  <Heart size={18} />
                  {t('settings.account.favorites.manageButton') || 'Manage Favorites'}
                </button>

                {/* Save Button (Name only) */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 min-h-12 px-6 py-3 btnPrimary rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {isSaving ? t('settings.account.form.saveButton.saving') : t('settings.account.form.saveButton.default')}
                </button>
              </div>
            </form>
          )}

          {/* Voice Input Modal for narrator mode */}
          {isVoiceInput && voiceModalOpen && (
            <VoiceInputModal
              isOpen={voiceModalOpen}
              onClose={() => { setVoiceModalOpen(false); setVoiceTarget(null); }}
              onConfirm={handleVoiceConfirm}
              confirmLabel={
                voiceTarget === 'name' ? t('voiceModal.actions.confirmName') :
                  voiceTarget === 'address' ? t('voiceModal.actions.confirmAddress') :
                    t('voiceModal.actions.confirm')
              }
            />
          )}

          {/* Card: Danger Zone / Sign Out */}
          <div className="secBg primBorder rounded-lg p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 min-h-12 px-6 py-3 btnDanger rounded-lg transition-all duration-200"
            >
              <LogOut size={18} />
              {t('settings.signOut.button')}
            </button>
          </div>

          {/* Card: About App */}
          <div className="secBg primBorder rounded-lg p-4">
            <button
              onClick={() => navigate('/about')}
              className="w-full flex items-center justify-center gap-2 min-h-12 px-6 py-3 btnSecondary rounded-lg transition-all duration-200"
            >
              <Info size={18} />
              {t('settings.about.button')}
            </button>
          </div>


        </div>
      </main>
    </Layout>
  )
}