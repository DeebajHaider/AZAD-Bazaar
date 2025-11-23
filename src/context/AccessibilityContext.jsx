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
  const [fontSize, setFontSize] = useState(() => {
    try {
      return localStorage.getItem('accessibility-fontSize') || 'normal'
    } catch (e) {
      return 'normal'
    }
  })

  const [colorMode, setColorMode] = useState(() => {
    try {
      return localStorage.getItem('accessibility-colorMode') || 'default'
    } catch (e) {
      return 'default'
    }
  })


  // ascMode state
  const [ascMode, setAscMode] = useState(() => {
    try {
      return localStorage.getItem('accessibility-ascMode') || ''
    } catch (e) {
      return ''
    }
  })

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
    root.classList.remove('highContrast', 'deuteranopia', 'protanopia', 'tritanopia')
    // Add the selected mode
    if (colorMode !== 'default') {
      root.classList.add(colorMode)
    }
    localStorage.setItem('accessibility-colorMode', colorMode)
  }, [colorMode])

  // Store ascMode in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('accessibility-ascMode', ascMode)
  }, [ascMode])


  const value = {
    fontSize,
    setFontSize,
    colorMode,
    setColorMode,
    ascMode,
    setAscMode,
    resetToDefaults: () => {
      setFontSize('normal')
      setColorMode('default')
      setAscMode('')
    }
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export default AccessibilityProvider
