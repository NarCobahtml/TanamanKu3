'use client';

import { useSyncExternalStore, useEffect } from 'react';

export type KategoriTanaman = 'Indoor' | 'Outdoor' | 'Kebun';
export type StatusSiram = 'hari-ini' | 'terlambat' | 'terjadwal';

export interface Tanaman {
  id: string; // pure numeric ID string e.g. "1", "2", "1789701234567"
  nama: string;
  jenis?: string;
  kategori: KategoriTanaman;
  status: StatusSiram;
  nextWater: string;
  photo?: string;
  notes?: string | null;
  userId?: string | null;
}

export const initialTanamanList: Tanaman[] = [
  { id: '1', nama: 'Monstera Deliciosa', jenis: 'hias', kategori: 'Indoor', status: 'hari-ini', nextWater: 'nw.hariIniSore', photo: '/figma-assets/monstera.avif' },
  { id: '2', nama: 'Lidah Mertua', jenis: 'hias', kategori: 'Indoor', status: 'terjadwal', nextWater: 'nw.berikutnya3', photo: '/figma-assets/plant-lidahmertua.jpg' },
  { id: '3', nama: 'Pisang', jenis: 'buah', kategori: 'Outdoor', status: 'terlambat', nextWater: 'nw.terlewat1', photo: '/figma-assets/plant-bananaleaf.jpg' },
  { id: '4', nama: 'Ceri', jenis: 'buah', kategori: 'Outdoor', status: 'terjadwal', nextWater: 'nw.berikutnya2', photo: '/figma-assets/plant-cherryleaf.jpg' },
  { id: '5', nama: 'Calathea', jenis: 'hias', kategori: 'Indoor', status: 'hari-ini', nextWater: 'nw.hariIniPagi', photo: '/figma-assets/plant-calathea-figma.jpg' },
  { id: '6', nama: 'Tomat Ceri', jenis: 'sayuran', kategori: 'Kebun', status: 'terlambat', nextWater: 'nw.terlewat2', photo: '/figma-assets/plant-tomat-chery.jpg' },
  { id: '7', nama: 'Cabai Rawit', jenis: 'sayuran', kategori: 'Kebun', status: 'terjadwal', nextWater: 'nw.berikutnyaBesok', photo: '/figma-assets/plant-chili.jpg' },
  { id: '8', nama: 'Melati', jenis: 'hias', kategori: 'Outdoor', status: 'hari-ini', nextWater: 'nw.hariIniPagi', photo: '/figma-assets/plant-melati.jpg' },
];

const STORAGE_KEY = 'tanamanku_plants_v2';

let cachedRaw: string | null = null;
let memoryList: Tanaman[] = initialTanamanList;
let listeners: Array<() => void> = [];
let hasFetchedFromApi = false;

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export const tanamanStore = {
  getSnapshot(): Tanaman[] {
    if (typeof window === 'undefined') return initialTanamanList;
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (item === null) {
        if (cachedRaw !== '__initial__') {
          cachedRaw = '__initial__';
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTanamanList));
          memoryList = initialTanamanList;
        }
        return memoryList;
      }
      if (item !== cachedRaw) {
        cachedRaw = item;
        memoryList = JSON.parse(item);
      }
      return memoryList;
    } catch {
      return memoryList;
    }
  },

  getServerSnapshot(): Tanaman[] {
    return initialTanamanList;
  },

  subscribe(listener: () => void) {
    listeners.push(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        if (e.newValue !== cachedRaw) {
          cachedRaw = e.newValue;
          try {
            memoryList = e.newValue ? JSON.parse(e.newValue) : initialTanamanList;
          } catch {
            // ignore
          }
          listener();
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
      window.removeEventListener('storage', onStorage);
    };
  },

  async refresh(): Promise<Tanaman[]> {
    try {
      const res = await fetch('/api/tanaman');
      if (!res.ok) return memoryList;
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        memoryList = json.data;
        const serialized = JSON.stringify(json.data);
        cachedRaw = serialized;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, serialized);
        }
        emitChange();
        return json.data;
      }
    } catch (err) {
      console.warn('TanamanStore refresh warning:', err);
    }
    return memoryList;
  },

  async tambahAsync(t: Omit<Tanaman, 'id'> & { id?: string }): Promise<Tanaman> {
    const list = tanamanStore.getSnapshot();
    // Use purely numeric ID timestamp to avoid duplicates
    const tempId = t.id && /^\d+$/.test(t.id) ? t.id : Date.now().toString();
    const optimisticPlant: Tanaman = {
      ...t,
      id: tempId,
    };

    // 1. Optimistic update
    const newList = [optimisticPlant, ...list];
    cachedRaw = JSON.stringify(newList);
    memoryList = newList;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, cachedRaw);
      } catch {}
    }
    emitChange();

    // 2. Persist to Supabase
    try {
      const res = await fetch('/api/tanaman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tempId,
          nama: t.nama,
          jenis: t.jenis,
          kategori: t.kategori,
          status: t.status,
          nextWater: t.nextWater,
          foto: t.photo,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const persistedPlant: Tanaman = json.data;
        const updatedList = memoryList.map((item) => (item.id === tempId ? persistedPlant : item));
        cachedRaw = JSON.stringify(updatedList);
        memoryList = updatedList;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, cachedRaw);
        }
        emitChange();
        return persistedPlant;
      }
    } catch (err) {
      console.error('Failed to persist plant to Supabase:', err);
    }

    return optimisticPlant;
  },

  tambah(t: Omit<Tanaman, 'id'> & { id?: string }) {
    this.tambahAsync(t);
    return t.id || Date.now().toString();
  },

  async editAsync(id: string, updated: Partial<Tanaman>): Promise<void> {
    const list = tanamanStore.getSnapshot();
    const newList = list.map((item) => (item.id === id ? { ...item, ...updated } : item));
    cachedRaw = JSON.stringify(newList);
    memoryList = newList;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, cachedRaw);
      } catch {}
    }
    emitChange();

    try {
      await fetch(`/api/tanaman/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: updated.nama,
          jenis: updated.jenis,
          kategori: updated.kategori,
          status: updated.status,
          nextWater: updated.nextWater,
          foto: updated.photo,
        }),
      });
    } catch (err) {
      console.error('Failed to update plant in Supabase:', err);
    }
  },

  edit(id: string, updated: Partial<Tanaman>) {
    this.editAsync(id, updated);
  },

  async hapusAsync(id: string): Promise<void> {
    const list = tanamanStore.getSnapshot();
    const newList = list.filter((item) => item.id !== id);
    cachedRaw = JSON.stringify(newList);
    memoryList = newList;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, cachedRaw);
      } catch {}
    }
    emitChange();

    try {
      await fetch(`/api/tanaman/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete plant from Supabase:', err);
    }
  },

  hapus(id: string) {
    this.hapusAsync(id);
  },

  getById(id: string): Tanaman | undefined {
    const list = tanamanStore.getSnapshot();
    return list.find((t) => t.id === id);
  },
};

export function useTanamanList(): Tanaman[] {
  const data = useSyncExternalStore(
    tanamanStore.subscribe,
    tanamanStore.getSnapshot,
    tanamanStore.getServerSnapshot
  );

  useEffect(() => {
    if (!hasFetchedFromApi) {
      hasFetchedFromApi = true;
      tanamanStore.refresh();
    }
  }, []);

  return data;
}
