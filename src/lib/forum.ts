import { prisma } from '@/lib/prisma';
import { forumPosts as initialMockPosts } from '@/features/forum/mock';
import type { ForumPost } from '@/features/forum/types';

import {
  formatRelativeTime,
  getInitials,
  extractHashtags,
  parsePostContent,
  parseCommentContent,
} from './forum-utils';

export * from './forum-utils';

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
    parentId?: string | null;
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
      parentId: c.parentId || cMeta.parentId || undefined,
    };
  });

  const excerpt =
    meta.body[0]?.slice(0, 140) + (meta.body[0]?.length > 140 ? '...' : '') || p.title;

  const rawBody = meta.body.join(' ');
  const textToScan = `${p.title} ${rawBody}`;
  const extractedTags = extractHashtags(textToScan);
  const metaTags = (meta.tags || []).map((t: string) => t.replace(/^#/, '').toLowerCase());
  const combinedTags = Array.from(new Set([...metaTags, ...extractedTags]));

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
    tags: combinedTags,
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
