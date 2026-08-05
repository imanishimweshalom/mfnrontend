import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safe check for localStorage (prevents SSR crashes)
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('mfn_token');
    if (token) {
      authAPI.me()
        .then(res => {
          // Fix: Ensure we are extracting the user object correctly
          // If your API returns { token, user }, use res.data.user. 
          // If it returns the user directly, use res.data.
          setUser(res.data.user || res.data);
        })
        .catch(() => {
          localStorage.removeItem('mfn_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Fix: Wrapped in useCallback to prevent unnecessary re-renders
  const login = useCallback(async (username, password) => {
    const res = await authAPI.login({ username, password });
    if (res.data.token) {
      localStorage.setItem('mfn_token', res.data.token);
    }
    // Fix: Consistently extracting the user object
    setUser(res.data.user || res.data);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mfn_token');
    setUser(null);
  }, []);

  const can = useCallback((action) => {
    const perms = {
      delete_content:   ['Admin'],
      approve_comments: ['Admin', 'Moderator', 'Editor'],
      manage_authors:   ['Admin', 'Editor'],
      publish_story:    ['Admin', 'Editor', 'Journalist'],
      manage_ads:       ['Admin'],
      manage_users:     ['Admin'],
    };
    return perms[action]?.includes(user?.role) ?? false;
  }, [user]); // Recreate this function only when the user changes

  return (
    <AuthContext.Provider value={{ user, login, logout, can, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
