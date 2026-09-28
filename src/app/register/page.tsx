import type { Metadata } from 'next';
import AuthForm from '@/features/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Daftar Akun Baru - TumbuhKita',
  description: 'Daftar akun TumbuhKita gratis dan mulai rawat tanaman Anda secara cerdas.',
};

export default function Page() {
  return <AuthForm mode="register" />;
}
