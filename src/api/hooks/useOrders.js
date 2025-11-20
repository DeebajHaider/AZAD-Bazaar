import { useState, useEffect, useCallback } from 'react';
import orderService from '../orderService';

/**
 * useOrders hook
 * Fetches all orders for the current authenticated user.
 * options: { immediate: boolean } - whether to fetch immediately
 */
export default function useOrders(options = { immediate: true }) {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getOrders();
      setOrders(res);
      return res;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options && options.immediate) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetch = useCallback(() => fetchOrders(), [fetchOrders]);

  return { orders, loading, error, refetch };
}
