import client from './client';

export const getBrands = async () => {
  const resp = await client.get('/brands');
  return resp.data;
};

export const getBrandById = async (id) => {
  if (!id) throw new Error('Brand id is required');
  const resp = await client.get(`/brands/${id}`);
  return resp.data;
};

export default {
  getBrands,
  getBrandById,
};
