import React, { useState, useContext, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Edit3, Save, Wallet, CreditCard, Loader2, Mic, MapPin, 
  Plus, Check, Circle, Smartphone, X, ChevronRight, Banknote 
} from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import { useCart } from '../context/CartContext'
import AuthContext from '../context/AuthContext'
import { useOrdersContext } from '../context/OrderContext'
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import BottomNav from '../component/BottomNav'
import VoiceInputModal from '../component/VoiceInputModal'
import { useAccessibility } from '../context/AccessibilityContext'
import { useMobileWallets, useCreditCards } from '../context/PaymentDataContext'
import { showToast } from '../utils/toast'

// --- Skeleton Components ---
const CheckoutSkeleton = () => (
  <div className="p-4 space-y-6 min-h-full animate-pulse">
    <div className="secBg primBorder rounded-lg">
      <div className="flex justify-between items-center p-4 dividerBorder">
        <div className="h-6 w-32 skeleton" />
        <div className="h-6 w-20 skeleton" />
      </div>
      <div className="p-4 space-y-4">
        <div className="h-24 w-full skeleton rounded-lg" />
      </div>
    </div>
    <div className="secBg primBorder rounded-lg p-4 space-y-4">
      <div className="h-6 w-32 skeleton" />
      <div className="space-y-3">
         <div className="h-14 skeleton rounded-lg" />
         <div className="h-14 skeleton rounded-lg" />
         <div className="h-14 skeleton rounded-lg" />
         <div className="h-14 skeleton rounded-lg" />
         <div className="h-14 skeleton rounded-lg" />
      </div>
    </div>
  </div>
)

const CheckoutBillingSkeleton = () => (
  <div className="primBg">
    <div className="secBg primBorder rounded-lg p-4 space-y-3">
      <div className="h-6 w-24 skeleton mb-2" />
      <div className="flex justify-between">
        <div className="h-5 w-20 skeleton" />
        <div className="h-5 w-16 skeleton" />
      </div>
      <div className="pt-3 mt-1 dividerBorder border-t flex justify-between">
        <div className="h-6 w-20 skeleton" />
        <div className="h-6 w-24 skeleton" />
      </div>
    </div>
  </div>
);

// --- Sub-components ---

