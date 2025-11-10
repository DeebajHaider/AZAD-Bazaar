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
  // { name: 'Bakery', icon: Bread },
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
      <main className="pb-40">
        {/* Address Bar */}
        <button 
          onClick={() => navigate('/address')}
          className="w-full px-4 py-2 flex items-center gap-2 bg-white border-b"
        >
          <MapPin size={18} className="text-blue-600 flex-shrink-0" />
          <div className="text-left">
            <div className="text-xs text-gray-500">Delivery to:</div>
            <div className="text-sm font-medium truncate">
              Etawah Society, Street 5, House Number 49
            </div>
          </div>
        </button>

        {/* Search Bar */}
        <div className="px-4 py-2 border-b">
          <button 
            onClick={() => navigate('/search')}
            className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-500"
          >
            <Search size={18} />
            <span className="text-sm">Search for items...</span>
          </button>
        </div>

        {/* Categories Section */}
        <div className="px-4 py-3">
          <h2 className="text-lg font-semibold mb-3">Categories</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.name}
                  className="flex flex-col items-center p-3 bg-white rounded-lg border shadow-sm"
                >
                  <Icon size={24} className="text-blue-600 mb-1" />
                  <span className="text-xs text-center">{category.name}</span>
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
