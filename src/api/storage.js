import localforage from 'localforage';

localforage.config({
  name: 'AZAD_BAZAAR',
  storeName: 'cache_store',
});

export const storage = {
  getItem: (key) => localforage.getItem(key),
  setItem: (key, value) => localforage.setItem(key, value),
  removeItem: (key) => localforage.removeItem(key),
  keys: () => localforage.keys(),
};
