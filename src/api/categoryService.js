import client from './client';
import { getFromCache, setInCache } from './cacheUtils';
import { CATEGORIES_LIST, CATEGORY_BY_ID } from './cacheKeys';

export const getCategories = async () => {
  const cacheKey = CATEGORIES_LIST;
  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  const resp = await client.get('/categories');
  await setInCache(cacheKey, resp.data);
  return resp.data;
};

export const getCategoryById = async (id) => {
  if (!id) throw new Error('Category id is required');

  const cacheKey = CATEGORY_BY_ID(id);

  // 1. Check if category exists in the full list cache
  const listCache = await getFromCache(CATEGORIES_LIST);
  if (listCache && Array.isArray(listCache)) {
    const found = listCache.find(c => c._id === id);
    if (found) {
      console.debug(`[Cache] HIT (from list): category_${id}`);
      await setInCache(cacheKey, found);
      return found;
    }
  }

  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  const resp = await client.get(`/categories/${id}`);
  await setInCache(cacheKey, resp.data);
  return resp.data;
};

export default {
  getCategories,
  getCategoryById,
};
