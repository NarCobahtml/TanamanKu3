'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tanaman } from '@/features/plants';
import { weatherNum, timeSlots, forecast, slotVisual } from '../constants';

export interface SiramMobileViewProps {
  plant: Tanaman;
  sudahDisiram: boolean;
  onSiram: () => void;
  notifOn: boolean;
  onToggleNotif: () => void;
  onEdit: () => void;
  onHapus: () => void;
  onBack: () => void;
}

export default function SiramMobileView({
  plant,
  sudahDisiram,
  onSiram,
  notifOn,
  onToggleNotif,
  onEdit,
  onHapus,
  onBack,
}: SiramMobileViewProps) {
  const t = useTranslations('siram');
  const tc = useTranslations('common');

  return (
    <div className="app-shell watering-detail pb-36 lg:hidden bg-background text-foreground">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button className="result-back-button p-1 text-muted-foreground hover:text-foreground" onClick={onBack} aria-label={tc("kembali")}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold truncate">{plant.nama}</h1>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${plant.nama}`}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onHapus}
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
              onClick={onToggleNotif}
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
            onClick={onSiram}
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
  );
}
