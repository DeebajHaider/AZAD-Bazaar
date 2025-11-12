import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import BottomNav from '../component/BottomNav'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const { logout, customer, updateCustomer } = useAuth()
  const navigate = useNavigate()
  const [colorblindMode, setColorblindMode] = useState('none')
  const [fontSize, setFontSize] = useState(16)
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

  // Load persisted fontSize on mount
  useEffect(() => {
    try {
      const savedFont = localStorage.getItem('azad_fontSize')
      if (savedFont) setFontSize(Number(savedFont))
    } catch (err) {
      // ignore
    }
  }, [])

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

  // Apply theme and font size to document and persist fontSize to localStorage
  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark-theme')
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark-theme')
        document.documentElement.classList.remove('dark')
      }
      // set CSS variable for font size
      document.documentElement.style.setProperty('--app-font-size', `${fontSize}px`)
      // persist fontSize
      localStorage.setItem('azad_fontSize', String(fontSize))
    } catch (err) {
      // ignore in environments without document
      console.warn('Could not apply theme/font size', err)
    }
  }, [theme, fontSize])

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

        {/* Appearance Section */}
        <section className="settings-section">
          <h3 className="section-title">Appearance</h3>
          
          <div className="form-group">
            <label className="form-label">Theme</label>
            <div className="button-group">
              <button
                type="button"
                className={`mode-button ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                Light Mode
              </button>
              <button
                type="button"
                className={`mode-button ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                Dark Mode
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Colorblind Mode</label>
            <div className="button-group colorblind">
              <button
                type="button"
                className={`mode-button ${colorblindMode === 'none' ? 'active' : ''}`}
                onClick={() => setColorblindMode('none')}
              >
                Standard
              </button>
              <button
                type="button"
                className={`mode-button ${colorblindMode === 'protanopia' ? 'active' : ''}`}
                onClick={() => setColorblindMode('protanopia')}
              >
                Protanopia
              </button>
              <button
                type="button"
                className={`mode-button ${colorblindMode === 'deuteranopia' ? 'active' : ''}`}
                onClick={() => setColorblindMode('deuteranopia')}
              >
                Deuteranopia
              </button>
              <button
                type="button"
                className={`mode-button ${colorblindMode === 'tritanopia' ? 'active' : ''}`}
                onClick={() => setColorblindMode('tritanopia')}
              >
                Tritanopia
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Font Size: {fontSize}px</label>
            <input
              type="range"
              min="12"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="form-range"
            />
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
