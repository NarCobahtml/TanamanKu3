import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';
import ForumDetail from '@/features/forum/ForumDetailPage';
import NotFoundView from '@/components/shared/NotFoundView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Diskusi Forum #${id} - TumbuhKita`,
    description: 'Baca dan ikuti diskusi komunitas pecinta tanaman di TumbuhKita.',
  };
}

export default async function ForumDetailRoute({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    return (
      <div className="min-h-dvh bg-background">
        <NotFoundView backHref="/forum" />
      </div>
    );
  }

  return (
    <AppShell>
      <ForumDetail id={id} />
    </AppShell>
  );
}
