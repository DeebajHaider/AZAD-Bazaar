import axios from 'axios';

// Resolve API base URL with precedence:
// 1. VITE_API_BASE_URL (recommended Vite-exposed variable)
// 2. APICLIENT (non-prefixed, from .env if manually loaded)
// 3. process.env.APICLIENT (Node context / SSR fallback)
// 4. default localhost
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
let baseURL = env.VITE_API_BASE_URL
  || (typeof process !== 'undefined' && process.env && process.env.APICLIENT)
  || 'http://localhost:5000/api';

console.debug('API client baseURL set to', baseURL);

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor placeholder (e.g., attach auth token)
client.interceptors.request.use(
  (config) => {
    // Example: attach token from localStorage if available
    console.debug('API request to', config.url);
    try {
      const token = localStorage.getItem('token') || (window && window.__AZAD_TOKEN__);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // no token found; leave Authorization as-is (caller may have set it)
        // console.debug('No auth token present for request', config.url);
      }
    } catch (e) {
      // ignore (SSR or privacy)
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - normalize errors
client.interceptors.response.use(
  (resp) => resp,
  (error) => {
    // Make sure error.response?.data?.message is available when possible
    if (error && error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default client;

// Helper for explicitly setting token at runtime (e.g., after login)
export function setAuthToken(token) {
  try {
    if (typeof window !== 'undefined') window.__AZAD_TOKEN__ = token;
    if (token) client.defaults.headers.Authorization = `Bearer ${token}`;
    else delete client.defaults.headers.Authorization;
  } catch (e) {
    // ignore
  }
}
