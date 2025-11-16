import React, { useState } from 'react'
import { ArrowLeft, Edit3, Save, Wallet, CreditCard } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import BottomNav from '../component/BottomNav'

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
  const { t } = useI18n()

  // State Management
  const [address, setAddress] = useState('123 Example St, Apt 4B, City, Country, 12345')
  const [editingAddress, setEditingAddress] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiry: '', cvv: '' })

  // Example fees from your original code
  const subtotal = 49.99
  const serviceFee = 2.5
  const deliveryFee = 5.0
  const taxRate = 0.13
  const tax = +(subtotal * taxRate).toFixed(2)
  const total = +(subtotal + serviceFee + deliveryFee + tax).toFixed(2)

  const handlePlaceOrder = () => {
    alert(`Order placed! Total: ${t('common.currencySymbol')}${total.toFixed(2)}`)
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

  return (
    <Layout
      header={<HeaderWithName title={t('checkout.title')} to="/cart" />}
      footer={<BottomNav />}
    >
      <main className="flex-1 overflow-y-auto primBg">
        <div className="p-4 space-y-6 pb-32">
          {/* Address Section */}
          <section className="secBg primBorder rounded-lg">
            <div className="flex justify-between items-center p-4 dividerBorder">
              <h2 className="text-lg font-semibold primText ">{t('checkout.address.title')}</h2>
              <EditAddressAction />
            </div>
            <div className="p-4 space-y-4">
              {editingAddress ? (
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows={3}
                  className="inputField"
                />
              ) : (
                <p className="text-base secText">{address}</p>
              )}
              <FormInput
                label={t('checkout.address.instructionsLabel')}
                placeholder={t('checkout.address.instructionsPlaceholder')}
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
              />
            </div>
          </section>

          {/* Payment Section */}
          <section className="secBg primBorder rounded-lg p-4 space-y-4">
            <h2 className="text-lg font-semibold primText ">{t('checkout.payment.title')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <PaymentOption
                label={t('checkout.payment.cashOnDelivery')}
                icon={Wallet}
                isActive={paymentMethod === 'cash'}
                onClick={() => setPaymentMethod('cash')}
              />
              <PaymentOption
                label={t('checkout.payment.card')}
                icon={CreditCard}
                isActive={paymentMethod === 'card'}
                onClick={() => setPaymentMethod('card')}
              />
            </div>
            {paymentMethod === 'card' && (
              <div className="space-y-4 pt-4 dividerBorder border-t">
                <FormInput label={t('checkout.payment.cardDetails.nameLabel')} placeholder="JOHN DOE" value={cardDetails.name} onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })} />
                <FormInput label={t('checkout.payment.cardDetails.numberLabel')} placeholder="0000 0000 0000 0000" value={cardDetails.number} onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })} />
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

      {/* Fixed Footer for Action Button */}
      <footer className="fixed bottom-16 left-0 right-0 z-10 w-full max-w-[430px] mx-auto bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm dividerBorder border-t p-4">
        <button
          onClick={handlePlaceOrder}
          className="w-full min-h-12 px-6 py-3 btnPrimary rounded-lg transition-all duration-200"
        >
          {t('checkout.actions.placeOrder', { total: total.toFixed(2) })}
        </button>
      </footer>
    </Layout>
  )
}