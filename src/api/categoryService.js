import client from './client';

export const getCategories = async () => {
  const resp = await client.get('/categories');
  return resp.data;
};

export const getCategoryById = async (id) => {
  if (!id) throw new Error('Category id is required');
  const resp = await client.get(`/categories/${id}`);
  return resp.data;
};

export default {
  getCategories,
  getCategoryById,
};
