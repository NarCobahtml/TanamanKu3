'use client';

import { useParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import ForumDetail from '@/components/ForumDetailPage';
import NotFoundView from '@/components/shared/NotFoundView';
import { forumPosts } from '@/components/ForumPage';

export default function ForumDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const post = forumPosts.find((p) => p.id === id);

  if (!post) {
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
