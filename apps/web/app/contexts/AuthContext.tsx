'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface User {
  id: string;
  phone: string;
  email?: string;
  isVerified: boolean;
  roles: string[];
  profile?: { fullName?: string; avatarUrl?: string; language?: string };
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phoneOrEmail: string, password: string) => Promise<void>;
  register: (phone: string, password: string, fullName?: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

async function refreshToken(): Promise<{ accessToken: string; user: User } | null> {
  try {
    const res = await fetch('/api/auth/refresh', { method: 'POST' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getAccessToken = useCallback(() => accessToken, [accessToken]);

  const refreshUser = useCallback(async () => {
    const result = await refreshToken();
    if (result) {
      setAccessToken(result.accessToken);
      setUser(result.user);
    } else {
      setAccessToken(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const login = async (phoneOrEmail: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneOrEmail, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    const json = await res.json();
    setAccessToken(json.data.accessToken);
    setUser(json.data.user);
  };

  const register = async (phone: string, password: string, fullName?: string, email?: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, fullName, email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    const json = await res.json();
    setAccessToken(json.data.accessToken);
    setUser(json.data.user);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
