import type { Metadata } from 'next';
import ScanView from '@/features/scan/components/ScanView';

export const metadata: Metadata = {
  title: 'Scan & Deteksi Penyakit Tanaman - TumbuhKita',
  description: 'Gunakan kamera atau unggah foto daun tanaman Anda untuk mendeteksi penyakit dengan AI.',
};

export default function Page() {
  return <ScanView />;
}