import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Settings from './pages/Settings'
import Search from './pages/Search'
import Address from './pages/Address'
import { ThemeProvider } from './context/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App" style={{fontFamily:'sans-serif', position: 'relative', height: '100%'}}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/search" element={<Search />} />
            <Route path="/address" element={<Address />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}