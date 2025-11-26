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
    const initAuth = async () => {
      // Check for stored user session
      const storedUser = localStorage.getItem('fitlife_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          if (!parsedUser?.token) {
            localStorage.removeItem('fitlife_user');
          } else {
            apiService.setAuthToken(parsedUser.token);
            setUser(parsedUser);
            
            // Refresh profile from API to ensure we have latest data (like gender)
            if (parsedUser.user_id && parsedUser.user_id !== '12345') {
              try {
                const profile = await apiService.getUserProfile(parsedUser.user_id);
                if (profile) {
                  const updatedUser = { ...parsedUser, ...profile };
                  if (!updatedUser.email && parsedUser.email) {
                    updatedUser.email = parsedUser.email;
                  }
                  setUser(updatedUser);
                  localStorage.setItem('fitlife_user', JSON.stringify(updatedUser));
                }
              } catch (err) {
                console.error('Failed to refresh profile', err);
              }
            }
          }
        } catch (e) {
          console.error('Failed to parse stored user', e);
          localStorage.removeItem('fitlife_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData) => {
    if (userData?.token) {
      apiService.setAuthToken(userData.token);
    }
    setUser(userData);
    localStorage.setItem('fitlife_user', JSON.stringify(userData));
  };

  const logout = () => {
    apiService.setAuthToken(null);
    setUser(null);
    localStorage.removeItem('fitlife_user');
  };

  const updateUser = (userData) => {
    setUser(prev => {
      const updated = { ...prev, ...userData, token: userData?.token ?? prev?.token };
      localStorage.setItem('fitlife_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
