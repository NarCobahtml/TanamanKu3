'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  Info,
  Pencil,
  Sparkles,
  Sun,
  Sunset,
  Trash2,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import TkRevealClient from '@/components/landing/tk-reveal-client';
import { useTanamanList, tanamanStore } from '@/features/plants/tanaman-store';
import EditTanamanDialog from '@/features/plants/EditTanamanDialog';
import HapusTanamanDialog from '@/features/plants/HapusTanamanDialog';

/* Data bersama, konten SAMA untuk desktop & mobile (sumber: tumbuhkita #1) */
const weatherNum = { temp: '27°C', tempRange: '27°C / 26°C', sunset: '17:30', humidity: '53%' };

type SlotStatus = 'optimal' | 'moderate' | 'unfavourable';
const timeSlots: Array<{ time: string; status: SlotStatus }> = [
  { time: 'Now', status: 'unfavourable' },
  { time: '4 PM', status: 'unfavourable' },
  { time: '5 PM', status: 'unfavourable' },
  { time: '6 PM', status: 'moderate' },
  { time: '7 PM', status: 'optimal' },
];

const forecast: Array<{ day: string; temp: string; icon: LucideIcon }> = [
  { day: 'sel', temp: '27°C', icon: CloudSun },
  { day: 'rab', temp: '27°C', icon: CloudSun },
  { day: 'kam', temp: '27°C', icon: Cloud },
  { day: 'jum', temp: '27°C', icon: CloudRain },
  { day: 'sab', temp: '27°C', icon: CloudRain },
  { day: 'min', temp: '26°C', icon: Cloud },
  { day: 'sen', temp: '28°C', icon: Sun },
];

const slotVisual: Record<SlotStatus, { icon: LucideIcon; chip: string; text: string }> = {
  optimal: { icon: Check, chip: 'border-primary/30 bg-primary/10', text: 'text-primary' },
  moderate: { icon: AlertTriangle, chip: 'border-ink/15 bg-ink/10', text: 'text-ink/70' },
  unfavourable: { icon: X, chip: 'border-destructive/30 bg-destructive/10', text: 'text-destructive' },
};

