import { prisma } from '@/lib/prisma';
import { forumPosts as initialMockPosts } from '@/features/forum/mock';
import type { ForumPost } from '@/features/forum/types';

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'TK';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function parsePostContent(rawContent: string) {
  try {
    if (rawContent.startsWith('{')) {
      const parsed = JSON.parse(rawContent);
      return {
        category: (parsed.category as string) || 'Perawatan',
        body: Array.isArray(parsed.body)
          ? (parsed.body as string[])
          : typeof parsed.body === 'string'
            ? [parsed.body]
            : [rawContent],
        likes: typeof parsed.likes === 'number' ? parsed.likes : 0,
        views: typeof parsed.views === 'number' ? parsed.views : 1,
        authorName: (parsed.authorName as string) || undefined,
        authorAvatar: (parsed.authorAvatar as string) || undefined,
        expert: Boolean(parsed.expert),
      };
    }
  } catch {
    // fallback
  }
  return {
    category: 'Perawatan',
    body: [rawContent],
    likes: 0,
    views: 1,
    authorName: undefined,
    authorAvatar: undefined,
    expert: false,
  };
}

export function parseCommentContent(rawContent: string) {
  try {
    if (rawContent.startsWith('{')) {
      const parsed = JSON.parse(rawContent);
      return {
        text: (parsed.text as string) || rawContent,
        replyTo: (parsed.replyTo as string) || undefined,
        authorName: (parsed.authorName as string) || undefined,
        authorAvatar: (parsed.authorAvatar as string) || undefined,
      };
    }
  } catch {
    // fallback
  }
  return {
    text: rawContent,
    replyTo: undefined,
    authorName: undefined,
    authorAvatar: undefined,
  };
}

export type PrismaPostWithRelations = {
  id: string;
  authorId: string | null;
  scanId: string | null;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    name: string;
    photoUrl: string | null;
    role: string;
  } | null;
  comments?: Array<{
    id: string;
    postId: string;
    authorId: string | null;
    content: string;
    createdAt: Date;
    author?: {
      id: string;
      name: string;
      photoUrl: string | null;
      role: string;
    } | null;
  }>;
};

export function formatForumPost(p: PrismaPostWithRelations): ForumPost {
  const meta = parsePostContent(p.content);
  const authorName = p.author?.name || meta.authorName || 'Pengguna TanamanKu';
  const authorAvatar = p.author?.photoUrl || meta.authorAvatar || undefined;
  const isExpert = p.author?.role === 'ADMIN' || meta.expert;

  const comments = (p.comments || []).map((c) => {
    const cMeta = parseCommentContent(c.content);
    return {
      id: c.id,
      authorId: c.authorId || undefined,
      author: c.author?.name || cMeta.authorName || 'Pengguna TanamanKu',
      avatar: c.author?.photoUrl || cMeta.authorAvatar || undefined,
      time: formatRelativeTime(c.createdAt),
      text: cMeta.text,
      replyTo: cMeta.replyTo,
    };
  });

  const excerpt =
    meta.body[0]?.slice(0, 140) + (meta.body[0]?.length > 140 ? '...' : '') || p.title;

  return {
    id: p.id,
    authorId: p.authorId || undefined,
    author: authorName,
    initials: getInitials(authorName),
    avatar: authorAvatar,
    expert: isExpert,
    time: formatRelativeTime(p.createdAt),
    category: meta.category,
    title: p.title,
    excerpt,
    content: meta.body,
    image: p.imageUrl || undefined,
    likes: meta.likes,
    views: meta.views,
    comments,
  };
}

let isDatabaseSeeded = false;

/**
 * Automatically seed mock posts to PostgreSQL if database is empty
 */
export async function seedForumPostsIfEmpty() {
  if (isDatabaseSeeded) return;
  try {
    const count = await prisma.post.count();
    if (count > 0) {
      isDatabaseSeeded = true;
      return;
    }

    for (const post of initialMockPosts) {
      const createdPost = await prisma.post.create({
        data: {
          id: post.id,
          title: post.title,
          imageUrl: post.image || null,
          content: JSON.stringify({
            category: post.category,
            body: post.content || [post.excerpt],
            likes: post.likes || 0,
            views: post.views || 1,
            authorName: post.author,
            authorAvatar: post.avatar,
            expert: post.expert || false,
          }),
        },
      });

      if (post.comments && post.comments.length > 0) {
        for (const comment of post.comments) {
          await prisma.comment.create({
            data: {
              postId: createdPost.id,
              content: JSON.stringify({
                text: comment.text,
                replyTo: comment.replyTo || undefined,
                authorName: comment.author,
              }),
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('Error seeding initial forum posts:', error);
  }
}
