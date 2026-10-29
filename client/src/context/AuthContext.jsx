import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi } from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'register'

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('imovies_token');
      const storedUser = localStorage.getItem('imovies_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const res = await getMeApi();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('imovies_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid, logging out.');
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginApi({ email, password });
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('imovies_token', data.token);
        localStorage.setItem('imovies_user', JSON.stringify(data.user));
        setAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await registerApi({ name, email, password });
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('imovies_token', data.token);
        localStorage.setItem('imovies_user', JSON.stringify(data.user));
        setAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_user');
  };

  const openLoginModal = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        isLoading,
        authModalOpen,
        authModalMode,
        setAuthModalMode,
        openLoginModal,
        openRegisterModal,
        closeAuthModal,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
