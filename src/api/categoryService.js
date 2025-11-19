import client from './client';
import { getFromCache, setInCache } from './cacheUtils';

export const getCategories = async () => {
  const cacheKey = 'categories_list';
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const resp = await client.get('/categories');
  setInCache(cacheKey, resp.data);
  return resp.data;
};

export const getCategoryById = async (id) => {
  if (!id) throw new Error('Category id is required');

  const cacheKey = `category_${id}`;

  // 1. Check if category exists in the full list cache
  const listCache = getFromCache('categories_list');
  if (listCache && Array.isArray(listCache)) {
    const found = listCache.find(c => c._id === id);
    if (found) {
      console.debug(`[Cache] HIT (from list): category_${id}`);
      setInCache(cacheKey, found);
      return found;
    }
  }

  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const resp = await client.get(`/categories/${id}`);
  setInCache(cacheKey, resp.data);
  return resp.data;
};

export default {
  getCategories,
  getCategoryById,
};
