/**
 * Centralized cache keys for the application
 * All cache keys used across services are defined here
 */

// Brand cache keys
export const BRANDS_LIST = 'brands_list';
export const BRAND_BY_ID = (id) => `brand_${id}`;

// Category cache keys
export const CATEGORIES_LIST = 'categories_list';
export const CATEGORY_BY_ID = (id) => `category_${id}`;

// Product cache keys
export const PRODUCTS_LIST = 'products_list';
export const PRODUCT_BY_ID = (id) => `product_${id}`;
export const RELATED_PRODUCTS = (id) => `related_products_${id}`;

// Cart cache keys (user-specific)
export const CART = (token = '') => `cart_${token ? token.substring(0, 10) : 'guest'}`;

// Favorites cache keys (user-specific)
export const FAVORITES = (token = '') => `favorites_${token ? token.substring(0, 10) : 'guest'}`;

// Order cache keys
export const ORDERS_LIST = 'orders_list';
export const ORDER_BY_ID = (id) => `order_${id}`;

// Address cache keys (customer-specific)
export const CUSTOMER_ADDRESSES = (customerId) => `addresses_${customerId}`;
