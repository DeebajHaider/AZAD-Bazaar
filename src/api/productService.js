import client from './client';
import { getFromCache, setInCache, generateCacheKey } from './cacheUtils';
import { PRODUCTS_LIST, PRODUCT_BY_ID, RELATED_PRODUCTS } from './cacheKeys';

/**
 * Fetch products list with optional query params.
 * Supported params (per backend): name, categories, brands, instock, sort
 * Example: { name: 'apple', categories: 'fruits', brands: ['b1','b2'], instock: true, sort: 'name' }
 */
export const getProducts = async (params = {}) => {
  const cacheKey = generateCacheKey(PRODUCTS_LIST, params);
  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  const response = await client.get('/products', { params });
  await setInCache(cacheKey, response.data);
  return response.data;
};

export const getProductById = async (id) => {
  if (!id) throw new Error('Product id is required');

  const cacheKey = PRODUCT_BY_ID(id);

  // 1. Check if product exists in the default full list cache
  const listCacheKey = generateCacheKey(PRODUCTS_LIST, {});
  const listCache = await getFromCache(listCacheKey);
  if (listCache && Array.isArray(listCache)) {
    const found = listCache.find(p => p._id === id);
    if (found) {
      console.debug(`[Cache] HIT (from list): product_${id}`);
      await setInCache(cacheKey, found);
      return found;
    }
  }

  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  const response = await client.get(`/products/${id}`);
  await setInCache(cacheKey, response.data);
  return response.data;
};

export const getRelatedProducts = async (id) => {
  if (!id) throw new Error('Product id is required');
  
  const cacheKey = RELATED_PRODUCTS(id);
  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  const response = await client.get(`/products/${id}/related`);
  await setInCache(cacheKey, response.data);
  return response.data;
};

export default {
  getProducts,
  getProductById,
  getRelatedProducts,
};
