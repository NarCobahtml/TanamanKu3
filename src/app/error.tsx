'use client';

import { useEffect } from 'react';
import { TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('error');
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('desc')}</p>
        <button type="button" onClick={reset} className="btn-cta mt-6 inline-flex h-11 items-center rounded-full px-7 text-sm font-semibold text-white">
          {t('retry')}
        </button>
      </div>
    </main>
  );
}
