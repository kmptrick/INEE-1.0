'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, User } from './api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('inee_token');
    if (token) {
      auth.me().then(setUser).catch(() => localStorage.removeItem('inee_token')).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await auth.login(email, password);
    localStorage.setItem('inee_token', res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('inee_token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
