import type { Metadata } from 'next';
import AuthForm from '@/features/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Masuk ke Akun - TumbuhKita',
  description: 'Masuk ke akun TumbuhKita Anda untuk mengelola tanaman dan konsultasi AI.',
};

export default function Page() {
  return <AuthForm mode="login" />;
}
