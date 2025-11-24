import client from './client';
import { getFromCache, setInCache, invalidateCache } from './cacheUtils';
import { CART } from './cacheKeys';

const getToken = () => {
  try {
    return localStorage.getItem('token') || '';
  } catch (e) {
    return '';
  }
};

export async function getCart() {
  const token = getToken();
  const cacheKey = CART(token);
  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  const resp = await client.get('/cart');
  await setInCache(cacheKey, resp.data);
  return resp.data;
}

export async function addProduct(productId) {
  const token = getToken();
  await invalidateCache(CART(token));
  const resp = await client.post('/cart/add', { productId });
  await setInCache(CART(token), resp.data);
  return resp.data;
}

export async function decrementProduct(productId) {
  const token = getToken();
  await invalidateCache(CART(token));
  const resp = await client.post('/cart/decrement', { productId });
  await setInCache(CART(token), resp.data);
  return resp.data;
}

// Remove a product from cart directly
export async function removeProduct(productId) {
  const token = getToken();
  await invalidateCache(CART(token));
  const resp = await client.post('/cart/remove', { productId });
  await setInCache(CART(token), resp.data);
  return resp.data;
}

export default { getCart, addProduct, decrementProduct, removeProduct };

export async function clearCart() {
  const token = getToken();
  await invalidateCache(CART(token));
  const resp = await client.post('/cart/clear');
  await setInCache(CART(token), resp.data);
  return resp.data;
}
