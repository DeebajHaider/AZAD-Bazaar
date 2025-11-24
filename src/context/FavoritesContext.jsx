import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import favService from '../api/favService';

const FavoritesContext = createContext({
  favorites: [],
  loading: false,
  error: null,
  refresh: async () => {},
  add: async (_id) => {},
  remove: async (_id) => {},
  isFavorite: (_id) => false,
});

export function FavoritesProvider({ children, immediate = true }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await favService.getFavorites();
      setFavorites(res?.favorites || []);
      return res;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const add = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await favService.addFavorite(productId);
      setFavorites(res?.favorites || []);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await favService.removeFavorite(productId);
      setFavorites(res?.favorites || []);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const isFavorite = useCallback((productId) => {
    if (!productId) return false;
    return favorites?.some((f) => String(f) === String(productId));
  }, [favorites]);

  useEffect(() => {
    if (immediate) refresh();
  }, [immediate, refresh]);

  const value = useMemo(() => ({ favorites, loading, error, refresh, add, remove, isFavorite }), [favorites, loading, error, refresh, add, remove, isFavorite]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  return useContext(FavoritesContext);
}

export default FavoritesContext;
