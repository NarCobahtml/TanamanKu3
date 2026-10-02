/**
 * Pure, browser-safe forum utility functions.
 * Do NOT import database or server-only modules (Prisma, pg, etc.) in this file.
 */

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

export function extractHashtags(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/#([a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]+)/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.slice(1).toLowerCase())));
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
        tags: Array.isArray(parsed.tags) ? (parsed.tags as string[]) : undefined,
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
    tags: undefined,
  };
}

export function parseCommentContent(rawContent: string) {
  try {
    if (rawContent.startsWith('{')) {
      const parsed = JSON.parse(rawContent);
      return {
        text: (parsed.text as string) || rawContent,
        replyTo: (parsed.replyTo as string) || undefined,
        parentId: (parsed.parentId as string) || undefined,
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
    parentId: undefined,
    authorName: undefined,
    authorAvatar: undefined,
  };
}
