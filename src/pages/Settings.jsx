import React, { useState } from 'react'

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

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Handle account deletion
    }
  }

  return (
    <main className="settings-page">
      <h2 className="section-title">Settings</h2>

      {/* Appearance Section */}
      <section className="settings-section">
        <h3 className="section-title">Appearance</h3>
        
        <div className="form-group">
          <label className="form-label">Theme</label>
          <select 
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="form-select"
          >
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Colorblind Mode</label>
          <select 
            value={colorblindMode}
            onChange={(e) => setColorblindMode(e.target.value)}
            className="form-select"
          >
            <option value="none">None</option>
            <option value="protanopia">Protanopia</option>
            <option value="deuteranopia">Deuteranopia</option>
            <option value="tritanopia">Tritanopia</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Font Size: {fontSize}px</label>
          <input
            type="range"
            min="12"
            max="24"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
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
            Update Password
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
  )
}
