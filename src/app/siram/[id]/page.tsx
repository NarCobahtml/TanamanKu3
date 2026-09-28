import type { Metadata } from 'next';
import SiramDetailView from '@/features/watering/components/SiramDetailView';

export const metadata: Metadata = {
  title: 'Detail & Jadwal Penyiraman - TumbuhKita',
  description: 'Pantau rekomendasi waktu penyiraman tanaman dan prakiraan cuaca real-time.',
};

export default function SiramDetailPage() {
  return <SiramDetailView />;
}
