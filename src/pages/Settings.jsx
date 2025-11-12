import React, { useState, useEffect } from 'react'
import BottomNav from '../component/BottomNav'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { logout, customer, updateCustomer } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // populate form from global customer when available
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        address: (Array.isArray(customer.addresses) && customer.addresses[0] && customer.addresses[0].addressText) || ''
      })
    }
  }, [customer])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Update name and address via API
    ;(async () => {
      try {
        if (!customer || !customer._id) return alert('No customer available')
        const payload = { name: formData.name }
        // send address as single string; backend will normalize into addresses array
        payload.address = formData.address
        const updated = await updateCustomer(customer._id, payload)
        alert('Saved')
        // optional: you could update local form from updated response
      } catch (err) {
        console.error('update customer failed', err)
        alert(err && err.message ? err.message : 'Update failed')
      }
    })()
  }


  const handleLogout = () => {
    if (window.confirm('Sign out now?')) {
      try {
        logout()
      } catch (err) {
        console.warn('Logout failed', err)
      }
      navigate('/')
    }
  }

  return (
    <>
      <main className="settings-page" style={{paddingBottom:'var(--space-20)'}}>
        <h2 className="section-title">Settings</h2>

        {/* Appearance -> replaced with single button to Accessibility page */}
        <section className="settings-section">
          <h3 className="section-title">Appearance & Accessibility</h3>
          <div className="form-group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/accessibility')}
            >
              Accessibility Settings
            </button>
          </div>
        </section>

        {/* Account Section */}
        <form onSubmit={handleSubmit} className="settings-section">
          <h3 className="section-title">Account Information</h3>
          
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              readOnly
              className="form-input bg-gray-100"
              placeholder="Phone (read-only)"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="form-input form-textarea"
              placeholder="Enter your address"
            />
          </div>

          <div className="form-group">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
        <section className="settings-section">
          <div className="mt-4">
            <button type="button" className="btn btn-secondary" onClick={handleLogout}>Sign out</button>
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  )
}
