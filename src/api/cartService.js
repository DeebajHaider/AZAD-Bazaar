import client from './client';
import { getFromCache, setInCache, invalidateCache } from './cacheUtils';
import { CART } from './cacheKeys';

export async function getCart() {
  const cacheKey = CART;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const resp = await client.get('/cart');
  setInCache(cacheKey, resp.data);
  return resp.data;
}

export async function addProduct(productId) {
  invalidateCache(CART);
  const resp = await client.post('/cart/add', { productId });
  setInCache(CART, resp.data);
  return resp.data;
}

export async function decrementProduct(productId) {
  invalidateCache(CART);
  const resp = await client.post('/cart/decrement', { productId });
  setInCache(CART, resp.data);
  return resp.data;
}

export default { getCart, addProduct, decrementProduct };

export async function clearCart() {
  invalidateCache(CART);
  const resp = await client.post('/cart/clear');
  setInCache(CART, resp.data);
  return resp.data;
}
