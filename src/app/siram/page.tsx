'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { TanamanPage, TambahTanamanDialog } from '@/features/plants';
import { useAuthGuard } from '@/components/shared/AuthGuardModal';

export default function Page() {
  const ts = useTranslations('siram');
  const [open, setOpen] = useState(false);
  const { checkAuth, AuthModal } = useAuthGuard();

  const handleTambah = () => {
    if (
      !checkAuth({
        title: 'Login untuk Tambah Tanaman',
        actionName: 'Tambah Tanaman',
        description:
          'Anda perlu masuk ke akun terlebih dahulu agar data koleksi dan jadwal penyiraman tanaman dapat tersimpan dengan aman.',
      })
    ) {
      return;
    }
    setOpen(true);
  };

  return (
    <AppShell>
      <TanamanPage onTambah={handleTambah} />

      {/* FAB thumb-friendly, hanya mobile (CSS) — buka dialog yang SAMA */}
      <button
        onClick={handleTambah}
        type="button"
        aria-label={ts('tambah')}
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B5E20] text-white shadow-lg lg:hidden cursor-pointer"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
      </button>

      <TambahTanamanDialog open={open} onOpenChange={setOpen} />
      {AuthModal}
    </AppShell>
  );
}
