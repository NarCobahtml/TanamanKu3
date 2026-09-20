'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FileDown, ScanLine, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/shared/PageHeader';
import { HealthStatus, type HealthLevel } from '@/components/shared/HealthStatus';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageCtaBand } from '@/components/shared/PageCtaBand';
import { FilterPill } from '@/components/ui/filter-pill';
import TkRevealClient from '@/components/shared/tk-reveal-client';

type Status = 'sehat' | 'terinfeksi';

const scans = [
  { id: 1, plant: 'Cabai Rawit', disease: 'Busuk Daun (Phytophthora)', date: '01.09.2026', accuracy: 94, status: 'terinfeksi' as Status, photo: '/figma-assets/plant-chili.jpg' },
  { id: 2, plant: 'Tomat Ceri', disease: 'Sehat, tidak ada gejala', date: '30.08.2026', accuracy: 98, status: 'sehat' as Status, photo: undefined },
  { id: 3, plant: 'Monstera Deliciosa', disease: 'Sehat, tidak ada gejala', date: '27.08.2026', accuracy: 96, status: 'sehat' as Status, photo: '/figma-assets/plant-monstera.png' },
  { id: 4, plant: 'Lidah Mertua', disease: 'Bercak Bakteri (Xanthomonas)', date: '25.08.2026', accuracy: 91, status: 'terinfeksi' as Status, photo: '/figma-assets/plant-lidahmertua.jpg' },
  { id: 5, plant: 'Calathea Orbifolia', disease: 'Sehat, tidak ada gejala', date: '22.08.2026', accuracy: 97, status: 'sehat' as Status, photo: '/figma-assets/plant-calathea-figma.jpg' },
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
  const tr = useTranslations('riwayat');
  const t = useTranslations('common');
  const [filter, setFilter] = useState('semua');
  const [loading] = useState(false); // ponytail: flip true to preview skeleton state

  const rows = filter === 'semua' ? scans : scans.filter((s) => s.status === filter);

  return (
    <div>
      <PageHeader
        overline={tr("overline")}
        title={tr("riwayatScan")}
        accent={tr("scanAccent")}
        description={tr("deskripsi")}
        actions={
          <>
            <Button asChild className="btn-cta">
              <Link href="/scan">
                <ScanLine className="h-4 w-4" aria-hidden="true" />
                {tr("scanBaru")}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-border bg-card hover:bg-accent/60"
              aria-label={tr("unduhRiwayat")}
            >
              <FileDown className="h-4 w-4" aria-hidden="true" />
              {t("unduh")}
            </Button>
          </>
        }
      >
        {/* Stat readout, tnum medical report style */}
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <div>
            <p className="tnum text-4xl font-extrabold leading-none">{scans.length}</p>
            <p className="overline mt-2">{tr("totalScan")}</p>
          </div>
          <div>
            <p className="tnum text-4xl font-extrabold leading-none text-success">{sehatCount}</p>
            <p className="overline mt-2">{t("sehat")}</p>
          </div>
          <div>
            <p className="tnum text-4xl font-extrabold leading-none text-destructive">{infectedCount}</p>
            <p className="overline mt-2">{t("terinfeksi")}</p>
          </div>
        </div>
      </PageHeader>

      <div className="mx-auto w-full max-w-7xl space-y-16 px-4 pb-24 pt-14 sm:px-6">
        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={tr("filterStatus")}>
          {filters.map((f) => (
            <FilterPill
              key={f.id}
              active={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {t(f.id)}
            </FilterPill>
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
              title={tr("belumAdaScan")}
              message={
                filter === 'semua'
                  ? tr('hasilOtomatis')
                  : tr("belumAdaFilter", { status: t(filter) })
              }
              action={
                <Button asChild size="sm">
                  <Link href="/scan">{tr("mulaiScan")}</Link>
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
                    <TableHead className="pl-4 pt-3.5 pb-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground sm:pl-6">{t("tanaman")}</TableHead>
                    <TableHead className="pt-3.5 pb-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t("diagnosis")}</TableHead>
                    <TableHead className="hidden pt-3.5 pb-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground md:table-cell">{t("tanggal")}</TableHead>
                    <TableHead className="pt-3.5 pb-3.5 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t("keyakinan")}</TableHead>
                    <TableHead className="pr-4 pt-3.5 pb-3.5 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground sm:pr-6">{t("status")}</TableHead>
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
                              alt={s.plant}
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
                          label={s.status === 'sehat' ? t('sehat') : t('terinfeksi')}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="rounded-b-xl border-t border-border bg-secondary/30 px-4 py-3 text-xs text-muted-foreground sm:px-6">
                {tr("menampilkan", { count: rows.length, total: scans.length })}
              </p>
            </div>
          </TkRevealClient>
        )}
      </div>

      <PageCtaBand
        heading={tr("tanamanMenunggu")}
        accent="diperiksa"
        description={tr("satuFotoCukup")}
        primary={{ href: '/scan', label: tr('scanSekarang') }}
        secondary={{ href: '/siram', label: t('lihatTanamanSaya') }}
      />
    </div>
  );
}