const PaymentRow = ({ 
  icon: Icon, 
  label, 
  subLabel, 
  isSelected, 
  onSelect, 
  actionLabel, 
  onAction,
  iconColorClass = "secText"
}) => (
  <div 
    onClick={onSelect}
    className={`
      w-full flex items-center gap-3 p-3.5 rounded-lg transition-all duration-200 border-2 cursor-pointer
      ${isSelected 
        ? 'modeChooseButton-selected shadow-sm' 
        : 'modeChooseButton-unselected border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
      }
    `}
  >
    {/* Icon */}
    <div className={`
      w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
      ${isSelected ? 'bg-white dark:bg-slate-950' : 'secBg'}
    `}>
      <Icon size={20} className={isSelected ? 'accentPrimText' : iconColorClass} />
    </div>

    {/* Text */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className={`font-semibold text-sm ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'primText'}`}>
          {label}
        </span>
      </div>
      {subLabel && (
        <p className={`text-xs truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'secText'}`}>
          {subLabel}
        </p>
      )}
    </div>

    {/* Selection / Action */}
    <div>
      {actionLabel ? (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          className="text-xs font-bold px-3 py-1.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        >
          {actionLabel}
        </button>
      ) : (
        <div className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center
          ${isSelected 
            ? 'border-blue-500 bg-blue-500 text-white' 
            : 'border-gray-300 dark:border-gray-600 bg-transparent'
          }
        `}>
          {isSelected && <Check size={12} strokeWidth={3} />}
        </div>
      )}
    </div>
  </div>
)

// --- Main Checkout Component ---

export default function Checkout() {
  const { t, lang } = useI18n()
  const { items: cartItems, total: cartTotal, clearCart, loading: cartLoading } = useCart()
  const { user, customer, loading: authLoading, getDefaultAddress } = useContext(AuthContext)
  const { createOrder } = useOrdersContext()
  const navigate = useNavigate()
  
  // Payment Context
  const { mobileWallets, loading: walletsLoading, addMobileWallet, updateMobileWallet } = useMobileWallets()
  const { creditCards, loading: cardsLoading, addCreditCard } = useCreditCards()

  // Accessibility
  const { ascMode } = useAccessibility() || {}
  const isVoiceInput = typeof ascMode === 'string' && ascMode.includes('voiceInput')
  const isRTL = lang === 'ar' || lang === 'he' || lang === 'fa' || lang === 'ur';

  // State Management
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderError, setOrderError] = useState(null)
  
  // Address State
  const [isSelectingAddress, setIsSelectingAddress] = useState(false)
  const [address, setAddress] = useState(null)

  // Payment State
  // Use backend-compatible values for payment type
  // 'cash_on_delivery', 'card_on_delivery', 'jazzcash', 'easypaisa', 'credit_card', 'cash'
  const [selectedPaymentType, setSelectedPaymentType] = useState('cash_on_delivery')
  const [modalState, setModalState] = useState({ type: null, data: null }) // type: 'wallet', 'card', 'cardList'
  const [isSaving, setIsSaving] = useState(false)

  // Initialize Address from Context
  useEffect(() => {
    if (!address && customer && customer.addresses && customer.addresses.length > 0) {
      const def = getDefaultAddress ? getDefaultAddress() : customer.addresses.find(a => a.isDefault);
      const fallback = customer.addresses[0];
      const target = def || fallback;
      
      setAddress({
        label: target.label || 'Home',
        addressText: target.addressText || '',
        lat: target.lat ?? null,
        lng: target.lng ?? null,
        addressId: target.addressId
      });
    }
  }, [customer, getDefaultAddress, address]);

  const [instructions, setInstructions] = useState('')
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)

  const handleVoiceConfirm = useCallback((transcript) => {
    setInstructions(transcript)
    setVoiceModalOpen(false);
  }, [])

  // Derived Payment Data
  const jazzCashWallet = mobileWallets?.find(w => w.provider === 'Jazzcash');
  const easypaisaWallet = mobileWallets?.find(w => w.provider === 'Easypaisa');
  const defaultCard = creditCards?.find(c => c.isDefault) || creditCards?.[0];
  const [currentCard, setCurrentCard] = useState(defaultCard || null);

  // Logic: Handle Payment Selection
  const handlePaymentSelect = (type) => {
    // 1. Wallets
    if (type === 'jazzcash') {
      if (jazzCashWallet) {
        setSelectedPaymentType('jazzcash');
      } else {
        setModalState({ type: 'wallet', data: { provider: 'Jazzcash' } });
      }
      return;
    }
    if (type === 'easypaisa') {
      if (easypaisaWallet) {
        setSelectedPaymentType('easypaisa');
      } else {
        setModalState({ type: 'wallet', data: { provider: 'Easypaisa' } });
      }
      return;
    }

    // 2. Credit/Debit Card (Online)
    if (type === 'credit_card') {
      if (defaultCard) {
        setSelectedPaymentType('credit_card');
      } else {
        setModalState({ type: 'card', data: null });
      }
      return;
    }

    // 3. COD and Card on Delivery
    setSelectedPaymentType(type);
  };

  // Calculation Logic
  const subtotal = cartTotal
  const serviceFee = 2.5
  const deliveryFee = 5.0
  const taxRate = 0.13
  const tax = +(subtotal * taxRate).toFixed(2)
  const total = +(subtotal + serviceFee + deliveryFee + tax).toFixed(2)

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0.00'
    return new Intl.NumberFormat(lang, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const handlePlaceOrder = async () => {
    if (!user || !user.customerId) {
      alert('You must be logged in to place an order.')
      return
    }
    
    if (!address) {
      alert(t('checkout.address.errorNoAddress') || 'Please select a delivery address');
      return;
    }

        // Prepare Payment Method Object based on Selection
        let finalPaymentMethod = { type: selectedPaymentType };

        // Add details for mobile wallets
        if (selectedPaymentType === 'jazzcash' && jazzCashWallet) {
          finalPaymentMethod.type = 'mobile_wallet';
          finalPaymentMethod.provider = 'Jazzcash';
          finalPaymentMethod.details = jazzCashWallet.mobileNumber;
        } else if (selectedPaymentType === 'easypaisa' && easypaisaWallet) {
          finalPaymentMethod.type = 'mobile_wallet';
          finalPaymentMethod.provider = 'Easypaisa';
          finalPaymentMethod.details = easypaisaWallet.mobileNumber;
        } else if (selectedPaymentType === 'credit_card' && currentCard) {
          finalPaymentMethod.provider = currentCard.brand;
          finalPaymentMethod.details = `${currentCard.brand.toUpperCase()} •••• ${currentCard.last4Digits}`;
        } else if (selectedPaymentType === 'card_on_delivery') {
          finalPaymentMethod = { type: 'card_on_delivery', name: 'Card on Delivery' };
        } else if (selectedPaymentType === 'cash_on_delivery') {
          finalPaymentMethod = { type: 'cash_on_delivery', name: 'Cash on Delivery' };
        } else {
          // fallback for legacy
          finalPaymentMethod = { type: 'cash', name: 'Cash on Delivery' };
        }

    const orderData = {
      customerId: user.customerId,
      customName: user.name,
      address: {
        ...address,
        lat: address.lat ?? 0,
        lng: address.lng ?? 0
      },
      paymentMethod: finalPaymentMethod,
      products: cartItems.map(item => ({
        productId: item.itemCode,
        quantity: item.quantity
      })),
      deliveryInstructions: instructions,
      vouchersUsed: []
    }

    setOrderLoading(true)
    setOrderError(null)
    
    try {
      const newOrder = await createOrder(orderData)
      if (newOrder) {
        clearCart()
        navigate('/orders')
      }
    } catch (err) {
      console.error('Failed to create order:', err)
      setOrderError(err)
      alert(`Error: ${err.message}`)
    } finally {
      setOrderLoading(false)
    }
  }

  // Handle Loading States
  if (cartLoading || authLoading || (user && user.customerId && !customer) || walletsLoading || cardsLoading) {
    return (
      <Layout
        header={<HeaderWithName title={t('checkout.title')} to="/cart" />}
        footer={<><CheckoutBillingSkeleton /><BottomNav /></>}
      >
        <main className="flex-1 overflow-y-auto primBg min-h-full">
          <CheckoutSkeleton />
        </main>
      </Layout>
    )
  }

  const PlaceOrderFooter = () => (
    <div className="secBg dividerBorder border-t p-4">
      <button
        onClick={handlePlaceOrder}
        disabled={orderLoading}
        className="w-full min-h-12 px-6 py-3 btnPrimary rounded-lg transition-all duration-200 flex items-center justify-center"
      >
        {orderLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          t('checkout.actions.placeOrder')
            .replace('${{total}}', `${t('common.currencySymbol') }${formatCurrency(total)}`)
        )}
      </button>
      {orderError && <p className="text-red-500 text-sm mt-2 text-center">{orderError.message}</p>}
    </div>
  )

  return (
    <Layout
      header={<HeaderWithName title={t('checkout.title')} to="/cart" />}
      footer={<><PlaceOrderFooter /><BottomNav /></>}
    >
      <main className="flex-1 overflow-y-auto primBg min-h-full">
        <div className="p-4 space-y-6">
          
          {/* --- ADDRESS SECTION --- */}
          <section className="secBg primBorder rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 pb-2">
              <h2 className="text-lg font-semibold primText">{t('checkout.address.title')}</h2>
              <button
                onClick={() => setIsSelectingAddress(!isSelectingAddress)}
                className="text-sm font-semibold accentPrimText hover:underline px-2 py-1"
              >
                {isSelectingAddress 
                  ? (t('common.done') || 'Done')
                  : (t('checkout.address.changeButton') || 'Change')
                }
              </button>
            </div>

            <div className="px-4 pb-4">
              {isSelectingAddress ? (
                <div className="space-y-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-medium secText uppercase tracking-wide">{t('checkout.address.savedAddresses') || 'Saved Addresses'}</span>
                    <button onClick={() => navigate('/address')} className="text-xs font-semibold accentPrimText flex items-center gap-1">
                      <Plus size={14} /> {t('checkout.address.addNew') || 'Manage'}
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1 -mr-1 custom-scrollbar">
                    {customer?.addresses && customer.addresses.length > 0 ? (
                      customer.addresses.map((addr) => {
                        const isSelected = address?.addressId === addr.addressId;
                        return (
                          <button
                            key={addr.addressId}
                            onClick={() => {
                              setAddress({ ...addr });
                            }}
                            className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-3
                              ${isSelected ? 'modeChooseButton-selected' : 'modeChooseButton-unselected secHoverBg'}
                            `}
                          >
                            <div className={`mt-0.5 flex-shrink-0 ${isSelected ? 'accentPrimText' : 'secText'}`}>
                              {isSelected ? (
                                <div className="w-5 h-5 rounded-full accentPrimBg flex items-center justify-center text-white">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                              ) : (
                                <Circle size={20} className="text-gray-300 dark:text-gray-600" />
                              )}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <p className={`font-bold text-sm mb-0.5 ${isSelected ? 'accentPrimText' : 'primText'}`}>
                                        {addr.label}
                                    </p>
                                    {addr.isDefault && <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">Default</span>}
                                </div>
                              <p className="text-sm secText line-clamp-2">{addr.addressText}</p>
                            </div>
                          </button>
                        )
                      })
                    ) : (
                      <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        <p className="secText text-sm mb-3">{t('checkout.address.noAddresses') || 'No addresses found.'}</p>
                        <button onClick={() => navigate('/address')} className="btnSecondary px-4 py-2 rounded-lg text-sm">
                          {t('checkout.address.createFirst') || 'Add New Address'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  {address ? (
                    <div className="flex items-start gap-3.5 py-1">
                      <div className="mt-1.5 p-2 rounded-full secBg accentPrimText flex-shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider secText mb-1">{address.label}</p>
                        <p className="text-lg font-medium primText leading-snug">{address.addressText}</p>
                      </div>
                    </div>
                  ) : (
                     <button 
                        onClick={() => setIsSelectingAddress(true)}
                        className="w-full py-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                     >
                        <Plus size={24} className="mb-2" />
                        <span className="text-sm font-medium">{t('checkout.address.selectPrompt') || 'Select Delivery Address'}</span>
                     </button>
                  )}
                </div>
              )}

              <div className="pt-4 border-t dividerBorder relative">
                <label className="block text-sm font-medium mb-2 primText flex items-center gap-2">
                   {t('checkout.address.instructionsLabel')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('checkout.address.instructionsPlaceholder')}
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    className={`inputField transition-all duration-200 ${isRTL ? 'pl-12' : 'pr-12'}`}
                  />
                  {isVoiceInput && (
                    <button
                      type="button"
                      onClick={() => setVoiceModalOpen(true)}
                      className={`absolute top-1.5 ${isRTL ? 'left-2' : 'right-2'} z-10 flex items-center justify-center w-9 h-9 rounded-full accentPrimBg hover:opacity-90 transition-colors`}
                    >
                      <Mic size={20} className="primText" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Voice Modal */}
          {isVoiceInput && voiceModalOpen && (
            <VoiceInputModal
              isOpen={voiceModalOpen}
              onClose={() => setVoiceModalOpen(false)}
              onConfirm={handleVoiceConfirm}
              confirmLabel={t('voiceModal.actions.confirmInstructions')}
            />
          )}

          {/* --- PAYMENT SECTION (NEW UNIFIED UI) --- */}
          <section className="secBg primBorder rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold primText">{t('checkout.payment.title')}</h2>
              {/* Optional: Secure Badge */}
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
                 <Check size={10} strokeWidth={4} /> Secure
              </div>
            </div>

            <div className="flex flex-col gap-1">
              
              {/* 1. Cash on Delivery */}
              <PaymentRow 
                icon={Banknote}
                label={t('checkout.payment.cashOnDelivery')}
                isSelected={selectedPaymentType === 'cash_on_delivery'}
                onSelect={() => handlePaymentSelect('cash_on_delivery')}
                iconColorClass="text-green-600 dark:text-green-400"
              />

              {/* 2. Card on Delivery */}
              <PaymentRow 
                icon={CreditCard}
                label="Card on Delivery"
                subLabel="Pay via POS terminal at doorstep"
                isSelected={selectedPaymentType === 'card_on_delivery'}
                onSelect={() => handlePaymentSelect('card_on_delivery')}
                iconColorClass="text-orange-500"
              />

              {/* 3. JazzCash */}
              <PaymentRow 
                icon={Smartphone}
                label="JazzCash"
                subLabel={jazzCashWallet ? jazzCashWallet.mobileNumber : 'Link account to pay'}
                isSelected={selectedPaymentType === 'jazzcash'}
                onSelect={() => handlePaymentSelect('jazzcash')}
                iconColorClass="text-red-600"
                actionLabel={!jazzCashWallet ? 'Setup' : null}
                onAction={() => setModalState({ type: 'wallet', data: { provider: 'Jazzcash' } })}
              />

              {/* 4. Easypaisa */}
              <PaymentRow 
                icon={Smartphone}
                label="Easypaisa"
                subLabel={easypaisaWallet ? easypaisaWallet.mobileNumber : 'Link account to pay'}
                isSelected={selectedPaymentType === 'easypaisa'}
                onSelect={() => handlePaymentSelect('easypaisa')}
                iconColorClass="text-green-500"
                actionLabel={!easypaisaWallet ? 'Setup' : null}
                onAction={() => setModalState({ type: 'wallet', data: { provider: 'Easypaisa' } })}
              />

              {/* 5. Credit/Debit Card (Online) */}
              <PaymentRow 
                icon={CreditCard}
                label={t('checkout.payment.card')}
                subLabel={currentCard 
                  ? `${currentCard.brand.toUpperCase()} •••• ${currentCard.last4Digits}`
                  : 'Add a card for online payment'
                }
                isSelected={selectedPaymentType === 'credit_card'}
                onSelect={() => handlePaymentSelect('credit_card')}
                iconColorClass="text-blue-600"
                actionLabel={currentCard ? 'Change' : 'Add'}
                onAction={() => setModalState({ type: currentCard ? 'cardList' : 'card' })}
              />

            </div>
          </section>

          {/* --- Billing Section --- */}
          <section className="secBg primBorder rounded-lg p-4 space-y-3">
            <h2 className="text-lg font-semibold primText mb-2">{t('checkout.billing.title')}</h2>
            <div className="flex justify-between text-base">
              <span className="secText">{t('checkout.billing.subtotal')}</span>
              <span className="font-medium primText ">{t('common.currencySymbol')}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="secText">{t('checkout.billing.serviceFee')}</span>
              <span className="font-medium primText ">{t('common.currencySymbol')}{serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="secText">{t('checkout.billing.deliveryFee')}</span>
              <span className="font-medium primText ">{t('common.currencySymbol')}{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="secText">{t('checkout.billing.tax')}</span>
              <span className="font-medium primText ">{t('common.currencySymbol')}{tax.toFixed(2)}</span>
            </div>
            <div className="pt-3 mt-1 dividerBorder border-t flex justify-between text-lg font-semibold">
              <span className="primText ">{t('checkout.billing.total')}</span>
              <span className="primText ">{t('common.currencySymbol')}{total.toFixed(2)}</span>
            </div>
          </section>
        </div>
      </main>

      {/* --- MODALS --- */}
      
      {/* 1. Wallet Setup Modal */}
      {modalState.type === 'wallet' && (
        <WalletModal 
          isOpen={true}
          onClose={() => setModalState({ type: null, data: null })}
          provider={modalState.data?.provider}
          existingData={
            modalState.data?.provider === 'Jazzcash' ? jazzCashWallet : easypaisaWallet
          }
          onSave={modalState.data?.mobileNumber ? updateMobileWallet : addMobileWallet}
          t={t}
          setSelectedPaymentType={setSelectedPaymentType}
        />
      )}

      {/* 2. Add New Card Modal */}
      {modalState.type === 'card' && (
        <AddCardModal 
           isOpen={true}
           onClose={() => setModalState({ type: null, data: null })}
           onSave={addCreditCard}
           t={t}
           setSelectedPaymentType={setSelectedPaymentType}
           setCurrentCard={setCurrentCard}
        />
      )}

      {/* 3. Card List Modal (for "Change" action) */}
      {modalState.type === 'cardList' && (
        <CardListModal 
          isOpen={true}
          onClose={() => setModalState({ type: null, data: null })}
          cards={creditCards}
          setCurrentCard={setCurrentCard}
          onAddNew={() => setModalState({ type: 'card', data: null })}
          onSelect={(card) => {
            setCurrentCard(card);
            setSelectedPaymentType('credit_card');
            setModalState({ type: null, data: null });
          }}
          t={t}
        />
      )}

    </Layout>
  )
}

// --- Local Modal Components for Checkout Flow ---

const ModalBackdrop = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
    <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={onClose} />
    <div className="relative w-full max-w-[430px] secBg rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-5">
      {children}
    </div>
  </div>
);

