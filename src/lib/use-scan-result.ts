'use client';

// Baca sessionStorage tanpa effect (react-hooks/set-state-in-effect):
// useSyncExternalStore = pola kanonik untuk external store, aman SSR.
// Nilai scan tidak berubah setelah ditulis, jadi subscribe no-op cukup.

import { useMemo, useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const serverSnapshot = () => null;

export function useSessionValue(key: string): string | null {
  return useSyncExternalStore(subscribe, () => sessionStorage.getItem(key), serverSnapshot);
}

export function useScanResult<T>(): T | null {
  const raw = useSessionValue('scan-result');
  return useMemo(() => (raw ? (JSON.parse(raw) as T) : null), [raw]);
}

export function useScanPhoto(): string {
  return useSessionValue('scan-capture') ?? '';
}
