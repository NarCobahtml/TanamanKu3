'use client';

import SitePage from '@/components/SitePage';
import CreatePostForm from '@/components/CreatePostPage';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ArrowLeft, ChevronDown, Camera, Send } from 'lucide-react';



export default function CreatePostPage() {
  const t = useTranslations('forum');
  const tc = useTranslations('common');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');

  return (
    <>
      {/* Desktop, t3 (tidak berubah) */}
      <div className="hidden lg:block">
        <SitePage>
          <CreatePostForm />
        </SitePage>
      </div>

      {/* Mobile, dari tumbuhkita #1 */}
      <div className="create-post-page app-shell lg:hidden">
        <header className="create-post-header">
          <div className="create-post-header-inner app-container">
            <button className="create-post-back" aria-label={tc("kembali")} onClick={() => window.history.back()}>
              <ArrowLeft className="w-5 h-5 text-ink" />
            </button>
            <h1>{t("postinganBaru")}</h1>
          </div>
        </header>

        <main className="create-post-main app-container">
          <img src="/figma-assets/profile-1.jpg" alt={t("avatarAnda")} className="w-11 h-11 rounded-full mb-3" />
          <div className="create-post-fields">
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("judulPlaceholder")}
              aria-label={t("judul")}
            />
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={t("isiPlaceholder")}
              aria-label={t("isi")}
              rows={3}
            />
            <div className="create-post-tools">
              <div className="relative">
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  aria-label={t("pilihKategori")}
                  className="h-10 px-4 pr-8 rounded-lg border border-ink/15 bg-white text-sm text-ink appearance-none"
                >
                  <option value="">{t("pilihKategori")}</option>
                  <option value="pests">{t("hama")}</option>
                  <option value="care">{t("perawatan")}</option>
                  <option value="nutrition">{t("nutrisi")}</option>
                  <option value="other">{t("lainnya")}</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/70 pointer-events-none" />
              </div>
              <button className="w-10 h-10 rounded-lg border border-ink/15 bg-white grid place-items-center" aria-label={t("tambahGambar")}>
                <Camera className="w-5 h-5 text-ink" />
              </button>
            </div>
          </div>
        </main>

        <button className="create-post-submit" type="button">
          <Send className="w-4 h-4" />
          <span>{tc("posting")}</span>
        </button>
      </div>
    </>
  );
}

