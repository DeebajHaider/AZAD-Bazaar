import { useState, useEffect, useCallback, useRef } from 'react';
import productService from '../productService';

/**
 * useProducts hook
 * params: object passed as query params to backend (name, categories, brands, instock, sort)
 * options: { immediate: boolean } - whether to fetch immediately
 */
export default function useProducts(initialParams = {}, options = { immediate: true }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const paramsRef = useRef(initialParams);

  const fetch = useCallback(async (overrideParams) => {
    setLoading(true);
    setError(null);
    const params = overrideParams ?? paramsRef.current ?? {};
    try {
      const res = await productService.getProducts(params);
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
    paramsRef.current = initialParams;
    if (options && options.immediate) {
      fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialParams)]);

  const refetch = useCallback((overrideParams) => fetch(overrideParams), [fetch]);

  return { data, loading, error, refetch };
}
