import { storage } from './storage';

const CACHE_PREFIX = 'AZAD_CACHE_';
const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour
const getFullKey = (key) => `${CACHE_PREFIX}${key}`;

// Async functions (internal)
const _getFromCache = async (key) => {
  const fullKey = getFullKey(key);
  const cachedRaw = await storage.getItem(fullKey);
  if (!cachedRaw) return null;

  try {
    const { value, expiry } = cachedRaw;
    if (Date.now() > expiry) {
      await storage.removeItem(fullKey);
      return null;
    }
    return value;
  } catch {
    await storage.removeItem(fullKey);
    return null;
  }
};

const _setInCache = async (key, value, ttl = DEFAULT_TTL) => {
  const fullKey = getFullKey(key);
  const payload = { value, expiry: Date.now() + ttl };
  await storage.setItem(fullKey, payload);
};

const _invalidateCache = async (keyPattern) => {
  const keys = await storage.keys();
  for (const k of keys) {
    if (k.startsWith(CACHE_PREFIX) && k.includes(keyPattern)) {
      await storage.removeItem(k);
    }
  }
};

// =======================
// Exported async functions
// =======================

// Get from cache (properly async)
export const getFromCache = async (key) => {
  return await _getFromCache(key);
};

// Set in cache (async)
export const setInCache = async (key, value, ttl = DEFAULT_TTL) => {
  await _setInCache(key, value, ttl);
};

// Invalidate cache (async)
export const invalidateCache = async (keyPattern) => {
  await _invalidateCache(keyPattern);
};

// Generate stable cache key (still sync)
export const generateCacheKey = (base, params = {}) => {
  const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
    acc[key] = params[key];
    return acc;
  }, {});
  return `${base}_${JSON.stringify(sortedParams)}`;
};
