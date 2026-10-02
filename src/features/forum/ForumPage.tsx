'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from '@/components/layout/LocaleProvider';
import { Search, SearchX, Hash, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthGuard } from '@/components/shared/AuthGuardModal';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageCtaBand } from '@/components/shared/PageCtaBand';
import { FilterPill } from '@/components/ui/filter-pill';
import { ForumPostCard } from './ForumPostCard';
import { categories, forumPosts } from './mock';
import type { ForumPost } from './types';
import { useAuth } from '@/lib/use-auth';
import { getAllPosts, fetchForumPosts, toggleForumLike, isPostOwner } from './forum-storage';
import { HapusPostDialog } from './components/HapusPostDialog';
import { extractHashtags } from '@/lib/forum-utils';
import { cn } from '@/lib/utils';

export default function ForumPage({ onCreatePost }: { onCreatePost?: () => void } = {}) {
  const t = useTranslations('forum');
  const tc = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { checkAuth, AuthModal } = useAuthGuard();
  const { locale: lang } = useLocale();
  const [category, setCategory] = useState('Semua');
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [allPosts, setAllPosts] = useState<ForumPost[]>(() => forumPosts);
  const [postToDelete, setPostToDelete] = useState<ForumPost | null>(null);
  const [openHapusDialog, setOpenHapusDialog] = useState(false);

  // Sync with URL query parameters (?tag=... or ?q=...)
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    const qParam = searchParams.get('q');
    if (tagParam) {
      setSelectedTag(tagParam.replace(/^#/, '').toLowerCase());
    }
    if (qParam) {
      setQuery(qParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const loadPosts = async () => {
      const cached = getAllPosts();
      if (cached.length > 0) setAllPosts(cached);

      const dbPosts = await fetchForumPosts();
      if (isMounted && dbPosts.length > 0) {
        setAllPosts(dbPosts);
      }
    };

    loadPosts();
    window.addEventListener('forum-posts-changed', loadPosts);
    return () => {
      isMounted = false;
      window.removeEventListener('forum-posts-changed', loadPosts);
    };
  }, []);

  // Compute dynamic popular topics from actual posts in database / mock
  const popularTopics = useMemo(() => {
    const tagCounts = new Map<string, number>();

    // Initial curated tags to guarantee rich list even if DB is minimal
    const seedDefaults = [
      { tag: 'monstera', count: 0 },
      { tag: 'overwatering', count: 0 },
      { tag: 'bercakdaun', count: 0 },
      { tag: 'panenpertama', count: 0 },
      { tag: 'pupukorganik', count: 0 },
      { tag: 'cabairawit', count: 0 },
      { tag: 'kaktus', count: 0 },
      { tag: 'sansevieria', count: 0 },
    ];
    for (const item of seedDefaults) {
      tagCounts.set(item.tag, item.count);
    }

    for (const p of allPosts) {
      const pTags =
        p.tags && p.tags.length > 0
          ? p.tags
          : extractHashtags(`${p.title} ${(p.content ?? [p.excerpt]).join(' ')}`);

      for (const t of pTags) {
        const clean = t.toLowerCase().replace(/^#/, '');
        tagCounts.set(clean, (tagCounts.get(clean) || 0) + 1);
      }
    }

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .filter((t) => t.count > 0 || seedDefaults.some((s) => s.tag === t.tag))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [allPosts]);

  const filtered = useMemo(() => {
    return allPosts.filter((p) => {
      const matchCategory = category === 'Semua' || p.category === category;

      // Tag filter
      let matchTag = true;
      if (selectedTag) {
        const cleanSelected = selectedTag.toLowerCase().replace(/^#/, '');
        const postTags = (p.tags || []).map((t) => t.toLowerCase().replace(/^#/, ''));
        const text = `${p.title} ${p.excerpt} ${(p.content || []).join(' ')}`.toLowerCase();
        matchTag =
          postTags.includes(cleanSelected) ||
          text.includes(`#${cleanSelected}`) ||
          text.includes(cleanSelected) ||
          (cleanSelected === 'bercakdaun' && text.includes('bercak') && text.includes('daun')) ||
          (cleanSelected === 'panenpertama' && text.includes('panen') && text.includes('pertama')) ||
          (cleanSelected === 'pupukorganik' && text.includes('pupuk'));
      }

      // Query filter
      const q = query.trim().toLowerCase();
      let matchQuery = true;
      if (q) {
        const cleanQ = q.replace(/^#/, '');
        const postTags = (p.tags || []).map((t) => t.toLowerCase().replace(/^#/, ''));
        const textToMatch = `${p.title} ${p.excerpt} ${p.author} ${p.category} ${(p.content || []).join(' ')}`.toLowerCase();
        matchQuery =
          textToMatch.includes(q) ||
          textToMatch.includes(cleanQ) ||
          postTags.some((t) => t.includes(cleanQ));
      }

      return matchCategory && matchTag && matchQuery;
    });
  }, [allPosts, category, selectedTag, query]);

  const toggleLike = async (id: string) => {
    if (
      !checkAuth({
        title: 'Login untuk Menyukai Diskusi',
        actionName: 'Menyukai Postingan',
        description:
          'Masuk ke akun Anda untuk memberikan dukungan dan menyimpan postingan favorit Anda.',
      })
    ) {
      return;
    }
    const next = !liked[id];
    setLiked((m) => ({ ...m, [id]: next }));
    await toggleForumLike(id, next);
  };

  const handleCreatePost = () => {
    if (onCreatePost) {
      onCreatePost();
      return;
    }
    if (
      !checkAuth({
        title: 'Login untuk Buat Postingan',
        actionName: 'Buat Postingan',
        description:
          'Anda perlu masuk ke akun terlebih dahulu untuk membagikan pertanyaan atau cerita tanaman di forum komunitas.',
      })
    ) {
      return;
    }
    router.push('/forum/create');
  };

  return (
    <div>
      <PageHeader
        overline={t("komunitas")}
        title={t("forumKomunitas")}
        accent={t("komunitas")}
        description={t("forumSub")}
        actions={
          <Button
            onClick={handleCreatePost}
            className="btn-cta rounded-full cursor-pointer h-10 px-5 text-sm font-semibold"
          >
            {t("buatPostingan")}
          </Button>
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

      {/* Active Hashtag Filter Badge */}
      {selectedTag && (
        <div className="flex items-center gap-2 -mt-6">
          <span className="text-xs font-medium text-muted-foreground">Topik aktif:</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary text-xs font-semibold px-3 py-1 border border-primary/20">
            <Hash className="h-3 w-3" />
            {selectedTag}
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className="hover:text-destructive transition-colors ml-1 p-0.5 cursor-pointer"
              title="Hapus filter topik"
              aria-label="Hapus filter topik"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        </div>
      )}

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
                  (query.trim() !== '' || category !== 'Semua' || selectedTag !== null) ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQuery('');
                        setCategory('Semua');
                        setSelectedTag(null);
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
                  isOwner={isPostOwner(post, user)}
                  onSelectTag={(tag) => {
                    const clean = tag.replace(/^#/, '').toLowerCase();
                    setSelectedTag(selectedTag === clean ? null : clean);
                  }}
                  onDelete={() => {
                    setPostToDelete(post);
                    setOpenHapusDialog(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar, writer rail on sage wash */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <div className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <h3 className="text-sm font-bold">{t("topikPopuler")}</h3>
                {selectedTag && (
                  <button
                    type="button"
                    onClick={() => setSelectedTag(null)}
                    className="text-xs text-primary hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <ul className="divide-y divide-border">
                {popularTopics.map((topic) => {
                  const isSelected = selectedTag?.toLowerCase() === topic.tag.toLowerCase();
                  return (
                    <li key={topic.tag}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTag(isSelected ? null : topic.tag);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors cursor-pointer",
                          isSelected
                            ? "bg-primary/10 text-primary font-semibold"
                            : "hover:bg-secondary"
                        )}
                      >
                        <span className="text-sm font-medium flex items-center gap-1.5">
                          <span className={cn(isSelected ? "text-primary font-bold" : "text-primary/70")}>#</span>
                          {topic.tag}
                        </span>
                        <span className="tnum text-xs text-muted-foreground">{t("diskusiN", { n: topic.count })}</span>
                      </button>
                    </li>
                  );
                })}
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
      {AuthModal}
      <HapusPostDialog
        open={openHapusDialog}
        onOpenChange={setOpenHapusDialog}
        post={postToDelete}
        onDeleted={() => {
          setPostToDelete(null);
        }}
      />
    </div>
  );
}
