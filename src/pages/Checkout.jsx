import React, { useState } from 'react'
import BottomNav from '../component/BottomNav'

export default function Checkout() {
  const [address, setAddress] = useState('123 Example St, Apt 4B, City')
  const [editingAddress, setEditingAddress] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [payment, setPayment] = useState('cash')

  // Example fees — replace with real values from your backend/cart
  const subtotal = 49.99
  const serviceFee = 2.5
  const deliveryFee = 5.0
  const taxRate = 0.13
  const tax = +(subtotal * taxRate).toFixed(2)
  const total = +(subtotal + serviceFee + deliveryFee + tax).toFixed(2)

  const handlePlaceOrder = () => {
    // Placeholder action — connect to backend or navigation as needed
    alert(`Order placed. Total: $${total.toFixed(2)}`)
  }

  return (
    <>
      <main style={{padding:'var(--space-4)', maxWidth:1000, margin:'0 auto', color:'var(--color-text-primary)', paddingBottom:'var(--space-20)', width:'100%', boxSizing:'border-box'}}>
      <h2 style={{fontSize:'var(--font-size-2xl)', fontWeight:600, marginBottom:'var(--space-4)'}}>Checkout</h2>

      {/* Address */}
  <section style={{marginBottom:'var(--space-5)', paddingBottom:'var(--space-5)', borderBottom:`1px solid var(--color-border)`}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'var(--space-2)'}}>
          <h3 style={{margin:0, fontSize:'var(--font-size-lg)', fontWeight:600}}>Delivery Address</h3>
          <button
            onClick={() => setEditingAddress(prev => !prev)}
            style={{border:'none', background:'transparent', color:'var(--color-primary-500)', cursor:'pointer'}}
            aria-pressed={editingAddress}
          >
            {editingAddress ? 'Save' : 'Edit'}
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

  <label style={{display:'block', marginTop:'var(--space-3)', marginBottom:'var(--space-2)', color:'var(--color-text-secondary)', fontSize:'var(--font-size-sm)'}}>Delivery instructions (optional)</label>
        <input
          type="text"
          placeholder="Ex: Call this number, leave at door, gate code..."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          style={{width:'100%', padding:'var(--space-3)', borderRadius:'var(--radius-md)', border:`1px solid var(--color-border)`, backgroundColor:'var(--color-surface)', color:'var(--color-text-primary)', fontFamily:'inherit'}}
        />
      </section>

      {/* Payment Options */}
  <section style={{marginBottom:'var(--space-5)', paddingBottom:'var(--space-5)', borderBottom:`1px solid var(--color-border)`}}>
        <h3 style={{fontSize:'var(--font-size-lg)', fontWeight:600, marginBottom:'var(--space-3)'}}>Payment</h3>

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
            Cash on Delivery
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
            Card
          </label>
        </div>

        {payment === 'card' && (
          <p style={{marginTop:'var(--space-3)', color:'var(--color-text-muted)', fontSize:'var(--font-size-sm)'}}>We'll collect card details on the next step (placeholder).</p>
        )}
      </section>

      {/* Billing Details */}
      <section style={{marginBottom:'var(--space-5)'}}>
        <h3 style={{fontSize:'var(--font-size-lg)', fontWeight:600, marginBottom:'var(--space-3)'}}>Billing</h3>

        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'var(--space-2)', color:'var(--color-text-primary)'}}>
          <span style={{color:'var(--color-text-muted)'}}>Subtotal</span>
          <strong>${subtotal.toFixed(2)}</strong>
        </div>

        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'var(--space-2)', color:'var(--color-text-primary)'}}>
          <span style={{color:'var(--color-text-muted)'}}>Service fee</span>
          <span>${serviceFee.toFixed(2)}</span>
        </div>

        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'var(--space-2)', color:'var(--color-text-primary)'}}>
          <span style={{color:'var(--color-text-muted)'}}>Delivery fee</span>
          <span>${deliveryFee.toFixed(2)}</span>
        </div>

        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'var(--space-3)', color:'var(--color-text-primary)'}}>
          <span style={{color:'var(--color-text-muted)'}}>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>

  <div style={{display:'flex', justifyContent:'space-between', paddingTop:'var(--space-3)', borderTop:`1px solid var(--color-border)`, color:'var(--color-text-primary)'}}>
          <strong>Total</strong>
          <strong>${total.toFixed(2)}</strong>
        </div>
      </section>

        <div>
          <button
            onClick={handlePlaceOrder}
            className="btn btn-primary"
            style={{width:'100%'}}
          >
            Place Order — ${total.toFixed(2)}
          </button>
        </div>
      </main>

      <BottomNav />
    </>
  )
}
