'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { TanamanPage, TambahTanamanDialog } from '@/features/plants';

export default function Page() {
  const ts = useTranslations('siram');
  const [open, setOpen] = useState(false);

  return (
    <AppShell>
      <TanamanPage onTambah={() => setOpen(true)} />

      {/* FAB thumb-friendly, hanya mobile (CSS) — buka dialog yang SAMA */}
      <button
        onClick={() => setOpen(true)}
        type="button"
        aria-label={ts('tambah')}
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B5E20] text-white shadow-lg lg:hidden"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
      </button>

      <TambahTanamanDialog open={open} onOpenChange={setOpen} />
    </AppShell>
  );
}
