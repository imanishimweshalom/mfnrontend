import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('mfn_token');
    if (token) {
      authAPI.me()
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('mfn_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password });
    localStorage.setItem('mfn_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('mfn_token');
    setUser(null);
  };

  const can = (action) => {
    const perms = {
      delete_content:   ['Admin'],
      approve_comments: ['Admin', 'Moderator', 'Editor'],
      manage_authors:   ['Admin', 'Editor'],
      publish_story:    ['Admin', 'Editor', 'Journalist'],
      manage_ads:       ['Admin'],
      manage_users:     ['Admin'],
    };
    return perms[action]?.includes(user?.role) ?? false;
  };

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
