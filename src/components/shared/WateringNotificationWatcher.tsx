'use client';

import { useEffect, useRef } from 'react';
import { useTanamanList } from '@/features/plants/tanaman-store';
import {
  isWateringNotificationEnabled,
  checkAndTriggerWateringReminders,
} from '@/lib/watering-notifications';

const CHECK_INTERVAL_MS = 20 * 60 * 1000; // Cek setiap 20 menit saat aplikasi aktif

export default function WateringNotificationWatcher() {
  const plants = useTanamanList();
  const plantsRef = useRef(plants);
  plantsRef.current = plants;

  useEffect(() => {
    // 1. Cek saat komponen di-mount pertama kali (setelah sedikit jeda agar app render siap)
    const initialTimer = setTimeout(() => {
      if (isWateringNotificationEnabled() && plantsRef.current.length > 0) {
        checkAndTriggerWateringReminders(plantsRef.current).catch(console.error);
      }
    }, 3000);

    // 2. Cek saat tab kembali aktif (visibility change dari background ke foreground)
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        isWateringNotificationEnabled() &&
        plantsRef.current.length > 0
      ) {
        checkAndTriggerWateringReminders(plantsRef.current).catch(console.error);
      }
    };

    // 3. Listener untuk custom trigger (misal setelah user menyiram atau mengubah setting)
    const handleCustomTrigger = (event: Event) => {
      const customEvent = event as CustomEvent<{ force?: boolean; plantId?: string }>;
      if (plantsRef.current.length > 0) {
        checkAndTriggerWateringReminders(plantsRef.current, {
          force: customEvent.detail?.force,
          plantId: customEvent.detail?.plantId,
        }).catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('tanamanku-check-watering-notifications', handleCustomTrigger);

    // 4. Interval berkala saat web / PWA tetap terbuka
    const interval = setInterval(() => {
      if (isWateringNotificationEnabled() && plantsRef.current.length > 0) {
        checkAndTriggerWateringReminders(plantsRef.current).catch(console.error);
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('tanamanku-check-watering-notifications', handleCustomTrigger);
    };
  }, []);

  return null;
}
