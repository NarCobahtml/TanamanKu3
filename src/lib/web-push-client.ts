'use client';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const clean = base64String.replace(/["'\s]/g, '');
  const padding = '='.repeat((4 - (clean.length % 4)) % 4);
  const base64 = (clean + padding).replace(/-/g, '+').replace(/_/g, '/');
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

  const rawVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!rawVapidKey) {
    return {
      success: false,
      error: 'NEXT_PUBLIC_VAPID_PUBLIC_KEY belum dikonfigurasi di lingkungan aplikasi.',
    };
  }

  const vapidPublicKey = rawVapidKey.replace(/["'\s]/g, '');

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
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey as unknown as BufferSource,
        });
      } catch (firstErr) {
        // Coba unsubscribe jika ada stale token dari key berbeda, lalu coba sekali lagi
        const stale = await registration.pushManager.getSubscription();
        if (stale) {
          await stale.unsubscribe().catch(() => {});
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey as unknown as BufferSource,
          });
        } else {
          throw firstErr;
        }
      }
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
    const rawMsg = err.message || '';

    // Deteksi jika penyebabnya adalah pemblokiran FCM oleh browser Brave
    const isBrave =
      typeof navigator !== 'undefined' &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Boolean((navigator as any).brave) || navigator.userAgent.includes('Brave'));

    if (rawMsg.includes('push service error') || rawMsg.includes('AbortError')) {
      if (isBrave) {
        return {
          success: false,
          error:
            'Brave memblokir Google Push Service. Buka brave://settings/privacy lalu aktifkan "Use Google services for push messaging", atau coba di browser Chrome / Edge.',
        };
      }
      return {
        success: false,
        error:
          'Push service browser menolak registrasi. Pastikan tidak dalam mode Incognito/Private, dan koneksi internet stabil.',
      };
    }

    return {
      success: false,
      error: rawMsg || 'Terjadi kesalahan saat mengaktifkan Web Push.',
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
