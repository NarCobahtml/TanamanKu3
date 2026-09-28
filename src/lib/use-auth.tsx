'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role?: string;
  photoUrl?: string | null;
  bio?: string | null;
  createdAt?: string;
}

export interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  isAuthenticated: boolean;
  initials: string;
  refresh: () => Promise<UserSession | null>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; bio?: string; photoUrl?: string }) => Promise<UserSession | undefined>;
}

const STORAGE_KEY = 'tumbuhkita_user';

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'TK';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as UserSession) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const readLocalUser = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as UserSession;
    } catch {
      // ignore
    }
    return null;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.user) {
          const u: UserSession = json.data.user;
          setUser(u);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
          }
          setLoading(false);
          return u;
        }
      } else if (res.status === 401) {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch auth session:', err);
    }
    setLoading(false);
    return null;
  }, []);

  useEffect(() => {
    let ignore = false;

    // 1. Initial server session validation asynchronously
    fetch('/api/auth/me')
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          if (!ignore && json.success && json.data?.user) {
            setUser(json.data.user);
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data.user));
            }
          }
        } else if (res.status === 401) {
          if (!ignore) {
            setUser(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem(STORAGE_KEY);
            }
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch auth session:', err);
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    // 2. Subscribe to Supabase auth state changes (OAuth, sign in, sign out)
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        await refresh();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
        }
        setLoading(false);
      }
    });

    // 3. Listen to local broadcast events
    const onAuthChanged = () => {
      const updated = readLocalUser();
      if (updated) setUser(updated);
      refresh();
    };

    window.addEventListener('auth-changed', onAuthChanged);
    window.addEventListener('storage', onAuthChanged);

    return () => {
      ignore = true;
      subscription.unsubscribe();
      window.removeEventListener('auth-changed', onAuthChanged);
      window.removeEventListener('storage', onAuthChanged);
    };
  }, [readLocalUser, refresh]);

  const logout = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event('auth-changed'));
    }
    setUser(null);
    router.push('/login');
    router.refresh();
  }, [router]);

  const updateProfile = useCallback(async (data: { name?: string; bio?: string; photoUrl?: string }) => {
    const res = await fetch('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Gagal memperbarui profil');
    }

    const updatedUser = json.data?.user;
    if (updatedUser) {
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('auth-changed'));
      }
    }
    return updatedUser;
  }, []);

  const value: AuthContextType = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    initials: getInitials(user?.name),
    refresh,
    logout,
    updateProfile,
  }), [user, loading, refresh, logout, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      loading: false,
      isAuthenticated: false,
      initials: 'TK',
      refresh: async () => null,
      logout: async () => {},
      updateProfile: async () => undefined,
    };
  }
  return context;
}
