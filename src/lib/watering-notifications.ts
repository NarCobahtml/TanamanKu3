'use client';

import type { Tanaman } from '@/features/plants/types';

const GLOBAL_NOTIF_KEY = 'tanamanku_watering_notif_enabled';
const LAST_NOTIF_TIME_KEY = 'tanamanku_last_watering_notif_time';
const PLANT_NOTIF_PREFIX = 'tanamanku_plant_notif_';
const NOTIF_COOLDOWN_MS = 3 * 60 * 60 * 1000; // 3 jam cooldown antar pengingat otomatis

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export function isWateringNotificationEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const permission = getNotificationPermission();
  if (permission !== 'granted') return false;
  return localStorage.getItem(GLOBAL_NOTIF_KEY) === 'true';
}

export function setWateringNotificationEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GLOBAL_NOTIF_KEY, enabled ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('tanamanku-notif-pref-changed', { detail: { enabled } }));
}

export function isPlantNotificationEnabled(plantId: string): boolean {
  if (typeof window === 'undefined') return false;
  const plantSetting = localStorage.getItem(`${PLANT_NOTIF_PREFIX}${plantId}`);
  if (plantSetting !== null) {
    return plantSetting === 'true';
  }
  return isWateringNotificationEnabled();
}

export function setPlantNotificationEnabled(plantId: string, enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${PLANT_NOTIF_PREFIX}${plantId}`, enabled ? 'true' : 'false');
  if (enabled) {
    setWateringNotificationEnabled(true);
  }
  window.dispatchEvent(new CustomEvent('tanamanku-notif-pref-changed', { detail: { plantId, enabled } }));
}

export async function requestWateringNotificationPermission(): Promise<{
  granted: boolean;
  status: NotificationPermission;
}> {
  if (!isNotificationSupported()) {
    return { granted: false, status: 'denied' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setWateringNotificationEnabled(true);
      return { granted: true, status: permission };
    }
    setWateringNotificationEnabled(false);
    return { granted: false, status: permission };
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { granted: false, status: 'denied' };
  }
}

export interface PwaNotificationOptions extends NotificationOptions {
  vibrate?: number | number[];
  renotify?: boolean;
  data?: { url?: string; [key: string]: unknown };
}

export async function showLocalNotification(
  title: string,
  options: PwaNotificationOptions
): Promise<boolean> {
  if (!isNotificationSupported() || getNotificationPermission() !== 'granted') {
    return false;
  }

  const notificationOptions: PwaNotificationOptions = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    ...options,
  };

  // 1. Coba melalui Service Worker Registration (standar PWA untuk background & lock screen)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, notificationOptions);
        return true;
      }
    } catch {
      // fallback ke new Notification jika service worker belum siap
    }
  }

  // 2. Fallback ke Web Notification API biasa
  try {
    const notif = new Notification(title, notificationOptions as NotificationOptions);
    notif.onclick = () => {
      window.focus();
      if (options.data?.url) {
        window.location.href = options.data.url;
      }
      notif.close();
    };
    return true;
  } catch (err) {
    console.error('Failed to display browser notification:', err);
    return false;
  }
}

export async function checkAndTriggerWateringReminders(
  plants: Tanaman[],
  options?: { force?: boolean; plantId?: string }
): Promise<{
  notified: boolean;
  count: number;
  message: string;
}> {
  if (!isWateringNotificationEnabled() && !options?.force) {
    return { notified: false, count: 0, message: 'Notifikasi belum diaktifkan.' };
  }

  // Cek apakah ada tanaman yang spesifik atau seluruh tanaman
  const targetPlants = options?.plantId
    ? plants.filter((p) => p.id === options.plantId)
    : plants.filter((p) => isPlantNotificationEnabled(p.id));

  // Tanaman yang butuh disiram: status 'hari-ini' atau 'terlambat'
  const duePlants = targetPlants.filter(
    (p) => p.status === 'hari-ini' || p.status === 'terlambat'
  );

  if (duePlants.length === 0) {
    return {
      notified: false,
      count: 0,
      message: 'Tidak ada tanaman yang perlu disiram saat ini. Semua terawat!',
    };
  }

  // Cek cooldown kecuali jika dipicu secara paksa / tes manual
  if (!options?.force && typeof window !== 'undefined') {
    const lastNotif = localStorage.getItem(LAST_NOTIF_TIME_KEY);
    const now = Date.now();
    if (lastNotif && now - Number(lastNotif) < NOTIF_COOLDOWN_MS) {
      return {
        notified: false,
        count: duePlants.length,
        message: 'Pengingat sudah dikirim baru-baru ini.',
      };
    }
  }

  // Susun judul dan pesan notifikasi
  let title = '';
  let body = '';
  let url = '/siram';

  if (duePlants.length === 1) {
    const plant = duePlants[0];
    title = `🌱 Waktunya Menyiram ${plant.nama}!`;
    body = `Tanaman ${plant.nama} (${plant.kategori}) sudah masuk jadwal siram hari ini. Buka untuk mencatat penyiraman.`;
    url = `/siram/${plant.id}`;
  } else {
    const names = duePlants.map((p) => p.nama);
    const displayedNames = names.slice(0, 3).join(', ');
    const remaining = names.length - 3;
    title = `🌱 ${duePlants.length} Tanaman Menunggu Disiram!`;
    body = `${displayedNames}${remaining > 0 ? ` dan ${remaining} lainnya` : ''} perlu disiram hari ini. Jangan sampai kekeringan!`;
    url = '/siram';
  }

  const shown = await showLocalNotification(title, {
    body,
    tag: 'tanamanku-watering-reminder',
    renotify: true,
    data: { url },
  });

  if (shown && typeof window !== 'undefined') {
    localStorage.setItem(LAST_NOTIF_TIME_KEY, Date.now().toString());
  }

  return {
    notified: shown,
    count: duePlants.length,
    message: body,
  };
}

export async function sendTestWateringNotification(): Promise<boolean> {
  const perm = await requestWateringNotificationPermission();
  if (!perm.granted) return false;

  return showLocalNotification('🌱 Notifikasi Siram TumbuhKita Berfungsi!', {
    body: 'Notifikasi PWA Anda berhasil diatur. Anda akan otomatis diingatkan setiap kali jadwal siram tiba.',
    tag: 'tanamanku-test-notif',
    data: { url: '/siram' },
  });
}
