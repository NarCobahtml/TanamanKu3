'use client';

import { useParams } from 'next/navigation';
import SitePage from '@/components/SitePage';
import ForumDetail from '@/components/ForumDetailPage';
import { forumPosts } from '@/components/ForumPage';
import { useState } from 'react';
import { ArrowLeft, ThumbsUp, MessageCircle, Share2, Camera, Send } from 'lucide-react';



export default function ForumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [comment, setComment] = useState('');

  const post = forumPosts.find((p) => p.id === id) ?? forumPosts[0];
  const comments = post.comments;

  return (
    <>
      {/* Desktop — t3 (tidak berubah) */}
      <div className="hidden lg:block">
        <SitePage>
          <ForumDetail id={id} />
        </SitePage>
      </div>

      {/* Mobile — mobile1 Figma */}
      <div className="app-shell pb-24 lg:hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background">
        <div className="app-container h-16 px-4 flex items-center gap-3">
          <button onClick={() => window.history.back()} aria-label="Kembali" className="p-1 -ml-1">
            <ArrowLeft className="w-6 h-6 text-ink" />
          </button>
          <h1 className="text-xl font-bold text-ink">Forum</h1>
        </div>
      </header>

      <main className="app-container">
        {/* Post */}
        <div className="bg-white border-b border-ink/15 p-4">
          {/* Author */}
          <div className="flex items-start gap-3 mb-4">
            <img
              src={post.avatar ?? '/figma-assets/avatar.png'}
              alt={post.author}
              className="w-11 h-11 rounded-full"
            />
            <div className="flex-1">
              <p className="font-bold text-ink">{post.author}</p>
              <p className="text-xs text-ink/70">{post.time} • <span className="text-[#1B5E20]">{post.category}</span></p>
            </div>
          </div>

          {/* Content */}
          <h2 className="text-[20px] font-bold mb-2 text-ink">{post.title}</h2>
          <div className="text-sm text-ink space-y-3 mb-4">
            {(post.content ?? [post.excerpt]).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* Image */}
          {post.image && (
            <img
              src={post.image}
              alt=""
              className="w-full rounded-xl mb-4"
            />
          )}

          {/* Engagement */}
          <div className="flex items-center gap-5 text-ink/70 pt-4 border-t border-ink/15">
            <button className="flex items-center gap-1.5 text-sm">
              <ThumbsUp className="w-5 h-5" />
              {post.likes}
            </button>
            <button className="flex items-center gap-1.5 text-sm">
              <MessageCircle className="w-5 h-5" />
              {post.comments.length}
            </button>
            <button className="ml-auto" aria-label="Bagikan">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-4">
          <h3 className="font-bold mb-4 text-ink">Komentar ({post.comments.length})</h3>

          <div className="space-y-5">
            {comments.map((c) => (
              <div key={c.author + c.time}>
                <div className="flex items-start gap-3">
                  <img
                    src="/figma-assets/avatar.png"
                    alt={c.author}
                    className="w-9 h-9 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="font-bold text-sm text-ink">{c.author}</p>
                      <span className="text-xs text-ink/70 whitespace-nowrap">{c.time}</span>
                    </div>
                    <p className="text-sm text-ink mb-1.5">{c.text}</p>
                    <div className="flex items-center gap-3 text-ink/70">
                      <button className="flex items-center gap-1 text-xs">
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button className="text-xs font-semibold text-[#1B5E20]">Balas</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Comment Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-ink/15 p-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
        <div className="app-container flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tulis komentar Anda..."
              className="w-full bg-background pl-11 pr-4 py-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
            />
            <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/70" />
          </div>
          <button className="w-10 h-10 bg-[#1B5E20] rounded-full flex items-center justify-center shrink-0" aria-label="Kirim komentar">
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
      </div>
    </>
  );
}

