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
          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'var(--space-3)', minHeight:'0'}}>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.name}
                  style={{display:'flex', flexDirection:'column', alignItems:'center', padding:'var(--space-3)', background:'var(--color-surface)', borderRadius:'var(--radius-md)', border:'1px solid var(--color-border)', boxShadow:'var(--shadow-sm)', cursor:'pointer', color:'var(--color-text-primary)'}}
                >
                  <Icon size={24} style={{color:'var(--color-primary-500)', marginBottom:'var(--space-1)'}} />
                  <span style={{fontSize:'var(--font-size-xs)', textAlign:'center', color:'var(--color-text-primary)'}}>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
