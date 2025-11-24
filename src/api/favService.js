import client from './client';
import { getFromCache, setInCache, invalidateCache } from './cacheUtils';
import { FAVORITES } from './cacheKeys';

const getToken = () => {
	try {
		return localStorage.getItem('token') || '';
	} catch (e) {
		return '';
	}
};

export async function getFavorites() {
	const token = getToken();
	const cacheKey = FAVORITES(token);
	const cached = await getFromCache(cacheKey);
	if (cached) return cached;

	const resp = await client.get('/favorites');
	await setInCache(cacheKey, resp.data);
	return resp.data;
}

export async function addFavorite(productId) {
	const token = getToken();
	const cacheKey = FAVORITES(token);
	await invalidateCache(cacheKey);
	const resp = await client.post('/favorites/add', { productId });
	await setInCache(cacheKey, resp.data);
	return resp.data;
}

export async function removeFavorite(productId) {
	const token = getToken();
	const cacheKey = FAVORITES(token);
	await invalidateCache(cacheKey);
	const resp = await client.post('/favorites/remove', { productId });
	await setInCache(cacheKey, resp.data);
	return resp.data;
}

export default { getFavorites, addFavorite, removeFavorite };
