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
            <Route path="/search-results" element={<SearchResults />} />
            <Route path="/address" element={<Address />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}