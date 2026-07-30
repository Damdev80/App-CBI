import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from '@/types';
import { Role } from '@/types';

const TOKEN_KEY = 'access_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;

  const payload = decodeToken(token);
  if (!payload) return false;

  // Check if token is expired
  const currentTime = Date.now() / 1000;
  if (payload.exp && payload.exp < currentTime) {
    removeToken();
    return false;
  }

  return true;
}

export function getUserRole(): Role | null {
  const token = getToken();
  if (!token) return null;

  const payload = decodeToken(token);
  return payload?.role ?? null;
}

export function getUserFromToken(): JwtPayload | null {
  const token = getToken();
  if (!token) return null;
  return decodeToken(token);
}

export function hasRole(...roles: Role[]): boolean {
  const userRole = getUserRole();
  if (!userRole) return false;
  return roles.includes(userRole);
}

export function isAdmin(): boolean {
  return hasRole(Role.ADMIN);
}

export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}
