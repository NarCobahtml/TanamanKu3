'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import id from '@/messages/id.json';
import en from '@/messages/en.json';

export type Locale = 'id' | 'en';

const messages = { id, en } as const;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = 'tanamanku-locale';

export function LocaleProvider({ children }: { children: ReactNode }) {
  // SSR & hydration pertama SELALU 'id' (sama dengan server HTML);
  // localStorage dibaca di effect -> re-render tanpa mismatch.
  const [locale, setLocaleState] = useState<Locale>('id');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- baca storage eksternal sekali saat mount
    if (saved === 'id' || saved === 'en') setLocaleState(saved);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages[locale]}
        timeZone="Asia/Jakarta"
        onError={() => undefined}
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>');
  return ctx;
}

/** Convenience: current locale getter for non-hook usage checks. */
export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'id';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === 'en' ? 'en' : 'id';
}
