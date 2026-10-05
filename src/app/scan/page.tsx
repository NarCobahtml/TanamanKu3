import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ScanView from '@/features/scan/components/ScanView';

export const metadata: Metadata = {
  title: 'Scan & Deteksi Penyakit Tanaman - TumbuhKita',
  description: 'Gunakan kamera atau unggah foto daun tanaman Anda untuk mendeteksi penyakit dengan AI.',
};

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/scan');
  }

  return <ScanView />;
}