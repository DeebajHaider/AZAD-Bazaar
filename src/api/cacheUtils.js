const CACHE_PREFIX = 'AZAD_CACHE_';
const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour

const getFullKey = (key) => `${CACHE_PREFIX}${key}`;

/**
 * Retrieve data from cache
 * @param {string} key 
 * @returns {any|null}
 */
export const getFromCache = (key) => {
  const fullKey = getFullKey(key);
  const cachedRaw = localStorage.getItem(fullKey);
  
  if (!cachedRaw) {
    console.debug(`[Cache] MISS: ${key}`);
    return null;
  }

  try {
    const { value, expiry } = JSON.parse(cachedRaw);
    const now = Date.now();

    if (now > expiry) {
      console.debug(`[Cache] EXPIRED: ${key}`);
      localStorage.removeItem(fullKey);
      return null;
    }

    console.debug(`[Cache] HIT: ${key}`);
    return value;
  } catch (e) {
    console.error(`[Cache] ERROR parsing ${key}`, e);
    localStorage.removeItem(fullKey);
    return null;
  }
};

/**
 * Store data in cache
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttl 
 */
export const setInCache = (key, value, ttl = DEFAULT_TTL) => {
  const fullKey = getFullKey(key);
  const expiry = Date.now() + ttl;
  const payload = { value, expiry };
  
  try {
    localStorage.setItem(fullKey, JSON.stringify(payload));
    console.debug(`[Cache] SET: ${key} (TTL: ${ttl}ms)`);
  } catch (e) {
    console.error(`[Cache] ERROR setting ${key}`, e);
  }
};

/**
 * Invalidate cache keys matching a pattern
 * @param {string} keyPattern - Substring to match in the key (e.g. 'cart', 'product_')
 */
export const invalidateCache = (keyPattern) => {
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith(CACHE_PREFIX) && k.includes(keyPattern)) {
      localStorage.removeItem(k);
      console.debug(`[Cache] INVALIDATED: ${k}`);
    }
  });
};

/**
 * Generate a stable key for params
 * @param {string} base 
 * @param {object} params 
 */
export const generateCacheKey = (base, params = {}) => {
    // Sort keys to ensure {a:1, b:2} generates same key as {b:2, a:1}
    const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
    }, {});
    return `${base}_${JSON.stringify(sortedParams)}`;
};
