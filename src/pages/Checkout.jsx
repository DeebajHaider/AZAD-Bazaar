import React, { useState, useContext, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit3, Save, Wallet, CreditCard, Loader2, Mic } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import { useCart } from '../context/CartContext'
import AuthContext from '../context/AuthContext'
import { useOrdersContext } from '../context/OrderContext'
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import BottomNav from '../component/BottomNav'
import VoiceInputModal from '../component/VoiceInputModal'
import { useAccessibility } from '../context/AccessibilityContext'

const CheckoutSkeleton = () => (
  <div className="p-4 space-y-6 min-h-full animate-pulse">
    {/* Address Section Skeleton */}
    <div className="secBg primBorder rounded-lg">
      <div className="flex justify-between items-center p-4 dividerBorder">
        <div className="h-6 w-32 skeleton" />
        <div className="h-6 w-20 skeleton" />
      </div>
      <div className="p-4 space-y-4">
        <div className="h-10 w-full skeleton" />
        <div className="h-10 w-full skeleton" />
      </div>
    </div>

    {/* Payment Section Skeleton */}
    <div className="secBg primBorder rounded-lg p-4 space-y-4">
      <div className="h-6 w-32 skeleton" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 skeleton rounded-lg" />
        <div className="h-24 skeleton rounded-lg" />
      </div>
    </div>

    {/* Billing Section Skeleton */}
    
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
      <div className="flex justify-between">
        <div className="h-5 w-24 skeleton" />
        <div className="h-5 w-12 skeleton" />
      </div>
      <div className="flex justify-between">
        <div className="h-5 w-28 skeleton" />
        <div className="h-5 w-14 skeleton" />
      </div>
      <div className="flex justify-between">
        <div className="h-5 w-16 skeleton" />
        <div className="h-5 w-12 skeleton" />
      </div>
      <div className="pt-3 mt-1 dividerBorder border-t flex justify-between">
        <div className="h-6 w-20 skeleton" />
        <div className="h-6 w-24 skeleton" />
      </div>
    </div></div>);

// --- Sub-components for better organization ---

// A reusable styled input component
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

// A visually distinct payment option selector
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
  const { user, customer, loading: authLoading } = useContext(AuthContext)
  const { createOrder } = useOrdersContext()
  const navigate = useNavigate()

  // State Management
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderError, setOrderError] = useState(null)
  const [editingAddress, setEditingAddress] = useState(false)
  const [address, setAddress] = useState({
    label: 'Home',
    addressText: '',
    lat: null,
    lng: null
  })
    // Sync address from customer context when available
    useEffect(() => {
      if (customer && Array.isArray(customer.addresses) && customer.addresses.length) {
        const defaultAddr = customer.addresses.find(a => a.isDefault) || customer.addresses[0]
        // Only update if not editing to avoid wiping in-progress edits
        if (!editingAddress) setAddress({
          label: defaultAddr.label || 'Home',
          addressText: defaultAddr.addressText || '',
          lat: defaultAddr.lat ?? null,
          lng: defaultAddr.lng ?? null,
          addressId: defaultAddr.addressId
        })
      }
    }, [customer, editingAddress])
  const [instructions, setInstructions] = useState('')
  const [paymentMethod, setPaymentMethod] = useState({
    name: 'Cash on Delivery',
    type: 'cash',
    last4Digits: ''
  })
  const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiry: '', cvv: '' })

  // Accessibility voice input mode
  const { ascMode } = useAccessibility && useAccessibility() || {}
  const isVoiceInput = typeof ascMode === 'string' && ascMode.includes('voiceInput')

  // Voice modal state
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)
  const [voiceTarget, setVoiceTarget] = useState(null) // 'instructions' or 'address'
  
  // Language direction (for button placement)
  const isRTL = lang === 'ar' || lang === 'he' || lang === 'fa' || lang === 'ur';

  // Handle voice confirm for narrator mode
  const handleVoiceConfirm = useCallback((transcript) => {
    if (!voiceTarget) return;
    if (voiceTarget === 'instructions') {
      setInstructions(transcript)
    } else if (voiceTarget === 'address') {
      setAddress(prev => ({ ...prev, addressText: transcript }))
    }
    setVoiceModalOpen(false);
    setVoiceTarget(null);
  }, [voiceTarget])

  // Example fees from your original code
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
      vouchersUsed: [] // Add voucher logic later
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

  // Header "Edit/Save" button
  const EditAddressAction = () => (
    <button
      onClick={() => setEditingAddress(prev => !prev)}
      className="flex items-center gap-1.5 text-sm font-medium accentPrimText hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
    >
      {editingAddress ? <Save size={16} /> : <Edit3 size={16} />}
      {editingAddress ? t('checkout.address.saveButton') : t('checkout.address.editButton')}
    </button>
  )

  // Show skeleton while cart is loading OR auth/customer still resolving
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

  // Footer action bar component (moved into Layout footer similar to Product/Cart pages)
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
          // Use replace on translation string to inject formatted total
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
          {/* Address Section */}
          <section className="secBg primBorder rounded-lg">
            <div className="flex justify-between items-center p-4 dividerBorder">
              <h2 className="text-lg font-semibold primText ">{t('checkout.address.title')}</h2>
              <EditAddressAction />
            </div>
            <div className="p-4 space-y-4">
              {editingAddress ? (
                <div className="relative">
                  <textarea
                    value={address.addressText}
                    onChange={e => setAddress({ ...address, addressText: e.target.value })}
                    rows={3}
                    className="inputField pr-12 rtl:pl-12"
                  />
                  {isVoiceInput && (
                    <button
                      type="button"
                      aria-label={t('voiceModal.actions.openForAddress') || 'Voice input for address'}
                      onClick={() => { setVoiceTarget('address'); setVoiceModalOpen(true); }}
                      className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} z-10 flex items-center justify-center w-9 h-9 rounded-full accentPrimBg hover:opacity-90 transition-colors`}
                      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                    >
                      <Mic size={20} className="primText" />
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-base secText">{address.addressText}</p>
              )}
              <div className="relative">
                <label className="block text-sm font-medium mb-2 primText ">
                  {t('checkout.address.instructionsLabel')}
                </label>
                <input
                  type="text"
                  placeholder={t('checkout.address.instructionsPlaceholder')}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="inputField placeholder-gray-400 dark:placeholder-slate-500 transition-all duration-200 pr-12 rtl:pl-12"
                />
                {isVoiceInput && (
                  <button
                    type="button"
                    aria-label={t('voiceModal.actions.openForInstructions') || 'Voice input for delivery instructions'}
                    onClick={() => { setVoiceTarget('instructions'); setVoiceModalOpen(true); }}
                    className={`absolute top-1.5 ${isRTL ? 'left-2' : 'right-2'} z-10 flex items-center justify-center w-9 h-9 rounded-full accentPrimBg hover:opacity-90 transition-colors`}
                    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                  >
                    <Mic size={20} className="primText" />
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Voice Input Modal for narrator mode */}
          {isVoiceInput && voiceModalOpen && (
            <VoiceInputModal
              isOpen={voiceModalOpen}
              onClose={() => { setVoiceModalOpen(false); setVoiceTarget(null); }}
              onConfirm={handleVoiceConfirm}
              confirmLabel={
                voiceTarget === 'instructions' ? t('voiceModal.actions.confirmInstructions') :
                voiceTarget === 'address' ? t('voiceModal.actions.confirmAddress') :
                t('voiceModal.actions.confirm')
              }
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