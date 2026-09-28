'use client';

import { useParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import ForumDetail from '@/features/forum/ForumDetailPage';
import NotFoundView from '@/components/shared/NotFoundView';

export default function ForumDetailRoute() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

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
