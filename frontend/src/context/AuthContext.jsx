import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/api/users/profile`);
        setUser(response.data);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email });
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/api/users/login`, {
        email,
        password,
      });
      console.log('Login response:', response.data);
      
      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('Attempting registration with:', { name, email });
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/api/users/register`, {
        name,
        email,
        password,
      });
      console.log('Registration response:', response.data);
      
      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error);
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_BASE_API_URL}/api/users/profile`, userData);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 