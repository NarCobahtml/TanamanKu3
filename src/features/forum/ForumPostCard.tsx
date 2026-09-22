'use client';

import Link from 'next/link';
import { Heart, MessageSquare, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ForumPost } from './types';
import { CategoryText } from './components/CategoryText';
import { ExpertBadge } from './components/ExpertBadge';

export interface ForumPostCardProps {
  post: ForumPost;
  isLiked: boolean;
  onToggleLike: () => void;
  isOwner?: boolean;
  onDelete?: () => void;
}

export function ForumPostCard({
  post,
  isLiked,
  onToggleLike,
  isOwner,
  onDelete,
}: ForumPostCardProps) {
  const t = useTranslations('forum');
  const likeCount = post.likes + (isLiked ? 1 : 0);

  return (
    <article className="group flex gap-5 py-7 transition-colors first:pt-0 hover:bg-accent/20">
      <Avatar size="lg" className="hidden shrink-0 sm:flex">
        <AvatarImage src={post.avatar} alt={post.author} />
        <AvatarFallback className="bg-accent text-sm font-semibold text-primary">
          {post.initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{post.author}</span>
            {post.expert && <ExpertBadge />}
            <span className="text-xs text-muted-foreground">{post.time}</span>
          </div>

          {isOwner && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete?.();
              }}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              title="Hapus postingan"
              aria-label="Hapus postingan"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Hapus</span>
            </button>
          )}
        </div>

        <h2 className="mt-1.5 text-lg font-bold leading-snug tracking-tight">
          <Link href={`/forum/${post.id}`} className="transition-colors group-hover:text-primary">
            {post.title}
          </Link>
        </h2>

        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          {post.excerpt}
        </p>

        {post.image && (
          <Link
            href={`/forum/${post.id}`}
            className="mt-3 block overflow-hidden rounded-xl border border-border bg-secondary/20 transition-all hover:border-primary/40 focus:outline-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt={post.title}
              loading="lazy"
              className="aspect-[16/9] w-full max-h-64 sm:max-h-80 object-cover transition-transform duration-300 hover:scale-[1.01]"
            />
          </Link>
        )}

        <div className="mt-3.5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <Badge variant="secondary">
            <CategoryText category={post.category} />
          </Badge>
          <span
            className="inline-flex items-center gap-1.5"
            aria-label={t('komentarN', { n: post.comments.length })}
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            {post.comments.length}
          </span>
          <button
            type="button"
            onClick={onToggleLike}
            aria-pressed={isLiked}
            aria-label={t('sukaPost', { title: post.title })}
            className={cn(
              'inline-flex items-center gap-1.5 transition-colors hover:text-destructive focus-visible:outline-none cursor-pointer',
              isLiked ? 'font-semibold text-destructive' : 'text-muted-foreground'
            )}
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-transform active:scale-125',
                isLiked ? 'fill-destructive text-destructive' : ''
              )}
              aria-hidden="true"
            />
            <span className="tnum">{likeCount}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
