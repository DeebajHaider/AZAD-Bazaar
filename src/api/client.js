import axios from 'axios';

// Base URL can be configured via Vite env var VITE_API_BASE_URL
const baseURL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://localhost:5000/api';

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
    try {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
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
