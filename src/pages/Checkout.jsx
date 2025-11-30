import React, { useState, useContext, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Wallet, CreditCard, Loader2, Mic, MapPin, 
  Plus, Check, Circle, Smartphone, X, Banknote 
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

// --- Skeleton Components (Unchanged) ---
const CheckoutSkeleton = () => (
  <div className="p-4 space-y-6 min-h-full animate-pulse">
    <div className="bg-md-surface-container rounded-md">
      <div className="flex justify-between items-center p-4 border-b border-md-outline-variant/30">
        <div className="h-6 w-32 bg-md-surface-variant/50 rounded" />
        <div className="h-6 w-20 bg-md-surface-variant/50 rounded" />
      </div>
      <div className="p-4 space-y-4">
        <div className="h-24 w-full bg-md-surface-variant/30 rounded-md" />
      </div>
    </div>
    <div className="bg-md-surface-container rounded-md p-4 space-y-4">
      <div className="h-6 w-32 bg-md-surface-variant/50 rounded" />
      <div className="space-y-3">
         {[1, 2, 3, 4].map(i => (
           <div key={i} className="h-14 bg-md-surface-variant/30 rounded-md" />
         ))}
      </div>
    </div>
  </div>
)

const CheckoutBillingSkeleton = () => (
  <div className="bg-md-surface border-t border-md-outline-variant">
    <div className="bg-md-surface-container m-4 rounded-md p-4 space-y-3">
      <div className="h-6 w-24 bg-md-surface-variant/50 rounded mb-2" />
      <div className="flex justify-between">
        <div className="h-5 w-20 bg-md-surface-variant/30 rounded" />
        <div className="h-5 w-16 bg-md-surface-variant/30 rounded" />
      </div>
    </div>
  </div>
);

// --- Refined Payment Row ---
// Removed heavy borders. Uses Tonal States (Background Fill) for selection.
const PaymentRow = ({ 
  icon: Icon, 
  label, 
  subLabel, 
  isSelected, 
  onSelect, 
  actionLabel, 
  onAction,
  iconColorClass = "text-md-on-surface-variant"
}) => (
  <div 
    onClick={onSelect}
    className={`
      w-full flex items-center gap-3 p-3.5 rounded-md transition-all duration-200 cursor-pointer group relative overflow-hidden
      ${isSelected 
        ? 'bg-md-primary-container shadow-sm' 
        : 'bg-md-surface-container-low hover:bg-md-surface-container-high' // Subtle background for unselected
      }
    `}
  >
    {/* Icon Container */}
    <div className={`
      w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
      ${isSelected ? 'bg-md-background/20' : 'bg-md-surface-container-highest'}
    `}>
      <Icon size={20} className={isSelected ? 'text-md-on-primary-container' : iconColorClass} />
    </div>

    {/* Text */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className={`font-semibold text-sm ${isSelected ? 'text-md-on-primary-container' : 'text-md-on-surface'}`}>
          {label}
        </span>
      </div>
      {subLabel && (
        <p className={`text-xs truncate ${isSelected ? 'text-md-on-primary-container/80' : 'text-md-on-surface-variant'}`}>
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
          // Tonal Button (Secondary)
          className="text-xs font-bold px-3 py-1.5 rounded-md bg-md-secondary-container text-md-on-secondary-container hover:opacity-80 transition-opacity"
        >
          {actionLabel}
        </button>
      ) : (
        // Clean Radio Indicator
        <div className={`
          w-5 h-5 rounded-full flex items-center justify-center transition-all
          ${isSelected 
            ? 'bg-md-primary text-md-on-primary' 
            : 'border-2 border-md-outline-variant/50 text-transparent' // Subtle border for unselected
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

  // State
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderError, setOrderError] = useState(null)
  const [isSelectingAddress, setIsSelectingAddress] = useState(false)
  const [address, setAddress] = useState(null)
  const [selectedPaymentType, setSelectedPaymentType] = useState('cash_on_delivery')
  const [modalState, setModalState] = useState({ type: null, data: null }) 

  // Initialize Address
  useEffect(() => {
    if (!address && customer && customer.addresses && customer.addresses.length > 0) {
      const def = getDefaultAddress ? getDefaultAddress() : customer.addresses.find(a => a.isDefault);
      const fallback = customer.addresses[0];
      const target = def || fallback;
      setAddress({ ...target, lat: target.lat ?? null, lng: target.lng ?? null });
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
    if (type === 'jazzcash') {
      if (jazzCashWallet) setSelectedPaymentType('jazzcash');
      else setModalState({ type: 'wallet', data: { provider: 'Jazzcash' } });
      return;
    }
    if (type === 'easypaisa') {
      if (easypaisaWallet) setSelectedPaymentType('easypaisa');
      else setModalState({ type: 'wallet', data: { provider: 'Easypaisa' } });
      return;
    }
    if (type === 'credit_card') {
      if (defaultCard) setSelectedPaymentType('credit_card');
      else setModalState({ type: 'card', data: null });
      return;
    }
    setSelectedPaymentType(type);
  };

  // Calculations
  const subtotal = cartTotal
  const serviceFee = 2.5
  const deliveryFee = 5.0
  const taxRate = 0.13
  const tax = +(subtotal * taxRate).toFixed(2)
  const total = +(subtotal + serviceFee + deliveryFee + tax).toFixed(2)

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0.00'
    return new Intl.NumberFormat(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  }

  const handlePlaceOrder = async () => {
    if (!user || !user.customerId) { alert('You must be logged in to place an order.'); return; }
    if (!address) { alert(t('checkout.address.errorNoAddress') || 'Please select a delivery address'); return; }

    let finalPaymentMethod = { type: selectedPaymentType };
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
      finalPaymentMethod = { type: 'cash', name: 'Cash on Delivery' };
    }

    const orderData = {
      customerId: user.customerId,
      customName: user.name,
      address: { ...address, lat: address.lat ?? 0, lng: address.lng ?? 0 },
      paymentMethod: finalPaymentMethod,
      products: cartItems.map(item => ({ productId: item.itemCode, quantity: item.quantity })),
      deliveryInstructions: instructions,
      vouchersUsed: []
    }

    setOrderLoading(true)
    setOrderError(null)
    
    try {
      const newOrder = await createOrder(orderData)
      if (newOrder) { clearCart(); navigate('/orders'); }
    } catch (err) {
      setOrderError(err)
    } finally {
      setOrderLoading(false)
    }
  }

  // Loading State
  if (cartLoading || authLoading || (user && user.customerId && !customer) || walletsLoading || cardsLoading) {
    return (
      <Layout header={<HeaderWithName title={t('checkout.title')} to="/cart" />} footer={<><CheckoutBillingSkeleton /><BottomNav /></>}>
        <main className="flex-1 overflow-y-auto bg-md-surface min-h-full"><CheckoutSkeleton /></main>
      </Layout>
    )
  }

  const PlaceOrderFooter = () => (
    <div className="bg-md-surface border-t border-md-outline-variant p-4">
      <button
        onClick={handlePlaceOrder}
        disabled={orderLoading}
        className="w-full min-h-12 px-6 py-3 bg-md-primary text-md-on-primary font-bold text-lg rounded-md shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center"
      >
        {orderLoading ? <Loader2 className="animate-spin" /> : t('checkout.actions.placeOrder').replace('${{total}}', `${t('common.currencySymbol') }${formatCurrency(total)}`)}
      </button>
      {orderError && <p className="text-md-error text-sm mt-2 text-center">{orderError.message}</p>}
    </div>
  )

  return (
    <Layout header={<HeaderWithName title={t('checkout.title')} to="/cart" />} footer={<><PlaceOrderFooter /><BottomNav /></>}>
      <main className="flex-1 overflow-y-auto bg-md-surface min-h-full">
        <div className="p-4 space-y-6">
          
          {/* --- ADDRESS SECTION --- */}
          <section className="bg-md-surface-container rounded-md overflow-hidden shadow-sm">
            <div className="flex justify-between items-center p-4 pb-2">
              <h2 className="text-lg font-bold text-md-on-surface">{t('checkout.address.title')}</h2>
              <button onClick={() => setIsSelectingAddress(!isSelectingAddress)} className="text-sm font-semibold text-md-primary hover:text-md-inverse-primary px-2 py-1">
                {isSelectingAddress ? (t('common.done') || 'Done') : (t('checkout.address.changeButton') || 'Change')}
              </button>
            </div>

            <div className="px-4 pb-4">
              {isSelectingAddress ? (
                <div className="space-y-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-medium text-md-on-surface-variant uppercase tracking-wide">{t('checkout.address.savedAddresses') || 'Saved Addresses'}</span>
                    <button onClick={() => navigate('/address')} className="text-xs font-semibold text-md-primary flex items-center gap-1">
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
                            onClick={() => setAddress({ ...addr })}
                            // REFINED ADDRESS LIST: Removed heavy borders
                            className={`w-full text-left p-3 rounded-md transition-all flex items-start gap-3
                              ${isSelected 
                                ? 'bg-md-primary-container shadow-sm' 
                                : 'bg-md-surface-container-low hover:bg-md-surface-container-high'
                              }
                            `}
                          >
                            <div className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-md-primary' : 'text-md-on-surface-variant'}`}>
                              {isSelected ? (
                                <div className="w-5 h-5 rounded-full bg-md-primary flex items-center justify-center text-md-on-primary">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                              ) : (
                                <Circle size={20} className="text-md-outline-variant" />
                              )}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <p className={`font-bold text-sm mb-0.5 ${isSelected ? 'text-md-on-primary-container' : 'text-md-on-surface'}`}>
                                        {addr.label}
                                    </p>
                                    {addr.isDefault && <span className="text-[10px] bg-md-tertiary-container text-md-on-tertiary-container px-1.5 py-0.5 rounded-md font-bold">Default</span>}
                                </div>
                              <p className={`text-sm line-clamp-2 ${isSelected ? 'text-md-on-primary-container/80' : 'text-md-on-surface-variant'}`}>
                                {addr.addressText}
                              </p>
                            </div>
                          </button>
                        )
                      })
                    ) : (
                      <div className="text-center py-6 border border-dashed border-md-outline-variant rounded-md">
                        <p className="text-md-on-surface-variant text-sm mb-3">{t('checkout.address.noAddresses') || 'No addresses found.'}</p>
                        <button onClick={() => navigate('/address')} className="text-md-primary font-medium text-sm">
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
                      <div className="mt-1.5 p-2 rounded-full bg-md-surface-container-highest text-md-primary flex-shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-md-on-surface-variant mb-1">{address.label}</p>
                        <p className="text-lg font-medium text-md-on-surface leading-snug">{address.addressText}</p>
                      </div>
                    </div>
                  ) : (
                     <button onClick={() => setIsSelectingAddress(true)} className="w-full py-6 border border-dashed border-md-outline rounded-md flex flex-col items-center justify-center text-md-on-surface-variant hover:bg-md-surface-container-high transition-colors">
                        <Plus size={24} className="mb-2" />
                        <span className="text-sm font-medium">{t('checkout.address.selectPrompt') || 'Select Delivery Address'}</span>
                     </button>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-md-outline-variant/50 relative">
                <label className="block text-sm font-medium mb-2 text-md-on-surface flex items-center gap-2">
                   {t('checkout.address.instructionsLabel')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('checkout.address.instructionsPlaceholder')}
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    className={`w-full h-12 rounded-md bg-md-surface-container-highest px-4 text-md-on-surface placeholder:text-md-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-md-primary transition-all ${isRTL ? 'pl-12' : 'pr-12'}`}
                  />
                  {isVoiceInput && (
                    <button type="button" onClick={() => setVoiceModalOpen(true)} className={`absolute top-1.5 ${isRTL ? 'left-2' : 'right-2'} z-10 flex items-center justify-center w-9 h-9 rounded-full bg-md-secondary-container text-md-on-secondary-container hover:opacity-90 transition-colors`}>
                      <Mic size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {isVoiceInput && voiceModalOpen && (
            <VoiceInputModal isOpen={voiceModalOpen} onClose={() => setVoiceModalOpen(false)} onConfirm={handleVoiceConfirm} confirmLabel={t('voiceModal.actions.confirmInstructions')} />
          )}

          {/* --- PAYMENT SECTION --- */}
          <section className="bg-md-surface-container rounded-md p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-md-on-surface">{t('checkout.payment.title')}</h2>
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-md">
                 <Check size={10} strokeWidth={4} /> Secure
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <PaymentRow icon={Banknote} label={t('checkout.payment.cashOnDelivery')} isSelected={selectedPaymentType === 'cash_on_delivery'} onSelect={() => handlePaymentSelect('cash_on_delivery')} iconColorClass="text-green-600 dark:text-green-400" />
              <PaymentRow icon={CreditCard} label={t('settings.managePayments.cardInDelivery')} subLabel={t('settings.managePayments.payViaPos')} isSelected={selectedPaymentType === 'card_on_delivery'} onSelect={() => handlePaymentSelect('card_on_delivery')} iconColorClass="text-orange-500" />
              <PaymentRow icon={Smartphone} label={t('settings.managePayments.jazzcash')} subLabel={jazzCashWallet ? jazzCashWallet.mobileNumber : t('settings.managePayments.linkAccount')} isSelected={selectedPaymentType === 'jazzcash'} onSelect={() => handlePaymentSelect('jazzcash')} iconColorClass="text-red-600" actionLabel={!jazzCashWallet ? t('settings.managePayments.other') : null} onAction={() => setModalState({ type: 'wallet', data: { provider: 'Jazzcash' } })} />
              <PaymentRow icon={Smartphone} label={t('settings.managePayments.easypaisa')} subLabel={easypaisaWallet ? easypaisaWallet.mobileNumber : t('settings.managePayments.linkAccount')} isSelected={selectedPaymentType === 'easypaisa'} onSelect={() => handlePaymentSelect('easypaisa')} iconColorClass="text-green-500" actionLabel={!easypaisaWallet ? t('settings.managePayments.other') : null} onAction={() => setModalState({ type: 'wallet', data: { provider: 'Easypaisa' } })} />
              <PaymentRow icon={CreditCard} label={t('checkout.payment.card')} subLabel={currentCard ? `${currentCard.brand.toUpperCase()} •••• ${currentCard.last4Digits}` : t('settings.managePayments.linkAccount')} isSelected={selectedPaymentType === 'credit_card'} onSelect={() => handlePaymentSelect('credit_card')} iconColorClass="text-blue-600" actionLabel={currentCard ? t('settings.managePayments.other') : t('settings.managePayments.linkAccount')} onAction={() => setModalState({ type: currentCard ? 'cardList' : 'card' })} />
            </div>
          </section>

          {/* --- Billing Section --- */}
          <section className="bg-md-surface-container rounded-md p-4 space-y-3 shadow-sm">
            <h2 className="text-lg font-bold text-md-on-surface mb-2">{t('checkout.billing.title')}</h2>
            <div className="flex justify-between text-base">
              <span className="text-md-on-surface-variant">{t('checkout.billing.subtotal')}</span>
              <span className="font-medium text-md-on-surface ">{t('common.currencySymbol')}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-md-on-surface-variant">{t('checkout.billing.serviceFee')}</span>
              <span className="font-medium text-md-on-surface ">{t('common.currencySymbol')}{serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-md-on-surface-variant">{t('checkout.billing.deliveryFee')}</span>
              <span className="font-medium text-md-on-surface ">{t('common.currencySymbol')}{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-md-on-surface-variant">{t('checkout.billing.tax')}</span>
              <span className="font-medium text-md-on-surface ">{t('common.currencySymbol')}{tax.toFixed(2)}</span>
            </div>
            <div className="pt-3 mt-1 border-t border-md-outline-variant flex justify-between text-lg font-bold">
              <span className="text-md-on-surface ">{t('checkout.billing.total')}</span>
              <span className="text-md-on-surface ">{t('common.currencySymbol')}{total.toFixed(2)}</span>
            </div>
          </section>
        </div>
      </main>

      {/* --- MODALS (Unchanged logic, themed) --- */}
      {modalState.type === 'wallet' && (
        <WalletModal isOpen={true} onClose={() => setModalState({ type: null, data: null })} provider={modalState.data?.provider} existingData={modalState.data?.provider === 'Jazzcash' ? jazzCashWallet : easypaisaWallet} onSave={modalState.data?.mobileNumber ? updateMobileWallet : addMobileWallet} t={t} setSelectedPaymentType={setSelectedPaymentType} />
      )}
      {modalState.type === 'card' && (
        <AddCardModal isOpen={true} onClose={() => setModalState({ type: null, data: null })} onSave={addCreditCard} t={t} setSelectedPaymentType={setSelectedPaymentType} setCurrentCard={setCurrentCard} />
      )}
      {modalState.type === 'cardList' && (
        <CardListModal isOpen={true} onClose={() => setModalState({ type: null, data: null })} cards={creditCards} setCurrentCard={setCurrentCard} onAddNew={() => setModalState({ type: 'card', data: null })} onSelect={(card) => { setCurrentCard(card); setSelectedPaymentType('credit_card'); setModalState({ type: null, data: null }); }} t={t} />
      )}

    </Layout>
  )
}

// --- Local Modal Components ---
const ModalBackdrop = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
    <div className="absolute inset-0 bg-black/60 transition-opacity backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-[430px] bg-md-surface text-md-on-surface rounded-t-2xl sm:rounded-md overflow-hidden shadow-xl animate-in slide-in-from-bottom-5">
      {children}
    </div>
  </div>
);

function WalletModal({ onClose, provider, existingData, onSave, t, setSelectedPaymentType }) {
  const [mobileNumber, setMobileNumber] = useState(existingData?.mobileNumber || '');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); try { await onSave({ provider, mobileNumber }); setSelectedPaymentType(provider.toLowerCase()); onClose(); } catch (error) { alert(error.message); } finally { setLoading(false); } };
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="p-5">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-md-on-surface">{existingData ? t('settings.managePayments.other') + ' ' + provider : t('settings.managePayments.linkAccount') + ' ' + provider}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-md-surface-container-high transition-colors"><X size={20} className="text-md-on-surface-variant" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-md-on-surface">{t('checkout.payment.mobileNumber') || 'Mobile Number'}</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-md-on-surface-variant" size={18} />
              <input type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required className="w-full h-12 rounded-md bg-md-surface-container-highest pl-10 pr-4 text-md-on-surface focus:ring-2 focus:ring-md-primary focus:outline-none" placeholder="03XX XXXXXXX" autoFocus />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-md-primary text-md-on-primary py-3.5 rounded-md font-bold flex justify-center hover:shadow-md transition-all">{loading ? <Loader2 className="animate-spin" /> : (t('common.save') || 'Save & Continue')}</button>
        </form>
      </div>
    </ModalBackdrop>
  );
}

