'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Role, JwtPayload } from '@/types';
import {
  getToken,
  setToken,
  removeToken,
  decodeToken,
} from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  token: JwtPayload | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<JwtPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      if (storedToken) {
        const payload = decodeToken(storedToken);
        if (payload) {
          setTokenState(payload);
          try {
            const res = await fetch('/api/profile', {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            if (res.ok) {
              const profile = await res.json();
              setUser(profile);
            } else {
              removeToken();
              setTokenState(null);
            }
          } catch {
            removeToken();
            setTokenState(null);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Error al iniciar sesión' }));
      throw new Error(error.message || 'Credenciales inválidas');
    }

    const data = await res.json();
    setToken(data.access_token);

    const payload = decodeToken(data.access_token);
    setTokenState(payload);

    // Fetch profile
    const profileRes = await fetch('/api/profile', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    if (profileRes.ok) {
      const profile = await profileRes.json();
      setUser(profile);
    }

    router.push('/dashboard');
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Error al registrar' }));
      throw new Error(error.message || 'Error al crear cuenta');
    }

    router.push('/login');
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setTokenState(null);
    // Clear the cookie
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  const hasRole = (...roles: Role[]) => {
    if (!token) return false;
    return roles.includes(token.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
