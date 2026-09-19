'use client';

import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('notFound');
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent text-primary">
          <SearchX className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-ink">404 - {t('title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('desc')}</p>
        <Link href="/home" className="btn-cta mt-6 inline-flex h-11 items-center rounded-full px-7 text-sm font-semibold text-white">
          {t('backHome')}
        </Link>
      </div>
    </main>
  );
}
