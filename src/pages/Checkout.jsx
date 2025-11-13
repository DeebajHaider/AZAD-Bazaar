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
    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-slate-50">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
    />
  </div>
)

// A visually distinct payment option selector
const PaymentOption = ({ label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all duration-200 ${isActive
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40'
        : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-gray-300 dark:hover:border-slate-700'
      }`}
  >
    <Icon size={24} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-slate-400'} />
    <span className={`font-medium ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-slate-50'}`}>
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
      className="flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
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
      <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
        <div className="p-4 space-y-6 pb-32">
          {/* Address Section */}
          <section className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-50">{t('checkout.address.title')}</h2>
              <EditAddressAction />
            </div>
            <div className="p-4 space-y-4">
              {editingAddress ? (
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-base text-gray-600 dark:text-slate-400">{address}</p>
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
          <section className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-50">{t('checkout.payment.title')}</h2>
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
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-slate-800">
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
          <section className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-50 mb-2">{t('checkout.billing.title')}</h2>
            <div className="flex justify-between text-base">
              <span className="text-gray-600 dark:text-slate-400">{t('checkout.billing.subtotal')}</span>
              <span className="font-medium text-gray-900 dark:text-slate-50">{t('common.currencySymbol')}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-gray-600 dark:text-slate-400">{t('checkout.billing.serviceFee')}</span>
              <span className="font-medium text-gray-900 dark:text-slate-50">{t('common.currencySymbol')}{serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-gray-600 dark:text-slate-400">{t('checkout.billing.deliveryFee')}</span>
              <span className="font-medium text-gray-900 dark:text-slate-50">{t('common.currencySymbol')}{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-gray-600 dark:text-slate-400">{t('checkout.billing.tax')}</span>
              <span className="font-medium text-gray-900 dark:text-slate-50">{t('common.currencySymbol')}{tax.toFixed(2)}</span>
            </div>
            <div className="pt-3 mt-1 border-t border-gray-200 dark:border-slate-800 flex justify-between text-lg font-semibold">
              <span className="text-gray-900 dark:text-slate-50">{t('checkout.billing.total')}</span>
              <span className="text-gray-900 dark:text-slate-50">{t('common.currencySymbol')}{total.toFixed(2)}</span>
            </div>
          </section>
        </div>
      </main>

      {/* Fixed Footer for Action Button */}
      <footer className="fixed bottom-16 left-0 right-0 z-10 w-full max-w-[430px] mx-auto bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-t border-gray-200 dark:border-slate-800 p-4">
        <button
          onClick={handlePlaceOrder}
          className="w-full min-h-12 px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200"
        >
          {t('checkout.actions.placeOrder', { total: total.toFixed(2) })}
        </button>
      </footer>
    </Layout>
  )
}