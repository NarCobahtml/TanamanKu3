'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, ChevronDown, Loader2, Send, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ActionButton } from '@/components/ui/action-button';
import { useAuthGuard } from '@/components/shared/AuthGuardModal';
import { useAuth } from '@/lib/use-auth';
import { saveNewPost } from './forum-storage';
import type { ForumPost } from './types';

const categories = [
  'Hama & Penyakit',
  'Perawatan',
  'Nutrisi',
  'Tanya Ahli',
];

export default function CreatePostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const { checkAuth, AuthModal } = useAuthGuard();

  useEffect(() => {
    checkAuth({
      title: 'Login untuk Buat Postingan',
      actionName: 'Buat Postingan',
      description:
        'Anda perlu masuk ke akun terlebih dahulu untuk mempublikasikan postingan baru di forum komunitas.',
    });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.category-dropdown-container')) {
        setShowCategoryDropdown(false);
      }
    };
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const valid = title.trim() !== '' && content.trim() !== '';

  const publish = () => {
    if (
      !checkAuth({
        title: 'Login untuk Buat Postingan',
        actionName: 'Buat Postingan',
        description:
          'Anda perlu masuk ke akun terlebih dahulu untuk mempublikasikan postingan baru di forum komunitas.',
      })
    ) {
      return;
    }

    if (!valid || publishing) {
      if (!title.trim()) {
        toast.error('Silakan isi judul postingan terlebih dahulu');
        return;
      }
      if (!content.trim()) {
        toast.error('Silakan isi konten postingan terlebih dahulu');
        return;
      }
      return;
    }

    setPublishing(true);

    try {
      let currentUserName = user?.name || 'Alex Saputra';
      let currentUserId = user?.id;
      let currentUserAvatar = user?.photoUrl || '/figma-assets/profile-1.jpg';

      if (!currentUserId) {
        try {
          const storedUser = localStorage.getItem('tumbuhkita_user');
          if (storedUser) {
            const u = JSON.parse(storedUser);
            if (u?.name) currentUserName = u.name;
            if (u?.id) currentUserId = u.id;
            if (u?.photoUrl) currentUserAvatar = u.photoUrl;
          }
        } catch {
          // fallback
        }
      }

      const initials = currentUserName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const newPost: ForumPost = {
        id: `post-${Date.now()}`,
        authorId: currentUserId,
        author: currentUserName,
        initials: initials || 'AS',
        avatar: currentUserAvatar,
        time: 'Baru saja',
        category: category || 'Perawatan',
        title: title.trim(),
        excerpt: content.trim().slice(0, 120) + (content.length > 120 ? '...' : ''),
        content: [content.trim()],
        image: photoPreview || undefined,
        likes: 0,
        views: 1,
        comments: [],
      };

      saveNewPost(newPost);
      toast.success('Postingan berhasil diterbitkan!');
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      router.push('/forum');
    }, 500);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#F8FAF8] dark:bg-background text-foreground antialiased">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-20 flex h-14 w-full items-center border-b border-[#EEF2EE] dark:border-border/40 bg-card px-4 sm:px-6">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Kembali"
          className="flex size-9 items-center justify-center -ml-1 text-foreground hover:opacity-75 transition-opacity cursor-pointer"
        >
          <ArrowLeft className="size-6 stroke-[2.2]" aria-hidden="true" />
        </button>
        <h1 className="ml-3 text-[18px] font-semibold text-foreground tracking-tight">
          Postingan Baru
        </h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 pt-5 pb-28 relative">
        <div className="flex gap-4">
          {/* Left: Avatar + Vertical Thread Line */}
          <div className="flex flex-col items-center shrink-0">
            <div className="size-11 sm:size-12 rounded-full bg-[#E5EBE5] dark:bg-muted/80 flex items-center justify-center text-[#738273] dark:text-muted-foreground">
              <User className="size-6 stroke-[1.8]" aria-hidden="true" />
            </div>
            {/* Thread line extending down */}
            <div className="w-[1.5px] min-h-[140px] flex-1 bg-[#DEE5DE] dark:bg-border/60 mt-2 mb-2" />
          </div>

          {/* Right: Form inputs and tool controls */}
          <div className="flex-1 min-w-0 pt-0.5">
            {/* Judul Postingan... */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul Postingan..."
              className="w-full bg-transparent text-[17px] sm:text-[18px] font-semibold tracking-tight text-foreground placeholder:text-[#A0ABA0] dark:placeholder:text-muted-foreground/60 outline-none border-none p-0 focus:ring-0"
              autoFocus
            />

            {/* Apa yang ingin Anda bagikan hari ini? */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Apa yang ingin Anda bagikan hari ini?"
              rows={5}
              className="w-full bg-transparent text-[15px] sm:text-[16px] text-foreground placeholder:text-[#A0ABA0] dark:placeholder:text-muted-foreground/60 outline-none border-none p-0 focus:ring-0 resize-none leading-relaxed mt-2.5 min-h-[110px]"
            />

            {/* Photo preview if chosen */}
            {photoPreview && (
              <div className="relative mt-3 inline-block rounded-xl overflow-hidden border border-border/80 shadow-sm max-w-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Preview foto tanaman"
                  className="max-h-48 w-auto rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  aria-label="Hapus foto"
                  className="absolute top-2 right-2 size-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            {/* Tools Row: Category selector pill + Camera icon */}
            <div className="flex items-center gap-2.5 mt-4 relative">
              {/* Category selector */}
              <div className="relative category-dropdown-container">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCategoryDropdown((prev) => !prev);
                  }}
                  className={cn(
                    "h-9 rounded-full border border-[#D5DDD5] dark:border-border/80 bg-white dark:bg-card px-3.5 flex items-center gap-2 text-xs sm:text-[13px] font-normal transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer",
                    category ? "text-foreground font-medium" : "text-[#556355] dark:text-muted-foreground"
                  )}
                >
                  <span>{category || 'Pilih Kategori'}</span>
                  <ChevronDown className="size-4 text-foreground/60" aria-hidden="true" />
                </button>

                {showCategoryDropdown && (
                  <div className="absolute left-0 top-full mt-1.5 z-30 w-48 rounded-xl border border-border bg-card p-1.5 shadow-lg animate-in fade-in-50 zoom-in-95">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setCategory(cat);
                          setShowCategoryDropdown(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors cursor-pointer",
                          category === cat
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-accent text-foreground"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Camera Button */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Tambah foto"
                className="size-9 sm:size-10 rounded-xl border border-[#D5DDD5] dark:border-border/80 bg-white dark:bg-card flex items-center justify-center text-[#556355] dark:text-foreground/75 hover:border-foreground/40 hover:text-foreground transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
              >
                <Camera className="size-[18px] sm:size-5 stroke-[1.8]" aria-hidden="true" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onPick}
                aria-label="Pilih foto dari galeri atau kamera"
              />
            </div>
          </div>
        </div>

        {/* Floating "Posting" Action Button at bottom right */}
        <ActionButton
          type="button"
          onClick={publish}
          disabled={!valid || publishing}
          icon={publishing ? Loader2 : Send}
          size="lg"
          className="fixed bottom-6 right-6 z-30 shadow-lg"
        >
          {publishing ? 'Memproses...' : 'Posting'}
        </ActionButton>
      </main>
      {AuthModal}
    </div>
  );
}
