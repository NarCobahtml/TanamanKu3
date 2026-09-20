'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  CalendarCheck,
  Droplets,
  Leaf,
  Pencil,
  ScanLine,
  Trash2,
} from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { HealthStatus, type HealthLevel } from '@/components/shared/HealthStatus';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import EditTanamanDialog from '@/components/EditTanamanDialog';
import HapusTanamanDialog from '@/components/HapusTanamanDialog';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import TkRevealClient from '@/components/landing/tk-reveal-client';
import { tanamanList } from './TanamanPage';
import { useLocale } from '@/components/layout/LocaleProvider';

// ponytail: hari & tanggal statis (frontend-only), ganti dengan data backend saat tersedia.
const HARI = ['sen', 'sel', 'rab', 'kam', 'jum', 'sab', 'min'];
const HARI_1 = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];
const TODAY_IDX = 2; // Rabu
const isWaterDay = (i: number) => i % 2 === 0;

const riwayatKesehatan: Array<{ tanggal: string; catatan: string; level: HealthLevel }> = [
  { tanggal: '02.09.2026', catatan: 'scanRutin', level: 'sehat' },
  { tanggal: '27.08.2026', catatan: 'tepiKuning', level: 'perhatian' },
  { tanggal: '20.08.2026', catatan: 'scanPertama', level: 'sehat' },
];

