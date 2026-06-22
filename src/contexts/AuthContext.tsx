import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: 'seller' | 'customer') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on startup
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('atelier_token');
      if (token) {
        try {
          const profile = await api.auth.getMe();
          setUser(profile);
        } catch (error) {
          console.error('Session restoration failed:', error);
          // Token expired or invalid
          localStorage.removeItem('atelier_token');
          localStorage.removeItem('atelier_user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token, user: loggedUser } = await api.auth.login(email, password);
      localStorage.setItem('atelier_token', token);
      localStorage.setItem('atelier_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: 'seller' | 'customer') => {
    setIsLoading(true);
    try {
      const { token, user: registeredUser } = await api.auth.register(name, email, password, role);
      localStorage.setItem('atelier_token', token);
      localStorage.setItem('atelier_user', JSON.stringify(registeredUser));
      setUser(registeredUser);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('atelier_token');
    localStorage.removeItem('atelier_user');
    api.auth.logout().catch(err => console.error('Logout error on backend:', err));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
