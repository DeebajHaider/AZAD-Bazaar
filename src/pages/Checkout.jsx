import React, { useState } from 'react'
import BottomNav from '../component/BottomNav'
import { useI18n } from '../context/I18nContext'

export default function Checkout() {
  const { t } = useI18n()
  const [address, setAddress] = useState('123 Example St, Apt 4B, City')
  const [editingAddress, setEditingAddress] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [payment, setPayment] = useState('cash')
  const [cardDetails, setCardDetails] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  })

  // simple formatter for translations containing {{placeholders}}
  const format = (key, vars = {}) => {
    let str = t(key)
    Object.keys(vars).forEach(k => {
      const re = new RegExp(`{{\\s*${k}\\s*}}`, 'g')
      str = String(str).replace(re, vars[k])
    })
    return str
  }

  // Example fees — replace with real values from your backend/cart
  const subtotal = 49.99
  const serviceFee = 2.5
  const deliveryFee = 5.0
  const taxRate = 0.13
  const tax = +(subtotal * taxRate).toFixed(2)
  const total = +(subtotal + serviceFee + deliveryFee + tax).toFixed(2)

  const handlePlaceOrder = () => {
    // Placeholder action — connect to backend or navigation as needed
    alert(format('checkout.actions.orderPlacedAlert', { total: total.toFixed(2) }))
  }

  return (
    <>
      <main style={{padding:'var(--space-4)', maxWidth:1000, margin:'0 auto', color:'var(--color-text-primary)', paddingBottom:'var(--space-20)', width:'100%', boxSizing:'border-box'}}>
        <h2 style={{fontSize:'var(--font-size-2xl)', fontWeight:600, marginBottom:'var(--space-4)'}}>{t('checkout.title')}</h2>

        {/* Address */}
        <section style={{marginBottom:'var(--space-5)', paddingBottom:'var(--space-5)', borderBottom:`1px solid var(--color-border)`}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'var(--space-2)'}}>
            <h3 style={{margin:0, fontSize:'var(--font-size-lg)', fontWeight:600}}>{t('checkout.address.title')}</h3>
            <button
              onClick={() => setEditingAddress(prev => !prev)}
              style={{border:'none', background:'transparent', color:'var(--color-primary-500)', cursor:'pointer'}}
              aria-pressed={editingAddress}
            >
              {editingAddress ? t('checkout.address.saveButton') : t('checkout.address.editButton')}
            </button>
          </div>

          {editingAddress ? (
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              style={{width:'100%', padding:'var(--space-3)', borderRadius:'var(--radius-md)', border:`1px solid var(--color-border)`, backgroundColor:'var(--color-surface)', color:'var(--color-text-primary)', fontFamily:'inherit'}}
            />
          ) : (
            <p style={{margin:0, color:'var(--color-text-secondary)'}}>{address}</p>
          )}

          <label style={{display:'block', marginTop:'var(--space-3)', marginBottom:'var(--space-2)', color:'var(--color-text-secondary)', fontSize:'var(--font-size-sm)'}}>{t('checkout.address.instructionsLabel')}</label>
          <input
            type="text"
            placeholder={t('checkout.address.instructionsPlaceholder')}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            style={{width:'100%', padding:'var(--space-3)', borderRadius:'var(--radius-md)', border:`1px solid var(--color-border)`, backgroundColor:'var(--color-surface)', color:'var(--color-text-primary)', fontFamily:'inherit'}}
          />
        </section>

        {/* Payment Options */}
        <section style={{marginBottom:'var(--space-5)', paddingBottom:'var(--space-5)', borderBottom:`1px solid var(--color-border)`}}>
          <h3 style={{fontSize:'var(--font-size-lg)', fontWeight:600, marginBottom:'var(--space-3)'}}>{t('checkout.payment.title')}</h3>

          <div style={{display:'flex', gap:'var(--space-2)', color:'var(--color-text-primary)'}}>
            <label style={{flex:1}}>
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={payment === 'cash'}
                onChange={() => setPayment('cash')}
                style={{marginRight:'var(--space-2)'}}
              />
              {t('checkout.payment.cashOnDelivery')}
            </label>

            <label style={{flex:1}}>
              <input
                type="radio"
                name="payment"
                value="card"
                checked={payment === 'card'}
                onChange={() => setPayment('card')}
                style={{marginRight:'var(--space-2)'}}
              />
              {t('checkout.payment.card')}
            </label>
          </div>

          {payment === 'card' && (
            <div style={{marginTop:'var(--space-4)', padding:'var(--space-4)', backgroundColor:'var(--color-surface)', borderRadius:'var(--radius-md)', border:`1px solid var(--color-border)`}}>
              <h4 style={{fontSize:'var(--font-size-md)', fontWeight:600, marginBottom:'var(--space-3)', margin:0}}>{t('checkout.payment.cardDetails.title')}</h4>
              
              <div style={{marginBottom:'var(--space-3)'}}>
                <label style={{display:'block', marginBottom:'var(--space-1)', fontSize:'var(--font-size-sm)', fontWeight:500, color:'var(--color-text-primary)'}}>{t('checkout.payment.cardDetails.nameLabel')}</label>
                <input
                  type="text"
                  placeholder={t('checkout.payment.cardDetails.namePlaceholder')}
                  value={cardDetails.cardholderName}
                  onChange={(e) => setCardDetails({...cardDetails, cardholderName: e.target.value})}
                  style={{width:'100%', padding:'var(--space-2)', borderRadius:'var(--radius-md)', border:`1px solid var(--color-border)`, backgroundColor:'var(--color-bg)', color:'var(--color-text-primary)', fontFamily:'inherit', boxSizing:'border-box'}}
                />
              </div>

              <div style={{marginBottom:'var(--space-3)'}}>
                <label style={{display:'block', marginBottom:'var(--space-1)', fontSize:'var(--font-size-sm)', fontWeight:500, color:'var(--color-text-primary)'}}>{t('checkout.payment.cardDetails.numberLabel')}</label>
                <input
                  type="text"
                  placeholder={t('checkout.payment.cardDetails.numberPlaceholder')}
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                  style={{width:'100%', padding:'var(--space-2)', borderRadius:'var(--radius-md)', border:`1px solid var(--color-border)`, backgroundColor:'var(--color-bg)', color:'var(--color-text-primary)', fontFamily:'inherit', boxSizing:'border-box'}}
                />
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-3)', marginBottom:'var(--space-3)'}}>
                <div>
                  <label style={{display:'block', marginBottom:'var(--space-1)', fontSize:'var(--font-size-sm)', fontWeight:500, color:'var(--color-text-primary)'}}>{t('checkout.payment.cardDetails.expiryLabel')}</label>
                  <input
                    type="text"
                    placeholder={t('checkout.payment.cardDetails.expiryPlaceholder')}
                    value={cardDetails.expiryDate}
                    onChange={(e) => setCardDetails({...cardDetails, expiryDate: e.target.value})}
                    style={{width:'100%', padding:'var(--space-2)', borderRadius:'var(--radius-md)', border:`1px solid var(--color-border)`, backgroundColor:'var(--color-bg)', color:'var(--color-text-primary)', fontFamily:'inherit', boxSizing:'border-box'}}
                  />
                </div>
                <div>
                  <label style={{display:'block', marginBottom:'var(--space-1)', fontSize:'var(--font-size-sm)', fontWeight:500, color:'var(--color-text-primary)'}}>{t('checkout.payment.cardDetails.cvvLabel')}</label>
                  <input
                    type="text"
                    placeholder={t('checkout.payment.cardDetails.cvvPlaceholder')}
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                    style={{width:'100%', padding:'var(--space-2)', borderRadius:'var(--radius-md)', border:`1px solid var(--color-border)`, backgroundColor:'var(--color-bg)', color:'var(--color-text-primary)', fontFamily:'inherit', boxSizing:'border-box'}}
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Billing Details */}
        <section style={{marginBottom:'var(--space-5)'}}>
          <h3 style={{fontSize:'var(--font-size-lg)', fontWeight:600, marginBottom:'var(--space-3)'}}>{t('checkout.billing.title')}</h3>

          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'var(--space-2)', color:'var(--color-text-primary)'}}>
            <span style={{color:'var(--color-text-muted)'}}>{t('checkout.billing.subtotal')}</span>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>

          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'var(--space-2)', color:'var(--color-text-primary)'}}>
            <span style={{color:'var(--color-text-muted)'}}>{t('checkout.billing.serviceFee')}</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>

          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'var(--space-2)', color:'var(--color-text-primary)'}}>
            <span style={{color:'var(--color-text-muted)'}}>{t('checkout.billing.deliveryFee')}</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>

          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'var(--space-3)', color:'var(--color-text-primary)'}}>
            <span style={{color:'var(--color-text-muted)'}}>{t('checkout.billing.tax')}</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div style={{display:'flex', justifyContent:'space-between', paddingTop:'var(--space-3)', borderTop:`1px solid var(--color-border)`, color:'var(--color-text-primary)'}}>
            <strong>{t('checkout.billing.total')}</strong>
            <strong>${total.toFixed(2)}</strong>
          </div>
        </section>

        <div>
          <button
            onClick={handlePlaceOrder}
            className="btn btn-primary"
            style={{width:'100%'}}
          >
            {format('checkout.actions.placeOrder', { total: total.toFixed(2) })}
          </button>
        </div>
      </main>

      <BottomNav />
    </>
  )
}
