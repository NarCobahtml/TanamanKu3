import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';
import ForumDetail from '@/features/forum/ForumDetailPage';
import NotFoundView from '@/components/shared/NotFoundView';
import { prisma } from '@/lib/prisma';
import { formatForumPost, seedForumPostsIfEmpty } from '@/lib/forum';
import { forumPosts } from '@/features/forum/mock';

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

  let initialPost = null;
  try {
    await seedForumPostsIfEmpty();
    const dbPost = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, photoUrl: true, role: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, photoUrl: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (dbPost) {
      initialPost = formatForumPost(dbPost);
    }
  } catch (err) {
    console.error('Error fetching post for SSR:', err);
  }

  if (!initialPost) {
    initialPost = forumPosts.find((p) => p.id === id) ?? null;
  }

  return (
    <AppShell>
      <ForumDetail id={id} initialPost={initialPost} />
    </AppShell>
  );
}

