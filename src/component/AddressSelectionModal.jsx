import React, { useEffect, useState } from 'react';
import { X, MapPin, Loader2, Plus, Check, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAddress } from '../api/hooks/useAddress';
import { useI18n } from '../context/I18nContext';
import { useNavigate } from 'react-router-dom';

// MD3 Skeleton: Uses Surface Variant with opacity for subtle loading
const AddressItemSkeleton = () => (
  <div className="w-full h-[88px] p-4 rounded-md bg-md-surface-container animate-pulse flex items-center gap-4 border border-transparent">
    <div className="w-10 h-10 rounded-full bg-md-surface-variant/50 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-1/3 bg-md-surface-variant/50 rounded" />
      <div className="h-3 w-3/4 bg-md-surface-variant/30 rounded" />
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
      {/* Backdrop - Scrim Color */}
      <div
        onClick={confirming ? undefined : onClose}
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300
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
        // HCI: Surface color establishes the modal layer. rounded-t-2xl is standard for bottom sheets.
        className={`fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto 
          bg-md-surface text-md-on-surface rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out
          flex flex-col
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}`
        }
      >
        {/* Drag Handle - On Surface Variant */}
        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-md-on-surface-variant/40" />
        </div>

        {/* Header */}
        <header className="px-5 py-3 flex items-center justify-between flex-shrink-0">
          <h2 id="modal-title" className="text-xl font-bold text-md-on-surface">
            {t('home.modal.selectAddressTitle') || 'Delivery Address'}
          </h2>
          {/* Close Button: Ghost button style */}
          <button
            onClick={onClose}
            disabled={confirming}
            className="w-10 h-10 rounded-full flex items-center justify-center text-md-on-surface-variant hover:bg-md-surface-variant/20 transition-colors disabled:opacity-50"
            aria-label={t('common.close')}
          >
            <X size={24} />
          </button>
        </header>

        {/* Content - Scrollable Area */}
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
                
                // HCI Logic:
                // Selected: Primary Container (High visual signal)
                // Unselected: Surface Container (Distinct card from background)
                const cardClasses = isSelected 
                  ? 'bg-md-primary-container border-md-primary ring-1 ring-md-primary' 
                  : 'bg-md-surface-container border-transparent hover:bg-md-surface-container-high';
                
                const textMain = isSelected ? 'text-md-on-primary-container' : 'text-md-on-surface';
                const textSub = isSelected ? 'text-md-on-primary-container/80' : 'text-md-on-surface-variant';
                const iconColor = isSelected ? 'text-md-on-primary-container' : 'text-md-primary';

                return (
                  <button
                    key={address.addressId}
                    onClick={() => setSelectedId(address.addressId)}
                    aria-pressed={isSelected}
                    className={`w-full p-4 rounded-md text-left transition-all duration-200 flex items-center gap-4 border
                      ${cardClasses}`
                    }
                  >
                    {/* Icon Container */}
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors
                      ${isSelected ? 'bg-md-background/20' : 'bg-md-surface-container-highest'}
                    `}>
                      <MapPin size={20} className={iconColor} />
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold truncate ${textMain}`}>
                          {address.label}
                        </span>
                        {address.isDefault && (
                          // Badge: Tertiary Container for "Info" badges to avoid competing with Primary selection
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-md-tertiary-container text-md-on-tertiary-container uppercase tracking-wider font-bold">
                            {t('common.default') || 'Default'}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm truncate mt-0.5 ${textSub}`}>
                        {address.addressText}
                      </p>
                    </div>

                    {/* Radio/Check Indicator */}
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 transition-all
                      ${isSelected 
                        ? 'bg-md-primary border-md-primary text-md-on-primary' 
                        : 'border-md-outline text-transparent'}
                    `}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 bg-md-surface-container rounded-md border border-md-outline-variant/50">
               <div className="w-16 h-16 rounded-full bg-md-surface-container-highest flex items-center justify-center">
                 <MapPin size={32} className="text-md-on-surface-variant" />
               </div>
               <div>
                 <p className="font-semibold text-md-on-surface text-lg">{t('home.modal.noAddressesFound') || 'No addresses found'}</p>
                 <p className="text-sm text-md-on-surface-variant max-w-[200px] mx-auto mt-1">{t('home.modal.addOnePrompt') || 'Add a delivery location to continue shopping.'}</p>
               </div>
            </div>
          )}
        </main>
        
        {/* Footer Actions */}
        <footer className="px-5 py-4 border-t border-md-outline-variant/30 flex flex-col gap-3 flex-shrink-0">
          {/* Main Action - Primary Button */}
          {addresses && addresses.length > 0 && (
            <button
              onClick={handleConfirm}
              disabled={!isSelectionChanged || confirming}
              className={`w-full min-h-12 rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-all
                ${(!isSelectionChanged || confirming) 
                  ? 'bg-md-surface-container-highest text-md-on-surface-variant/50 cursor-not-allowed' 
                  : 'bg-md-primary text-md-on-primary hover:shadow-md active:opacity-90'}`
              }
            >
              {confirming && <Loader2 size={20} className="animate-spin" />}
              {confirming ? (t('common.saving') || 'Saving...') : (t('common.confirm') || 'Confirm Address')}
            </button>
          )}

          {/* Secondary Action - Tonal Button (Surface Container Highest) or Outlined */}
          {/* Using Outlined style (Border Primary) to distinguish from the filled Primary button above */}
          <button 
            onClick={handleManageAddresses} 
            className="w-full min-h-12 rounded-md border border-md-outline text-md-primary font-medium flex items-center justify-center gap-2 hover:bg-md-surface-container-highest/50 transition-colors"
          >
            {(!addresses || addresses.length === 0) ? (
              <>
                <Plus size={18} />
                {t('home.modal.addAddressButton') || 'Add New Address'}
              </>
            ) : (
              <>
                <Settings size={18} />
                <span>{t('home.modal.manageAll') || 'Manage Addresses'}</span>
              </>
            )}
          </button>
        </footer>
      </div>
    </>
  );
}