'use client';

import { forumPosts as initialMockPosts } from './mock';
import type { ForumPost } from './types';

const STORAGE_KEY_CUSTOM_POSTS = 'tumbuhkita_custom_posts';
const STORAGE_KEY_DELETED_POSTS = 'tumbuhkita_deleted_posts';

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
  const deletedIds = new Set(getDeletedPostIds());
  const custom = getCustomPosts().filter((p) => !deletedIds.has(p.id));
  const mock = initialMockPosts.filter((p) => !deletedIds.has(p.id));
  return [...custom, ...mock];
}

export function getPostById(id: string): ForumPost | undefined {
  const all = getAllPosts();
  return all.find((p) => p.id === id);
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

  // 1. Remove from custom posts if present
  const custom = getCustomPosts();
  const updatedCustom = custom.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY_CUSTOM_POSTS, JSON.stringify(updatedCustom));

  // 2. Mark in deleted posts list
  const deletedIds = getDeletedPostIds();
  if (!deletedIds.includes(id)) {
    deletedIds.push(id);
    localStorage.setItem(STORAGE_KEY_DELETED_POSTS, JSON.stringify(deletedIds));
  }

  // 3. Notify all listening components
  window.dispatchEvent(new Event('forum-posts-changed'));
}

export function isPostOwner(
  post: ForumPost | null | undefined,
  user: { id?: string; name?: string } | null
): boolean {
  if (!post || !user) return false;

  // 1. Match authorId if both exist
  if (post.authorId && user.id) {
    return post.authorId === user.id;
  }

  // 2. Match author name (case insensitive)
  if (user.name && post.author && user.name.trim().toLowerCase() === post.author.trim().toLowerCase()) {
    return true;
  }

  // 3. Match posts created locally by current user session
  if (post.id.startsWith('post-')) {
    const custom = getCustomPosts();
    const found = custom.find((p) => p.id === post.id);
    if (found && (user.id || user.name)) {
      return true;
    }
  }

  return false;
}
