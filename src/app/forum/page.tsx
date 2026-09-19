'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import AppShell from '@/components/AppShell';
import ForumPage from '@/components/ForumPage';

export default function Page() {
  const t = useTranslations('forum');

  return (
    <AppShell>
      <ForumPage />

      {/* FAB thumb-friendly, selalu ada di kanan di mobile seperti di /siram */}
      <Link
        href="/forum/create"
        aria-label={t('buatPostingan')}
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B5E20] text-white shadow-lg transition-transform active:scale-95 lg:hidden"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
      </Link>
    </AppShell>
  );
}
