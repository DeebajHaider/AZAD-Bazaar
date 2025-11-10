import React from 'react'
import BottomNav from '../component/BottomNav'
import { useNavigate } from 'react-router-dom'
import { 
  MapPin, Search,
  Apple, Carrot, Cookie, Milk, Coffee,
  Fish, Egg, Beef, Cake, ChefHat, Wine
} from 'lucide-react'

const categories = [
  { name: 'Fruits', icon: Apple },
  { name: 'Vegetables', icon: Carrot },
  { name: 'Snacks', icon: Cookie },
  { name: 'Dairy', icon: Milk },
  { name: 'Beverages', icon: Coffee },
  { name: 'Seafood', icon: Fish },
  { name: 'Eggs', icon: Egg },
  { name: 'Meat', icon: Beef },
  { name: 'Desserts', icon: Cake },
  { name: 'Ready Meals', icon: ChefHat },
  { name: 'Drinks', icon: Wine }
];

export default function Home() {
  const navigate = useNavigate()
   const [voucherCode, setVoucherCode] = React.useState('')
   const [appliedVoucher, setAppliedVoucher] = React.useState(null)

   // simple voucher validation map
   const voucherMap = {
     'AZAD10': 10,
     'AZAD20': 20,
   }

  // theme box styles used across categories, recent orders and brands
  const themeBox = {
    background: 'var(--color-surface)',
    borderRadius: '15px',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-sm)',
    color: 'var(--color-text-primary)'
  }

  const categoryButtonStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 75,
    ...themeBox
  }

  const recentOrderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    height: 100,
    textAlign: 'left',
    ...themeBox,
    borderRadius: '12px'
  }

  const brandButtonStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 75,
    ...themeBox
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto pb-20" style={{background:'var(--color-bg)', color:'var(--color-text-primary)'}}>
        {/* Address Bar */}
        <button 
          onClick={() => navigate('/address')}
          style={{width:'100%', padding:'var(--space-2) var(--space-4)', display:'flex', alignItems:'center', gap:'var(--space-2)', background:'var(--color-surface)', borderBottom:'1px solid var(--color-border)', border:'none', cursor:'pointer', color:'var(--color-text-primary)'}}
        >
          <MapPin size={18} style={{color:'var(--color-primary-500)', flexShrink:0}} />
          <div style={{textAlign:'left'}}>
            <div style={{fontSize:'var(--font-size-xs)', color:'var(--color-text-secondary)'}}>Delivery to:</div>
            <div style={{fontSize:'var(--font-size-sm)', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--color-text-primary)'}}>
              Etawah Society, Street 5, House Number 49
            </div>
          </div>
        </button>

        {/* Search Bar */}
        <div style={{padding:'var(--space-2) var(--space-4)', borderBottom:'1px solid var(--color-border)', background:'var(--color-surface)'}}>
          <button 
            onClick={() => navigate('/search')}
            style={{width:'100%', display:'flex', alignItems:'center', gap:'var(--space-2)', padding:'var(--space-2) var(--space-4)', background:'var(--color-surface-alt)', borderRadius:'var(--radius-md)', border:'none', cursor:'pointer', color:'var(--color-text-muted)', fontSize:'var(--font-size-sm)'}}
          >
            <Search size={18} />
            <span>Search for items...</span>
          </button>
        </div>

        {/* Categories Section */}
        <div style={{padding:'var(--space-3) var(--space-4)', background:'var(--color-bg)'}}>
          <h2 style={{fontSize:'var(--font-size-lg)', fontWeight:600, marginBottom:'var(--space-3)', color:'var(--color-text-primary)'}}>Categories</h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'8px', minHeight:'0'}}>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.name}
                  onClick={() => { /* intentionally no-op for now */ }}
                  style={categoryButtonStyle}
                >
                  <Icon size={22} style={{color:'var(--color-primary-500)', marginBottom:'6px'}} />
                  <span style={{fontSize:'12px', textAlign:'center', color:'var(--color-text-primary)'}}>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

          {/* Voucher Section
          <div className="px-4 py-3 border-t">
            <h3 style={{fontSize:'var(--font-size-lg)', fontWeight:600, marginBottom:'var(--space-3)', color:'var(--color-text-primary)'}}>Apply Voucher</h3>
            <div className="flex gap-2">
              <input
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Enter voucher code"
                className="flex-1 px-2 py-1.5 text-sm border rounded-md bg-white"
              />
              <button
                onClick={() => {
                  const pct = voucherMap[voucherCode.trim()]
                  if (pct) {
                    setAppliedVoucher({ code: voucherCode.trim(), pct })
                  } else {
                    setAppliedVoucher({ invalid: true })
                  }
                }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm"
              >
                Apply
              </button>
            </div>
            <div className="mt-2 min-h-[1.25rem]">
              {appliedVoucher && appliedVoucher.invalid && (
                <div className="text-sm text-red-600">Invalid voucher code</div>
              )}
              {appliedVoucher && appliedVoucher.pct && (
                <div className="text-sm text-green-700">
                  Voucher applied! You have {appliedVoucher.pct}% off on your next order!
                </div>
              )}
            </div>
          </div> */}

          {/* Recent Deliveries Section */}
          <div className="px-4 py-3">
            <h3 style={{fontSize:'var(--font-size-lg)', fontWeight:600, marginBottom:'var(--space-3)', color:'var(--color-text-primary)'}}>Recent Orders</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              { [1,2,3].map((i) => (
                <button
                  key={i}
                  onClick={() => navigate('/view-cart')}
                  style={recentOrderStyle}
                >
                  {/* reuse existing icons for placeholders */}
                  <Cake size={18} style={{color:'var(--color-primary-500)'}} />
                  <div>
                    <div style={{fontSize:13, fontWeight:600}}>Order #{100 + i}</div>
                    <div style={{fontSize:11, color:'var(--color-text-secondary)'}}>Delivered recently</div>
                  </div>
                </button>
              ))}
              </div>
            </div>

          {/* Popular Brands Section */}
          <div className="px-4 py-3">
            <h3 style={{fontSize:'var(--font-size-lg)', fontWeight:600, marginBottom:'var(--space-3)', color:'var(--color-text-primary)'}}>Popular Brands</h3>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'8px'}}>
              {Array.from({ length: 8 }).map((_, idx) => (
                <button
                  key={idx}
                  style={brandButtonStyle}
                >
                  {/* Placeholder brand label - replace with brand logo later */}
                  <div style={{fontSize:14, fontWeight:600, color:'var(--color-text-primary)'}}>Brand {idx + 1}</div>
                </button>
              ))}
            </div>
          </div>
      </main>
      <BottomNav />
    </>
  )
}
