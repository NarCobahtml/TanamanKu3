'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Droplets, Leaf, Plus, Search, SearchX } from 'lucide-react';
import { toast } from 'sonner';
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
  { id: 'monstera', nama: 'Monstera Deliciosa', species: 'Monstera deliciosa', kategori: 'Indoor', status: 'hari-ini', nextWater: 'Siram hari ini, sore', photo: '/figma-assets/plant-monstera.png' },
  { id: 'lidah-mertua', nama: 'Lidah Mertua', species: 'Sansevieria trifasciata', kategori: 'Indoor', status: 'terjadwal', nextWater: 'Siram berikutnya 3 hari lagi', photo: '/figma-assets/plant-sansevieria.png' },
  { id: 'karet', nama: 'Karet', species: 'Ficus elastica', kategori: 'Indoor', status: 'terlambat', nextWater: 'Terlewat 1 hari, segera siram', photo: '/figma-assets/leaf-macro.jpg' },
  { id: 'pothos', nama: 'Pothos', species: 'Epipremnum aureum', kategori: 'Indoor', status: 'terjadwal', nextWater: 'Siram berikutnya 2 hari lagi', photo: '/figma-assets/leaf2.jpg' },
  { id: 'calathea', nama: 'Calathea', species: 'Calathea orbifolia', kategori: 'Indoor', status: 'hari-ini', nextWater: 'Siram hari ini, pagi', photo: '/figma-assets/plant-calathea.jpg' },
  { id: 'tomat', nama: 'Tomat Cherry', species: 'Solanum lycopersicum', kategori: 'Kebun', status: 'terlambat', nextWater: 'Terlewat 2 hari, segera siram' },
  { id: 'cabai', nama: 'Cabai Rawit', species: 'Capsicum frutescens', kategori: 'Kebun', status: 'terjadwal', nextWater: 'Siram berikutnya besok', photo: '/figma-assets/forum-chili.png' },
  { id: 'melati', nama: 'Melati', species: 'Jasminum sambac', kategori: 'Outdoor', status: 'hari-ini', nextWater: 'Siram hari ini, pagi', photo: '/figma-assets/hero-plant2.jpg' },
];

const kategoriList: Array<'Semua' | Kategori> = ['Semua', 'Indoor', 'Outdoor', 'Kebun'];
const jenisList = ['Monstera', 'Sansevieria', 'Ficus', 'Pothos', 'Calathea', 'Tomat', 'Cabai', 'Melati'];

/* Status jangan color-only: selalu Badge + teks label. */
const statusSiramBadge: Record<StatusSiram, { label: string; className: string }> = {
  'hari-ini': { label: 'Hari ini', className: 'border-warning/30 bg-warning/10 text-warning' },
  terlambat: { label: 'Terlambat', className: 'border-destructive/30 bg-destructive/10 text-destructive' },
  terjadwal: { label: 'Terjadwal', className: '' },
};

