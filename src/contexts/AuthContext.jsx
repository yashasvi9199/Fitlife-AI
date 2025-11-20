/**
 * Auth Context - Manages user authentication state
 */

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage immediately
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('fitlife-user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('fitlife-user');
        return null;
      }
    }
    return null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('fitlife-user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fitlife-user');
  };

  const updateUser = (userData) => {
    setUser(prev => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('fitlife-user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading: false, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
