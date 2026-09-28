import type { Metadata } from 'next';
import ForumClientPage from '@/features/forum/ForumClientPage';

export const metadata: Metadata = {
  title: 'Forum Diskusi Komunitas - TumbuhKita',
  description: 'Diskusikan perawatan tanaman, hama, dan tips bertanam bersama komunitas TumbuhKita.',
};

export default function Page() {
  return <ForumClientPage />;
}
