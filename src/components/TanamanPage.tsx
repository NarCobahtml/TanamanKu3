'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Droplets, ImagePlus, Leaf, Plus, Search, SearchX } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/ui/badge';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HealthStatus, type HealthLevel } from '@/components/HealthStatus';
import { PageCtaBand } from '@/components/PageCtaBand';
import TkRevealClient from '@/components/landing/tk-reveal-client';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type Kategori = 'Indoor' | 'Outdoor' | 'Kebun';
type StatusSiram = 'hari-ini' | 'terlambat' | 'terjadwal';

export interface Tanaman {
  id: string;
  nama: string;
  species: string;
  kategori: Kategori;
  status: StatusSiram;
  nextWater: string;
  photo?: string;
}

export const tanamanList: Tanaman[] = [
  { id: 'monstera', nama: 'Monstera Deliciosa', species: 'Monstera deliciosa', kategori: 'Indoor', status: 'hari-ini', nextWater: 'nw.hariIniSore', photo: '/figma-assets/monstera.avif' },
  { id: 'lidah-mertua', nama: 'Lidah Mertua', species: 'Sansevieria trifasciata', kategori: 'Indoor', status: 'terjadwal', nextWater: 'nw.berikutnya3', photo: '/figma-assets/plant-lidahmertua.jpg' },
  { id: 'pisang', nama: 'Pisang', species: 'Musa paradisiaca', kategori: 'Outdoor', status: 'terlambat', nextWater: 'nw.terlewat1', photo: '/figma-assets/plant-bananaleaf.jpg' },
  { id: 'ceri', nama: 'Ceri', species: 'Prunus avium', kategori: 'Outdoor', status: 'terjadwal', nextWater: 'nw.berikutnya2', photo: '/figma-assets/plant-cherryleaf.jpg' },
  { id: 'calathea', nama: 'Calathea', species: 'Calathea orbifolia', kategori: 'Indoor', status: 'hari-ini', nextWater: 'nw.hariIniPagi', photo: '/figma-assets/plant-calathea-figma.jpg' },
  { id: 'tomat-ceri', nama: 'Tomat Ceri', species: 'Solanum lycopersicum var. cerasiforme', kategori: 'Kebun', status: 'terlambat', nextWater: 'nw.terlewat2', photo: '/figma-assets/plant-tomat-chery.jpg' },
  { id: 'cabai', nama: 'Cabai Rawit', species: 'Capsicum frutescens', kategori: 'Kebun', status: 'terjadwal', nextWater: 'nw.berikutnyaBesok', photo: '/figma-assets/plant-chili.jpg' },
  { id: 'melati', nama: 'Melati', species: 'Jasminum sambac', kategori: 'Outdoor', status: 'hari-ini', nextWater: 'nw.hariIniPagi', photo: '/figma-assets/plant-melati.jpg' },
];

const kategoriList: Array<'Semua' | Kategori> = ['Semua', 'Indoor', 'Outdoor', 'Kebun'];
const jenisList = ['hias', 'sayuran', 'buah', 'obat', 'umbi'] as const;

/* Status jangan color-only: selalu Badge + teks label. */
const statusSiramBadge: Record<StatusSiram, { label: string; className: string }> = {
  'hari-ini': { label: 'hariIni', className: 'border-warning/30 bg-warning/10 text-warning' },
  terlambat: { label: 'terlambat', className: 'border-destructive/30 bg-destructive/10 text-destructive' },
  terjadwal: { label: 'terjadwal', className: '' },
};

function StatusSiramBadge({ status }: { status: StatusSiram }) {
  const ts = useTranslations('siram');
  const s = statusSiramBadge[status];
  return (
    <Badge variant={status === 'terjadwal' ? 'secondary' : 'outline'} className={s.className}>
      {ts(s.label)}
    </Badge>
  );
}

function healthLevel(t: Tanaman): HealthLevel {
  return t.status === 'terlambat' ? 'perhatian' : 'sehat';
}

function PlantThumb({ t, className }: { t: Tanaman; className?: string }) {
  return t.photo ? (
    <img src={t.photo} alt={t.nama} className={cn('h-10 w-10 rounded-sm object-cover', className)} />
  ) : (
    <span className={cn('flex h-10 w-10 items-center justify-center bg-accent', className)} aria-hidden="true">
      <Leaf className="size-5 text-primary/40" />
    </span>
  );
}

