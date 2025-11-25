import React, { useState, useContext, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit3, Save, Wallet, CreditCard, Loader2, Mic, MapPin, Plus, Check, Circle } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import { useCart } from '../context/CartContext'
import AuthContext from '../context/AuthContext'
import { useOrdersContext } from '../context/OrderContext'
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import BottomNav from '../component/BottomNav'
import VoiceInputModal from '../component/VoiceInputModal'
import { useAccessibility } from '../context/AccessibilityContext'

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
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 skeleton rounded-lg" />
        <div className="h-24 skeleton rounded-lg" />
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

const FormInput = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-2 primText ">
      {label}
    </label>
    <input
      {...props}
      className="inputField placeholder-gray-400 dark:placeholder-slate-500 transition-all duration-200"
    />
  </div>
)

const PaymentOption = ({ label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-all duration-200 ${isActive
      ? 'modeChooseButton-selected'
      : 'modeChooseButton-unselected'
      }`}
  >
    <Icon size={24} className={isActive ? '' : 'secText'} />
    <span className="font-medium">
      {label}
    </span>
  </button>
)

// --- Main Checkout Component ---

export default function Checkout() {
  const { t, lang } = useI18n()
  const { items: cartItems, total: cartTotal, clearCart, loading: cartLoading } = useCart()
  const { user, customer, loading: authLoading, getDefaultAddress } = useContext(AuthContext)
  const { createOrder } = useOrdersContext()
  const navigate = useNavigate()
  
  // Accessibility
  const { ascMode } = useAccessibility && useAccessibility() || {}
  const isVoiceInput = typeof ascMode === 'string' && ascMode.includes('voiceInput')
  const isRTL = lang === 'ar' || lang === 'he' || lang === 'fa' || lang === 'ur';

  // State Management
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderError, setOrderError] = useState(null)
  
  // Address State
  const [isSelectingAddress, setIsSelectingAddress] = useState(false)
  const [address, setAddress] = useState(null)

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
  const [paymentMethod, setPaymentMethod] = useState({
    name: 'Cash on Delivery',
    type: 'cash',
    last4Digits: ''
  })
  const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiry: '', cvv: '' })
  
  // Voice Modal State
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)

  const handleVoiceConfirm = useCallback((transcript) => {
    setInstructions(transcript)
    setVoiceModalOpen(false);
  }, [])

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

    const orderData = {
      customerId: user.customerId,
      customName: user.name,
      address: {
        ...address,
        lat: address.lat ?? 0,
        lng: address.lng ?? 0
      },
      paymentMethod: paymentMethod,
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
  if (cartLoading || authLoading || (user && user.customerId && !customer)) {
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

  // Footer Component
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
          
          {/* --- ADDRESS SECTION (IMPROVED) --- */}
          <section className="secBg primBorder rounded-lg overflow-hidden">
            {/* Header: Clean Title + Action */}
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

            {/* Content Body */}
            <div className="px-4 pb-4">
              
              {/* VIEW STATE 1: SELECTION LIST */}
              {isSelectingAddress ? (
                <div className="space-y-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-medium secText uppercase tracking-wide">{t('checkout.address.savedAddresses') || 'Saved Addresses'}</span>
                    <button 
                       onClick={() => navigate('/address')}
                       className="text-xs font-semibold accentPrimText flex items-center gap-1"
                    >
                      <Plus size={14} />
                      {t('checkout.address.addNew') || 'Manage'}
                    </button>
                  </div>
                  
                  {/* Scrollable Container */}
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1 -mr-1 custom-scrollbar">
                    {customer?.addresses && customer.addresses.length > 0 ? (
                      customer.addresses.map((addr) => {
                        const isSelected = address?.addressId === addr.addressId;
                        return (
                          <button
                            key={addr.addressId}
                            onClick={() => {
                              setAddress({
                                label: addr.label || 'Home',
                                addressText: addr.addressText || '',
                                lat: addr.lat,
                                lng: addr.lng,
                                addressId: addr.addressId
                              });
                            }}
                            className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-3
                              ${isSelected 
                                ? 'modeChooseButton-selected' 
                                : 'modeChooseButton-unselected secHoverBg'
                              }
                            `}
                          >
                            {/* Radio Circle */}
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
                /* VIEW STATE 2: SELECTED STATIC VIEW (Redesigned) */
                <div className="mb-4">
                  {address ? (
                    <div className="flex items-start gap-3.5 py-1">
                      {/* Icon Anchor */}
                      <div className="mt-1.5 p-2 rounded-full secBg accentPrimText flex-shrink-0">
                        <MapPin size={20} />
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider secText mb-1">
                            {address.label}
                        </p>
                        <p className="text-lg font-medium primText leading-snug">
                          {address.addressText}
                        </p>
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

              {/* Delivery Instructions - OUTSIDE Conditional so it stays visible */}
              <div className="pt-4 border-t dividerBorder relative animate-in fade-in duration-300">
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
                      aria-label={t('voiceModal.actions.openForInstructions') || 'Voice input for delivery instructions'}
                      onClick={() => setVoiceModalOpen(true)}
                      className={`absolute top-1.5 ${isRTL ? 'left-2' : 'right-2'} z-10 flex items-center justify-center w-9 h-9 rounded-full accentPrimBg hover:opacity-90 transition-colors`}
                      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                    >
                      <Mic size={20} className="primText" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          </section>

          {/* Voice Input Modal */}
          {isVoiceInput && voiceModalOpen && (
            <VoiceInputModal
              isOpen={voiceModalOpen}
              onClose={() => setVoiceModalOpen(false)}
              onConfirm={handleVoiceConfirm}
              confirmLabel={t('voiceModal.actions.confirmInstructions')}
            />
          )}

          {/* Payment Section */}
          <section className="secBg primBorder rounded-lg p-4 space-y-4">
            <h2 className="text-lg font-semibold primText ">{t('checkout.payment.title')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <PaymentOption
                label={t('checkout.payment.cashOnDelivery')}
                icon={Wallet}
                isActive={paymentMethod.type === 'cash'}
                onClick={() => setPaymentMethod({ name: 'Cash on Delivery', type: 'cash', last4Digits: '' })}
              />
              <PaymentOption
                label={t('checkout.payment.card')}
                icon={CreditCard}
                isActive={paymentMethod.type === 'card'}
                onClick={() => setPaymentMethod({ name: 'Card', type: 'card', last4Digits: cardDetails.number.slice(-4) })}
              />
            </div>
            {paymentMethod.type === 'card' && (
              <div className="space-y-4 pt-4 dividerBorder border-t">
                <FormInput label={t('checkout.payment.cardDetails.nameLabel')} placeholder="JOHN DOE" value={cardDetails.name} onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })} />
                <FormInput label={t('checkout.payment.cardDetails.numberLabel')} placeholder="0000 0000 0000 0000" value={cardDetails.number} onChange={e => {
                  setCardDetails({ ...cardDetails, number: e.target.value })
                  setPaymentMethod({ ...paymentMethod, last4Digits: e.target.value.slice(-4) })
                }} />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label={t('checkout.payment.cardDetails.expiryLabel')} placeholder="MM/YY" value={cardDetails.expiry} onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })} />
                  <FormInput label={t('checkout.payment.cardDetails.cvvLabel')} placeholder="123" value={cardDetails.cvv} onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })} />
                </div>
              </div>
            )}
          </section>

          {/* Billing Section */}
          <section className="secBg primBorder rounded-lg p-4 space-y-3">
            <h2 className="text-lg font-semibold primText  mb-2">{t('checkout.billing.title')}</h2>
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
    </Layout>
  )
}