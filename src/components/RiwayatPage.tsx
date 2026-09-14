'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileDown, ScanLine, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/PageHeader';
import { HealthStatus, type HealthLevel } from '@/components/HealthStatus';
import { EmptyState } from '@/components/EmptyState';
import { PageCtaBand } from '@/components/PageCtaBand';
import TkRevealClient from '@/components/landing/tk-reveal-client';
import { toast } from 'sonner';

type Status = 'sehat' | 'terinfeksi';

const scans = [
  { id: 1, plant: 'Cabai Rawit', disease: 'Busuk Daun (Phytophthora)', date: '01.09.2026', accuracy: 94, status: 'terinfeksi' as Status, photo: '/figma-assets/forum-chili.png' },
  { id: 2, plant: 'Tomat Cherry', disease: 'Sehat, tidak ada gejala', date: '30.08.2026', accuracy: 98, status: 'sehat' as Status, photo: undefined },
  { id: 3, plant: 'Monstera Deliciosa', disease: 'Sehat, tidak ada gejala', date: '27.08.2026', accuracy: 96, status: 'sehat' as Status, photo: '/figma-assets/plant-monstera.png' },
  { id: 4, plant: 'Lidah Mertua', disease: 'Bercak Bakteri (Xanthomonas)', date: '25.08.2026', accuracy: 91, status: 'terinfeksi' as Status, photo: '/figma-assets/plant-sansevieria.png' },
  { id: 5, plant: 'Calathea Orbifolia', disease: 'Sehat, tidak ada gejala', date: '22.08.2026', accuracy: 97, status: 'sehat' as Status, photo: '/figma-assets/plant-calathea.jpg' },
];

const filters = [
  { id: 'semua', name: 'Semua' },
  { id: 'sehat', name: 'Sehat' },
  { id: 'terinfeksi', name: 'Terinfeksi' },
];

const statusLevel: Record<Status, HealthLevel> = { sehat: 'sehat', terinfeksi: 'penyakit' };

const sehatCount = scans.filter((s) => s.status === 'sehat').length;
const infectedCount = scans.length - sehatCount;

export default function RiwayatPage() {
  const [filter, setFilter] = useState('semua');
  const [loading] = useState(false); // ponytail: flip true to preview skeleton state

  const rows = filter === 'semua' ? scans : scans.filter((s) => s.status === filter);

  return (
    <div>
      <PageHeader
        overline="Diagnosis"
        title="Riwayat Scan"
        accent="Scan"
        description="Semua hasil diagnosis AI pada tanamanmu, terbaru duluan. Angka besar, garis tipis — laporan yang mudah dibaca ulang."
        actions={
          <>
            <Button asChild className="btn-cta">
              <Link href="/scan">
                <ScanLine className="h-4 w-4" aria-hidden="true" />
                Scan Baru
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-border bg-card hover:bg-accent/60"
              onClick={() => toast.info('Riwayat diunduh (demo)')}
            >
              <FileDown className="h-4 w-4" aria-hidden="true" />
              Unduh
            </Button>
          </>
        }
      >
        {/* Stat readout — tnum medical report style */}
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <div>
            <p className="tnum text-4xl font-extrabold leading-none">{scans.length}</p>
            <p className="overline mt-2">Total scan</p>
          </div>
          <div>
            <p className="tnum text-4xl font-extrabold leading-none text-success">{sehatCount}</p>
            <p className="overline mt-2">Sehat</p>
          </div>
          <div>
            <p className="tnum text-4xl font-extrabold leading-none text-destructive">{infectedCount}</p>
            <p className="overline mt-2">Terinfeksi</p>
          </div>
        </div>
      </PageHeader>

      <div className="mx-auto w-full max-w-7xl space-y-16 px-4 pb-4 pt-14 sm:px-6">
        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter status">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={
                filter === f.id
                  ? 'rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground'
                  : 'rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/60 hover:text-primary'
              }
            >
              {f.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-border">
            <EmptyState
              icon={<SearchX className="h-6 w-6" aria-hidden="true" />}
              title="Belum ada scan"
              message={
                filter === 'semua'
                  ? 'Hasil scan AI akan tersimpan otomatis di sini.'
                  : `Belum ada scan dengan status ${filter}.`
              }
              action={
                <Button asChild size="sm">
                  <Link href="/scan">Mulai Scan</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <TkRevealClient>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-secondary/50 hover:bg-secondary/50">
                    <TableHead className="pl-4 pt-3.5 pb-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground sm:pl-6">Tanaman</TableHead>
                    <TableHead className="pt-3.5 pb-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Diagnosis</TableHead>
                    <TableHead className="hidden pt-3.5 pb-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground md:table-cell">Tanggal</TableHead>
                    <TableHead className="pt-3.5 pb-3.5 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Keyakinan</TableHead>
                    <TableHead className="pr-4 pt-3.5 pb-3.5 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground sm:pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((s) => (
                    <TableRow key={s.id} className="border-border transition-colors hover:bg-secondary">
                      <TableCell className="py-4 pl-4 sm:pl-6">
                        <span className="flex items-center gap-3">
                          {s.photo ? (
                            <img
                              src={s.photo}
                              alt={`Foto ${s.plant}`}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                              <ScanLine className="h-4 w-4" aria-hidden="true" />
                            </span>
                          )}
                          <span className="font-medium">{s.plant}</span>
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[220px] whitespace-normal text-muted-foreground">{s.disease}</TableCell>
                      <TableCell className="tnum hidden whitespace-nowrap text-muted-foreground md:table-cell">{s.date}</TableCell>
                      <TableCell className="tnum text-right font-semibold">{s.accuracy}%</TableCell>
                      <TableCell className="pr-4 pt-4 pb-4 text-right sm:pr-6">
                        <HealthStatus
                          level={statusLevel[s.status]}
                          label={s.status === 'sehat' ? 'Sehat' : 'Terinfeksi'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="rounded-b-xl border-t border-border bg-secondary/30 px-4 py-3 text-xs text-muted-foreground sm:px-6">
                Menampilkan {rows.length} dari {scans.length} scan · Data demo
              </p>
            </div>
          </TkRevealClient>
        )}
      </div>

      <PageCtaBand
        heading="Tanaman lain menunggu diperiksa"
        accent="diperiksa"
        description="Satu foto daun cukup untuk diagnosis 30+ jenis penyakit."
        primary={{ href: '/scan', label: 'Scan Sekarang' }}
        secondary={{ href: '/siram', label: 'Lihat Tanaman Saya' }}
      />
    </div>
  );
}
