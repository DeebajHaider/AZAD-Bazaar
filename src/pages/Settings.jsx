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
  <div className="space-y-3 p-4 animate-pulse">
    <div className="h-20 w-full bg-md-surface-container-highest rounded-xl" />
    <div className="h-16 w-full bg-md-surface-container-highest rounded-xl" />
    <div className="h-16 w-full bg-md-surface-container-highest rounded-xl" />
  </div>
);

// --- Sub-component: Menu Item (Themed) ---
// Uses Surface Container for standard items, Error Container for destructive actions
const MenuItem = ({ icon: Icon, title, description, onClick, isDestructive = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-xl border border-transparent transition-all duration-200 mb-3 group active:scale-[0.98]
      ${isDestructive 
        ? 'bg-md-error-container text-md-on-error-container hover:shadow-md' 
        : 'bg-md-surface-container text-md-on-surface hover:bg-md-surface-container-high hover:shadow-sm' 
      }`}
  >
    {/* Icon Container */}
    <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 
      ${isDestructive 
        ? 'bg-md-error/10 text-md-error' 
        : 'bg-md-surface-container-highest text-md-on-surface-variant'}`}>
      <Icon size={20} />
    </div>
    
    {/* Text Content */}
    <div className="flex-1 text-left">
      <h3 className={`font-bold text-sm ${isDestructive ? 'text-md-on-error-container' : 'text-md-on-surface'}`}>
        {title}
      </h3>
      {description && <p className={`text-xs mt-0.5 opacity-80 ${isDestructive ? 'text-md-on-error-container' : 'text-md-on-surface-variant'}`}>{description}</p>}
    </div>

    {/* Chevron */}
    {!isDestructive && (
      <ChevronRight size={18} className="text-md-on-surface-variant opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all rtl:rotate-180" />
    )}
  </button>
);

