'use client';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isWebPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!isWebPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}

export async function registerServerWebPush(): Promise<{
  success: boolean;
  subscription?: PushSubscription | null;
  error?: string;
}> {
  if (!isWebPushSupported()) {
    return {
      success: false,
      error: 'Browser ini tidak mendukung Web Push Notification.',
    };
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    return {
      success: false,
      error: 'NEXT_PUBLIC_VAPID_PUBLIC_KEY belum dikonfigurasi di lingkungan aplikasi.',
    };
  }

  try {
    // 1. Minta izin notifikasi browser
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        error: 'Izin notifikasi tidak diberikan oleh pengguna.',
      };
    }

    // 2. Pastikan Service Worker terdaftar dan siap
    const registration = await navigator.serviceWorker.ready;

    // 3. Ambil subscription yang ada atau buat baru
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as unknown as BufferSource,
      });
    }

    // 4. Kirim data subscription ke server
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Gagal menyimpan langganan push di server');
    }

    return {
      success: true,
      subscription,
    };
  } catch (error: unknown) {
    console.error('Error registering for Web Push:', error);
    const err = error as { message?: string };
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan saat mengaktifkan Web Push.',
    };
  }
}

export async function unsubscribeServerWebPush(): Promise<boolean> {
  if (!isWebPushSupported()) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return true;

    const endpoint = subscription.endpoint;

    // 1. Hapus dari server
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint }),
    });

    // 2. Unsubscribe dari browser push manager
    await subscription.unsubscribe();
    return true;
  } catch (error) {
    console.error('Error unsubscribing from Web Push:', error);
    return false;
  }
}

export async function triggerServerPushTest(): Promise<{ success: boolean; message: string }> {
  try {
    const sub = await getExistingPushSubscription();
    const endpoint = sub?.endpoint;

    const res = await fetch('/api/push/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint }),
    });

    const data = await res.json();
    return {
      success: res.ok && data.success,
      message: data.message || data.error || 'Respons server tidak dikenal.',
    };
  } catch (err: unknown) {
    const e = err as { message?: string };
    return {
      success: false,
      message: e.message || 'Gagal menghubungi server.',
    };
  }
}
