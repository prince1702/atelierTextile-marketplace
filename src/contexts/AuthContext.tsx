import React, { createContext, useContext, useState, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'customer';
  initials: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: 'admin' | 'seller' | 'customer') => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: 'seller' | 'customer') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Record<string, User & { password: string }> = {
  'admin@atelier.com': { id: '1', name: 'Admin User', email: 'admin@atelier.com', role: 'admin', initials: 'AU', password: 'admin123' },
  'seller@atelier.com': { id: '2', name: 'Elena Jenkins', email: 'seller@atelier.com', role: 'seller', initials: 'EJ', password: 'seller123' },
  'customer@atelier.com': { id: '3', name: 'Marcus Reed', email: 'customer@atelier.com', role: 'customer', initials: 'MR', password: 'customer123' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('atelier_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, _password: string, role?: 'admin' | 'seller' | 'customer') => {
    await new Promise(r => setTimeout(r, 800));
    const demoUser = DEMO_USERS[email];
    if (demoUser) {
      const { password: _, ...userData } = demoUser;
      setUser(userData);
      localStorage.setItem('atelier_user', JSON.stringify(userData));
    } else {
      // Create a demo user based on role or email
      const inferredRole = role || (email.includes('admin') ? 'admin' : email.includes('seller') ? 'seller' : 'customer');
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
      const newUser: User = { id: Date.now().toString(), name, email, role: inferredRole, initials };
      setUser(newUser);
      localStorage.setItem('atelier_user', JSON.stringify(newUser));
    }
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string, role: 'seller' | 'customer') => {
    await new Promise(r => setTimeout(r, 1000));
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    const newUser: User = { id: Date.now().toString(), name, email, role, initials };
    setUser(newUser);
    localStorage.setItem('atelier_user', JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('atelier_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
