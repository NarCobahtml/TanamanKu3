'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { EmptyState } from '@/components/shared/EmptyState';
import { SearchX } from 'lucide-react';

/** Untuk halaman dinamis client ([id]): tampilkan 404 alih-alih fallback diam. */
export default function NotFoundView({ backHref = '/home' }: { backHref?: string }) {
  const t = useTranslations('notFound');
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-24 sm:px-6">
      <EmptyState
        icon={<SearchX className="size-6" aria-hidden="true" />}
        title={t('title')}
        message={t('desc')}
        action={
          <Link href={backHref} className="btn-cta inline-flex h-10 items-center rounded-full px-6 text-sm font-semibold text-white">
            {t('backHome')}
          </Link>
        }
      />
    </div>
  );
}
