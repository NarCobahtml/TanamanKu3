import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';
import RiwayatPage from '@/features/scan/RiwayatPage';

export const metadata: Metadata = {
  title: 'Riwayat Diagnosis - TumbuhKita',
  description: 'Arsip dan riwayat seluruh pemindaian tanaman yang pernah Anda lakukan.',
};

export default function Page() {
  return (
    <AppShell>
      <RiwayatPage />
    </AppShell>
  );
}
