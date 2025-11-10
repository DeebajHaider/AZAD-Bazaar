import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Router>
      <div style={{fontFamily:'sans-serif'}}>
        <header style={{padding:12, borderBottom:'1px solid #eee', marginBottom:12}}>
          <h1 style={{margin:0, fontSize:18}}>AZAD-Bazaar</h1>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  )
}