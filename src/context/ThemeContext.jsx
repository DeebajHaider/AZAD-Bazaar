import React, { createContext, useState, useContext, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
  }, [theme])
useEffect(() => {
  const isNative = Capacitor.getPlatform() !== 'web'
  if (!isNative) return

  const toHex = (num) => {
    const h = Math.round(num).toString(16).padStart(2, '0')
    return h
  }

  const cssColorToHex = (c) => {
    if (!c) return null
    
    // Handle hex colors
    if (c.startsWith('#')) {
      if (c.length === 7) return c
      if (c.length === 4) {
        const r = c[1]; const g = c[2]; const b = c[3]
        return `#${r}${r}${g}${g}${b}${b}`
      }
      if (c.length === 9) return `#${c.slice(3)}`
    }
    
    // Handle rgb/rgba
    const m = c.match(/rgba?\(([^)]+)\)/i)
    if (m) {
      const parts = m[1].split(',').map(p => p.trim())
      const r = parseFloat(parts[0])
      const g = parseFloat(parts[1])
      const b = parseFloat(parts[2])
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }
    
    // Handle oklch/oklab and other CSS colors
    if (c.includes('oklch') || c.includes('oklab') || c.includes('hsl') || c.includes('hwb')) {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = 1
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = c
        ctx.fillRect(0, 0, 1, 1)
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`
      } catch (e) {
        return null
      }
    }
    
    return null
  }

  const luminance = (hex) => {
    const n = hex.replace('#', '')
    const r = parseInt(n.slice(0, 2), 16) / 255
    const g = parseInt(n.slice(2, 4), 16) / 255
    const b = parseInt(n.slice(4, 6), 16) / 255
    const a = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
  }

  const pickColorFromDOM = () => {
    const header = document.querySelector('header')
    let targetVar = '--color-md-surface'
    
    if (header) {
      const rect = header.getBoundingClientRect()
      // Check if header is at the top (allowing for small sub-pixel differences)
      if (Math.abs(rect.top) < 1) {
        targetVar = '--color-md-surface-container'
      }
    }
    
    try {
      const temp = document.createElement('div')
      temp.style.backgroundColor = `var(${targetVar})`
      temp.style.position = 'absolute'
      temp.style.visibility = 'hidden'
      document.body.appendChild(temp)
      
      const computedStyle = window.getComputedStyle(temp)
      const resolvedColor = computedStyle.backgroundColor
      document.body.removeChild(temp)
      
      const resolvedHex = cssColorToHex(resolvedColor)
      if (resolvedHex) {
        console.log(`[StatusBar] Using ${targetVar}:`, resolvedHex)
        return resolvedHex
      }
    } catch (e) {
      console.warn(`[StatusBar] Error resolving ${targetVar}:`, e)
    }
    
    // Final fallback
    const fallback = theme === 'dark' ? '#11150D' : '#F8FBEE'
    console.log('[StatusBar] Using hardcoded fallback:', fallback)
    return fallback
  }

  const apply = async () => {
    try {
      const color = pickColorFromDOM()
      const isDarkBg = luminance(color) < 0.5
      await StatusBar.setOverlaysWebView({ overlay: false })
      await StatusBar.setBackgroundColor({ color })
      await StatusBar.setStyle({ style: isDarkBg ? Style.Dark : Style.Light })
    } catch (err) {
      console.error('[StatusBar] Error:', err)
    }
  }

  // Initial apply - reduced delay
  setTimeout(apply, 50)

  // Use MutationObserver to detect significant DOM changes (page navigation)
  let lastPath = window.location.pathname
  let timeoutId = null
  
  const observer = new MutationObserver(() => {
    const currentPath = window.location.pathname
    if (currentPath !== lastPath) {
      lastPath = currentPath
      // Debounce to avoid multiple rapid calls
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(apply, 50)
    }
  })

  // Observe the entire app container for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  // Also listen for popstate (browser back/forward)
  const handlePopState = () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(apply, 50)
  }
  window.addEventListener('popstate', handlePopState)

  return () => {
    if (timeoutId) clearTimeout(timeoutId)
    observer.disconnect()
    window.removeEventListener('popstate', handlePopState)
  }
}, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// export hook as a top-level const for stable HMR compatibility
export const useTheme = () => useContext(ThemeContext)

// also provide a default export for the context object to keep export shape stable
export default ThemeContext
