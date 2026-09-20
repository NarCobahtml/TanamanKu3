'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Droplets,
  Info,
  Pencil,
  Sparkles,
  Sun,
  Sunset,
  Trash2,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import TkRevealClient from '@/components/shared/tk-reveal-client';
import type { Tanaman } from '@/features/plants';
import { weatherNum, timeSlots, forecast, slotVisual } from '../constants';
import type { SlotStatus } from '../types';

export interface SiramDesktopViewProps {
  plant: Tanaman;
  sudahDisiram: boolean;
  onSiram: () => void;
  notifOn: boolean;
  onToggleNotif: () => void;
  onEdit: () => void;
  onHapus: () => void;
}

export default function SiramDesktopView({
  plant,
  sudahDisiram,
  onSiram,
  notifOn,
  onToggleNotif,
  onEdit,
  onHapus,
}: SiramDesktopViewProps) {
  const t = useTranslations('siram');
  const tc = useTranslations('common');

  return (
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
                    onClick={onSiram}
                    disabled={sudahDisiram}
                  >
                    <Droplets className="h-4 w-4" aria-hidden="true" />
                    {sudahDisiram ? t('sudahDisiram') : t('tandai')}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full bg-card hover:bg-accent/60 cursor-pointer"
                    onClick={onEdit}
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    {tc("edit")}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full bg-card text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                    onClick={onHapus}
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
                        onClick={onToggleNotif}
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
                    onClick={onSiram}
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
  );
}