function AddCardModal({ onClose, onSave, t, setSelectedPaymentType, setCurrentCard }) {
  const [formData, setFormData] = useState({ last4Digits: '', brand: '', expiryMonth: '', expiryYear: '', isDefault: true });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); try { const newCard = await onSave(formData); setCurrentCard && setCurrentCard(formData); setSelectedPaymentType('credit_card'); onClose(); } catch (error) { alert(error.message); } finally { setLoading(false); } };
  const inputClass = "w-full h-12 rounded-md bg-md-surface-container-highest px-4 text-md-on-surface focus:ring-2 focus:ring-md-primary focus:outline-none placeholder:text-md-on-surface-variant/50";
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="p-5">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-md-on-surface">{t('checkout.payment.addCard') || 'Add New Card'}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-md-surface-container-high transition-colors"><X size={20} className="text-md-on-surface-variant" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
           <div><label className="block text-sm font-semibold mb-2 text-md-on-surface">{t('checkout.payment.cardDetails.nameLabel')}</label><input type="text" placeholder="e.g. Visa" className={inputClass} value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required /></div>
           <div><label className="block text-sm font-semibold mb-2 text-md-on-surface">{t('checkout.payment.cardDetails.numberLabel')}</label><input type="tel" maxLength={16} placeholder="0000 0000 0000 0000" className={`${inputClass} font-mono`} value={formData.last4Digits} onChange={e => setFormData({...formData, last4Digits: e.target.value.slice(-4)})} /><p className="text-xs text-md-on-surface-variant mt-1">{t('settings.managePayments.last4Digits')}</p></div>
           <div className="flex gap-4"><div className="flex-1"><label className="block text-sm font-semibold mb-2 text-md-on-surface">{t('settings.managePayments.mm')}</label><input type="tel" maxLength={2} placeholder={t('settings.managePayments.mm')} className={`${inputClass} text-center`} value={formData.expiryMonth} onChange={e => setFormData({...formData, expiryMonth: e.target.value})} required /></div><div className="flex-1"><label className="block text-sm font-semibold mb-2 text-md-on-surface">{t('settings.managePayments.yyyy')}</label><input type="tel" maxLength={4} placeholder={t('settings.managePayments.yyyy')} className={`${inputClass} text-center`} value={formData.expiryYear} onChange={e => setFormData({...formData, expiryYear: e.target.value})} required /></div></div>
           <button type="submit" disabled={loading} className="w-full bg-md-primary text-md-on-primary py-3.5 rounded-md font-bold flex justify-center hover:shadow-md transition-all">{loading ? <Loader2 className="animate-spin" /> : t('settings.managePayments.other')}</button>
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
          <h3 className="text-xl font-bold text-md-on-surface">{t('settings.managePayments.other')}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-md-surface-container-high transition-colors"><X size={20} className="text-md-on-surface-variant" /></button>
        </div>
        <div className="overflow-y-auto space-y-3 flex-1 mb-4">
           {cards.map((card, idx) => (
             <div key={idx} onClick={() => onSelect(card)} className="p-4 rounded-md bg-md-surface-container-low hover:bg-md-surface-container-high transition-colors flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-md-surface-container-highest flex items-center justify-center">
                     <CreditCard className="text-md-primary" size={20} />
                   </div>
                   <div>
                      <p className="font-bold text-md-on-surface uppercase">{card.brand}</p>
                      <p className="text-sm text-md-on-surface-variant">•••• {card.last4Digits}</p>
                   </div>
                </div>
                {card.isDefault && <span className="text-xs bg-md-tertiary-container text-md-on-tertiary-container px-2 py-1 rounded-md font-bold">Default</span>}
             </div>
           ))}
        </div>
        <button onClick={onAddNew} className="w-full py-3.5 border border-dashed border-md-outline rounded-md flex items-center justify-center gap-2 font-semibold text-md-on-surface-variant hover:bg-md-surface-container-high transition-colors">
          <Plus size={18} /> {t('settings.managePayments.linkAccount')}
        </button>
      </div>
    </ModalBackdrop>
  )
}