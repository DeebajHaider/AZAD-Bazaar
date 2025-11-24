import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import * as cartService from '../api/cartService';
import productService from '../api/productService';

const PLACEHOLDER = 'https://via.placeholder.com/80?text=Product';

export default function useCart(authTrigger) {
  const [rawItems, setRawItems] = useState([]); // { productId, quantity, addedAt }
  const [products, setProducts] = useState([]); // product docs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Track pending operations to prevent race conditions
  const pendingOps = useRef(new Set());

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
  }, [load, authTrigger]);

  // New effect: ensure we have product docs (with images) for items
  useEffect(() => {
    if (!rawItems || rawItems.length === 0) return;
    const ids = Array.from(new Set(rawItems.map(it => (it.productId && it.productId.toString) ? it.productId.toString() : String(it.productId))));
    if (!ids.length) return;

    const existingById = new Map((products || []).map(p => [p._id && p._id.toString ? p._id.toString() : String(p._id), p]));
    const needFetch = [];
    for (const id of ids) {
      const existing = existingById.get(id);
      if (!existing || !(Array.isArray(existing.images) && existing.images.length)) {
        needFetch.push(id);
      }
    }

    if (needFetch.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const fetched = await Promise.allSettled(needFetch.map(id => productService.getProductById(id)));
        if (cancelled) return;
        const successful = fetched
          .filter(r => r.status === 'fulfilled' && r.value)
          .map(r => r.status === 'fulfilled' ? r.value : null)
          .filter(Boolean);
        if (successful.length) {
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
        setError(err.message || err);
      }
    })();

    return () => { cancelled = true; };
  }, [rawItems, products]);

  const addToCart = useCallback(async (productId) => {
    // Prevent concurrent operations on the same item
    const opKey = `add-${productId}`;
    if (pendingOps.current.has(opKey)) {
      console.warn('⚠️ Skipping duplicate add operation for', productId);
      return;
    }
    
    pendingOps.current.add(opKey);
    setLoading(true);
    
    try {
      console.log('➕ Adding to cart:', productId);
      const resp = await cartService.addProduct(productId);
      console.log('✅ Add response:', resp.items);
      
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
      console.error('❌ Add failed:', err);
      setError(err.message || 'Failed to add product');
    } finally {
      pendingOps.current.delete(opKey);
      setLoading(false);
    }
  }, [load]);

  const decrementProduct = useCallback(async (productId) => {
    // Prevent concurrent operations on the same item
    const opKey = `dec-${productId}`;
    if (pendingOps.current.has(opKey)) {
      console.warn('⚠️ Skipping duplicate decrement operation for', productId);
      return;
    }
    
    pendingOps.current.add(opKey);
    setLoading(true);
    
    try {
      console.log('➖ Decrementing:', productId);
      const resp = await cartService.decrementProduct(productId);
      console.log('✅ Decrement response:', resp.items);
      
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
      console.error('❌ Decrement failed:', err);
      setError(err.message || 'Failed to update product');
    } finally {
      pendingOps.current.delete(opKey);
      setLoading(false);
    }
  }, [load]);

  const items = useMemo(() => {
    const productMap = new Map();
    (products || []).forEach((p) => {
      const id = p._id && p._id.toString ? p._id.toString() : String(p._id);
      productMap.set(id, p);
    });

    const result = rawItems.map((it) => {
      const pid = it.productId && it.productId.toString ? it.productId.toString() : String(it.productId);
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
    
    console.log('🔄 Items recalculated:', result.map(i => `${i.itemCode.slice(-4)}:${i.quantity}`).join(', '));
    return result;
  }, [rawItems, products]);

  const total = useMemo(() => items.reduce((s, it) => s + (Number(it.itemPrice) || 0) * (Number(it.quantity) || 0), 0), [items]);
  const savings = useMemo(() => items.reduce((s, it) => s + ((Number(it.itemOldPrice) || 0) - (Number(it.itemPrice) || 0)) * (Number(it.quantity) || 0), 0), [items]);

  const removeItem = useCallback(async (productId) => {
    setLoading(true);
    try {
      // Use dedicated removeProduct API to fully remove the item
      const resp = await cartService.removeProduct(productId);
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