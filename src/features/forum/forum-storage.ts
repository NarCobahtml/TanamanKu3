'use client';

import { forumPosts as initialMockPosts } from './mock';
import type { ForumPost } from './types';

const STORAGE_KEY_CUSTOM_POSTS = 'tumbuhkita_custom_posts';
const STORAGE_KEY_DELETED_POSTS = 'tumbuhkita_deleted_posts';
const STORAGE_KEY_DB_POSTS = 'tumbuhkita_cached_db_posts';

export function getDeletedPostIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_POSTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCustomPosts(): ForumPost[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_POSTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getAllPosts(): ForumPost[] {
  if (typeof window !== 'undefined') {
    try {
      const dbCached = localStorage.getItem(STORAGE_KEY_DB_POSTS);
      if (dbCached) {
        const parsed = JSON.parse(dbCached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const deleted = new Set(getDeletedPostIds());
          return parsed.filter((p: ForumPost) => !deleted.has(p.id));
        }
      }
    } catch {
      // fallback
    }
  }

  const deletedIds = new Set(getDeletedPostIds());
  const custom = getCustomPosts().filter((p) => !deletedIds.has(p.id));
  const mock = initialMockPosts.filter((p) => !deletedIds.has(p.id));
  return [...custom, ...mock];
}

export function getPostById(id: string): ForumPost | undefined {
  const all = getAllPosts();
  return all.find((p) => p.id === id);
}

/**
 * Fetch all posts from database via /api/forum
 */
export async function fetchForumPosts(category?: string, query?: string): Promise<ForumPost[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'Semua') params.set('category', category);
    if (query && query.trim()) params.set('q', query.trim());

    const url = `/api/forum${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Gagal mengambil data forum dari database');

    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      if (typeof window !== 'undefined' && (!category || category === 'Semua') && !query) {
        localStorage.setItem(STORAGE_KEY_DB_POSTS, JSON.stringify(json.data));
      }
      return json.data;
    }
  } catch (error) {
    console.warn('Fallback to local posts:', error);
  }
  return getAllPosts();
}

/**
 * Fetch single post detail from database via /api/forum/[id]
 */
export async function fetchForumPostById(id: string): Promise<ForumPost | null> {
  try {
    const res = await fetch(`/api/forum/${id}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (error) {
    console.warn('Fallback to local post by id:', error);
  }
  return getPostById(id) || null;
}

/**
 * Create a new post in the database
 */
export async function createForumPost(data: {
  title: string;
  content: string;
  category: string;
  image?: string;
}): Promise<ForumPost> {
  const res = await fetch('/api/forum', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Gagal membuat postingan di database');
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('forum-posts-changed'));
  }

  return json.data;
}

/**
 * Delete a post from the database
 */
export async function deleteForumPost(id: string): Promise<void> {
  const res = await fetch(`/api/forum/${id}`, {
    method: 'DELETE',
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Gagal menghapus postingan');
  }

  // Also purge from local cache
  if (typeof window !== 'undefined') {
    const deletedIds = getDeletedPostIds();
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem(STORAGE_KEY_DELETED_POSTS, JSON.stringify(deletedIds));
    }
    const custom = getCustomPosts();
    const updatedCustom = custom.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY_CUSTOM_POSTS, JSON.stringify(updatedCustom));
    window.dispatchEvent(new Event('forum-posts-changed'));
  }
}

/**
 * Add a comment to a post in the database
 */
export async function submitForumComment(
  postId: string,
  data: { text: string; replyTo?: string }
) {
  const res = await fetch(`/api/forum/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Gagal menambahkan komentar');
  }

  return json.data;
}

/**
 * Toggle like for a post in the database
 */
export async function toggleForumLike(postId: string, liked: boolean): Promise<number> {
  const res = await fetch(`/api/forum/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ liked }),
  });

  if (res.ok) {
    const json = await res.json();
    return json.likes;
  }
  return 0;
}

export function saveNewPost(post: ForumPost): void {
  if (typeof window === 'undefined') return;
  const custom = getCustomPosts();
  custom.unshift(post);
  localStorage.setItem(STORAGE_KEY_CUSTOM_POSTS, JSON.stringify(custom));
  window.dispatchEvent(new Event('forum-posts-changed'));
}

export function deletePost(id: string): void {
  if (typeof window === 'undefined') return;
  deleteForumPost(id).catch((err) => {
    console.warn('API delete error, falling back to local mark:', err);
    const deletedIds = getDeletedPostIds();
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem(STORAGE_KEY_DELETED_POSTS, JSON.stringify(deletedIds));
    }
    window.dispatchEvent(new Event('forum-posts-changed'));
  });
}

export function isPostOwner(
  post: ForumPost | null | undefined,
  user: { id?: string; name?: string; role?: string } | null
): boolean {
  if (!post || !user) return false;

  // 1. Admins have management access
  if (user.role === 'ADMIN') return true;

  // 2. Match authorId if both exist
  if (post.authorId && user.id) {
    return post.authorId === user.id;
  }

  // 3. Match author name (case insensitive)
  if (user.name && post.author && user.name.trim().toLowerCase() === post.author.trim().toLowerCase()) {
    return true;
  }

  return false;
}
