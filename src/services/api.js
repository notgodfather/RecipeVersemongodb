// frontend/src/services/api.js - FULL PRODUCTION-READY VERSION
import axios from 'axios';

const api = axios.create({
  // 🌐 Dynamic baseURL - Dev vs Production
  baseURL: import.meta.env.VITE_API_URL || 
           import.meta.env.PROD ? 'https://recipeversebackend.onrender.com/api' :
           'http://localhost:5000/api',
  
  // 🍪 Credentials for auth cookies
  withCredentials: true,
  
  // ⏱️ Timeout protection
  timeout: 10000,
  
  // 📱 Headers
  headers: {
    'Content-Type': 'application/json',
  }
});

// 🔑 Auto-add token to ALL requests
api.interceptors.request.use(
  (config) => {
    // LocalStorage (primary)
    let token = localStorage.getItem('token');
    
    // Fallback: sessionStorage
    if (!token) {
      token = sessionStorage.getItem('token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Auto-logout on 401 + token refresh
api.interceptors.response.use(
  (response) => response,
  
  async (error) => {
    const originalRequest = error.config;
    
    // 🔓 401 = Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear invalid token
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login?expired=true';
      }
      
      return Promise.reject(error);
    }
    
    // 🌐 Network errors
    if (!error.response) {
      console.error('🌐 Network error - check backend URL');
    }
    
    return Promise.reject(error);
  }
);

export default api;
