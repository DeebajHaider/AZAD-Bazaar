import { useEffect, useMemo, useState } from 'react';

// Module-level cache so multiple hook instances share the loaded translations
let cachedMap = null;
let cachedRaw = null;

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to fetch translations from ${url}: ${res.status} ${res.statusText}`);
  return res.json();
}

/**
 * useTranslations hook
 * Options:
 *  - url: path to translations JSON (default: '/translations_export.json')
 *  - normalize: boolean, if true lookups are case-insensitive + trimmed
 *  - enabled: boolean
 *  - debug: boolean, if true print debug logs to console
 *
 * Returned object:
 *  - loading, error
 *  - get(model, field, value, lang) -> translated string or fallback
  *  - setTranslations(json) -> override cache with custom JSON
 */
export default function useTranslations(options = {}) {
  const { url = '/data_translated.json', normalize = true, enabled = true, debug = false } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(cachedMap);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
         console.log('useTranslations: loading translations from', url);
        if (!cachedMap || cachedRaw?.sourceUrl !== url) {
          const json = await fetchJson(url);
          const built = buildLookup(json, { normalize });
          cachedMap = built;
          cachedRaw = { sourceUrl: url, json };
           console.log('useTranslations: translations loaded', { sourceUrl: url, models: Array.isArray(json.models) ? json.models.length : 0 });
        }
        if (mounted) setMap(cachedMap);
      } catch (err) {
        if (mounted) setError(err);
         console.error('useTranslations: failed to load translations', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [url, normalize, enabled, debug]);

  // translateDBVal: translation helper (renamed from `get`)
  const translateDBVal = (model, field, value, lang = 'ur') => {
    console.log('translateDBVal called', { model, field, value, lang });
    if (!value) return value;
    if (lang === 'en') return value; // english is the source
    const key = normalize && typeof value === 'string' ? value.trim().toLowerCase() : value;
    if (!map) {
       console.log('translateDBVal: no map available', { model, field, value, key });
      return value;
    }
    const modelMap = map[model];
    if (!modelMap) {
       console.log('translateDBVal: missing model', { model, field, value, key });
      return value;
    }
    const fieldMap = modelMap[field];
    if (!fieldMap) {
       console.log('translateDBVal: missing field', { model, field, value, key });
      return value;
    }
    const entry = fieldMap[key];
    if (!entry) {
       console.log('translateDBVal: missing entry', { model, field, value, key });
      return value;
    }
    console.log('translateDBVal: found entry', { entry });
    if (lang === 'ur' && entry.ur) {
       console.log('translateDBVal: hit', { model, field, value, key, result: entry.ur });
      return entry.ur;
    }
     console.log('translateDBVal: fallback to original', { model, field, value, key });
    return value;
  };

  // Allow caller to override the cached translations at runtime
  const setTranslations = (json) => {
    try {
       console.log('useTranslations: setTranslations called (runtime override)', { entries: Array.isArray(json.models) ? json.models.length : 0 });
      cachedRaw = { sourceUrl: 'runtime', json };
      cachedMap = buildLookup(json, { normalize });
      setMap(cachedMap);
      return true;
    } catch (err) {
      setError(err);
       console.error('useTranslations: setTranslations failed', err);
      return false;
    }
  };

  return useMemo(() => ({ loading, error, translateDBVal, setTranslations, raw: cachedRaw?.json }), [loading, error, map]);
}

function buildLookup(json, opts = {}) {
  const { normalize = true } = opts;
  const map = {};
  if (!json || !Array.isArray(json.models)) return map;
  for (const block of json.models) {
    const { model, field, entries } = block;
    if (!map[model]) map[model] = {};
    if (!map[model][field]) map[model][field] = {};
    if (!Array.isArray(entries)) continue;
    for (const e of entries) {
      let key = e.value;
      if (normalize && typeof key === 'string') key = key.trim().toLowerCase();
      map[model][field][key] = e; // store the whole entry (includes ur field to be filled)
    }
  }
  return map;
}

/**
 * Example usage:
 *
 * import useTranslations from '../hooks/useTranslations';
 *
 * function ProductTitle({ product, lang }) {
 *   const { loading, translateDBVal } = useTranslations();
 *   if (loading) return '...';
 *   const title = translateDBVal('Product', 'name', product.name, lang);
 *   return <span>{title}</span>;
 * }
 */
