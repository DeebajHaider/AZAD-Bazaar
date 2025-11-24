import client from './client';
import productService from './productService';
import categoryService from './categoryService';
import brandService from './brandService';
import orderService from './orderService';
import favService from './favService';

import useProducts from './hooks/useProducts';
import useProduct from './hooks/useProduct';
import useCategories from './hooks/useCategories';
import useBrands from './hooks/useBrands';
import useOrders from './hooks/useOrders';
import useFavorites, { useAddFavorite, useRemoveFavorite } from './hooks/useFavorites';

export {
  client,
  productService,
  categoryService,
  brandService,
  orderService,
  favService,
  useProducts,
  useProduct,
  useCategories,
  useBrands,
  useOrders,
  useFavorites,
  useAddFavorite,
  useRemoveFavorite,
};

export default {
  client,
  productService,
  categoryService,
  brandService,
  orderService,
  favService,
};
