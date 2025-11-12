import client from './client';

export async function getCart() {
  const resp = await client.get('/cart');
  return resp.data;
}

export async function addProduct(productId) {
  const resp = await client.post('/cart/add', { productId });
  return resp.data;
}

export async function decrementProduct(productId) {
  const resp = await client.post('/cart/decrement', { productId });
  return resp.data;
}

export default { getCart, addProduct, decrementProduct };

export async function clearCart() {
  const resp = await client.post('/cart/clear');
  return resp.data;
}
