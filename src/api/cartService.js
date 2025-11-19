import client from './client';
import { getFromCache, setInCache, invalidateCache } from './cacheUtils';

export async function getCart() {
  const cacheKey = 'cart';
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const resp = await client.get('/cart');
  setInCache(cacheKey, resp.data);
  return resp.data;
}

export async function addProduct(productId) {
  invalidateCache('cart');
  const resp = await client.post('/cart/add', { productId });
  setInCache('cart', resp.data);
  return resp.data;
}

export async function decrementProduct(productId) {
  invalidateCache('cart');
  const resp = await client.post('/cart/decrement', { productId });
  setInCache('cart', resp.data);
  return resp.data;
}

export default { getCart, addProduct, decrementProduct };

export async function clearCart() {
  invalidateCache('cart');
  const resp = await client.post('/cart/clear');
  setInCache('cart', resp.data);
  return resp.data;
}
