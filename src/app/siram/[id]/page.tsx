'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  AlertTriangle,
  Check,
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  Info,
  Sparkles,
  Sun,
  Sunset,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SitePage from '@/components/SitePage';
import { tanamanList } from '@/components/TanamanPage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import TkRevealClient from '@/components/landing/tk-reveal-client';

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
  const t = useTranslations('siram');
  const tc = useTranslations('common');
  const plant = tanamanList.find((t) => t.id === id) ?? tanamanList[0];
  const [sudahDisiram, setSudahDisiram] = useState(false);
  const [notifOn, setNotifOn] = useState(false);

  return (
    <>
      {/* ============ Desktop, layout t3, konten mobile ============ */}
      <div className="hidden lg:block">
        <SitePage>
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
                    <p className="mt-2 text-base italic text-muted-foreground">{plant.species}</p>
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

                  <div className="flex flex-wrap gap-2 lg:justify-end lg:pb-1.5">
                    <Button
                      className="btn-cta rounded-full px-6"
                      onClick={() => setSudahDisiram(true)}
                      disabled={sudahDisiram}
                    >
                      <Droplets className="h-4 w-4" aria-hidden="true" />
                      {sudahDisiram ? t('sudahDisiram') : t('tandai')}
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
                            'relative h-6 w-12 rounded-full transition-colors',
                            notifOn ? 'bg-primary' : 'bg-ink/15',
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
                      className="mt-5 w-full rounded-full border-white/20 bg-white text-[#123526] hover:bg-white/90"
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
        </SitePage>
      </div>

      {/* ============ Mobile, dari tumbuhkita #1 (tidak berubah) ============ */}
      <div className="app-shell watering-detail pb-36 lg:hidden">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
            <button className="result-back-button" onClick={() => window.history.back()} aria-label={tc("kembali")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/figma-assets/icons-scan/back.svg" width="16" height="16" alt="" />
            </button>
            <h1 className="text-xl font-bold">{plant.nama}</h1>
          </div>
        </header>

        <main className="app-container watering-main">
          {/* Weather Card */}
          <div className="siram-section weather-section">
            <p className="text-sm text-gray-600 mb-2">{t("hariIniLokasi")}</p>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-5xl font-bold">{weatherNum.temp}</p>
                <p className="text-gray-600">{weatherNum.tempRange}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
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
          <div className="siram-section">
            <div className="flex items-center gap-2 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="w-5 h-5" src="/figma-assets/icons-siram/siram-9.svg" alt="" />
              <h2 className="font-bold text-[#1B5E20]">{t("aiSummary")}</h2>
            </div>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              {t('aiSummaryText')}{' '}
              <span className="text-[#1B5E20] font-semibold">
                {t("aiSaran")}
              </span>
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-700">{t("notifikasiHarian")}</span>
              <button className="w-12 h-6 bg-gray-200 rounded-full relative" aria-label={t("aktifkanNotif")}>
                <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
              </button>
            </div>
          </div>

          {/* Watering Time */}
          <div className="siram-section">
            <div className="watering-time-heading flex items-center justify-between">
              <div>
                <h2 className="font-bold">{t("waktuSiram")}</h2>
                <p className="text-xs text-gray-600">{t("berdasarkanCuaca")}</p>
              </div>
              <button className="watering-info-button" aria-label={t("infoWaktu")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/figma-assets/icons-siram/siram-5.svg" width="20" height="20" alt="" />
              </button>
            </div>

            <div className="watering-condition">
              <p>
                <span>{t("kondisiPrefix")}</span>
                <span>{t("kurangMendukung")}</span>
              </p>
            </div>

            <div className="watering-slots">
              {timeSlots.map((slot) => {
                const v = slotVisual[slot.status];
                const Icon = v.icon;
                return (
                  <div key={slot.time === "Now" ? t("now") : slot.time} className={`watering-slot ${slot.status}`}>
                    <div className="watering-slot-icon">
                      <Icon className="hidden" aria-hidden="true" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          slot.status === 'optimal'
                            ? '/figma-assets/icons-siram/siram-status-optimal.svg'
                            : slot.status === 'moderate'
                              ? '/figma-assets/icons-siram/siram-status-moderate.svg'
                              : '/figma-assets/icons-siram/siram-status-bad.svg'
                        }
                        alt=""
                      />
                    </div>
                    <span>{slot.time === "Now" ? t("now") : slot.time}</span>
                  </div>
                );
              })}
            </div>

            <div className="watering-legend">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/figma-assets/icons-siram/legend-optimal.svg" alt="" />
                <span>{t("optimal")}</span>
              </div>
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/figma-assets/icons-siram/legend-moderate.svg" alt="" />
                <span>{t("moderate")}</span>
              </div>
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/figma-assets/icons-siram/legend-bad.svg" alt="" />
                <span>{t("unfavourable")}</span>
              </div>
            </div>

            <button className="watering-learn-more text-sm text-[#1B5E20] font-medium">
              {t("pelajari")}
            </button>
          </div>

          {/* 7-Day Forecast */}
          <div className="forecast-section">
            <h2 className="font-bold mb-3">{t("prediksi7")}</h2>
            <div className="forecast-list">
              {forecast.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.day} className="forecast-card">
                    <p>{t(f.day)}</p>
                    <Icon className="hidden" aria-hidden="true" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/figma-assets/icons-siram/forecast-${(forecast.indexOf(f) % 5) + 1}.svg`}
                      alt=""
                    />
                    <p>{f.temp}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Action Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20">
          <div className="max-w-lg mx-auto">
            <button className="w-full bg-[#1B5E20] text-white py-4 rounded-xl font-semibold">
              {t("sudahMenyiram")}
            </button>
            <p className="text-xs text-gray-600 text-center mt-2">
              {t("jadwalHariIniSelesai")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
