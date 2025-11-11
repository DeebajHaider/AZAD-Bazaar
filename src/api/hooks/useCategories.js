import { useState, useEffect, useCallback } from 'react';
import categoryService from '../categoryService';

export default function useCategories(options = { immediate: true }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await categoryService.getCategories();
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
    if (options && options.immediate) fetch();
  }, []);

  const refetch = useCallback(() => fetch(), [fetch]);

  return { data, loading, error, refetch };
}
