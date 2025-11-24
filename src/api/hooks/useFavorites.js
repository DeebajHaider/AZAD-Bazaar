import { useState, useEffect, useCallback } from 'react';
import favService from '../favService';

export default function useFavorites(options = { immediate: true }) {
  const [data, setData] = useState({ favorites: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await favService.getFavorites();
      setData(res || { favorites: [] });
      return res;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options && options.immediate) fetch();
  }, []);

  const refetch = useCallback(() => fetch(), [fetch]);

  return { data, loading, error, refetch };
}

// Named hooks for mutations, colocated to reduce file sprawl
export function useAddFavorite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const addFavorite = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await favService.addFavorite(productId);
      setResult(res);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { addFavorite, loading, error, result };
}

export function useRemoveFavorite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const removeFavorite = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await favService.removeFavorite(productId);
      setResult(res);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { removeFavorite, loading, error, result };
}
