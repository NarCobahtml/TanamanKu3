import type { Metadata } from 'next';
import SiramClientPage from '@/features/plants/SiramClientPage';

export const metadata: Metadata = {
  title: 'Koleksi Tanaman & Jadwal Siram - TumbuhKita',
  description: 'Kelola seluruh tanaman Anda dan pantau jadwal penyiraman harian.',
};

export default function Page() {
  return <SiramClientPage />;
}
