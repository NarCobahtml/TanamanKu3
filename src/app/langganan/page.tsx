import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';
import LanggananPage from '@/features/subscription/LanggananPage';

export const metadata: Metadata = {
  title: 'Paket & Langganan - TumbuhKita',
  description: 'Tingkatkan kuota scan dan dapatkan fitur premium konsultasi ahli tanaman.',
};

export default function Page() {
  return (
    <AppShell>
      <LanggananPage />
    </AppShell>
  );
}
