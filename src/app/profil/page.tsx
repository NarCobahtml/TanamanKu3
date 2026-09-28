import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';
import ProfilPage from '@/features/profile/ProfilPage';

export const metadata: Metadata = {
  title: 'Profil Saya - TumbuhKita',
  description: 'Kelola preferensi akun, foto profil, dan informasi keanggotaan TumbuhKita.',
};

export default function Page() {
  return (
    <AppShell>
      <ProfilPage />
    </AppShell>
  );
}