export default function TanamanDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const td = useTranslations('tanamanDetail');
  const ts = useTranslations('siram');
  const tc = useTranslations('common');
  const { locale } = useLocale();
  const [sudahDisiram, setSudahDisiram] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [hapusOpen, setHapusOpen] = useState(false);

  const t = tanamanList.find((x) => x.id === id);

  if (!t) {
    return (
      <EmptyState
        icon={<Leaf className="size-6" aria-hidden="true" />}
        title={td("tanamanTidakDitemukan")}
        message={td("mungkinDihapus")}
        action={
          <Button variant="outline" asChild>
            <Link href="/siram">{td("kembaliKoleksi")}</Link>
          </Button>
        }
      />
    );
  }

  const statusSiramLabel =
    sudahDisiram || t.status === 'terjadwal' ? ts('terjadwal') : t.status === 'hari-ini' ? ts('hariIni') : ts('terlambat');

  const infoTanaman: Array<{ label: string; value: string }> = [
    { label: td('kategori'), value: tc(t.kategori.toLowerCase()) },
    { label: td('lokasiRak'), value: td('rakJendela') },
    { label: td('frekuensiSiram'), value: td('frek2hari') },
    { label: td('scanTerakhir'), value: '02.09.2026' },
  ];

  const tandaiSiram = () => {
    setSudahDisiram(true);
  };

  return (
    <div>
      {/* ============ SUB-HERO, breadcrumb overline + specimen photo plate ============ */}
      <header className="sage-wash border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14">
          <nav
            aria-label="Breadcrumb"
            className="hero-anim hero-fade flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
          >
            <Link href="/siram" className="transition-colors hover:text-foreground">{ts("tanamanSaya")}</Link>
            <span aria-hidden="true">/</span>
            <span className="normal-case tracking-normal text-foreground">{t.nama}</span>
          </nav>

          <div className="hero-anim hero-fade mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end" style={{ animationDelay: '0.12s' }}>
            <div>
              <p className="overline">{td("profilTanaman")}</p>
              <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-5xl">
                <span className="font-playfair">{t.nama.split(' ')[0]}</span> {t.nama.split(' ').slice(1).join(' ')}
              </h1>
              <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Droplets className="h-4 w-4 text-primary" aria-hidden="true" />
                {sudahDisiram ? td('sudahDisiram') : ts(t.nextWater)}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-card">{tc(t.kategori.toLowerCase())}</Badge>
                <HealthStatus level={t.status === 'terlambat' ? 'perhatian' : 'sehat'} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end lg:pb-1.5">
              <Button className="btn-cta rounded-full px-6" onClick={tandaiSiram} disabled={sudahDisiram}>
                <Droplets className="h-4 w-4" aria-hidden="true" />
                {sudahDisiram ? ts('sudahDisiram') : td('tandaiSiram')}
              </Button>
              <Button
                variant="outline"
                className="rounded-full bg-card hover:bg-accent/60"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                {tc("edit")}
              </Button>
              <Button variant="outline" className="rounded-full bg-card text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setHapusOpen(true)}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {tc("hapus")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ============ BODY, editorial two-column: photo+timeline kiri | sticky aside kanan ============ */}
      <div className="mx-auto grid w-full max-w-7xl gap-16 px-4 py-14 sm:px-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Left: specimen plate + health timeline */}
        <div className="min-w-0 space-y-16">
          <TkRevealClient>
            <div className="relative overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
              {t.photo ? (
                <img src={t.photo} alt={t.nama} className="aspect-[16/10] w-full object-cover" />
              ) : (
                <div className="flex aspect-[16/10] w-full items-center justify-center bg-accent" aria-hidden="true">
                  <Leaf className="size-14 text-primary/40" />
                </div>
              )}
            </div>
          </TkRevealClient>

          <section aria-labelledby="riwayat-kesehatan">
            <h2 id="riwayat-kesehatan" className="text-3xl font-extrabold tracking-tight">
              {td("riwayat")} <span className="font-playfair">{td("kesehatan")}</span>
            </h2>
            <TkRevealClient>
              <ol className="mt-8 space-y-0 border-l border-border pl-6">
                {riwayatKesehatan.map((r) => (
                  <li key={r.tanggal} className="relative pb-9 last:pb-0">
                    <span className="absolute -left-[31px] top-0.5 grid size-2.5 place-items-center rounded-full bg-primary ring-4 ring-background" aria-hidden="true" />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{td(r.catatan)}</p>
                        <p className="tnum mt-0.5 text-xs text-muted-foreground">{r.tanggal}</p>
                      </div>
                      <HealthStatus level={r.level} />
                    </div>
                  </li>
                ))}
              </ol>
            </TkRevealClient>
          </section>
        </div>

        {/* Right: sticky info aside, hairline cards */}
        <aside className="min-w-0">
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
              <h3 className="border-b border-border px-6 py-4 text-sm font-bold">{td("informasiTanaman")}</h3>
              <dl className="divide-y divide-border">
                {infoTanaman.map((f) => (
                  <div key={f.label} className="flex items-baseline justify-between gap-4 px-6 py-3.5">
                    <dt className="text-sm text-muted-foreground">{f.label}</dt>
                    <dd className="text-right text-sm font-medium">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="ink-panel rounded-xl p-6" aria-labelledby="jadwal-siram">
              <div className="flex items-center justify-between gap-4">
                <h3 id="jadwal-siram" className="flex items-center gap-2 font-bold tracking-tight">
                  <CalendarCheck className="h-4 w-4 text-[#7ed8a4]" aria-hidden="true" />
                  {td("jadwalPenyiraman")}
                </h3>
                <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">{statusSiramLabel}</Badge>
              </div>
              <div
                className="mt-5 grid grid-cols-7 gap-1.5"
                role="img"
                aria-label={td("jadwal7", { today: ts(HARI[TODAY_IDX]), days: HARI.filter((_, i) => isWaterDay(i)).map((d) => ts(d)).join(", ") })}
              >
                {HARI.map((h, i) => (
                  <div
                    key={h}
                    className={cn(
                      'flex h-10 items-center justify-center rounded-md border text-xs font-medium',
                      i === TODAY_IDX
                        ? 'border-white bg-white font-bold text-[#123526]'
                        : isWaterDay(i)
                          ? 'border-white/40 bg-white/10 text-white'
                          : 'border-white/15 text-ink/15',
                    )}
                  >
                    <span aria-hidden="true">{HARI_1[i]}</span>
                    <span className="sr-only">{ts(h)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-white/70">
                {td("kotakTerisi")}
              </p>
            </div>

            <div className="rounded-xl border-l-2 border-primary bg-accent p-6" aria-labelledby="rekomendasi-ai">
              <h3 id="rekomendasi-ai" className="flex items-center gap-2 font-bold tracking-tight">
                <ScanLine className="h-4 w-4 text-primary" aria-hidden="true" />
                {td("rekomendasiAI")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                {td("rekText")}
              </p>
            </div>

            <div className="flex items-center gap-2 border-t border-border pt-4">
              <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
              <p className="text-xs text-muted-foreground">
                {td("dataPemantauan")}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Edit and Delete Dialogs */}
      <EditTanamanDialog
        plant={t}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <HapusTanamanDialog
        plant={t}
        open={hapusOpen}
        onOpenChange={setHapusOpen}
        onDeleted={() => router.push('/siram')}
      />
    </div>
  );
}
