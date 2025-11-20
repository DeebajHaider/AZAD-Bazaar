import client from './client';
import { getFromCache, setInCache, invalidateCache } from './cacheUtils';

const ORDERS_LIST_KEY = 'orders_list';

/**
 * Create a new order.
 * This will invalidate the orders list cache and the cart cache.
 * @param {object} orderData - The payload for creating an order (e.g., { cartId, address, paymentMethod })
 */
export async function createOrder(orderData) {
  // Invalidate caches that will be affected by a new order
  invalidateCache(ORDERS_LIST_KEY);
  invalidateCache('cart'); // Creating an order usually clears the cart

  const resp = await client.post('/orders', orderData);
  // Don't cache the response of a POST request directly,
  // let the next GET request populate the cache.
  return resp.data;
}

/**
 * Fetch all orders for the current user.
 */
export async function getOrders() {
  const cacheKey = ORDERS_LIST_KEY;
  // const cached = getFromCache(cacheKey);
  // if (cached) return cached;

  const resp = await client.get('/orders');
  setInCache(cacheKey, resp.data);
  return resp.data;
}

/**
 * Fetch a single order by its ID.
 * @param {string} id
 */
export async function getOrderById(id) {
  if (!id) throw new Error('Order ID is required');

  const cacheKey = `order_${id}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  // As an optimization, check the list cache first
  const listCache = getFromCache(ORDERS_LIST_KEY);
  if (listCache && Array.isArray(listCache)) {
    const found = listCache.find(o => o._id === id);
    if (found) {
      console.debug(`[Cache] HIT (from list): ${cacheKey}`);
      setInCache(cacheKey, found); // Populate specific item cache
      return found;
    }
  }

  const resp = await client.get(`/orders/${id}`);
  setInCache(cacheKey, resp.data);
  return resp.data;
}

export default {
  createOrder,
  getOrders,
  getOrderById,
};
