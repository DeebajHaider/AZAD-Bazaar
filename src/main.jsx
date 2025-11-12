import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Apply persisted theme and font size before React mounts to avoid flicker
try {
  const savedTheme = localStorage.getItem('azad_theme')
  const savedFont = localStorage.getItem('azad_fontSize')
  if (savedTheme === 'dark') {
    console.log('Applying dark theme before React mounts')
    document.documentElement.classList.add('dark')
    document.documentElement.classList.add('dark-theme')
  } else {
    console.log('Applying light theme before React mounts')
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.remove('dark-theme')
  }
  if (savedFont) {
    document.documentElement.style.setProperty('--app-font-size', `${Number(savedFont)}px`)
  }
} catch (err) {
  // ignore
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)