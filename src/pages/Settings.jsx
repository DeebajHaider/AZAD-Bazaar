import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { 
  ChevronRight, 
  LogOut, 
  Save, 
  Info, 
  Mic, 
  Heart, 
  MapPin, 
  User, 
  Globe, 
  Eye, 
  CreditCard,
  ChevronLeft
} from 'lucide-react'
import { useAddress } from '../api/hooks/useAddress'
import BottomNav from '../component/BottomNav'
import { useI18n } from '../context/I18nContext'
import { Layout } from '../Layout' 
import HeaderWithName from '../component/HeaderWithName'
import { useAccessibility } from '../context/AccessibilityContext'
import VoiceInputModal from '../component/VoiceInputModal'

// --- Sub-component: Skeleton ---
const AccountInfoSkeleton = () => (
  <div className="space-y-3 p-4">
    <div className="h-20 w-full skeleton rounded-xl" />
    <div className="h-16 w-full skeleton rounded-xl" />
    <div className="h-16 w-full skeleton rounded-xl" />
  </div>
);

// --- Sub-component: Menu Item (Themed as a Card Button) ---
// UPDATED: Now uses 'secBg primBorder secHoverBg rounded-xl' to match the rest of the app
const MenuItem = ({ icon: Icon, title, description, onClick, isDestructive = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 mb-3 group focusRing
      ${isDestructive 
        ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/30' 
        : 'secBg primBorder secHoverBg' 
      }`}
  >
    {/* Icon Container */}
    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border 
      ${isDestructive 
        ? 'bg-white dark:bg-red-900/40 border-red-200 dark:border-red-800 text-red-600' 
        : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 secText'}`}>
      <Icon size={20} />
    </div>
    
    {/* Text Content */}
    <div className="flex-1 text-left">
      <h3 className={`font-bold text-sm ${isDestructive ? 'accentDangerText' : 'primText'}`}>
        {title}
      </h3>
      {description && <p className="text-xs secText mt-0.5 opacity-80">{description}</p>}
    </div>

    {/* Chevron (Only for navigation items) */}
    {!isDestructive && (
      <ChevronRight size={18} className="secText opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all rtl:rotate-180" />
    )}
  </button>
);