export default function Settings() {
  const { logout, customer, updateCustomer, loading: authLoading } = useAuth()
  const { addresses, refreshAddresses } = useAddress()
  const navigate = useNavigate()
  const { t, lang, setLang } = useI18n()
  
  const [currentView, setCurrentView] = useState('menu') 
  const [formData, setFormData] = useState({ name: '', phone: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  
  const { ascMode } = useAccessibility()
  const isVoiceInput = typeof ascMode === 'string' && ascMode.includes('voiceInput')
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)
  const [voiceTarget, setVoiceTarget] = useState(null)
  const isRTL = lang === 'ar' || lang === 'he' || lang === 'fa' || lang === 'ur'

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
          <HeaderWithName
            title={t('settings.account.form.fullName.label') || 'Profile Info'}
            to={null}
            overwriteNavButton={
              <button
                onClick={() => setCurrentView('menu')}
                className="min-h-11 min-w-11 flex items-center justify-center rounded-md bg-md-secondary-container text-md-on-secondary-container hover:opacity-90 transition-opacity"
                aria-label="Back to Settings"
              >
                <ChevronLeft size={20} />
              </button>
            }
          />
        }
      >
        <main className="min-h-screen flex-1 overflow-y-auto bg-md-surface p-4">
          <form onSubmit={handleSubmitProfile} className="bg-md-surface-container rounded-xl p-4 space-y-5 max-w-[430px] mx-auto shadow-sm">
            
            {/* Avatar Placeholder */}
            <div className="flex justify-center mb-2">
              <div className="w-24 h-24 rounded-md bg-md-secondary-container flex items-center justify-center border-4 border-md-surface shadow-sm text-md-on-secondary-container">
                 <User size={40} />
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-md-on-surface">
                {t('settings.account.form.fullName.label')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  // Filled Input Style
                  className="w-full h-12 rounded-md bg-md-surface-container-highest px-4 text-md-on-surface focus:outline-none focus:ring-2 focus:ring-md-primary pr-12 rtl:pl-12"
                  placeholder="Your Name"
                />
                 {isVoiceInput && (
                    <button
                      type="button"
                      onClick={() => { setVoiceTarget('name'); setVoiceModalOpen(true); }}
                      className={`absolute top-1.5 ${isRTL ? 'left-2' : 'right-2'} z-10 w-9 h-9 flex items-center justify-center rounded-md bg-md-secondary-container text-md-on-secondary-container hover:opacity-90 transition-colors`}
                    >
                      <Mic size={18} />
                    </button>
                  )}
              </div>
            </div>

            {/* Phone Input (Read Only) */}
            <div className="space-y-2 opacity-70">
              <label className="text-sm font-bold text-md-on-surface">
                {t('settings.account.form.phone.label')}
              </label>
              <input
                type="text"
                value={formData.phone}
                readOnly
                className="w-full h-12 rounded-md bg-md-surface-container-high px-4 text-md-on-surface-variant cursor-not-allowed border border-transparent"
              />
            </div>

            {/* Success Message */}
            {successMsg && (
              <div className="p-3 bg-md-success-container text-md-on-success-container rounded-lg text-sm font-medium text-center">
                {successMsg}
              </div>
            )}

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-md-secondary text-md-on-secondary min-h-12 rounded-lg font-bold text-lg shadow-sm mt-4 flex items-center justify-center gap-2 hover:shadow-md transition-all active:scale-[0.98]"
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
      <main className="min-h-screen flex-1 overflow-y-auto bg-md-surface">
        <div className="max-w-[430px] mx-auto p-4">
          
          {/* 1. Language Selection */}
          <section className="mb-6">
            <h2 className="text-sm font-bold text-md-on-surface-variant uppercase tracking-wider mb-3 px-1">
               {t('settings.appearance.language.title')}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLang('en')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200 border
                  ${lang === 'en' 
                    ? 'bg-md-secondary-container border-md-primary text-md-on-secondary-container shadow-sm' 
                    : 'bg-md-surface-container-high border-transparent text-md-on-surface hover:bg-md-surface-container-highest'}`}
              >
                <span className="text-3xl">🇺🇸</span>
                <span className="font-bold text-sm">English</span>
              </button>
              <button
                onClick={() => setLang('ur')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200 border
                  ${lang === 'ur' 
                    ? 'bg-md-secondary-container border-md-primary text-md-on-secondary-container shadow-sm' 
                    : 'bg-md-surface-container-high border-transparent text-md-on-surface hover:bg-md-surface-container-highest'}`}
              >
                <span className="text-3xl">🇵🇰</span>
                <span className="font-bold text-sm">اردو</span>
              </button>
            </div>
          </section>

          {/* 2. Accessibility */}
          <section className="mb-6">
             <button
                onClick={() => navigate('/accessibility')}
                className="w-full p-4 rounded-xl bg-md-surface-container hover:bg-md-surface-container-high transition-colors flex items-center gap-4 group shadow-sm border border-transparent hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-md bg-md-secondary flex items-center justify-center shrink-0 shadow-sm text-md-on-secondary">
                  <Eye size={24} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-lg text-md-on-surface">{t('settings.appearance.accessibility.title')}</h3>
                  <p className="text-xs text-md-on-surface-variant leading-tight mt-1">{t('settings.appearance.accessibility.description')}</p>
                </div>
                <ChevronRight size={20} className="text-md-on-surface-variant/50 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
              </button>
          </section>

          {/* 3. Account Settings */}
          {authLoading ? <AccountInfoSkeleton /> : (
            <section className="mb-6">
              <h2 className="text-sm font-bold text-md-on-surface-variant uppercase tracking-wider mb-3 px-1">
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

          {/* 4. More */}
          <section>
             <h2 className="text-sm font-bold text-md-on-surface-variant uppercase tracking-wider mb-3 px-1">
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
            <p className="text-[10px] text-md-on-surface-variant/40 uppercase tracking-widest font-semibold">
              v1.0.2 • Azad Bazaar
            </p>
          </div>

        </div>
      </main>
    </Layout>
  )
}