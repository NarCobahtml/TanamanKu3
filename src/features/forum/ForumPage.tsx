'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/layout/LocaleProvider';
import Link from 'next/link';
import { Heart, MessageSquare, Plus, Search, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ActionButton } from '@/components/ui/action-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageCtaBand } from '@/components/shared/PageCtaBand';
import { FilterPill } from '@/components/ui/filter-pill';
import { ForumPostCard } from './ForumPostCard';
import { cn } from '@/lib/utils';
import { categories, forumPosts } from './mock';
import type { ForumPost } from './types';

const topics = [
  { tag: 'bercakdaun', count: 18 },
  { tag: 'overwatering', count: 14 },
  { tag: 'panenpertama', count: 9 },
  { tag: 'pupukorganik', count: 7 },
  { tag: 'monstera', count: 5 },
];

export default function ForumPage() {
  const t = useTranslations('forum');
  const tc = useTranslations('common');
  const { locale: lang } = useLocale();
  const [category, setCategory] = useState('Semua');
  const [query, setQuery] = useState('');
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [allPosts, setAllPosts] = useState<ForumPost[]>(forumPosts);

  useEffect(() => {
    try {
      const existing = localStorage.getItem('tumbuhkita_custom_posts');
      if (existing) {
        const parsed = JSON.parse(existing);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAllPosts([...parsed, ...forumPosts]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const filtered = allPosts.filter((p) => {
    const matchCategory = category === 'Semua' || p.category === category;
    const q = query.trim().toLowerCase();
    if (!q) return matchCategory;
    const textToMatch = `${p.title} ${p.excerpt} ${p.author} ${p.category}`.toLowerCase();
    return matchCategory && textToMatch.includes(q);
  });

  const toggleLike = (id: string) => {
    const next = !liked[id];
    setLiked((m) => ({ ...m, [id]: next }));
  };

  const likeCount = (p: ForumPost) => p.likes + (liked[p.id] ? 1 : 0);

  return (
    <div>
      <PageHeader
        overline={t("komunitas")}
        title={t("forumKomunitas")}
        accent={t("komunitas")}
        description={t("forumSub")}
        actions={
          <ActionButton href="/forum/create">
            {t("buatPostingan")}
          </ActionButton>
        }
      />

      <div className="mx-auto w-full max-w-7xl space-y-12 px-4 pt-12 pb-24 sm:px-6">
      {/* Toolbar: search + filter kategori */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("cari")}
              aria-label={t("cariAria")}
              className="rounded-xl border-border bg-card pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("filterKategori")}>
            {categories.map((c) => (
              <FilterPill
                key={c.id}
                active={category === c.id}
                onClick={() => setCategory(c.id)}
              >
                {c.section === "common" ? tc(c.key) : t(c.key)}
              </FilterPill>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("menampilkan", { count: filtered.length, total: allPosts.length })}
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        {/* Feed, editorial divider list, not card stack */}
        <div className="min-w-0">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-border">
              <EmptyState
                icon={<SearchX className="h-6 w-6" aria-hidden="true" />}
                title={t("tidakAdaPost")}
                message={t("cobaKataKategori")}
                action={
                  (query.trim() !== '' || category !== 'Semua') ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQuery('');
                        setCategory('Semua');
                      }}
                    >
                      {t("resetPencarian")}
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((post) => (
                <ForumPostCard
                  key={post.id}
                  post={post}
                  isLiked={!!liked[post.id]}
                  onToggleLike={() => toggleLike(post.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar, writer rail on sage wash */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <div className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
              <h3 className="border-b border-border px-5 py-3.5 text-sm font-bold">{t("topikPopuler")}</h3>
              <ul className="divide-y divide-border">
                {topics.map((topic) => (
                  <li key={topic.tag}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(topic.tag);
                      }}
                      className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-secondary"
                    >
                      <span className="text-sm font-medium">#{topic.tag}</span>
                      <span className="tnum text-xs text-muted-foreground">{t("diskusiN", { n: topic.count })}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
      </div>

      <PageCtaBand
        heading={t("punyaCerita")}
        accent={lang === "id" ? "dibagikan" : "shared"}
        description={t("pengalamanJawaban")}
        primary={{ href: '/forum/create', label: t('buatPostingan') }}
        secondary={{ href: '/scan', label: tc('scanTanaman') }}
      />
    </div>
  );
}
