import client from './client';
import productService from './productService';
import categoryService from './categoryService';
import brandService from './brandService';
import orderService from './orderService';

import useProducts from './hooks/useProducts';
import useProduct from './hooks/useProduct';
import useCategories from './hooks/useCategories';
import useBrands from './hooks/useBrands';
import useOrders from './hooks/useOrders';

export {
  client,
  productService,
  categoryService,
  brandService,
  orderService,
  useProducts,
  useProduct,
  useCategories,
  useBrands,
  useOrders,
};

export default {
  client,
  productService,
  categoryService,
  brandService,
  orderService,
};
