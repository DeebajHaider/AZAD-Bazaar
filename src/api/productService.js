import client from './client';

/**
 * Fetch products list with optional query params.
 * Supported params (per backend): name, categories, brands, instock, sort
 * Example: { name: 'apple', categories: 'fruits', brands: ['b1','b2'], instock: true, sort: 'name' }
 */
export const getProducts = async (params = {}) => {
  const response = await client.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  if (!id) throw new Error('Product id is required');
  const response = await client.get(`/products/${id}`);
  return response.data;
};

export default {
  getProducts,
  getProductById,
};
