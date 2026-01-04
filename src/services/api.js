// frontend/src/services/api.js - FIXED DOUBLE PREFIX + PRODUCTION PERFECT
import axios from 'axios';

const api = axios.create({
  // 🌐 FIXED: Backend ROOT (no /api) - Backend handles /api/*
  baseURL: import.meta.env.VITE_API_URL || 
           (import.meta.env.PROD 
             ? 'https://recipeversebackend.onrender.com'
             : 'http://localhost:5000'),
  
  withCredentials: true,
  timeout: 15000, // Increased for Render cold starts
  headers: { 'Content-Type': 'application/json' }
});

// 🔑 Token interceptor
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 🐛 Remove in production
    if (import.meta.env.DEV) {
      console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Response interceptor - Auto logout 401s
api.interceptors.response.use(
  (response) => response,
  
  async (error) => {
    const originalRequest = error.config;
    
    // 🔓 Token expired → Logout
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear tokens
      ['token', 'user'].forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // Redirect (avoid infinite loops)
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        const params = new URLSearchParams({ expired: 'true' });
        window.location.href = `/login?${params}`;
      }
      
      return Promise.reject(error);
    }
    
    // Offline/network
    if (!error.response && import.meta.env.DEV) {
      console.error('🌐 Network error - Backend offline?');
    }
    
    return Promise.reject(error);
  }
);

// 🔄 Helper: Set auth token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
