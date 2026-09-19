import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { api, ApiError } from '../api/client';
import { useAlerts } from './AlertContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);
  const { showAlert } = useAlerts();

  // Validate existing token on boot
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const userData = await api.getMe();
        setUser(userData);
        setToken(savedToken);
      } catch (err) {
        console.warn('Existing session invalid or expired:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(
    async (email: string, pass: string) => {
      setLoading(true);
      try {
        const { token: newToken, user: userData } = await api.login(email, pass);
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        showAlert('success', `Welcome back, ${userData.name}! Logged in as ${userData.role}.`);
      } catch (err: any) {
        const message = err instanceof ApiError ? err.message : 'Invalid email or password';
        showAlert('error', message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [showAlert]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    showAlert('info', 'You have been securely logged out.');
  }, [showAlert]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
