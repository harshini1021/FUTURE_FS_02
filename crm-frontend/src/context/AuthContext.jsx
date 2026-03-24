// src/context/AuthContext.jsx
// Global auth state: user, login, logout, loading

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking saved session

  // ── On mount: restore session from localStorage ────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');

      if (!token) {
        setLoading(false);
        return;
      }

      // Optimistically set user from cache while we verify
      if (savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch (_) {}
      }

      try {
        const { data } = await authAPI.getMe();
        const freshUser = data.data.user;
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      } catch {
        // Token invalid / expired and refresh failed → clear everything
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login(email, password);
    const { user: loggedInUser, accessToken, refreshToken } = data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    return loggedInUser;
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const registerUser = useCallback(async (name, email, password) => {
    const { data } = await authAPI.register(name, email, password, 'viewer');
    const { user: loggedInUser, accessToken, refreshToken } = data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    return loggedInUser;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (_) {
      // ignore network errors on logout
    }
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }, []);

  // ── Update local user state (e.g. after profile edit) ─────────────────────
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'admin' || user?.role === 'manager',
    login,
    register: registerUser,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for easy consumption
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
