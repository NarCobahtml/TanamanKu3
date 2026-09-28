import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';
import HomePage from '@/features/dashboard/HomePage';

export const metadata: Metadata = {
  title: 'Beranda - TumbuhKita',
  description: 'Pantau kesehatan tanaman, jadwal penyiraman, dan riwayat diagnosis AI Anda.',
};

export default function Page() {
  return (
    <AppShell>
      <HomePage />
    </AppShell>
  );
}
