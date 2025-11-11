import client from './client';
import productService from './productService';
import categoryService from './categoryService';
import brandService from './brandService';

import useProducts from './hooks/useProducts';
import useProduct from './hooks/useProduct';
import useCategories from './hooks/useCategories';
import useBrands from './hooks/useBrands';

export {
  client,
  productService,
  categoryService,
  brandService,
  useProducts,
  useProduct,
  useCategories,
  useBrands,
};

export default {
  client,
  productService,
  categoryService,
  brandService,
};
