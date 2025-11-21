/**
 * Auth Context - Manages user authentication state
 */

import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('fitlife_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('fitlife_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // This would be a real API call
    // For now, we simulate a login
    // In a real app, you'd get a token and user data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser = {
      user_id: '12345', // Replace with real ID from DB
      email,
      name: email.split('@')[0]
    };
    
    setUser(mockUser);
    localStorage.setItem('fitlife_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fitlife_user');
  };

  const updateUser = (userData) => {
    setUser(prev => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('fitlife_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading: false, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
