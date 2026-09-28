import type { Metadata } from 'next';
import CreatePostPage from '@/features/forum/CreatePostPage';

export const metadata: Metadata = {
  title: 'Buat Postingan Baru - Forum TumbuhKita',
  description: 'Tanyakan seputar perawatan tanaman atau bagikan pengalaman Anda dengan komunitas.',
};

export default function Page() {
  return <CreatePostPage />;
}
