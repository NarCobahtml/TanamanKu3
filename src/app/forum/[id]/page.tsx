'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import ForumDetail from '@/features/forum/ForumDetailPage';
import NotFoundView from '@/components/shared/NotFoundView';
import { getPostById } from '@/features/forum/forum-storage';
import type { ForumPost } from '@/features/forum/types';

export default function ForumDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<ForumPost | null | undefined>(undefined);

  useEffect(() => {
    if (id) {
      setPost(getPostById(id) || null);
    }
  }, [id]);

  if (post === undefined) {
    return null; // Loading state while reading localStorage
  }

  if (post === null) {
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
