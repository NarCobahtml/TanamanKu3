import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';
import AboutPage from '@/features/about/AboutPage';

export const metadata: Metadata = {
  title: 'Tentang Kami - TanamanKu',
  description:
    'Kenali tim pengembang, visi, dan misi di balik TanamanKu dalam menghadirkan perawatan tanaman berbasis AI.',
};

export default function Page() {
  return (
    <AppShell>
      <AboutPage />
    </AppShell>
  );
}