export default function SiramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations('siram');
  const tc = useTranslations('common');
  const tanamanList = useTanamanList();
  const plant = tanamanList.find((x) => x.id === id) ?? tanamanStore.getById(id) ?? tanamanList[0];

  const [sudahDisiram, setSudahDisiram] = useState(false);
  const [notifOn, setNotifOn] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [hapusOpen, setHapusOpen] = useState(false);

  if (!plant) {
    return null;
  }

  return (
    <>
      {/* ============ Desktop, layout t3, konten mobile ============ */}
      <div className="hidden lg:block">
        <AppShell>
          <div>
            {/* SUB-HERO, breadcrumb + identitas + CTA */}
            <header className="sage-wash border-b border-border">
              <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14">
                <nav
                  aria-label="Breadcrumb"
                  className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  <Link href="/siram" className="transition-colors hover:text-foreground">
                    {t("tanamanSaya")}
                  </Link>
                  <span aria-hidden="true">/</span>
                  <span className="normal-case tracking-normal text-foreground">{plant.nama}</span>
                </nav>

                <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
                  <div>
                    <p className="overline">{tc("penyiraman")}</p>
                    <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-5xl">
                      <span className="font-playfair">{plant.nama.split(' ')[0]}</span>{' '}
                      {plant.nama.split(' ').slice(1).join(' ')}
                    </h1>
                    <p className="mt-4 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                      <Sun className="h-4 w-4 text-primary" aria-hidden="true" />
                      {weatherNum.temp} · {t("hariIniLokasi")}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="bg-card">
                        {plant.kategori}
                      </Badge>
                      <Badge variant="outline" className="bg-card">
                        {t("kondisiSaatIni", { status: t("kurangMendukung") })}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end lg:pb-1.5">
                    <Button
                      className="btn-cta rounded-full px-6 cursor-pointer"
                      onClick={() => setSudahDisiram(true)}
                      disabled={sudahDisiram}
                    >
                      <Droplets className="h-4 w-4" aria-hidden="true" />
                      {sudahDisiram ? t('sudahDisiram') : t('tandai')}
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full bg-card hover:bg-accent/60 cursor-pointer"
                      onClick={() => setEditOpen(true)}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      {tc("edit")}
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full bg-card text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                      onClick={() => setHapusOpen(true)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      {tc("hapus")}
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            {/* BODY, dua kolom editorial: cuaca+AI+waktu kiri | prediksi sticky kanan */}
            <div className="mx-auto grid w-full max-w-7xl gap-16 px-4 py-14 sm:px-6 lg:grid-cols-[1.5fr_1fr]">
              <div className="min-w-0 space-y-16">
                {/* Kondisi Cuaca */}
                <TkRevealClient>
                  <div className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
                    <h2 className="border-b border-border px-6 py-4 text-sm font-bold">{t("kondisiCuaca")}</h2>
                    <div className="flex flex-wrap items-end justify-between gap-6 px-6 py-6">
                      <div>
                        <p className="text-5xl font-extrabold tracking-tight">{weatherNum.temp}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{weatherNum.tempRange}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-6 text-sm">
                        <span className="flex items-center gap-2">
                          <Sunset className="h-4 w-4 text-primary" aria-hidden="true" />
                          Sunset {weatherNum.sunset}
                        </span>
                        <span className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-primary" aria-hidden="true" />
                          {weatherNum.humidity}
                        </span>
                      </div>
                    </div>
                  </div>
                </TkRevealClient>

                {/* AI Summary */}
                <section aria-labelledby="ai-summary">
                  <h2 id="ai-summary" className="text-3xl font-extrabold tracking-tight">
                    {t("aiSummary")}
                  </h2>
                  <TkRevealClient>
                    <div className="mt-8 rounded-xl border-l-2 border-primary bg-accent p-6">
                      <h3 className="flex items-center gap-2 font-bold tracking-tight">
                        <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                        {t("rekomendasiSiram")}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                        {t("aiSummaryText")}{' '}
                        <span className="font-semibold text-foreground">
                          {t("aiSaran")}
                        </span>
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                        <span className="text-sm text-muted-foreground">{t("notifikasiHarian")}</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={notifOn}
                          aria-label={t("notifikasiHarianAria")}
                          onClick={() => setNotifOn((v) => !v)}
                          className={cn(
                            'relative h-6 w-12 rounded-full transition-colors cursor-pointer',
                            notifOn ? 'bg-primary' : 'bg-muted border border-border',
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all',
                              notifOn ? 'left-6.5' : 'left-0.5',
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  </TkRevealClient>
                </section>

                {/* Waktu Siram & Semprot */}
                <section aria-labelledby="waktu-siram">
                  <h2 id="waktu-siram" className="text-3xl font-extrabold tracking-tight">
                    {t("waktuSiram")}
                  </h2>
                  <TkRevealClient>
                    <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
                      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
                        <div>
                          <h3 className="text-sm font-bold">{t("slotHariIni")}</h3>
                          <p className="text-xs text-muted-foreground">{t("berdasarkanCuaca")}</p>
                        </div>
                        <button
                          type="button"
                          aria-label={t("infoWaktu")}
                          className="grid size-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent/60"
                        >
                          <Info className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="px-6 py-6">
                        <div className="grid grid-cols-5 gap-3">
                          {timeSlots.map((slot) => {
                            const v = slotVisual[slot.status];
                            const Icon = v.icon;
                            return (
                              <div
                                key={slot.time === "Now" ? t("now") : slot.time}
                                className={cn(
                                  'flex flex-col items-center gap-2 rounded-lg border px-2 py-4',
                                  v.chip,
                                )}
                              >
                                <Icon className={cn('h-4 w-4', v.text)} aria-hidden="true" />
                                <span className="text-xs font-semibold">{slot.time === "Now" ? t("now") : slot.time}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-border pt-4 text-xs text-muted-foreground">
                          {(Object.keys(slotVisual) as SlotStatus[]).map((k) => {
                            const v = slotVisual[k];
                            const Icon = v.icon;
                            return (
                              <span key={k} className="flex items-center gap-1.5">
                                <Icon className={cn('h-3.5 w-3.5', v.text)} aria-hidden="true" />
                                {t(k)}
                              </span>
                            );
                          })}
                          <button
                            type="button"
                            className="ml-auto font-medium text-primary transition-colors hover:text-primary/80"
                          >
                            {t("pelajari")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </TkRevealClient>
                </section>
              </div>

              {/* Aside sticky, prediksi 7 hari + CTA */}
              <aside className="min-w-0">
                <div className="space-y-6 lg:sticky lg:top-24">
                  <div className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
                    <h3 className="border-b border-border px-6 py-4 text-sm font-bold">{t("prediksi7")}</h3>
                    <ol className="divide-y divide-border">
                      {forecast.map((f) => {
                        const Icon = f.icon;
                        return (
                          <li key={f.day} className="flex items-center justify-between px-6 py-3.5">
                            <span className="w-10 text-sm font-semibold">{t(f.day)}</span>
                            <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                            <span className="tnum w-14 text-right text-sm font-medium">{f.temp}</span>
                          </li>
                        );
                      })}
                    </ol>
                  </div>

                  <div className="ink-panel rounded-xl p-6">
                    <h3 className="font-bold tracking-tight">{t("sudahMenyiram")}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                      {sudahDisiram
                        ? t('jadwalSelesai')
                        : t('jadwalHariIniSelesai')}
                    </p>
                    <Button
                      className="mt-5 w-full rounded-full border-white/20 bg-white text-[#123526] hover:bg-white/90 cursor-pointer"
                      onClick={() => setSudahDisiram(true)}
                      disabled={sudahDisiram}
                    >
                      <Droplets className="h-4 w-4" aria-hidden="true" />
                      {sudahDisiram ? t('sudahDisiram') : t('tandaiSelesai')}
                    </Button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </AppShell>
      </div>

      {/* ============ Mobile, dari tumbuhkita #1 (tidak berubah) ============ */}
      <div className="app-shell watering-detail pb-36 lg:hidden bg-background text-foreground">
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button className="result-back-button p-1 text-muted-foreground hover:text-foreground" onClick={() => router.push('/siram')} aria-label={tc("kembali")}>
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold truncate">{plant.nama}</h1>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                aria-label={`Edit ${plant.nama}`}
                className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setHapusOpen(true)}
                aria-label={`Hapus ${plant.nama}`}
                className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="app-container watering-main px-4 py-4 space-y-4">
          {/* Weather Card */}
          <div className="siram-section weather-section rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground mb-2">{t("hariIniLokasi")}</p>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-5xl font-bold">{weatherNum.temp}</p>
                <p className="text-muted-foreground text-sm">{weatherNum.tempRange}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-5 h-5" src="/figma-assets/icons-siram/siram-1.svg" alt="" />
                <span>{t("sunset")} {weatherNum.sunset}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-5 h-5" src="/figma-assets/icons-siram/siram-6.svg" alt="" />
                <span>{weatherNum.humidity}</span>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="siram-section rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="w-5 h-5" src="/figma-assets/icons-siram/siram-9.svg" alt="" />
              <h2 className="font-bold text-primary">{t("aiSummary")}</h2>
            </div>
            <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
              {t('aiSummaryText')}{' '}
              <span className="text-primary font-semibold">
                {t("aiSaran")}
              </span>
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">{t("notifikasiHarian")}</span>
              <button
                type="button"
                role="switch"
                aria-checked={notifOn}
                aria-label={t("aktifkanNotif")}
                onClick={() => setNotifOn(!notifOn)}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-colors cursor-pointer",
                  notifOn ? "bg-primary" : "bg-muted border border-border"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform",
                    notifOn ? "translate-x-6" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Watering Time */}
          <div className="siram-section rounded-xl border border-border bg-card p-4">
            <div className="watering-time-heading flex items-center justify-between mb-3">
              <div>
                <h2 className="font-bold">{t("waktuSiram")}</h2>
                <p className="text-xs text-muted-foreground">{t("berdasarkanCuaca")}</p>
              </div>
              <button className="watering-info-button p-1 text-muted-foreground" aria-label={t("infoWaktu")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/figma-assets/icons-siram/siram-5.svg" width="20" height="20" alt="" />
              </button>
            </div>

            <div className="watering-condition mb-4 p-2.5 rounded-lg bg-accent text-xs">
              <p>
                <span className="text-muted-foreground">{t("kondisiPrefix")} </span>
                <span className="font-semibold text-primary">{t("kurangMendukung")}</span>
              </p>
            </div>

            <div className="watering-slots grid grid-cols-5 gap-2 mb-4">
              {timeSlots.map((slot) => {
                const v = slotVisual[slot.status];
                const Icon = v.icon;
                return (
                  <div
                    key={slot.time === "Now" ? t("now") : slot.time}
                    className={cn(
                      "watering-slot aspect-square flex flex-col items-center justify-center gap-1 p-1 rounded-xl border text-center transition-colors",
                      v.chip
                    )}
                  >
                    <div className="watering-slot-icon">
                      <Icon className={cn("w-4 h-4 shrink-0", v.text)} aria-hidden="true" />
                    </div>
                    <span className="font-semibold text-[10.5px] sm:text-xs leading-none tracking-tight">
                      {slot.time === "Now" ? t("now") : slot.time}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="watering-legend flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
              <div className="flex items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/figma-assets/icons-siram/legend-optimal.svg" alt="" className="w-3.5 h-3.5" />
                <span>{t("optimal")}</span>
              </div>
              <div className="flex items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/figma-assets/icons-siram/legend-moderate.svg" alt="" className="w-3.5 h-3.5" />
                <span>{t("moderate")}</span>
              </div>
              <div className="flex items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/figma-assets/icons-siram/legend-bad.svg" alt="" className="w-3.5 h-3.5" />
                <span>{t("unfavourable")}</span>
              </div>
            </div>

            <button className="watering-learn-more text-sm text-primary font-medium mt-3">
              {t("pelajari")}
            </button>
          </div>

          {/* 7-Day Forecast */}
          <div className="forecast-section rounded-xl border border-border bg-card p-4">
            <h2 className="font-bold mb-3">{t("prediksi7")}</h2>
            <div className="forecast-list grid grid-cols-7 gap-1">
              {forecast.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.day} className="forecast-card flex flex-col items-center p-2 rounded-lg bg-accent/40 text-center text-xs">
                    <p className="font-medium text-muted-foreground">{t(f.day)}</p>
                    <Icon className="w-5 h-5 text-primary my-1" aria-hidden="true" />
                    <p className="font-bold">{f.temp}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Action Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border p-4 z-20">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setSudahDisiram(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              {sudahDisiram ? t("sudahDisiram") : t("sudahMenyiram")}
            </button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              {sudahDisiram ? t("jadwalSelesai") : t("jadwalHariIniSelesai")}
            </p>
          </div>
        </div>
      </div>

      {/* Edit and Delete Dialogs */}
      <EditTanamanDialog
        plant={plant}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <HapusTanamanDialog
        plant={plant}
        open={hapusOpen}
        onOpenChange={setHapusOpen}
        onDeleted={() => router.push('/siram')}
      />
    </>
  );
}
