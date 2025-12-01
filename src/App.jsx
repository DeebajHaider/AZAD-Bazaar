import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import smartlookClient from 'smartlook-client'
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
import { I18nProvider } from './context/I18nContext'
import { TTSProvider } from './context/TTSContext'
import LanguageSelection from './pages/LanguageSelection'
import SplashScreen from './pages/SplashScreen'
import BackButtonHandler from './component/BackButtonHandler'
import { OrderProvider } from './context/OrderContext'
import Orders from './pages/Orders'
import Order from './pages/Order'
import About from './pages/About'
import ThemeSelection from './pages/ThemeSelection'
import { Toaster } from 'react-hot-toast';


// --- NEW IMPORTS (Ensure you create these files) ---
import ModeSelection from './pages/ModeSelection'
import Favorites from './pages/Favorites'
import { FavoritesProvider } from './context/FavoritesContext'
import { PaymentDataProvider } from './context/PaymentDataContext'
import ManagePayments from './pages/ManagePayments'

export default function App() {
  useEffect(() => {
    // This code runs once when the app starts.
    // Initialize the Smartlook Web SDK for session recording and heatmaps.
    // --- IMPORTANT ---
    // Replace this with your actual project key from the Smartlook dashboard
    smartlookClient.init('b667668399931a9cd9e2518fceab106b9ff5a13b', { region: 'eu' });
    console.log('Smartlook Web SDK initialized.');
    // The web SDK starts recording automatically after init.

  }, []); // The empty array ensures this effect runs only once.
  const AuthGate = () => {
    const { user, loading } = useAuth()

    // 1. LOADING STATE
    // Changed: Don't use <SplashScreen /> here because it has redirect logic.
    // Just show a simple static loader.
    if (loading) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center primBg">
           <img src="/Azad-Bazaar.svg" alt="Loading..." className="h-40 w-auto animate-pulse" />
        </div>
      )
    }

    // 2. ONBOARDING / UNAUTHENTICATED FLOW
    if (!user) {
      return (
        <div style={{ fontFamily: 'sans-serif', position: 'relative', height: '100%' }}>
          <BackButtonHandler />
          <Routes>
            {/* Step 1: Splash (Checks local storage for 'hasOnboarded') */}
            <Route path="/" element={<SplashScreen />} />

            {/* Step 2: Language Selection */}
            <Route path="/language-selection" element={<LanguageSelection />} />

            {/* Step 3: Mode Selection (Literate vs Illiterate) */}
            <Route path="/mode-selection" element={<ModeSelection />} />

            {/* Step 4: Theme Selection */}
            <Route path="/theme-selection" element={<ThemeSelection />} />

            {/* Step 4: Accessibility Setup */}
            <Route path="/accessibility" element={<AccessibilitySettings />} />

            {/* Step 5: Login */}
            <Route path="/login" element={<Login />} />

            {/* Catch-all: Send to Splash to re-evaluate */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      )
    }

    // 3. AUTHENTICATED FLOW (Main App)
    return (
      <div className="App" style={{ fontFamily: 'sans-serif', position: 'relative', height: '100%' }}>
        <BackButtonHandler />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/view-cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/search" element={<Search />} />
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/address" element={<Address />} />
          {/* Note: You might want to remove this generic accessibility route 
              if you only want it during onboarding, but keeping it for Settings is good */}
          <Route path="/accessibility" element={<AccessibilitySettings />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<Order />} />
          <Route path="/about" element={<About />} />
          <Route path="/manage-payments" element={<ManagePayments />} />
        </Routes>
      </div>
    )
}

return (
  <I18nProvider>
    <TTSProvider>
      <ThemeProvider>
        <AccessibilityProvider>
          <AuthProvider>
            <DataProvider>
              <CartProvider>
                <OrderProvider>
                  <FavoritesProvider>
                    <PaymentDataProvider>
                      {/* MOVED Router OUTSIDE AuthGate so useNavigate works inside Splash */}
                      <Router>
                        <Toaster position="bottom-center" />
                        <AuthGate />
                      </Router>
                    </PaymentDataProvider>
                  </FavoritesProvider>
                </OrderProvider>
              </CartProvider>
            </DataProvider>
          </AuthProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </TTSProvider>
  </I18nProvider>
)
}