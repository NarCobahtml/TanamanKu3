'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import AppShell from '@/components/layout/AppShell';
import ForumPage from '@/features/forum/ForumPage';
import { useAuthGuard } from '@/components/shared/AuthGuardModal';

export default function Page() {
  const t = useTranslations('forum');
  const router = useRouter();
  const { checkAuth, AuthModal } = useAuthGuard();

  const handleCreatePost = () => {
    if (
      !checkAuth({
        title: 'Login untuk Buat Postingan',
        actionName: 'Buat Postingan',
        description:
          'Anda perlu masuk ke akun terlebih dahulu untuk membagikan pertanyaan atau cerita tanaman di forum komunitas.',
      })
    ) {
      return;
    }
    router.push('/forum/create');
  };

  return (
    <AppShell>
      <ForumPage onCreatePost={handleCreatePost} />

      {/* FAB thumb-friendly, selalu ada di kanan di mobile seperti di /siram */}
      <button
        onClick={handleCreatePost}
        type="button"
        aria-label={t('buatPostingan')}
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B5E20] text-white shadow-lg transition-transform active:scale-95 lg:hidden cursor-pointer"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
      </button>
      {AuthModal}
    </AppShell>
  );
}
