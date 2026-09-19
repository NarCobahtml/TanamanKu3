'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { tanamanStore } from '@/lib/tanaman-store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const jenisList = ['hias', 'sayuran', 'buah', 'obat', 'umbi'] as const;

/** Form tambah tanaman, dipakai desktop (toolbar) & mobile (FAB). Submit masih mock. */
export default function TambahTanamanDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const ts = useTranslations('siram');
  const tc = useTranslations('common');
  const [form, setForm] = useState({ nama: '', jenis: 'hias', foto: '' });
  const [submitting, setSubmitting] = useState(false);
  const fotoRef = useRef<HTMLInputElement>(null);

  const submitTambah = async () => {
    if (!form.nama.trim() || submitting) return;
    setSubmitting(true);
    try {
      const numericId = Date.now().toString();
      let resolvedKategori: 'Indoor' | 'Outdoor' | 'Kebun' = 'Indoor';
      if (form.jenis === 'hias') resolvedKategori = 'Indoor';
      else if (form.jenis === 'sayuran' || form.jenis === 'buah') resolvedKategori = 'Kebun';
      else resolvedKategori = 'Outdoor';

      await tanamanStore.tambahAsync({
        id: numericId,
        nama: form.nama.trim(),
        jenis: form.jenis,
        kategori: resolvedKategori,
        status: 'terjadwal',
        nextWater: 'nw.berikutnyaBesok',
        photo: form.foto || undefined,
      });

      toast.success('Tanaman berhasil ditambahkan', {
        description: `${form.nama} telah tersimpan di Supabase.`,
      });
      setForm({ nama: '', jenis: 'hias', foto: '' });
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error('Gagal menambahkan tanaman ke database.');
    } finally {
      setSubmitting(false);
    }
  };

  const onPickFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, foto: reader.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{ts("tambah")}</DialogTitle>
            <DialogDescription>{ts("detailBaru")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama-tanaman">{ts("namaTanaman")}</Label>
              <Input
                id="nama-tanaman"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder={ts("cthTanaman")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jenis-tanaman">{ts("jenisTanaman")}</Label>
              <Select value={form.jenis} onValueChange={(v) => setForm({ ...form, jenis: v })}>
                <SelectTrigger id="jenis-tanaman" className="w-full">
                  <SelectValue placeholder={ts("pilihJenis")} />
                </SelectTrigger>
                <SelectContent>
                  {jenisList.map((j) => (
                    <SelectItem key={j} value={j}>
                      {ts(j)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{ts("fotoTanaman")}</Label>
              <input type="file" accept="image/*" className="sr-only" id="foto-tanaman" onChange={onPickFoto} ref={fotoRef} />
              {form.foto ? (
                <div className="relative overflow-hidden rounded-xl border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.foto} alt={ts("fotoTanaman")} className="aspect-[16/9] w-full object-cover" />
                  <div className="absolute right-2 top-2 flex gap-2">
                    <Button type="button" variant="outline" size="sm" className="h-8 rounded-full bg-card/90 px-3 text-xs" onClick={() => fotoRef.current?.click()}>
                      {ts("gantiFoto")}
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="h-8 rounded-full bg-card/90 px-3 text-xs" onClick={() => setForm((f) => ({ ...f, foto: '' }))}>
                      {ts("hapusFoto")}
                    </Button>
                  </div>
                </div>
              ) : (
                <label htmlFor="foto-tanaman" className="flex aspect-[16/9] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/40 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/40">
                  <ImagePlus className="h-8 w-8" aria-hidden="true" />
                  <span className="text-sm font-medium">{ts("pilihFoto")}</span>
                  <span className="text-xs">{ts("fotoHint")}</span>
                </label>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              {tc("batal")}
            </Button>
            <Button onClick={submitTambah} disabled={submitting || !form.nama.trim()}>
              {submitting ? 'Menyimpan...' : tc("simpan")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}
