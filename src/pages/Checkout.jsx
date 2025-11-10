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
      <main style={{padding:20, maxWidth:800, margin:'0 auto', color:'var(--text-primary)', paddingBottom:72}}>
      <h2 style={{fontSize:20, fontWeight:600, marginBottom:16}}>Checkout</h2>

      {/* Address */}
  <section style={{marginBottom:20, paddingBottom:20, borderBottom:'1px solid var(--border-color)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
          <h3 style={{margin:0, fontSize:16, fontWeight:600}}>Delivery Address</h3>
          <button
            onClick={() => setEditingAddress(prev => !prev)}
            style={{border:'none', background:'transparent', color:'var(--primary-color)', cursor:'pointer'}}
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
            style={{width:'100%', padding:12, borderRadius:8, border:'1px solid var(--border-color)'}}
          />
        ) : (
          <p style={{margin:0, color:'var(--text-secondary)'}}>{address}</p>
        )}

  <label style={{display:'block', marginTop:12, marginBottom:6, color:'var(--text-secondary)'}}>Delivery instructions (optional)</label>
        <input
          type="text"
          placeholder="Ex: Call this number, leave at door, gate code..."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          style={{width:'100%', padding:12, borderRadius:8, border:'1px solid var(--border-color)'}}
        />
      </section>

      {/* Payment Options */}
  <section style={{marginBottom:20, paddingBottom:20, borderBottom:'1px solid var(--border-color)'}}>
        <h3 style={{fontSize:16, fontWeight:600, marginBottom:12}}>Payment</h3>

        <div style={{display:'flex', gap:8}}>
          <label style={{flex:1}}>
            <input
              type="radio"
              name="payment"
              value="cash"
              checked={payment === 'cash'}
              onChange={() => setPayment('cash')}
              style={{marginRight:8}}
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
              style={{marginRight:8}}
            />
            Card
          </label>
        </div>

        {payment === 'card' && (
          <p style={{marginTop:12, color:'var(--muted-color)', fontSize:14}}>We'll collect card details on the next step (placeholder).</p>
        )}
      </section>

      {/* Billing Details */}
      <section style={{marginBottom:20}}>
        <h3 style={{fontSize:16, fontWeight:600, marginBottom:12}}>Billing</h3>

        <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
          <span style={{color:'var(--muted-color)'}}>Subtotal</span>
          <strong>${subtotal.toFixed(2)}</strong>
        </div>

        <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
          <span style={{color:'var(--muted-color)'}}>Service fee</span>
          <span>${serviceFee.toFixed(2)}</span>
        </div>

        <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
          <span style={{color:'var(--muted-color)'}}>Delivery fee</span>
          <span>${deliveryFee.toFixed(2)}</span>
        </div>

        <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
          <span style={{color:'var(--muted-color)'}}>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>

  <div style={{display:'flex', justifyContent:'space-between', paddingTop:12, borderTop:'1px solid var(--border-color)'}}>
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
