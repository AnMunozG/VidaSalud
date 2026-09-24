import axios from 'axios';

export const TOKEN_KEY = 'vidasalud_token';
export const USER_KEY = 'vidasalud_user';
export const AUTH_MODE_KEY = 'vidasalud_auth_mode';
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// Configuración base de axios (API Gateway / backend Spring Boot)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    return Promise.reject(error);
  }
);

export default api;