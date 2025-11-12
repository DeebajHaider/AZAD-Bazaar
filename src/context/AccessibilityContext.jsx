import React, { createContext, useContext, useState, useEffect } from 'react'

const AccessibilityContext = createContext()

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}

export function AccessibilityProvider({ children }) {
  const [fontSize, setFontSize] = useState('normal')
  const [colorMode, setColorMode] = useState('default')

  // Load saved preferences on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility-fontSize')
    const savedColorMode = localStorage.getItem('accessibility-colorMode')
    
    if (savedFontSize) setFontSize(savedFontSize)
    if (savedColorMode) setColorMode(savedColorMode)
  }, [])

  // Apply font size to root element
  useEffect(() => {
    const fontSizes = {
      small: '14px',
      normal: '16px',
      large: '18px',
      xlarge: '22px'
    }
    
    document.documentElement.style.fontSize = fontSizes[fontSize]
    localStorage.setItem('accessibility-fontSize', fontSize)
  }, [fontSize])

  // Apply color mode to root element
  useEffect(() => {
    const root = document.documentElement
    
    // Remove all color mode classes
    root.classList.remove('high-contrast', 'deuteranopia', 'protanopia', 'tritanopia')
    
    // Add the selected mode
    if (colorMode !== 'default') {
      root.classList.add(colorMode)
    }
    
    localStorage.setItem('accessibility-colorMode', colorMode)
  }, [colorMode])

  const value = {
    fontSize,
    setFontSize,
    colorMode,
    setColorMode,
    resetToDefaults: () => {
      setFontSize('normal')
      setColorMode('default')
    }
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export default AccessibilityProvider
