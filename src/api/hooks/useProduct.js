import { useState, useEffect, useCallback } from 'react';
import productService from '../productService';

export default function useProduct(id, options = { immediate: true }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (productId) => {
    if (!productId) return null;
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getProductById(productId);
      setData(res);
      return res;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options && options.immediate && id) fetch(id);
  }, [id]);

  const refetch = useCallback(() => fetch(id), [fetch, id]);

  return { data, loading, error, refetch };
}