function WalletModal({ onClose, provider, existingData, onSave, t, setSelectedPaymentType }) {
  const [mobileNumber, setMobileNumber] = useState(existingData?.mobileNumber || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ provider, mobileNumber });
      setSelectedPaymentType(provider.toLowerCase()); // Auto-select after save
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="p-5">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold primText">{existingData ? `Update ${provider}` : `Setup ${provider}`}</h3>
          <button onClick={onClose} className="p-2 rounded-full secHoverBg"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 primText">{t('checkout.payment.mobileNumber') || 'Mobile Number'}</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 secText" size={18} />
              <input 
                type="tel" 
                value={mobileNumber} 
                onChange={e => setMobileNumber(e.target.value)} 
                required 
                className="inputField pl-10"
                placeholder="03XX XXXXXXX"
                autoFocus
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full btnPrimary py-3.5 rounded-xl font-bold flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : (t('common.save') || 'Save & Continue')}
          </button>
        </form>
      </div>
    </ModalBackdrop>
  );
}

function AddCardModal({ onClose, onSave, t, setSelectedPaymentType, setCurrentCard }) {
  const [formData, setFormData] = useState({ last4Digits: '', brand: '', expiryMonth: '', expiryYear: '', isDefault: true });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newCard = await onSave(formData);
      setCurrentCard && setCurrentCard(formData);
      setSelectedPaymentType('credit_card');
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="p-5">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold primText">{t('checkout.payment.addCard') || 'Add New Card'}</h3>
          <button onClick={onClose} className="p-2 rounded-full secHoverBg"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
              <label className="block text-sm font-semibold mb-2 primText">Card Brand</label>
              <input type="text" placeholder="e.g. Visa" className="inputField" 
                value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required 
              />
           </div>
           <div>
              <label className="block text-sm font-semibold mb-2 primText">Card Number</label>
              <input type="tel" maxLength={16} placeholder="0000 0000 0000 0000" className="inputField font-mono" 
                 value={formData.last4Digits} onChange={e => setFormData({...formData, last4Digits: e.target.value.slice(-4)})} 
                 // Note: In real app we capture full, but here per schema only last4
              />
              <p className="text-xs secText mt-1">For demo, just enter last 4 digits in state</p>
           </div>
           <div className="flex gap-4">
              <div className="flex-1">
                 <label className="block text-sm font-semibold mb-2 primText">Expiry MM</label>
                 <input type="tel" maxLength={2} placeholder="MM" className="inputField text-center"
                   value={formData.expiryMonth} onChange={e => setFormData({...formData, expiryMonth: e.target.value})} required 
                 />
              </div>
              <div className="flex-1">
                 <label className="block text-sm font-semibold mb-2 primText">Expiry YYYY</label>
                 <input type="tel" maxLength={4} placeholder="YYYY" className="inputField text-center"
                   value={formData.expiryYear} onChange={e => setFormData({...formData, expiryYear: e.target.value})} required 
                 />
              </div>
           </div>
           <button type="submit" disabled={loading} className="w-full btnPrimary py-3.5 rounded-xl font-bold flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : 'Add Card'}
          </button>
        </form>
      </div>
    </ModalBackdrop>
  );
}

function CardListModal({ onClose, cards, onAddNew, onSelect, setCurrentCard, t }) {
  return (
    <ModalBackdrop onClose={onClose}>
       <div className="p-5 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold primText">Select Card</h3>
          <button onClick={onClose} className="p-2 rounded-full secHoverBg"><X size={20} /></button>
        </div>
        
        <div className="overflow-y-auto space-y-3 flex-1 mb-4">
           {cards.map((card, idx) => (
             <div key={idx} onClick={() => onSelect(card)} className="p-4 rounded-xl primBorder secBg flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800">
                <div className="flex items-center gap-3">
                   <CreditCard className="text-blue-600" size={24} />
                   <div>
                      <p className="font-bold primText uppercase">{card.brand}</p>
                      <p className="text-sm secText">•••• {card.last4Digits}</p>
                   </div>
                </div>
                {card.isDefault && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Default</span>}
             </div>
           ))}
        </div>

        <button onClick={onAddNew} className="w-full py-3.5 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 font-semibold secText hover:primText transition-colors">
            <Plus size={18} /> Add Another Card
        </button>
      </div>
    </ModalBackdrop>
  )
}