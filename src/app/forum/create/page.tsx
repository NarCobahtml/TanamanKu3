'use client';

import SitePage from '@/components/SitePage';
import CreatePostForm from '@/components/CreatePostPage';
import { useState } from 'react';
import { ArrowLeft, ChevronDown, Camera, Send } from 'lucide-react';



export default function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');

  return (
    <>
      {/* Desktop — t3 (tidak berubah) */}
      <div className="hidden lg:block">
        <SitePage>
          <CreatePostForm />
        </SitePage>
      </div>

      {/* Mobile — dari tumbuhkita #1 */}
      <div className="create-post-page app-shell lg:hidden">
        <header className="create-post-header">
          <div className="create-post-header-inner app-container">
            <button className="create-post-back" aria-label="Kembali" onClick={() => window.history.back()}>
              <ArrowLeft className="w-5 h-5 text-ink" />
            </button>
            <h1>Postingan Baru</h1>
          </div>
        </header>

        <main className="create-post-main app-container">
          <img src="/figma-assets/avatar.png" alt="Avatar Anda" className="w-11 h-11 rounded-full mb-3" />
          <div className="create-post-fields">
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Judul Postingan..."
              aria-label="Judul Postingan"
            />
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Apa yang ingin Anda bagikan hari ini?"
              aria-label="Isi postingan"
              rows={3}
            />
            <div className="create-post-tools">
              <div className="relative">
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  aria-label="Pilih Kategori"
                  className="h-10 px-4 pr-8 rounded-lg border border-ink/15 bg-white text-sm text-ink appearance-none"
                >
                  <option value="">Pilih Kategori</option>
                  <option value="pests">Hama &amp; Penyakit</option>
                  <option value="care">Perawatan</option>
                  <option value="nutrition">Nutrisi</option>
                  <option value="other">Lainnya</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/70 pointer-events-none" />
              </div>
              <button className="w-10 h-10 rounded-lg border border-ink/15 bg-white grid place-items-center" aria-label="Tambahkan gambar">
                <Camera className="w-5 h-5 text-ink" />
              </button>
            </div>
          </div>
        </main>

        <button className="create-post-submit" type="button">
          <Send className="w-4 h-4" />
          <span>Posting</span>
        </button>
      </div>
    </>
  );
}

