import client from './client';
import { getFromCache, setInCache } from './cacheUtils';

export const getBrands = async () => {
  const cacheKey = 'brands_list';
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const resp = await client.get('/brands');
  setInCache(cacheKey, resp.data);
  return resp.data;
};

export const getBrandById = async (id) => {
  if (!id) throw new Error('Brand id is required');
  
  const cacheKey = `brand_${id}`;

  // 1. Check if brand exists in the full list cache
  const listCache = getFromCache('brands_list');
  if (listCache && Array.isArray(listCache)) {
    const found = listCache.find(b => b._id === id);
    if (found) {
      console.debug(`[Cache] HIT (from list): brand_${id}`);
      setInCache(cacheKey, found);
      return found;
    }
  }

  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const resp = await client.get(`/brands/${id}`);
  setInCache(cacheKey, resp.data);
  return resp.data;
};

export default {
  getBrands,
  getBrandById,
};
