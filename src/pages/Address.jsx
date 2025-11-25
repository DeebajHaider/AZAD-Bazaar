import React, { useState } from 'react'
import { Plus, Edit2, Trash2, MapPin, X, Loader2 } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import useAddress from '../api/hooks/useAddress'
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import { showToast } from '../utils/toast'

// --- Language Constants (unchanged) ---
const languageStrings = {
  en: {
    title: 'My Addresses', back: 'Go back', add: 'Add', loading: 'Loading addresses...', noAddresses: 'No addresses saved yet', addFirstAddress: 'Add Your First Address', defaultBadge: 'Default', edit: 'Edit', delete: 'Delete', confirmDelete: 'Are you sure you want to delete this address?', deleteSuccess: 'Address deleted successfully!', deleteError: 'Failed to delete address', modalEditTitle: 'Edit Address', modalAddTitle: 'Add New Address', labelPlaceholder: 'e.g., Home, Office', fullAddressLabel: 'Full Address', addressPlaceholder: 'Enter complete address with street, city, state, zip code, and country', captureLocation: 'Capture Current Location', locationCaptured: 'Location captured!', locationError: 'Unable to get location: ', geolocationUnsupported: 'Geolocation is not supported by your browser', setDefault: 'Set as default address', cancel: 'Cancel', update: 'Update', saving: 'Saving...', saveSuccess: 'Address saved successfully!', saveError: 'Failed to save address', cannotDeleteDefault: 'Default address cannot be deleted'
  },
  ur: {
    title: 'میرے پتے', back: 'واپس جائیں', add: 'شامل کریں', loading: 'پتے لوڈ ہو رہے ہیں...', noAddresses: 'کوئی پتہ محفوظ نہیں ہے', addFirstAddress: 'اپنا پہلا پتہ شامل کریں', defaultBadge: 'ڈیفالٹ', edit: 'ترمیم', delete: 'حذف کریں', confirmDelete: 'کیا آپ واقعی اس پتے کو حذف کرنا چاہتے ہیں؟', deleteSuccess: 'پتہ کامیابی سے حذف ہو گیا!', deleteError: 'پتہ حذف کرنے میں ناکامی', modalEditTitle: 'پتے میں ترمیم کریں', modalAddTitle: 'نیا پتہ شامل کریں', labelPlaceholder: 'مثلاً، گھر، دفتر', fullAddressLabel: 'مکمل پتہ', addressPlaceholder: 'گلی، شہر، ریاست، زپ کوڈ، اور ملک کے ساتھ مکمل پتہ درج کریں', captureLocation: 'موجودہ مقام کیپچر کریں', locationCaptured: 'مقام کیپچر ہو گیا!', locationError: 'مقام حاصل کرنے سے قاصر: ', geolocationUnsupported: 'جغرافیائی محل وقوع آپ کے براؤزر کے ذریعے تعاون یافتہ نہیں ہے۔', setDefault: 'ڈیفالٹ پتہ کے طور پر سیٹ کریں', cancel: 'منسوخ', update: 'اپ ڈیٹ', saving: 'محفوظ کیا جا رہا ہے...', saveSuccess: 'پتہ کامیابی سے محفوظ ہو گیا!', saveError: 'پتہ محفوظ کرنے میں ناکامی', cannotDeleteDefault: 'ڈیفالٹ پتہ حذف نہیں کیا جا سکتا'
  }
}

// --- Sub-components ---

const AddressCardSkeleton = () => (
  <div className="card space-y-3">
    <div className="flex justify-between items-start">
      <div className="w-1/2 h-6 skeleton" />
      <div className="w-1/4 h-5 skeleton rounded-full" />
    </div>
    <div className="w-full h-10 skeleton" />
    <div className="flex gap-2 pt-2">
      <div className="flex-1 h-10 skeleton" />
      <div className="flex-1 h-10 skeleton" />
    </div>
  </div>
)

// --- Main Address Component ---

