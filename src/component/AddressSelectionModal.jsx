import React, { useEffect, useState } from 'react';
import { X, MapPin, Loader2, Plus, Check, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAddress } from '../api/hooks/useAddress';
import { useI18n } from '../context/I18nContext';
import { useNavigate } from 'react-router-dom';

// Skeleton adjusted to match the card height
const AddressItemSkeleton = () => (
  <div className="w-full h-[88px] p-4 rounded-xl skeleton flex items-center gap-4">
    <div className="w-10 h-10 rounded-full skeleton shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-1/3 skeleton" />
      <div className="h-3 w-3/4 skeleton" />
    </div>
  </div>
);

export default function AddressSelectionModal({ isOpen, onClose }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { getDefaultAddress, setDefaultAddress } = useAuth();
  const { addresses, loading, refreshAddresses } = useAddress();

  const currentDefaultAddress = getDefaultAddress();
  const [selectedId, setSelectedId] = useState(currentDefaultAddress?.addressId);
  const [confirming, setConfirming] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedId(currentDefaultAddress?.addressId);
    }
  }, [isOpen, currentDefaultAddress]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleConfirm = async () => {
    if (confirming || !selectedId) return;
    
    if (selectedId === currentDefaultAddress?.addressId) {
      onClose();
      return;
    }

    setConfirming(true);
    try {
      await setDefaultAddress(selectedId);
      // Refresh addresses to reflect the updated default status immediately
      await refreshAddresses();
      onClose();
    } catch (err) {
      console.warn('Failed to set default address', err);
    } finally {
      setConfirming(false);
    }
  };
  
  const handleManageAddresses = () => {
    onClose();
    navigate('/address');
  }

  const isSelectionChanged = selectedId && selectedId !== currentDefaultAddress?.addressId;

  return (
    <>
      {/* Backdrop - Darkened only, no blur */}
      <div
        onClick={confirming ? undefined : onClose}
        className={`fixed inset-0 z-50 bg-black/70 transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
        }
        aria-hidden={!isOpen}
      />

      {/* Bottom Sheet Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        className={`fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto 
          primBg rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out
          flex flex-col
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}`
        }
      >
        {/* Drag Handle */}
        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 opacity-80" />
        </div>

        {/* Header */}
        <header className="px-5 py-3 flex items-center justify-between flex-shrink-0">
          <h2 id="modal-title" className="text-xl font-bold primText">
            {t('home.modal.selectAddressTitle') || 'Delivery Address'}
          </h2>
          <button
            onClick={onClose}
            disabled={confirming}
            className="btnSecondary rounded-full p-2 h-10 w-10 flex items-center justify-center focusRing disabled:opacity-50"
            aria-label={t('common.close')}
          >
            <X size={20} />
          </button>
        </header>

        {/* 
           Content - Scrollable Area 
           max-h-[320px] is approximately 3 cards (88px each + gap).
           This ensures the list is scrollable but doesn't take up the whole screen.
        */}
        <main className="flex-1 overflow-y-auto px-5 py-2 space-y-3 max-h-[320px] min-h-[150px]">
          {loading ? (
            <div className="space-y-3">
              <AddressItemSkeleton />
              <AddressItemSkeleton />
            </div>
          ) : addresses && addresses.length > 0 ? (
            <div className="space-y-3 pb-4">
              {addresses.map((address) => {
                const isSelected = selectedId === address.addressId;
                return (
                  <button
                    key={address.addressId}
                    onClick={() => setSelectedId(address.addressId)}
                    aria-pressed={isSelected}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-4 border-2 group
                      ${isSelected ? 'modeChooseButton-selected' : 'modeChooseButton-unselected'}`
                    }
                  >
                    {/* Icon */}
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors
                      ${isSelected ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'secBg secText'}
                    `}>
                      <MapPin size={20} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'primText'}`}>
                          {address.label}
                        </span>
                        {address.isDefault && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded badgeSecondary bg-gray-200 dark:bg-gray-700 secText uppercase tracking-wider font-bold">
                            {t('common.default') || 'Default'}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm truncate mt-0.5 ${isSelected ? 'text-blue-600/80 dark:text-blue-300/80' : 'secText'}`}>
                        {address.addressText}
                      </p>
                    </div>

                    {/* Checkmark */}
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors
                      ${isSelected 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'border-gray-300 dark:border-slate-600 bg-transparent text-transparent group-hover:border-gray-400'}
                    `}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 secBg primBorder rounded-xl border">
               <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                 <MapPin size={32} className="secText" />
               </div>
               <div>
                 <p className="font-semibold primText text-lg">{t('home.modal.noAddressesFound') || 'No addresses found'}</p>
                 <p className="text-sm secText max-w-[200px] mx-auto mt-1">{t('home.modal.addOnePrompt') || 'Add a delivery location to continue shopping.'}</p>
               </div>
            </div>
          )}
        </main>
        
        {/* Footer Actions */}
        <footer className="px-5 py-4 border-t dividerBorder flex flex-col gap-3 flex-shrink-0 bg-inherit">
          {/* Main Action */}
          {addresses && addresses.length > 0 && (
            <button
              onClick={handleConfirm}
              disabled={!isSelectionChanged || confirming}
              className={`w-full min-h-12 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all shadow-sm
                ${(!isSelectionChanged || confirming) 
                  ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed' 
                  : 'btnPrimary shadow-md transform active:scale-[0.98]'}`
              }
            >
              {confirming && <Loader2 size={20} className="animate-spin" />}
              {confirming ? (t('common.saving') || 'Saving...') : (t('common.confirm') || 'Confirm Address')}
            </button>
          )}

          {/* Secondary Action */}
          <button 
            onClick={handleManageAddresses} 
            className="w-full min-h-12 btnSecondary rounded-xl flex items-center justify-center gap-2 font-medium"
          >
            {(!addresses || addresses.length === 0) ? (
              <>
                <Plus size={18} />
                {t('home.modal.addAddressButton') || 'Add New Address'}
              </>
            ) : (
              <>
                <Settings size={18} className="secText" />
                <span className="secText">{t('home.modal.manageAll') || 'Manage Addresses'}</span>
              </>
            )}
          </button>
        </footer>
      </div>
    </>
  );
}