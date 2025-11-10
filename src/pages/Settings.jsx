import React, { useState, useEffect } from 'react'
import BottomNav from '../component/BottomNav'

export default function Settings() {
  const [theme, setTheme] = useState('light')
  const [colorblindMode, setColorblindMode] = useState('none')
  const [fontSize, setFontSize] = useState(16)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Load persisted settings on mount (run first to avoid overwriting saved values)
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('azad_theme')
      const savedFont = localStorage.getItem('azad_fontSize')
      if (savedTheme) setTheme(savedTheme)
      if (savedFont) setFontSize(Number(savedFont))
    } catch (err) {
      // ignore
    }
  }, [])

  // Apply theme and font size to document and persist to localStorage
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
      // persist
      localStorage.setItem('azad_theme', theme)
      localStorage.setItem('azad_fontSize', String(fontSize))
    } catch (err) {
      // ignore in environments without document
      console.warn('Could not apply theme/font size', err)
    }
  }, [theme, fontSize])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    alert('Saved (placeholder)')
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Handle account deletion
      alert('Account deleted (placeholder)')
    }
  }

  return (
    <>
      <main className="settings-page" style={{paddingBottom:72}}>
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
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your phone number"
              pattern="[0-9]*"
              inputMode="numeric"
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
            <h4 className="section-title">Change Password</h4>
            
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>

        {/* Delete Account Section */}
        <section className="settings-section">
          <h3 className="section-title danger-text">Delete Account</h3>
          
          <p className="helper-text">
            Once you delete your account, there is no going back. Please be certain.
          </p>

          <button 
            type="button" 
            className="btn btn-danger"
            onClick={handleDeleteAccount}
          >
            Delete My Account
          </button>
        </section>
      </main>

      <BottomNav />
    </>
  )
}
