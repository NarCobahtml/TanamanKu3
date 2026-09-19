'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role?: string;
  photoUrl?: string | null;
  bio?: string | null;
  createdAt?: string;
}

const STORAGE_KEY = 'tumbuhkita_user';

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'TK';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Read from localStorage initially
  const readLocalUser = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as UserSession;
      }
    } catch {
      // ignore
    }
    return null;
  }, []);

  // Fetch verified session from /api/auth/me
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
        // Not authenticated
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
    // 1. Instant local read
    const local = readLocalUser();
    if (local) {
      setUser(local);
      setLoading(false);
    }

    // 2. Validate with Supabase server
    refresh();

    // 3. Listen to auth changes
    const onAuthChanged = () => {
      const updated = readLocalUser();
      setUser(updated);
      refresh();
    };

    window.addEventListener('auth-changed', onAuthChanged);
    window.addEventListener('storage', onAuthChanged);

    return () => {
      window.removeEventListener('auth-changed', onAuthChanged);
      window.removeEventListener('storage', onAuthChanged);
    };
  }, [readLocalUser, refresh]);

  const logout = async () => {
    try {
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
  };

  const updateProfile = async (data: { name?: string; bio?: string; photoUrl?: string }) => {
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
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    initials: getInitials(user?.name),
    refresh,
    logout,
    updateProfile,
  };
}
