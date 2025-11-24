import React, { useMemo } from 'react';
import BottomNav from '../component/BottomNav';
import { Layout } from '../Layout';
import HeaderWithName from '../component/HeaderWithName';
import { useFavoritesContext } from '../context/FavoritesContext';

export default function Favorites() {
  const { favorites, loading, error, remove, isFavorite } = useFavoritesContext();

  const items = useMemo(() => Array.isArray(favorites) ? favorites : [], [favorites]);

  return (
    <Layout footer={<BottomNav />} header={<HeaderWithName title={"Favorites"} to="/" /> }>
      <main className="min-h-screen flex-1 overflow-y-auto primBg">
        <div className="p-4 space-y-4">
          <div className="secBg primBorder rounded-lg p-4">
            <h2 className="text-xl font-semibold primText mb-2">Your Favorites</h2>
            {loading && (
              <p className="secText">Loading favorites…</p>
            )}
            {error && (
              <p className="text-red-500 text-sm">{error?.message || 'Failed to load favorites'}</p>
            )}
            {!loading && items.length === 0 && (
              <p className="secText">No favorites yet.</p>
            )}
            <ul className="divide-y divide-gray-200/10">
              {items.map((id) => (
                <li key={String(id)} className="flex items-center justify-between py-3">
                  <div className="flex-1 min-w-0">
                    <p className="primText text-sm font-medium truncate">{String(id)}</p>
                    <p className="secText text-xs">{isFavorite(id) ? 'In favorites' : ''}</p>
                  </div>
                  <button
                    onClick={() => remove(id)}
                    className="btnDanger min-h-10 px-3 py-2 rounded-lg text-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </Layout>
  );
}