function StatusSiramBadge({ status }: { status: StatusSiram }) {
  const s = statusSiramBadge[status];
  return (
    <Badge variant={status === 'terjadwal' ? 'secondary' : 'outline'} className={s.className}>
      {s.label}
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

/** Collection cell — photo as anchor, hairline card: image + info plate below. */
function TanamanCell({ t }: { t: Tanaman }) {
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
            {t.nextWater}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function TanamanPage() {
  const [query, setQuery] = useState('');
  const [kategori, setKategori] = useState<'Semua' | Kategori>('Semua');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nama: '', jenis: '', lokasi: '' });

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
    if (!form.nama.trim()) {
      toast.error('Nama tanaman wajib diisi');
      return;
    }
    toast.success(`"${form.nama.trim()}" ditambahkan ke Tanaman Saya`);
    setForm({ nama: '', jenis: '', lokasi: '' });
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        overline="Koleksi"
        title="Tanaman Saya"
        accent="Saya"
        description="Kelola koleksi tanaman dan jadwal penyiraman tiap tanaman — semua di satu tempat yang rapi."
        actions={
          <>
            {/* Watering ledger inline in the header — actionable summary */}
            <span className="hidden items-center gap-4 text-xs text-muted-foreground md:flex">
              <span>
                <strong className="tnum text-sm font-bold text-foreground">{counts.hariIni}</strong> siram hari ini
              </span>
              <span className="h-4 w-px bg-border" aria-hidden="true" />
              <span>
                <strong className="tnum text-sm font-bold text-destructive">{counts.terlambat}</strong> terlambat
              </span>
            </span>
            <Button className="btn-cta" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tambah Tanaman
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
              placeholder="Cari tanaman…"
              aria-label="Cari tanaman"
              className="rounded-xl border-border bg-card pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter kategori">
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
                {k}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Menampilkan <strong className="font-semibold text-foreground">{filtered.length}</strong> dari {counts.total} tanaman
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" aria-hidden="true" />}
          title="Tidak ada tanaman yang cocok"
          message="Coba kata kunci lain atau reset filter kategori."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery('');
                setKategori('Semua');
              }}
            >
              Reset pencarian
            </Button>
          }
        />
      ) : (
        <TkRevealClient>
        <Tabs defaultValue="grid">
          <div className="flex justify-end">
            <TabsList className="rounded-full border border-border bg-card p-1">
              <TabsTrigger value="grid" className="rounded-full px-3.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none after:hidden">Kartu</TabsTrigger>
              <TabsTrigger value="tabel" className="rounded-full px-3.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none after:hidden">Tabel</TabsTrigger>
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
                      <TableHead className="py-3.5 pl-5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Tanaman</TableHead>
                      <TableHead className="py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Kategori</TableHead>
                      <TableHead className="py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Kesehatan</TableHead>
                      <TableHead className="py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Status Siram</TableHead>
                      <TableHead className="hidden py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground md:table-cell">Jadwal Berikutnya</TableHead>
                      <TableHead className="py-3.5 pr-5 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                        <span className="sr-only">Aksi</span>
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
                          <Badge variant="outline">{t.kategori}</Badge>
                        </TableCell>
                        <TableCell>
                          <HealthStatus level={healthLevel(t)} />
                        </TableCell>
                        <TableCell>
                          <StatusSiramBadge status={t.status} />
                        </TableCell>
                        <TableCell className="hidden whitespace-normal text-muted-foreground md:table-cell">{t.nextWater}</TableCell>
                        <TableCell className="py-4 pr-5 text-right">
                          <Button variant="ghost" size="icon-sm" asChild>
                            <Link href={`/siram/${t.id}`} aria-label={`Lihat detail ${t.nama}`}>
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
            <DialogTitle>Tambah Tanaman</DialogTitle>
            <DialogDescription>Isi detail tanaman baru untuk koleksimu.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama-tanaman">Nama tanaman</Label>
              <Input
                id="nama-tanaman"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="cth. Monstera kecil"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jenis-tanaman">Jenis</Label>
              <Select value={form.jenis} onValueChange={(v) => setForm({ ...form, jenis: v })}>
                <SelectTrigger id="jenis-tanaman" className="w-full">
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  {jenisList.map((j) => (
                    <SelectItem key={j} value={j}>
                      {j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lokasi-tanaman">Lokasi</Label>
              <Input
                id="lokasi-tanaman"
                value={form.lokasi}
                onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                placeholder="cth. Rak jendela"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={submitTambah}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>

      <PageCtaBand
        heading="Tanaman baru menunggu dirawat?"
        accent="dirawat"
        description="Tambahkan ke koleksi, atur jadwal penyiramannya, biarkan sisanya kami pantau."
        primary={{ href: '/scan', label: 'Scan Tanaman' }}
        secondary={{ href: '/forum', label: 'Tanya Komunitas' }}
      />
    </div>
  );
}
