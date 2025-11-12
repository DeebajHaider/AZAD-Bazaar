import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Settings from './pages/Settings'
import Search from './pages/Search'
import SearchResults from './pages/SearchResults'
import Address from './pages/Address'
import Product from './pages/Product'
import { ThemeProvider } from './context/ThemeContext'
import { CartProvider } from './context/CartContext'
import { DataProvider } from './context/DataContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import { AccessibilityProvider } from './context/AccessibilityContext'
import AccessibilitySettings from './pages/AccessibilitySettings'

export default function App() {
  const AuthGate = () => {
    const { user, loading } = useAuth()
    // while auth is initializing, avoid flicker
    if (loading) return <div className="p-4">Loading...</div>
    if (!user) {
      return (
        <Router>
          <div style={{fontFamily: 'sans-serif', position: 'relative', height: '100%'}}>
            <Routes>
              <Route path="/*" element={<Login />} />
             <Route path="/accessibility" element={<AccessibilitySettings />} />
            </Routes>
          </div>
        </Router>
      )
    }

    return (
      <Router>
        <div className="App" style={{fontFamily:'sans-serif', position: 'relative', height: '100%'}}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/view-cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/search" element={<Search />} />
            <Route path="/search-results" element={<SearchResults />} />
            <Route path="/product" element={<Product />} />
            <Route path="/address" element={<Address />} />
            <Route path="/accessibility" element={<AccessibilitySettings />} />
          </Routes>
        </div>
      </Router>
    )
  }

  return (
  <ThemeProvider>
    <AccessibilityProvider>
      <AuthProvider>
        <DataProvider>
          <CartProvider>
            <AuthGate />
          </CartProvider>
        </DataProvider>
      </AuthProvider>
    </AccessibilityProvider>
  </ThemeProvider>
  )
}