/** Collection cell, photo as anchor, hairline card: image + info plate below. */
function TanamanCell({ t }: { t: Tanaman }) {
  const ts = useTranslations('siram');
  return (
    <Link
      href={`/siram/${t.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-primary/40 hover:bg-accent/30"
    >
      {t.photo ? (
        <img
          src={t.photo}
          alt={t.nama}
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-accent" aria-hidden="true">
          <Leaf className="size-10 text-primary/40" />
        </div>
      )}
      <div className="space-y-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold leading-tight">{t.nama}</h3>
            <p className="text-xs italic text-muted-foreground">{t.species}</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <StatusSiramBadge status={t.status} />
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
            {ts(t.nextWater)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function TanamanPage() {
  const ts = useTranslations('siram');
  const tc = useTranslations('common');
  const [query, setQuery] = useState('');
  const [kategori, setKategori] = useState<'Semua' | Kategori>('Semua');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nama: '', jenis: '', foto: '' });
  const fotoRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tanamanList.filter(
      (t) =>
        (kategori === 'Semua' || t.kategori === kategori) &&
        (q === '' || t.nama.toLowerCase().includes(q) || t.species.toLowerCase().includes(q)),
    );
  }, [query, kategori]);

  const counts = useMemo(
    () => ({
      total: tanamanList.length,
      terlambat: tanamanList.filter((t) => t.status === 'terlambat').length,
      hariIni: tanamanList.filter((t) => t.status === 'hari-ini').length,
    }),
    [],
  );

  const submitTambah = () => {
    if (!form.nama.trim()) return;
    setForm({ nama: '', jenis: '', foto: '' });
    setOpen(false);
  };

  const onPickFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, foto: reader.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <PageHeader
        overline={ts("koleksi")}
        title={ts("tanamanSaya")}
        accent={ts("saya")}
        description={ts("deskripsi")}
        actions={
          <>
            {/* Watering ledger inline in the header, actionable summary */}
            <span className="hidden items-center gap-4 text-xs text-muted-foreground md:flex">
              <span>
                <strong className="tnum text-sm font-bold text-foreground">{counts.hariIni}</strong> {ts("siramHariIni")} {ts("ini")}
              </span>
              <span className="h-4 w-px bg-border" aria-hidden="true" />
              <span>
                <strong className="tnum text-sm font-bold text-destructive">{counts.terlambat}</strong> {ts("terlambat")}
              </span>
            </span>
            <Button className="btn-cta" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {ts("tambah")}
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl space-y-12 px-4 pt-12 pb-4 sm:px-6">
      {/* Toolbar: search + filter kategori + view switch */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={ts("cari")}
              aria-label={ts("cariAria")}
              className="rounded-xl border-border bg-card pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={ts("filterKategori")}>
            {kategoriList.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKategori(k)}
                aria-pressed={kategori === k}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  kategori === k
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-accent/60 hover:text-primary',
                )}
              >
                {k === "Semua" ? tc("semua") : tc(k.toLowerCase())}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {ts("menampilkan", { count: filtered.length, total: counts.total })}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" aria-hidden="true" />}
          title={ts("tidakAdaCocok")}
          message={ts("cobaKata")}
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery('');
                setKategori('Semua');
              }}
            >
              {ts("resetPencarian")}
            </Button>
          }
        />
      ) : (
        <TkRevealClient>
        <Tabs defaultValue="grid">
          <div className="flex justify-end">
            <TabsList className="rounded-full border border-border bg-card p-1">
              <TabsTrigger value="grid" className="rounded-full px-3.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none after:hidden">{ts("kartu")}</TabsTrigger>
              <TabsTrigger value="tabel" className="rounded-full px-3.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none after:hidden">{ts("tabel")}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((t) => (
                <div key={t.id}>
                  <TanamanCell t={t} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tabel">
            <div className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border bg-secondary/50 hover:bg-secondary/50">
                      <TableHead className="py-3.5 pl-5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{ts("tanamanKolom")}</TableHead>
                      <TableHead className="py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{ts("kategoriKolom")}</TableHead>
                      <TableHead className="py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{ts("kesehatanKolom")}</TableHead>
                      <TableHead className="py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{ts("statusSiram")}</TableHead>
                      <TableHead className="hidden py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground md:table-cell">{ts("jadwalBerikutnya")}</TableHead>
                      <TableHead className="py-3.5 pr-5 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                        <span className="sr-only">{ts("aksi")}</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((t) => (
                      <TableRow key={t.id} className="border-border transition-colors hover:bg-secondary">
                        <TableCell className="py-4 pl-5">
                          <span className="flex items-center gap-3">
                            <PlantThumb t={t} className="rounded-lg" />
                            <span>
                              <span className="block font-medium">{t.nama}</span>
                              <span className="block text-xs italic text-muted-foreground">{t.species}</span>
                            </span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{tc(t.kategori.toLowerCase())}</Badge>
                        </TableCell>
                        <TableCell>
                          <HealthStatus level={healthLevel(t)} />
                        </TableCell>
                        <TableCell>
                          <StatusSiramBadge status={t.status} />
                        </TableCell>
                        <TableCell className="hidden whitespace-normal text-muted-foreground md:table-cell">{ts(t.nextWater)}</TableCell>
                        <TableCell className="py-4 pr-5 text-right">
                          <Button variant="ghost" size="icon-sm" asChild>
                            <Link href={`/siram/${t.id}`} aria-label={`${ts("lihatDetail")} ${t.nama}`}>
                              <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </TkRevealClient>
      )}

      {/* Dialog tambah tanaman */}
      <Dialog open={open} onOpenChange={setOpen}>
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
            <Button variant="outline" onClick={() => setOpen(false)}>
              {tc("batal")}
            </Button>
            <Button onClick={submitTambah}>{tc("simpan")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>

      <PageCtaBand
        heading={ts("tanamanBaruMenunggu")}
        accent="dirawat"
        description={ts("tambahkanKoleksi")}
        primary={{ href: '/scan', label: tc('scanTanaman') }}
        secondary={{ href: '/forum', label: tc('tanyaKomunitas') }}
      />
    </div>
  );
}
