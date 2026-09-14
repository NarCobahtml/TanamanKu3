'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ImagePlus, Loader2, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/PageHeader';
import TkRevealClient from '@/components/landing/tk-reveal-client';
import { toast } from 'sonner';

const categories = ['Hama & Penyakit', 'Perawatan', 'Nutrisi', 'Tanya Ahli'];

export default function CreatePostPage() {
  const router = useRouter();
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
      toast.success('Postingan berhasil dipublikasikan');
      router.push('/forum');
    }, 800);
  };

  return (
    <div>
      <PageHeader
        overline="Komunitas"
        title="Buat Postingan"
        accent="Postingan"
        description="Pertanyaan atau cerita apa pun seputar tanamanmu, semua dijawab di sini."
      />

      <TkRevealClient className="mx-auto w-full max-w-3xl px-4 pt-12 sm:px-6">
      <form
        className="space-y-10"
        onSubmit={(e) => {
          e.preventDefault();
          publish();
        }}
      >
        <div className="space-y-6 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40 md:p-8">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-semibold">Judul</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Daun monstera saya menguning, kenapa ya?"
              className="text-base"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category" className="font-semibold">Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Foto</Label>
              {/* hidden native picker behind a styled button */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onPick}
                aria-label="Pilih foto tanaman"
              />
              {photoName ? (
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="max-w-full">
                    <span className="truncate">{photoName}</span>
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Hapus foto terpilih"
                    onClick={() => {
                      setPhotoName(null);
                      if (fileRef.current) fileRef.current.value = '';
                    }}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileRef.current?.click()}
                  >
                    <ImagePlus className="h-4 w-4" aria-hidden="true" />
                    Unggah Foto
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Opsional. JPG/PNG maks 5MB.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="font-semibold">Konten</Label>
          <Textarea
            id="content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ceritakan kondisi tanamanmu…"
            className="rounded-xl border-border bg-card"
          />
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Ceritakan kondisi tanamanmu: seberapa sering disiram, lokasi penempatan, gejala yang terlihat.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button asChild variant="outline" type="button" className="rounded-full bg-card hover:bg-accent/60">
            <Link href="/forum">Batal</Link>
          </Button>
          <Button type="submit" className="btn-cta rounded-full px-6" disabled={!valid || publishing}>
            {publishing && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {publishing ? 'Mempublikasikan…' : 'Publikasikan'}
          </Button>
        </div>
      </form>
      </TkRevealClient>
    </div>
  );
}
