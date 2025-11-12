import { useCallback, useEffect, useMemo, useState } from 'react';
import * as cartService from '../api/cartService';
// add productService (the same underlying service used by useProduct hook)
import productService from '../api/productService';

const PLACEHOLDER = 'https://via.placeholder.com/80?text=Product';

export default function useCart() {
  const [rawItems, setRawItems] = useState([]); // { productId, quantity, addedAt }
  const [products, setProducts] = useState([]); // product docs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.getCart();
      setRawItems(data.items || []);
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // New effect: ensure we have product docs (with images) for items
  useEffect(() => {
    if (!rawItems || rawItems.length === 0) return;
    // collect unique product ids from rawItems
    const ids = Array.from(new Set(rawItems.map(it => (it.productId && it.productId.toString) ? it.productId.toString() : String(it.productId))));
    if (!ids.length) return;

    // build set of existing product ids we already have and check for missing images
    const existingById = new Map((products || []).map(p => [p._id && p._id.toString ? p._id.toString() : String(p._id), p]));
    const needFetch = [];
    for (const id of ids) {
      const existing = existingById.get(id);
      // fetch if we don't have the product at all OR if it exists but has no images (so UI can show image)
      if (!existing || !(Array.isArray(existing.images) && existing.images.length)) {
        needFetch.push(id);
      }
    }

    if (needFetch.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        // fetch missing product docs in parallel (limit not implemented; keep simple)
        const fetched = await Promise.allSettled(needFetch.map(id => productService.getProductById(id)));
        if (cancelled) return;
        const successful = fetched
          .filter(r => r.status === 'fulfilled' && r.value)
          .map(r => r.status === 'fulfilled' ? r.value : null)
          .filter(Boolean);
        if (successful.length) {
          // merge into products: replace existing entries or append new ones
          setProducts(prev => {
            const map = new Map((prev || []).map(p => [p._id && p._id.toString ? p._id.toString() : String(p._id), p]));
            for (const doc of successful) {
              const id = doc._id && doc._id.toString ? doc._id.toString() : String(doc._id);
              map.set(id, doc);
            }
            return Array.from(map.values());
          });
        }
      } catch (err) {
        // non-fatal — keep existing products and surface error state
        setError(err.message || err);
      }
    })();

    return () => { cancelled = true; };
  }, [rawItems, products]);

  const addToCart = useCallback(async (productId) => {
    setLoading(true);
    try {
      const resp = await cartService.addProduct(productId);
      // If the server returned the cart and products, update local state directly to avoid a second GET
      if (resp && (resp.items || resp.cart || resp.products)) {
        // there are two possible shapes: { items, products } (new) or { cart, products }
        const items = resp.items || (resp.cart && resp.cart.items) || [];
        const products = resp.products || [];
        setRawItems(items || []);
        if (products && products.length) setProducts(products);
        else {
          // if products missing, fallback to full reload
          await load();
        }
      } else {
        await load();
      }
    } catch (err) {
      setError(err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  }, [load]);

  const decrementProduct = useCallback(async (productId) => {
    setLoading(true);
    try {
      const resp = await cartService.decrementProduct(productId);
      if (resp && (resp.items || resp.cart || resp.products)) {
        const items = resp.items || (resp.cart && resp.cart.items) || [];
        const products = resp.products || [];
        setRawItems(items || []);
        if (products && products.length) setProducts(products);
        else {
          await load();
        }
      } else {
        await load();
      }
    } catch (err) {
      setError(err.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  }, [load]);

  const productMap = useMemo(() => {
    const m = new Map();
    (products || []).forEach((p) => m.set(p._id.toString(), p));
    return m;
  }, [products]);

  const items = useMemo(() => {
    return rawItems.map((it) => {
      const pid = it.productId.toString ? it.productId.toString() : String(it.productId);
      const p = productMap.get(pid) || {};
      return {
        itemCode: pid,
        itemName: p.name || 'Unknown product',
        itemPhoto: (p.images && p.images[0]) || PLACEHOLDER,
        itemPrice: p.discountedPrice || 0,
        itemOldPrice: p.originalPrice || 0,
        quantity: it.quantity || 0,
        addedAt: it.addedAt || null,
      };
    });
  }, [rawItems, productMap]);

  const total = useMemo(() => items.reduce((s, it) => s + (Number(it.itemPrice) || 0) * (Number(it.quantity) || 0), 0), [items]);
  const savings = useMemo(() => items.reduce((s, it) => s + ((Number(it.itemOldPrice) || 0) - (Number(it.itemPrice) || 0)) * (Number(it.quantity) || 0), 0), [items]);

  const removeItem = useCallback(async (productId) => {
    // decrement until removed - backend supports decrement which removes at 0
    // We'll call decrement in a loop until item disappears locally (simple approach)
    setLoading(true);
    try {
      // try a single decrement then reload
      const resp = await cartService.decrementProduct(productId);
      if (resp && (resp.items || resp.cart || resp.products)) {
        const items = resp.items || (resp.cart && resp.cart.items) || [];
        const products = resp.products || [];
        setRawItems(items || []);
        if (products && products.length) setProducts(products);
        else await load();
      } else {
        await load();
      }
    } catch (err) {
      setError(err.message || 'Failed to remove item');
    } finally {
      setLoading(false);
    }
  }, [load]);

  const clearCartLocal = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await cartService.clearCart();
      // server returns empty cart shape
      if (resp && (resp.items || resp.products || resp.cart)) {
        const items = resp.items || (resp.cart && resp.cart.items) || [];
        const products = resp.products || [];
        setRawItems(items || []);
        setProducts(products || []);
      } else {
        await load();
      }
    } catch (err) {
      setError(err.message || 'Failed to clear cart');
    } finally {
      setLoading(false);
    }
  }, [load]);

  return {
    items,
    rawItems,
    products,
    loading,
    error,
    load,
    addToCart,
    decrementProduct,
    removeItem,
    clearCart: clearCartLocal,
    total,
    savings,
  };
}
