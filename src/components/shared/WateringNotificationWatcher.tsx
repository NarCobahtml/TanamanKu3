'use client';

import { useEffect, useRef } from 'react';
import { useTanamanList } from '@/features/plants/tanaman-store';
import {
  isWateringNotificationEnabled,
  checkAndTriggerWateringReminders,
} from '@/lib/watering-notifications';
import { registerServerWebPush } from '@/lib/web-push-client';

const CHECK_INTERVAL_MS = 20 * 60 * 1000; // Interval cek 20 menit

export default function WateringNotificationWatcher() {
  const plants = useTanamanList();
  const plantsRef = useRef(plants);
  plantsRef.current = plants;

  useEffect(() => {
    // 0. Sinkronisasi token push
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      registerServerWebPush().catch(() => {});
    }

    // 1. Cek saat mount
    const initialTimer = setTimeout(() => {
      if (isWateringNotificationEnabled() && plantsRef.current.length > 0) {
        checkAndTriggerWateringReminders(plantsRef.current).catch(console.error);
      }
    }, 3000);

    // 2. Cek tab aktif
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        isWateringNotificationEnabled() &&
        plantsRef.current.length > 0
      ) {
        checkAndTriggerWateringReminders(plantsRef.current).catch(console.error);
      }
    };

    // 3. Listener trigger kustom
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

    // 4. Interval berkala
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
