'use client';

import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import SitePage from '@/components/SitePage';
import ForumSection, { forumPosts } from '@/components/ForumPage';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CategoryText } from '@/components/ForumPage';
import { ThumbsUp, MessageCircle, Share2, Plus } from 'lucide-react';

export default function ForumPage() {
  const t = useTranslations('forum');
  const tc = useTranslations('common');
  const categories = [
    { id: 'Semua', key: 'semua', section: 'common' },
    { id: 'Hama & Penyakit', key: 'hama', section: 'forum' },
    { id: 'Perawatan', key: 'perawatan', section: 'forum' },
    { id: 'Nutrisi', key: 'nutrisi', section: 'forum' },
  ];

  return (
    <>
      {/* Desktop, t3 (tidak berubah) */}
      <div className="hidden lg:block">
        <SitePage>
          <ForumSection />
        </SitePage>
      </div>

      {/* Mobile, mobile1 Figma */}
      <div className="app-shell pb-[86px] lg:hidden">
        <Header showSearch showProfile />

      <main className="app-container">
        {/* Categories */}
        <div className="px-4 py-4 overflow-x-auto">
          <div className="flex gap-2">
            {categories.map((cat, idx) => (
              <button
                key={cat.id}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold ${
                  idx === 0
                    ? 'bg-[#1B5E20] text-white'
                    : 'bg-white text-ink border border-ink/15'
                }`}
              >
                {cat.section === 'common' ? tc(cat.key) : t(cat.key)}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        <div className="px-4 pb-6 space-y-4">
          {forumPosts.map((post) => (
            <Link
              key={post.id}
              href={`/forum/${post.id}`}
              className="block bg-white rounded-xl border border-ink/15 p-4"
            >
              {/* Author */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={post.avatar ?? '/figma-assets/profile-1.jpg'}
                  alt={post.author}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-bold text-[16px] text-ink">{post.author}</p>
                  <p className="text-xs text-ink/70">{post.time}</p>
                </div>
              </div>

              {/* Content */}
              <h3 className="font-bold text-[18px] mb-1.5 text-ink">{post.title}</h3>
              <p className="text-sm text-ink mb-3 line-clamp-2">{post.excerpt}</p>

              {/* Image if exists */}
              {post.image && (
                <img
                  src={post.image}
                  alt=""
                  className="w-full h-44 object-cover rounded-lg mb-3"
                />
              )}

              {/* Engagement */}
              <div className="flex items-center gap-4 text-ink/70">
                <span className="flex items-center gap-1.5 text-sm">
                  <ThumbsUp className="w-5 h-5" />
                  {post.likes}
                </span>
                <span className="flex items-center gap-1.5 text-sm">
                  <MessageCircle className="w-5 h-5" />
                  {post.comments.length}
                </span>
                <button className="ml-auto" aria-label={t("bagikan")}>
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* FAB */}
      <Link
        href="/forum/create"
        aria-label={t("buatPostingan")}
        className="fixed bottom-24 right-[max(24px,calc((100vw-390px)/2+24px))] w-14 h-14 bg-[#1B5E20] rounded-full flex items-center justify-center shadow-lg"
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </Link>

      <BottomNav />
      </div>
    </>
  );
}