export default function Address() {
  const { lang } = useI18n()
  const t = (key) => languageStrings[lang][key] || languageStrings['en'][key]

  const { addresses, loading, addAddress, updateAddress, deleteAddress } = useAddress()

  const [showModal, setShowModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [formData, setFormData] = useState({ label: '', addressText: '', lat: null, lng: null, isDefault: false })
  
  const [mutatingState, setMutatingState] = useState({ id: null, type: null })
  const isActionLoading = !!mutatingState.type

  const handleOpenModal = (address = null) => {
    if (isActionLoading) return
    if (address) {
      setEditingAddress(address)
      setFormData({
        label: address.label || '', addressText: address.addressText || '',
        lat: address.lat || null, lng: address.lng || null, isDefault: address.isDefault || false
      })
    } else {
      setEditingAddress(null)
      setFormData({ label: '', addressText: '', lat: null, lng: null, isDefault: false })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    if (mutatingState.type === 'save') return
    setShowModal(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMutatingState({ type: 'save' })
    try {
      console.log('Submitting form data:', formData)
      if (editingAddress) {
        await updateAddress({ ...formData, addressId: editingAddress.addressId })
      } else {
        await addAddress(formData)
      }
      console.log('Address saved successfully:', formData)
      showToast('success', t('saveSuccess'))
      setShowModal(false) // FIX: Directly set state to close the modal
    } catch (error) {
      showToast('error', error.message || t('saveError'))
    } finally {
      setMutatingState({ id: null, type: null })
    }
  }

  const handleDelete = async (addressId) => {
    if (isActionLoading) return
    // Prevent deleting the default address
    const target = Array.isArray(addresses) ? addresses.find(a => a.addressId === addressId) : null
    if (target && target.isDefault) {
      showToast('error', t('cannotDeleteDefault'))
      return
    }
    if (window.confirm(t('confirmDelete'))) {
      setMutatingState({ id: addressId, type: 'delete' })
      try {
        await deleteAddress(addressId)
        showToast('success', t('deleteSuccess'))
      } catch (error) {
        showToast('error', error.message || t('deleteError'))
      } finally {
        setMutatingState({ id: null, type: null })
      }
    }
  }

  const handleCaptureLocation = () => {
    if (isActionLoading) return
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({ ...prev, lat: position.coords.latitude, lng: position.coords.longitude }))
          showToast('success', t('locationCaptured'))
        },
        (error) => { showToast('error', t('locationError') + error.message) }
      )
    } else {
      showToast('error', t('geolocationUnsupported'))
    }
  }

  return (
    <Layout
      header={
        <HeaderWithName
          title={t('title')}
          rightAction={
            <button
              onClick={() => handleOpenModal()}
              className="btnPrimary px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
              disabled={isActionLoading}
            >
              <Plus size={18} />
              {t('add')}
            </button>
          }
        />
      }
    >
      <main className="primBg flex-1 overflow-y-auto p-4 min-h-full">
        {loading ? (
          <div className="space-y-3">
            <AddressCardSkeleton />
            <AddressCardSkeleton />
          </div>
        ) : !Array.isArray(addresses) || addresses.length === 0 ? (
          <div className="text-center py-16 secText">
            <MapPin size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-medium text-lg primText mb-2">{t('noAddresses')}</p>
            <button onClick={() => handleOpenModal()} className="btnPrimary mt-4 px-5 py-2.5 rounded-lg text-sm">
              {t('addFirstAddress')}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {addresses.map((address) => {
              const isDeleting = mutatingState.type === 'delete' && mutatingState.id === address.addressId;
              return (
                <div key={address.addressId} className={`card relative p-4 transition-opacity duration-300 ${isDeleting ? 'opacity-50' : ''}`}>
                  {address.isDefault && (
                    <span className="badgePrimary absolute top-3 right-3">{t('defaultBadge')}</span>
                  )}
                  <div className="mb-3 pr-20">
                    <h3 className="text-md font-semibold mb-1 primText">{address.label}</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap secText">{address.addressText}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleOpenModal(address)} className="btnSecondary flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm" disabled={isActionLoading}>
                      <Edit2 size={16} />{t('edit')}
                    </button>
                    <button onClick={() => {
                      if (address.isDefault) showToast( t('cannotDeleteDefault'))
                      else handleDelete(address.addressId)
                    }} className={`btnDanger flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm ${address.isDefault ? 'opacity-50' : ''}`} disabled={isActionLoading} >
                      <Trash2 size={16} />{t('delete')}
                    </button>
                  </div>
                  {isDeleting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-transparent rounded-lg">
                      <Loader2 className="animate-spin primText" size={28} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" onClick={handleCloseModal}>
          <div onClick={(e) => e.stopPropagation()} className="secBg w-full max-w-[430px] rounded-t-2xl max-h-[90vh] flex flex-col overflow-hidden" style={{animation:'slideUp 0.3s ease-out'}}>
            <header className="secBg dividerBorder sticky top-0 p-4 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
              <h2 className="text-lg font-semibold primText">
                {editingAddress ? t('modalEditTitle') : t('modalAddTitle')}
              </h2>
              <button onClick={handleCloseModal} className="btnSecondary rounded-full !p-0 h-9 w-9 flex items-center justify-center" aria-label="Close modal" disabled={mutatingState.type === 'save'}>
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-1">
              <fieldset disabled={mutatingState.type === 'save'} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 primText">{t('labelPlaceholder')}</label>
                  <input type="text" value={formData.label} onChange={(e) => setFormData(prev => ({...prev, label: e.target.value}))} required className="inputField" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 primText">{t('fullAddressLabel')}</label>
                  <textarea value={formData.addressText} onChange={(e) => setFormData(prev => ({...prev, addressText: e.target.value}))} required rows={4} placeholder={t('addressPlaceholder')} className="inputField resize-y" />
                  <button type="button" onClick={handleCaptureLocation} className="btnSecondary mt-2 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                    <MapPin size={16} /> {t('captureLocation')}
                  </button>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={(e) => setFormData(prev => ({...prev, isDefault: e.target.checked}))} className="w-5 h-5 cursor-pointer accentPrimBg focusRing rounded" />
                  <label htmlFor="isDefault" className="text-sm cursor-pointer primText">{t('setDefault')}</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={handleCloseModal} className="btnSecondary flex-1 py-3 rounded-lg text-sm font-medium">{t('cancel')}</button>
                  <button type="submit" className="btnPrimary flex-1 py-3 rounded-lg text-sm font-medium flex items-center justify-center disabled:opacity-60">
                    {mutatingState.type === 'save' ? <Loader2 size={20} className="animate-spin" /> : editingAddress ? t('update') : t('add')}
                  </button>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </Layout>
  )
}