export default function Settings() {
  const { logout, customer, updateCustomer, loading: authLoading } = useAuth()
  const { addresses, refreshAddresses } = useAddress()
  const navigate = useNavigate()
  const { t, lang, setLang } = useI18n()
  
  // State for internal navigation (Menu vs Profile Form)
  const [currentView, setCurrentView] = useState('menu') // 'menu' | 'profile'

  // Form State
  const [formData, setFormData] = useState({ name: '', phone: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  
  // Accessibility & Voice
  const { ascMode } = useAccessibility()
  const isVoiceInput = typeof ascMode === 'string' && ascMode.includes('voiceInput')
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)
  const [voiceTarget, setVoiceTarget] = useState(null)
  const isRTL = lang === 'ar' || lang === 'he' || lang === 'fa' || lang === 'ur'

  // Initialize Data
  useEffect(() => {
    (async () => {
      try { await refreshAddresses() } catch (e) { /* silent */ }
    })()
  }, [])

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || ''
      })
    }
  }, [customer])

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleVoiceConfirm = useCallback((transcript) => {
    if (!voiceTarget) return;
    setFormData(prev => ({ ...prev, [voiceTarget]: transcript }))
    setVoiceModalOpen(false)
    setVoiceTarget(null)
  }, [voiceTarget])

  const handleSubmitProfile = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccessMsg(null)
    try {
      if (!customer?._id) throw new Error(t('settings.notifications.noCustomerError'))
      await updateCustomer(customer._id, { name: formData.name })
      setSuccessMsg(t('settings.notifications.updateSuccess'))
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      console.error('Update failed', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm(t('settings.signOut.confirmDialog'))) {
      logout()
      navigate('/')
    }
  }

  // --- VIEW: PROFILE EDIT FORM ---
  if (currentView === 'profile') {
    return (
      <Layout 
        footer={<BottomNav />} 
        header={
          <header className="secBg dividerBorder p-4">
            <div className="max-w-[430px] mx-auto flex items-center gap-3">
              <button
                onClick={() => setCurrentView('menu')}
                className="min-h-11 min-w-11 flex items-center justify-center rounded-lg btnSecondary"
                aria-label="Back to Settings"
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-xl font-semibold primText">
                {t('settings.account.form.fullName.label') || 'Profile Info'}
              </h1>
            </div>
          </header>
        }
      >
        <main className="min-h-screen flex-1 overflow-y-auto primBg p-4">
          <form onSubmit={handleSubmitProfile} className="secBg primBorder rounded-xl p-4 space-y-5 max-w-[430px] mx-auto">
            
            {/* Avatar Placeholder */}
            <div className="flex justify-center mb-2">
              <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-sm text-blue-500">
                 <User size={40} />
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold primText">
                {t('settings.account.form.fullName.label')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="inputField pr-12 rtl:pl-12"
                  placeholder="Your Name"
                />
                 {isVoiceInput && (
                    <button
                      type="button"
                      onClick={() => { setVoiceTarget('name'); setVoiceModalOpen(true); }}
                      className={`absolute top-1.5 ${isRTL ? 'left-2' : 'right-2'} z-10 w-9 h-9 flex items-center justify-center rounded-full accentPrimBg hover:opacity-90 transition-colors`}
                    >
                      <Mic size={18} className="primText" />
                    </button>
                  )}
              </div>
            </div>

            {/* Phone Input */}
            <div className="space-y-2 opacity-70">
              <label className="text-sm font-bold primText">
                {t('settings.account.form.phone.label')}
              </label>
              <input
                type="text"
                value={formData.phone}
                readOnly
                className="inputField bg-gray-100 dark:bg-slate-800 cursor-not-allowed"
              />
            </div>

            {/* Success Message */}
            {successMsg && (
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium text-center">
                {successMsg}
              </div>
            )}

            {/* Save Button - Using btnPrimary class */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full btnPrimary min-h-12 rounded-lg font-bold text-lg shadow-sm mt-4 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {isSaving ? t('common.saving') : t('common.save')}
            </button>
          </form>

           {isVoiceInput && voiceModalOpen && (
            <VoiceInputModal
              isOpen={voiceModalOpen}
              onClose={() => { setVoiceModalOpen(false); setVoiceTarget(null); }}
              onConfirm={handleVoiceConfirm}
            />
          )}
        </main>
      </Layout>
    )
  }

  // --- VIEW: MAIN SETTINGS MENU ---
  return (
    <Layout footer={<BottomNav />} header={<HeaderWithName title={t('settings.title')} to="/" />}>
      <main className="min-h-screen flex-1 overflow-y-auto primBg">
        <div className="max-w-[430px] mx-auto p-4 pb-24">
          
          {/* 1. Language Selection (Horizontal Grid) */}
          <section className="mb-6">
            <h2 className="text-sm font-bold secText uppercase tracking-wider mb-3 px-1">
               {t('settings.appearance.language.title')}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {/* Uses exact classes from AccessibilitySettings for consistency */}
              <button
                onClick={() => setLang('en')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200 
                  ${lang === 'en' ? 'modeChooseButton-selected shadow-sm' : 'modeChooseButton-unselected'}`}
              >
                <span className="text-3xl">🇺🇸</span>
                <span className="font-bold text-sm">English</span>
              </button>
              <button
                onClick={() => setLang('ur')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200 
                  ${lang === 'ur' ? 'modeChooseButton-selected shadow-sm' : 'modeChooseButton-unselected'}`}
              >
                <span className="text-3xl">🇵🇰</span>
                <span className="font-bold text-sm">اردو</span>
              </button>
            </div>
          </section>

          {/* 2. Accessibility (Prominent Card) */}
          <section className="mb-6">
             <button
                onClick={() => navigate('/accessibility')}
                // Using secBg primBorder etc. to look like a Menu Item Card
                className="w-full p-4 rounded-xl secBg primBorder secHoverBg flex items-center gap-4 group focusRing"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500 dark:bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Eye size={24} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-lg primText">{t('settings.appearance.accessibility.title')}</h3>
                  <p className="text-xs secText leading-tight mt-1 opacity-80">{t('settings.appearance.accessibility.description')}</p>
                </div>
                <ChevronRight size={20} className="secText opacity-50 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
              </button>
          </section>

          {/* 3. Account Settings (Individual Cards) */}
          {authLoading ? <AccountInfoSkeleton /> : (
            <section className="mb-6">
              <h2 className="text-sm font-bold secText uppercase tracking-wider mb-3 px-1">
                {t('settings.account.title')}
              </h2>
              
              <MenuItem 
                icon={User} 
                title={t('settings.account.form.fullName.label') || "Profile Information"} 
                description={customer?.name || t('settings.account.profileDesc')}
                onClick={() => setCurrentView('profile')}
              />
              
              <MenuItem 
                icon={MapPin} 
                title={t('settings.account.form.address.manageButton')} 
                description={addresses?.length > 0 ? `${addresses.length} ${t('common.saved') || 'saved'}` : null}
                onClick={() => navigate('/address')}
              />

              <MenuItem 
                icon={CreditCard} 
                title={t('settings.managePayments.button')} 
                onClick={() => navigate('/manage-payments')}
              />

              <MenuItem 
                icon={Heart} 
                title={t('settings.account.favorites.manageButton')} 
                onClick={() => navigate('/favorites')}
              />
            </section>
          )}

          {/* 4. App Info & Danger Zone */}
          <section>
             <h2 className="text-sm font-bold secText uppercase tracking-wider mb-3 px-1">
               {t('common.more') || 'More'}
             </h2>
             <MenuItem 
                icon={Info} 
                title={t('settings.about.button')} 
                onClick={() => navigate('/about')}
              />
             <MenuItem 
                icon={LogOut} 
                title={t('settings.signOut.button')} 
                onClick={handleLogout}
                isDestructive={true}
              />
          </section>

          <div className="text-center pt-4">
            <p className="text-[10px] secText uppercase tracking-widest opacity-40 font-semibold">
              v1.0.2 • Azad Bazaar
            </p>
          </div>

        </div>
      </main>
    </Layout>
  )
}