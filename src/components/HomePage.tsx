'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SectionHeader } from '@/components/shared/PageHeader';
import { HealthStatus, type HealthLevel } from '@/components/shared/HealthStatus';
import { PageCtaBand } from '@/components/shared/PageCtaBand';
import TkRevealClient from '@/components/landing/tk-reveal-client';
import {
  ScanLine,
  Droplets,
  Leaf,
  CircleCheck,
  Clock,
  TriangleAlert,
  ArrowRight,
  Camera,
  Bug,
  CalendarCheck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/layout/LocaleProvider';
import { useAuth } from '@/lib/use-auth';
import { tanamanList } from './TanamanPage';

/* ---- placeholder data (frontend-only, no backend) ---- */

type PlantHealth = { level: HealthLevel; lastScan: string };

const healthById: Record<string, PlantHealth> = {
  monstera: { level: 'sehat', lastScan: '27.08.2026' },
  'lidah-mertua': { level: 'penyakit', lastScan: '25.08.2026' },
  pisang: { level: 'sehat', lastScan: '02.09.2026' },
  ceri: { level: 'sehat', lastScan: '01.09.2026' },
  calathea: { level: 'sehat', lastScan: '22.08.2026' },
  'tomat-ceri': { level: 'penyakit', lastScan: '01.09.2026' },
  cabai: { level: 'sehat', lastScan: '30.08.2026' },
  melati: { level: 'sehat', lastScan: '28.08.2026' },
};

const recentScans = [
  { id: 1, plant: 'Tomat Ceri', disease: 'Early Blight (Alternaria solani)', confidence: 94, date: '01.09.2026', level: 'penyakit' as HealthLevel, photo: undefined },
  { id: 2, plant: 'Pisang', disease: 'Sehat, tidak ada gejala', confidence: 88, date: '02.09.2026', level: 'sehat' as HealthLevel, photo: '/figma-assets/plant-bananaleaf.jpg' },
  { id: 3, plant: 'Cabai Rawit', disease: 'Sehat, tidak ada gejala', confidence: 98, date: '30.08.2026', level: 'sehat' as HealthLevel, photo: '/figma-assets/plant-chili.jpg' },
  { id: 4, plant: 'Lidah Mertua', disease: 'Bercak Bakteri (Xanthomonas)', confidence: 91, date: '25.08.2026', level: 'penyakit' as HealthLevel, photo: '/figma-assets/plant-lidahmertua.jpg' },
  { id: 5, plant: 'Monstera Deliciosa', disease: 'Sehat, tidak ada gejala', confidence: 96, date: '27.08.2026', level: 'sehat' as HealthLevel, photo: '/figma-assets/plant-monstera.png' },
];

const wateringToday = [
  { time: '08:00', plant: 'Tomat Ceri', state: 'completed' as const },
  { time: '09:30', plant: 'Calathea', state: 'upcoming' as const },
  { time: '16:00', plant: 'Cabai Rawit', state: 'overdue' as const },
];

/* ---- derived health counts ---- */

const total = tanamanList.length;
const sehat = Object.values(healthById).filter((h) => h.level === 'sehat').length;
const penyakit = Object.values(healthById).filter((h) => h.level === 'penyakit').length;

export default function HomePage() {
  const t = useTranslations("home");
  const ts = useTranslations("siram");
  const { locale: lang } = useLocale();
  const { user } = useAuth();
  const heroPlant = tanamanList[0];
  const heroHealth = healthById[heroPlant.id] ?? { level: 'sehat' as HealthLevel, lastScan: '-' };

  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : 'Pekebun';

  return (
    <div>
      {/* ============ HERO BAND, sage wash editorial opening ============ */}
      <header className="sage-wash border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20">
          <p className="overline hero-anim hero-fade">{t("workspace")}</p>
          <h1
            className="hero-anim hero-fade mt-3 max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-6xl"
            style={{ animationDelay: '0.12s' }}
          >
            {t('welcomePrefix')}
            <span>, </span>
            <span className="font-playfair">{firstName}</span>.
          </h1>
          <p
            className="hero-anim hero-fade mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground"
            style={{ animationDelay: '0.26s' }}
          >
            {t("pantau")}
          </p>

          {/* vitals readout, medical-style tabular numbers */}
          <dl
            className="hero-anim hero-fade mt-12 grid grid-cols-3 gap-x-6 gap-y-8 sm:gap-10"
            style={{ animationDelay: '0.4s' }}
          >
            <div>
              <dt className="overline min-h-[2.5rem] sm:min-h-0">{t("tanamanDipantau")}</dt>
              <dd className="tnum mt-2 text-4xl font-extrabold leading-none md:text-5xl">{total}</dd>
            </div>
            <div>
              <dt className="overline min-h-[2.5rem] sm:min-h-0">{t("sehat")}</dt>
              <dd className="tnum mt-2 text-4xl font-extrabold leading-none text-success md:text-5xl">{sehat}</dd>
            </div>
            <div>
              <dt className="overline min-h-[2.5rem] sm:min-h-0">{t("terdeteksiPenyakit")}</dt>
              <dd className="tnum mt-2 text-4xl font-extrabold leading-none text-destructive md:text-5xl">{penyakit}</dd>
            </div>
          </dl>

          {/* proportional status bar */}
          <div
            className="hero-anim hero-fade mt-8 flex h-1.5 w-full overflow-hidden bg-muted"
            role="img"
            aria-label={`${sehat} ${t("sehat")}, ${penyakit} ${t("terdeteksiPenyakit")}`}
            style={{ animationDelay: '0.5s' }}
          >
            <span className="bg-[#7ed8a4]" style={{ width: `${(sehat / total) * 100}%` }} />
            <span className="bg-[#f09a90]" style={{ width: `${(penyakit / total) * 100}%` }} />
          </div>

          {/* primary detection CTA */}
          <div className="hero-anim hero-fade mt-10 flex flex-wrap items-center gap-3" style={{ animationDelay: '0.6s' }}>
            <Button asChild size="lg" className="btn-cta rounded-full px-7">
              <Link href="/scan">
                <ScanLine className="h-5 w-5" aria-hidden="true" />
                {t("scanTanaman")}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="gap-2 rounded-full border border-border bg-card px-7 hover:border-primary/40 hover:bg-accent/60 hover:text-primary"
            >
              <Link href="/siram">
                {t("kelolaTanaman")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ============ FEATURE STRIP, hero plant + quick actions ============ */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-16 sm:px-6" aria-label={t("tanamanUnggulan")}>
        <TkRevealClient>
          <div className="grid overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40 lg:grid-cols-[1fr_1fr]">
            <Link
              href={`/siram/${heroPlant.id}`}
              className="group relative block aspect-[16/10] w-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {heroPlant.photo ? (
                <img
                  src={heroPlant.photo}
                  alt={heroPlant.nama}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-accent" aria-hidden="true">
                  <Leaf className="size-12 text-primary/40" />
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent p-5 pt-12">
                <span className="min-w-0">
                  <span className="block font-bold text-white">{heroPlant.nama}</span>
                </span>
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  {t("lihatDetail")}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </span>
            </Link>

            <div className="flex flex-col">
              {/* Quick actions, detection first */}
              <div className="grid flex-1 grid-cols-3 divide-x divide-border">
                {[
                  { href: '/scan', icon: Camera, label: t('scanBaru') },
                  { href: '/riwayat', icon: Bug, label: t('diagnosis') },
                  { href: '/siram', icon: CalendarCheck, label: t('penyiraman') },
                ].map((q) => (
                  <Link
                    key={q.label}
                    href={q.href}
                    className="flex flex-col items-center justify-center gap-2 px-3 py-8 text-center transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:bg-accent/40"
                  >
                    <q.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                    <span className="text-sm font-semibold">{q.label}</span>
                  </Link>
                ))}
              </div>

              {/* Latest health note */}
              <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4 text-sm text-muted-foreground">
                <span>
                  {t("scanTerakhir")} <strong className="font-semibold text-foreground">{heroHealth.lastScan}</strong>
                </span>
                <HealthStatus level={heroHealth.level} />
              </div>
            </div>
          </div>
        </TkRevealClient>
      </section>

      {/* ============ MAIN CANVAS ============ */}
      <div className="mx-auto w-full max-w-7xl space-y-20 px-4 pb-4 pt-16 sm:px-6">
        {/* --- Recent diagnosis: structured report table + watering task rail --- */}
        <div className="grid min-w-0 gap-12 lg:grid-cols-[1.7fr_1fr]">
          <section aria-labelledby="scan-terakhir" className="min-w-0">
            <SectionHeader title={t("diagnosis")} href="/riwayat" />
            <TkRevealClient>
              <div className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
                {/* Mobile scan cards (< sm) */}
                <div className="divide-y divide-border sm:hidden">
                  {recentScans.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-3 p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        {s.photo ? (
                          <img src={s.photo} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                        ) : (
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                            <Leaf className="h-4 w-4" aria-hidden="true" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{s.plant}</p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">{s.disease}</p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <HealthStatus level={s.level} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Full table (>= sm) */}
                <div className="hidden overflow-x-auto sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border bg-secondary/50 hover:bg-secondary/50">
                        <TableHead className="py-4 pl-5 text-xs font-bold uppercase tracking-[0.08em] text-foreground">{t("tanaman")}</TableHead>
                        <TableHead className="py-4 text-xs font-bold uppercase tracking-[0.08em] text-foreground">{t("diagnosis")}</TableHead>
                        <TableHead className="hidden py-4 text-xs font-bold uppercase tracking-[0.08em] text-foreground sm:table-cell">{t("keyakinan")}</TableHead>
                        <TableHead className="hidden py-4 text-xs font-bold uppercase tracking-[0.08em] text-foreground md:table-cell">{t("tanggal")}</TableHead>
                        <TableHead className="py-4 pr-5 text-right text-xs font-bold uppercase tracking-[0.08em] text-foreground">{t("status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentScans.map((s) => (
                        <TableRow key={s.id} className="border-border transition-colors hover:bg-secondary">
                          <TableCell className="py-4 text-[15px]">
                            <span className="flex items-center gap-3">
                              {s.photo ? (
                                <img src={s.photo} alt="" className="h-9 w-9 rounded-lg object-cover" />
                              ) : (
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                                  <Leaf className="h-4 w-4" aria-hidden="true" />
                                </span>
                              )}
                              <span className="font-medium">{s.plant}</span>
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[200px] whitespace-normal text-[15px] text-foreground/80">{s.disease}</TableCell>
                          <TableCell className="tnum hidden text-[15px] font-semibold sm:table-cell">{s.confidence}%</TableCell>
                          <TableCell className="tnum hidden whitespace-nowrap text-[15px] font-medium md:table-cell">{s.date}</TableCell>
                          <TableCell className="py-4 pr-5 text-right">
                            <HealthStatus level={s.level} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="border-t border-border bg-secondary/30 px-5 py-3 text-sm text-muted-foreground">
                  {t("laporan30")}
                </p>
              </div>
            </TkRevealClient>
          </section>

          {/* Watering: task list on sage wash block */}
          <section aria-labelledby="penyiraman-hari-ini" className="min-w-0">
            <TkRevealClient>
              <div className="sage-wash rounded-xl border border-border p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 id="penyiraman-hari-ini" className="flex items-center gap-2 text-base font-bold tracking-tight sm:text-lg">
                    <Droplets className="h-5 w-5 text-primary" aria-hidden="true" />
                    {t("penyiramanHariIni")}
                  </h2>
                  <Link href="/siram" className="shrink-0 text-sm font-medium text-primary hover:underline">
                    {t("jadwal")}
                  </Link>
                </div>
                <ol className="divide-y divide-border rounded-xl border border-border bg-card">
                  {wateringToday.map((w) => {
                    const meta = {
                      completed: { label: t('selesai'), icon: CircleCheck, cls: 'text-success' },
                      upcoming: { label: t('akanDatang'), icon: Clock, cls: 'text-muted-foreground' },
                      overdue: { label: t('terlewat'), icon: TriangleAlert, cls: 'text-destructive' },
                    }[w.state];
                    return (
                      <li key={w.time + w.plant} className="flex items-center justify-between gap-3 p-3.5 transition-colors hover:bg-secondary/60 sm:px-5 sm:py-4">
                        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                          <span className="tnum w-11 shrink-0 text-xs font-bold sm:w-12 sm:text-sm">{w.time}</span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{w.plant}</p>
                            <p className="text-xs text-muted-foreground sm:text-sm">{t("penyiraman")}</p>
                          </div>
                        </div>
                        <span className={'flex shrink-0 items-center gap-1.5 text-xs font-semibold sm:text-sm ' + meta.cls}>
                          <meta.icon className="h-4 w-4" aria-hidden="true" />
                          {meta.label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
                <Button asChild variant="outline" className="mt-4 w-full rounded-full bg-card hover:bg-accent/60">
                  <Link href="/siram">{t("bukaJadwal")}</Link>
                </Button>
              </div>
            </TkRevealClient>
          </section>
        </div>

        {/* --- Plant collection: photo grid with key line --- */}
        <section aria-labelledby="tanaman-saya" className="rule pt-14">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="overline">{t("koleksi")}</p>
              <h2 id="tanaman-saya" className="mt-1.5 text-3xl font-extrabold tracking-tight md:text-4xl">
                {t("tanaman")} <span className="font-playfair">{t("saya")}</span>
              </h2>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-full bg-card hover:bg-accent/60">
              <Link href="/siram">
                {t("kelolaSemua")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <TkRevealClient>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {tanamanList.slice(0, 8).map((plant) => {
                const h = healthById[plant.id] ?? { level: 'sehat' as HealthLevel, lastScan: '-' };
                return (
                  <Link
                    key={plant.id}
                    href={`/siram/${plant.id}`}
                    className="group block overflow-hidden rounded-xl border border-border bg-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-primary/40 hover:bg-accent/30"
                  >
                    {plant.photo ? (
                      <img
                        src={plant.photo}
                        alt={plant.nama}
                        className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex aspect-[4/3] w-full items-center justify-center bg-accent" aria-hidden="true">
                        <Leaf className="size-10 text-primary/40" />
                      </div>
                    )}
                    <div className="space-y-2 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-bold leading-tight">{plant.nama}</h3>
                        </div>
                        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-sm text-foreground">
                          <Droplets className="h-4 w-4" aria-hidden="true" />
                          {ts(plant.nextWater)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80">{t("scanTerakhir")} {h.lastScan}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </TkRevealClient>
        </section>
      </div>

      <PageCtaBand
        heading={t("daunMencurigakan")}
        accent={lang === "id" ? "mencurigakan" : "suspicious"}
        description={t("cukupSatuFoto")}
        primary={{ href: '/scan', label: t('scanTanaman') }}
        secondary={{ href: '/forum', label: t('tanyaKomunitas') }}
      />
    </div>
  );
}
