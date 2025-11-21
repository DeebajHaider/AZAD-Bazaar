import { useState, useEffect, useCallback } from 'react';
import orderService from '../orderService';

/**
 * useOrders hook
 * trigger: A value (like auth token) that forces a reload when changed
 */
export default function useOrders(options = { immediate: true }, trigger) {
  const [orders, setOrders] = useState(null); // Default to null (not loaded)
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

  const immediate = options?.immediate;
  useEffect(() => {
    if (immediate) {
      fetchOrders();
    }
    // Reload whenever the trigger (token) changes
  }, [trigger, fetchOrders, immediate]);

  const refetch = useCallback(() => fetchOrders(), [fetchOrders]);

  return { orders, loading, error, refetch };
}