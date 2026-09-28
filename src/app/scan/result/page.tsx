import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';
import ScanResult from '@/features/scan/ScanResultPage';

export const metadata: Metadata = {
  title: 'Hasil Diagnosis AI - TumbuhKita',
  description: 'Lihat hasil diagnosis kesehatan tanaman dan rekomendasi penanganan.',
};

export default function Page() {
  return (
    <AppShell>
      <ScanResult />
    </AppShell>
  );
}
