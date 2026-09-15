'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ChevronDown, ImagePlus, Loader2, Send } from 'lucide-react';

const categories = [
  { value: 'Hama & Penyakit', key: 'hama' },
  { value: 'Perawatan', key: 'perawatan' },
  { value: 'Nutrisi', key: 'nutrisi' },
  { value: 'Tanya Ahli', key: 'tanyaAhli', common: true },
];

export default function CreatePostPage() {
  const router = useRouter();
  const t = useTranslations('forum');
  const tc = useTranslations('common');
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const valid = title.trim() !== '' && category !== '' && content.trim() !== '';

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoName(file ? file.name : null);
  };

  const publish = () => {
    if (!valid || publishing) return;
    setPublishing(true);
    // ponytail: fake latency, replace with POST /api/forum when backend exists
    setTimeout(() => {
      router.push('/forum');
    }, 800);
  };

  return (
    <form
      className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6"
      onSubmit={(e) => {
        e.preventDefault();
        publish();
      }}
    >
      {/* header back, seperti mobile */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label={tc("kembali")}
          className="grid size-9 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent/60"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">{t("postinganBaru")}</h1>
      </div>

      {/* identitas, seperti mobile */}
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/figma-assets/profile-1.jpg"
          alt=""
          className="size-11 rounded-full"
        />
        <p className="font-semibold">Alex Saputra</p>
      </div>

      {/* fields polos, tanpa label, tanpa kartu */}
      <div className="mt-4 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("judulPlaceholder")}
          aria-label={t("judul")}
          className="w-full bg-transparent text-lg font-semibold tracking-tight outline-none placeholder:text-muted-foreground/70 placeholder:font-normal"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("isiPlaceholder")}
          aria-label={t("isi")}
          rows={6}
          className="w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground/70"
        />

        {photoName && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ImagePlus className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{photoName}</span>
          </p>
        )}

        {/* tools row, kategori + kamera, seperti mobile */}
        <div className="flex items-center gap-3 pt-1">
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label={t("pilihKategori")}
              className="h-10 appearance-none rounded-lg border border-border bg-card pl-4 pr-9 text-sm text-foreground outline-none transition-colors hover:border-primary/40 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">{t("pilihKategori")}</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.common ? tc(c.key) : t(c.key)}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </div>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label={t("tambahGambar")}
            className="grid size-10 place-items-center rounded-lg border border-border bg-card text-foreground transition-colors hover:border-primary/40 hover:bg-accent/40"
          >
            <ImagePlus className="size-5" aria-hidden="true" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onPick}
            aria-label={t("pilihFoto")}
          />
        </div>
      </div>

      {/* submit, pill hijau seperti mobile */}
      <button
        type="submit"
        disabled={!valid || publishing}
        className="btn-cta mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {publishing ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        {publishing ? t('mempublikasikan') : tc('posting')}
      </button>
    </form>
  );
}
