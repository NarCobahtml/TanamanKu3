'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Share2, ArrowLeft, MessageSquare, Reply, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { forumPosts } from './mock';
import type { ForumPost } from './types';
import { CategoryText } from './components/CategoryText';
import { ExpertBadge } from './components/ExpertBadge';
import { HapusPostDialog } from './components/HapusPostDialog';
import { getPostById, getAllPosts, fetchForumPostById, submitForumComment, toggleForumLike, isPostOwner } from './forum-storage';
import { useAuth } from '@/lib/use-auth';
import TkRevealClient from '@/components/shared/tk-reveal-client';
import { useAuthGuard } from '@/components/shared/AuthGuardModal';
import { cn } from '@/lib/utils';

function renderTextWithHashtags(text: string) {
  const parts = text.split(/(#[\w\u00C0-\u024F\u1E00-\u1EFF]+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      const tag = part.slice(1);
      return (
        <Link
          key={index}
          href={`/forum?tag=${encodeURIComponent(tag.toLowerCase())}`}
          className="font-semibold text-primary hover:underline transition-colors"
        >
          {part}
        </Link>
      );
    }
    return part;
  });
}

export default function ForumDetailPage({
  id,
  initialPost,
}: {
  id: string;
  initialPost?: ForumPost | null;
}) {
  const t = useTranslations('forum');
  const router = useRouter();
  const { user } = useAuth();
  const { checkAuth, AuthModal } = useAuthGuard();

  const [currentPost, setCurrentPost] = useState<ForumPost>(() => {
    return initialPost ?? forumPosts.find((p) => p.id === id) ?? forumPosts[0];
  });
  const [openHapusDialog, setOpenHapusDialog] = useState(false);

  const post = currentPost;
  const isOwner = isPostOwner(post, user);
  const [related, setRelated] = useState<ForumPost[]>(() => {
    return forumPosts.filter((p) => p.id !== (initialPost?.id ?? id)).slice(0, 3);
  });

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(post.comments);
  const [draft, setDraft] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTarget, setReplyingTarget] = useState<{ author: string; commentId?: string } | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      // Sync related posts from cache or db
      const cachedRelated = getAllPosts().filter((p) => p.id !== id).slice(0, 3);
      if (isMounted && cachedRelated.length > 0) {
        setRelated(cachedRelated);
      }

      if (!initialPost) {
        const cached = getPostById(id) ?? forumPosts.find((p) => p.id === id);
        if (cached && isMounted) {
          setCurrentPost(cached);
          setLikes(cached.likes);
          setComments(cached.comments);
        }
      }

      const livePost = await fetchForumPostById(id);
      if (livePost && isMounted) {
        setCurrentPost(livePost);
        setLikes(livePost.likes);
        setComments(livePost.comments);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [id, initialPost]);

  const toggleLike = async () => {
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
    const next = !liked;
    setLiked(next);
    setLikes((n) => (next ? n + 1 : Math.max(0, n - 1)));
    await toggleForumLike(post.id, next);
  };

  const submitComment = async () => {
    if (
      !checkAuth({
        title: 'Login untuk Berkomentar',
        actionName: 'Komentar Forum',
        description:
          'Bergabung dalam diskusi dan bagikan pengalaman Anda dengan masuk ke akun terlebih dahulu.',
      })
    ) {
      return;
    }
    const text = draft.trim();
    if (!text || submittingComment) return;

    setSubmittingComment(true);
    const replyAuthor = replyingTarget?.author;
    const parentId = replyingTarget?.commentId;

    try {
      const createdComment = await submitForumComment(post.id, {
        text,
        replyTo: replyAuthor,
        parentId,
      });

      setComments((list) => [...list, createdComment]);
      setDraft('');
      setReplyingTarget(null);
    } catch (err) {
      console.error('Failed to submit comment:', err);
      // Fallback
      setComments((list) => [
        ...list,
        {
          author: user?.name || 'Pengguna TanamanKu',
          avatar: user?.photoUrl || undefined,
          time: t('baruSaja'),
          text,
          replyTo: replyAuthor,
          parentId,
        },
      ]);
      setDraft('');
      setReplyingTarget(null);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleBuatPostingan = () => {
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
      {/* ============ SUB-HERO, breadcrumb overline + post title ============ */}
      <header className="sage-wash border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16">
          <nav
            aria-label="Breadcrumb"
            className="hero-anim hero-fade flex items-center gap-3 text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase"
          >
            <Link href="/forum" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {t("forum")}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="max-w-[280px] truncate normal-case tracking-normal text-foreground" aria-current="page">
              {post.title}
            </span>
          </nav>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
            <h1
              className="hero-anim hero-fade max-w-3xl text-3xl font-extrabold leading-[1.12] tracking-[-0.03em] md:text-5xl"
              style={{ animationDelay: '0.12s' }}
            >
              <span className="font-playfair">{post.title.split(' ')[0]}</span>{' '}
              {post.title.split(' ').slice(1).join(' ')}
            </h1>
            <div
              className="hero-anim hero-fade flex flex-wrap items-center gap-3"
              style={{ animationDelay: '0.24s' }}
            >
              <Avatar size="lg">
                <AvatarImage src={post.avatar} alt={post.author} />
                <AvatarFallback className="bg-card text-sm font-semibold text-primary">
                  {post.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{post.author}</span>
                  {post.expert && <ExpertBadge />}
                </div>
                <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                  {post.time} · <CategoryText category={post.category} />
                </p>
              </div>
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenHapusDialog(true)}
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive gap-1.5 cursor-pointer ml-auto sm:ml-2"
                  title="Hapus postingan saya"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Hapus Postingan</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ============ BODY, editorial two-column: article | sticky aside ============ */}
      <div className="mx-auto grid w-full max-w-7xl gap-16 px-4 py-14 sm:px-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Article, reading column */}
        <article className="min-w-0">
          <TkRevealClient>
            <div className="space-y-5 text-[15px] leading-8">
              {(post.content ?? [post.excerpt]).map((para, i) => (
                <p key={i}>{renderTextWithHashtags(para)}</p>
              ))}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Topik terkait:</span>
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/forum?tag=${encodeURIComponent(tag.replace(/^#/, '').toLowerCase())}`}
                    className="inline-flex items-center text-xs font-medium text-primary hover:text-primary-foreground hover:bg-primary bg-primary/10 rounded-full px-3 py-1 transition-colors"
                  >
                    #{tag.replace(/^#/, '')}
                  </Link>
                ))}
              </div>
            )}

            {post.image && (
              <img
                src={post.image}
                alt={t("fotoPendamping", { title: post.title })}
                className="mt-10 aspect-video w-full rounded-xl border border-border object-cover"
              />
            )}

            <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
              <Button
                variant={liked ? 'secondary' : 'outline'}
                size="sm"
                onClick={toggleLike}
                aria-pressed={liked}
                className={cn('rounded-full', liked ? 'text-destructive' : 'bg-card hover:bg-accent/60')}
              >
                <Heart
                  className={liked ? 'h-4 w-4 fill-destructive text-destructive' : 'h-4 w-4'}
                  aria-hidden="true"
                />
                {t("sukaDot")} · <span className="tnum">{likes}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full bg-card hover:bg-accent/60"
                aria-label={t("bagikan")}
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                {t("bagikan")}
              </Button>

              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenHapusDialog(true)}
                  className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive sm:ml-auto gap-1.5 cursor-pointer"
                  title="Hapus postingan saya"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span>Hapus Postingan</span>
                </Button>
              )}
            </div>
          </TkRevealClient>

          {/* Comments */}
          <section aria-labelledby="komentar" className="mt-16 border-t border-border pt-10">
            <h2 id="komentar" className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <MessageSquare className="h-5 w-5 text-primary" aria-hidden="true" />
              {t("komentarJudul")} (<span className="tnum">{comments.length}</span>)
            </h2>
            <TkRevealClient>
              {(() => {
                // Group comments: top-level comments and nested replies attached to parent comment
                const topLevelComments: Array<typeof comments[0] & { nestedReplies: typeof comments }> = [];

                // 1. Index top-level comments (comments without parentId and without replyTo)
                for (const c of comments) {
                  if (!c.parentId && !c.replyTo) {
                    topLevelComments.push({ ...c, nestedReplies: [] });
                  }
                }

                // If all comments have replyTo / parentId (legacy data), pick first as top-level
                if (topLevelComments.length === 0 && comments.length > 0) {
                  topLevelComments.push({ ...comments[0], nestedReplies: [] });
                }

                // 2. Attach replies to the appropriate top-level comment
                for (const c of comments) {
                  // Skip if it is already one of the topLevelComments root items
                  if (topLevelComments.some((tl) => (tl.id && tl.id === c.id) || (!tl.id && tl === c))) {
                    continue;
                  }

                  let attached = false;

                  // 2a. Match by parentId to a top-level comment
                  if (c.parentId) {
                    const parent = topLevelComments.find((p) => p.id === c.parentId);
                    if (parent) {
                      parent.nestedReplies.push(c);
                      attached = true;
                    }
                  }

                  // 2b. Match by replyTo author
                  if (!attached && c.replyTo) {
                    const parent = topLevelComments.find((p) => p.author === c.replyTo);
                    if (parent) {
                      parent.nestedReplies.push(c);
                      attached = true;
                    }
                  }

                  // 2c. Fallback if parent wasn't found: attach to latest top-level comment or make top-level
                  if (!attached) {
                    if (topLevelComments.length > 0) {
                      topLevelComments[topLevelComments.length - 1].nestedReplies.push(c);
                    } else {
                      topLevelComments.push({ ...c, nestedReplies: [] });
                    }
                  }
                }

                return (
                  <ul className="mt-6 divide-y divide-border border-t border-border">
                    {topLevelComments.map((parent, pIdx) => (
                      <li key={parent.id || pIdx} className="py-5 space-y-4">
                        {/* Parent Comment */}
                        <div className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent/20">
                          <Avatar>
                            <AvatarFallback className="bg-secondary text-xs font-semibold">
                              {parent.author
                                .split(' ')
                                .map((w) => w[0])
                                .join('')
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm">
                              <span className="font-semibold text-foreground">{parent.author}</span>{' '}
                              <span className="text-muted-foreground text-xs" suppressHydrationWarning>· {parent.time}</span>
                            </p>
                            <p className="mt-1 text-sm leading-6 text-foreground/90">{parent.text}</p>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTarget({ author: parent.author, commentId: parent.id });
                                commentInputRef.current?.focus();
                                commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }}
                              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary/80 hover:underline cursor-pointer"
                            >
                              <Reply className="h-3.5 w-3.5" aria-hidden="true" />
                              {t("balas")}
                            </button>
                          </div>
                        </div>

                        {/* Nested Replies specifically under THIS comment */}
                        {parent.nestedReplies.length > 0 && (
                          <div className="ml-6 sm:ml-10 space-y-3 border-l-2 border-primary/30 pl-4 sm:pl-6">
                            {parent.nestedReplies.map((reply, rIdx) => (
                              <div key={reply.id || rIdx} className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent/20">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="bg-accent text-[11px] font-semibold text-primary">
                                    {reply.author
                                      .split(' ')
                                      .map((w) => w[0])
                                      .join('')
                                      .slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  {reply.replyTo && (
                                    <p className="mb-0.5 text-xs text-muted-foreground">
                                      {t('membalas')} <span className="font-medium text-primary">@{reply.replyTo}</span>
                                    </p>
                                  )}
                                  <p className="text-xs">
                                    <span className="font-semibold text-foreground">{reply.author}</span>{' '}
                                    <span className="text-muted-foreground" suppressHydrationWarning>· {reply.time}</span>
                                  </p>
                                  <p className="mt-1 text-sm leading-6 text-foreground/90">{reply.text}</p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReplyingTarget({ author: reply.author, commentId: parent.id || reply.id });
                                      commentInputRef.current?.focus();
                                      commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }}
                                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80 hover:underline cursor-pointer"
                                  >
                                    <Reply className="h-3 w-3" aria-hidden="true" />
                                    {t("balas")}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </TkRevealClient>

            {/* Composer */}
            <div className="mt-8 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
              {replyingTarget && (
                <div className="mb-3 flex items-center justify-between rounded-lg border border-primary/20 bg-accent/60 px-3.5 py-2 text-xs">
                  <span className="text-foreground">
                    {t('membalas')} <strong className="font-semibold text-primary">@{replyingTarget.author}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyingTarget(null)}
                    className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                    aria-label="Batalkan balasan"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <label htmlFor="comment" className="text-sm font-semibold">
                {replyingTarget ? `${t("balas")} @${replyingTarget.author}` : t("tulisKomentar")}
              </label>
              <Textarea
                id="comment"
                ref={commentInputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={replyingTarget ? `Tulis balasan untuk @${replyingTarget.author}...` : t("bagikanJawaban")}
                className="mt-2"
              />
              <div className="mt-3 flex items-center justify-between">
                {replyingTarget ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTarget(null)}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Batal Balas
                  </Button>
                ) : <span />}
                <Button onClick={submitComment} className="btn-cta rounded-full cursor-pointer" disabled={draft.trim() === ''}>
                  {replyingTarget ? 'Kirim Balasan' : t("kirimKomentar")}
                </Button>
              </div>
            </div>
          </section>
        </article>

        {/* Sidebar, sticky info cards hairline */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <div className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
              <h3 className="border-b border-border px-5 py-3.5 text-sm font-bold">
                {t("diskusiTerkait")}
              </h3>
              <ul className="divide-y divide-border">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/forum/${r.id}`}
                      className="block px-5 py-4 transition-colors hover:bg-secondary"
                    >
                      <p className="line-clamp-2 text-sm font-medium leading-snug">{r.title}</p>
                      <p className="tnum mt-1 text-xs text-muted-foreground">
                        {t("sukaKomentarN", { likes: r.likes, n: r.comments.length })}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ink-panel rounded-xl p-6">
              <h3 className="font-bold tracking-tight">
                {t("bagikan")} <span className="font-playfair">{t("pengalamanMu")}</span>
              </h3>
              <p className="mt-1.5 text-sm text-white/80">
                {t("ceritaJawaban")}
              </p>
              <Button
                onClick={handleBuatPostingan}
                className="mt-4 rounded-full bg-white text-[#123526] hover:bg-primary/10 cursor-pointer"
              >
                {t("buatPostingan")}
              </Button>
            </div>
          </div>
        </aside>
      </div>
      {AuthModal}
      <HapusPostDialog
        open={openHapusDialog}
        onOpenChange={setOpenHapusDialog}
        post={post}
        onDeleted={() => {
          router.push('/forum');
        }}
      />
    </div>
  );
}
