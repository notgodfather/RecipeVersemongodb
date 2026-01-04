import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load from storage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken);
        // Check expiry
        if (decoded.exp * 1000 > Date.now()) {
          setToken(savedToken);
          setUser(decoded);  // { id, username, iat, exp }
          // Set API header
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // ✅ FIXED: login(user, token) signature
  const login = (userData, authToken) => {
    localStorage.setItem('token', authToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    setToken(authToken);
    setUser(userData);  // Backend user: { id, username, email }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    // Redirect to login
    window.location.href = '/login?expired=true';
  };

  // Token expiry check
  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      const expiry = decoded.exp * 1000;
      const timeout = expiry - Date.now();
      
      if (timeout > 0) {
        const timer = setTimeout(logout, timeout);
        return () => clearTimeout(timer);
      } else {
        logout();
      }
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
