'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API || 'http://localhost:3110/api/v1/auth';

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
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setTokens = (access: string, refresh: string) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  };

  const getAccessToken = () => localStorage.getItem('accessToken');

  const getUserId = () => {
    const u = user;
    return u?.id || null;
  };

  const refreshUser = useCallback(async () => {
    const accessToken = getAccessToken();
    if (!accessToken) { setUser(null); setLoading(false); return; }
    try {
      const res = await fetch(`${AUTH_API}/me`, {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'x-user-id': getUserId() || '' },
      });
      if (res.ok) {
        const json = await res.json();
        setUser(json.data);
      } else {
        const refresh = localStorage.getItem('refreshToken');
        if (refresh) {
          const refreshRes = await fetch(`${AUTH_API}/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: refresh }),
          });
          if (refreshRes.ok) {
            const refreshJson = await refreshRes.json();
            setTokens(refreshJson.data.accessToken, refreshJson.data.refreshToken);
            setUser(refreshJson.data.user);
          } else {
            setUser(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        } else {
          setUser(null);
        }
      }
    } catch { setUser(null); }
    setLoading(false);
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const login = async (phoneOrEmail: string, password: string) => {
    const res = await fetch(`${AUTH_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneOrEmail, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    const json = await res.json();
    setTokens(json.data.accessToken, json.data.refreshToken);
    setUser(json.data.user);
  };

  const register = async (phone: string, password: string, fullName?: string, email?: string) => {
    const res = await fetch(`${AUTH_API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, fullName, email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    const json = await res.json();
    setTokens(json.data.accessToken, json.data.refreshToken);
    setUser(json.data.user);
  };

  const logout = async () => {
    const refresh = localStorage.getItem('refreshToken');
    try {
      await fetch(`${AUTH_API}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify({ refreshToken: refresh }),
      });
    } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
