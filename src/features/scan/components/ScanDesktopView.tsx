'use client';

import { useTranslations } from 'next-intl';
import { Camera, Images, Info } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TkReveal from '@/components/shared/tk-reveal-client';
import type { RefObject } from 'react';

const steps = [
  { n: 1, title: 'bukaKamera', desc: 'izinkanKamera' },
  { n: 2, title: 'ambilFoto', desc: 'bingkaiJelas' },
  { n: 3, title: 'lihatHasil', desc: 'langkah3Desc' },
];

export interface ScanDesktopViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  cameraState: 'loading' | 'ready' | 'error';
  cameraError: string;
  analyzing: boolean;
  onCapture: () => void;
  onRetryCamera: () => void;
  onOpenGallery: () => void;
}

export default function ScanDesktopView({
  videoRef,
  cameraState,
  cameraError,
  analyzing,
  onCapture,
  onRetryCamera,
  onOpenGallery,
}: ScanDesktopViewProps) {
  const t = useTranslations('scan');
  const tc = useTranslations('common');

  return (
    <div className="hidden md:block w-full pb-16">
      <PageHeader
        overline={t("deteksi")}
        title={t("periksaKondisi")}
        accent={tc("tanaman")}
        description={t("deskripsi")}
      />

      {/* Workspace: viewfinder + control rail */}
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 pt-12 sm:px-6 lg:grid-cols-[1fr_300px]">
        {/* Viewfinder, core experience, dominant */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-secondary/60 transition-colors hover:border-primary/40 md:aspect-video">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            poster="/figma-assets/plant-bananaleaf.jpg"
            className="h-full w-full object-cover"
            aria-label={t("pratinjau")}
          />

          {/* Corner brackets */}
          <div className="absolute left-3 top-3 h-6 w-6 rounded-none border-l-2 border-t-2 border-primary" />
          <div className="absolute right-3 top-3 h-6 w-6 rounded-none border-r-2 border-t-2 border-primary" />
          <div className="absolute bottom-3 left-3 h-6 w-6 rounded-none border-b-2 border-l-2 border-primary" />
          <div className="absolute bottom-3 right-3 h-6 w-6 rounded-none border-b-2 border-r-2 border-primary" />

          {/* Loading state */}
          {cameraState === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <Skeleton className="h-10 w-40" />
                <p className="text-sm text-muted-foreground">{t("membukaKamera")}</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {cameraState === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-secondary/95 p-8 text-center">
              <Camera className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
              <p className="max-w-sm text-sm text-muted-foreground">{cameraError}</p>
              <Button onClick={onRetryCamera} variant="outline" size="sm" className="rounded-full">
                {t("cobaLagi")}
              </Button>
            </div>
          )}

          {/* Capture / analyzing state */}
          {cameraState === 'ready' && !analyzing && (
            <div className="absolute inset-x-0 bottom-6 flex justify-center">
              <Button onClick={onCapture} size="lg" className="btn-cta gap-2 rounded-full px-7">
                <Camera className="h-5 w-5" aria-hidden="true" />
                {t("ambilFoto")}
              </Button>
            </div>
          )}
          {analyzing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-secondary/85 backdrop-blur-sm">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm font-medium">{t("menganalisis")}</p>
            </div>
          )}
        </div>

        {/* Control rail, quota + tools, stacked */}
        <aside className="flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/30">
            <p className="overline">{t("kuota")}</p>
            <p className="tnum mt-2 text-lg font-bold">3/5</p>
            <p className="text-xs text-muted-foreground">{t("scanGratisTersisa")}</p>
            <div
              className="mt-3 h-1.5 w-full rounded-full bg-secondary"
              role="progressbar"
              aria-label="3/5"
              aria-valuenow={3}
              aria-valuemin={0}
              aria-valuemax={5}
            >
              <div className="h-full w-[60%] rounded-full bg-primary" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t("resetBulan")}</p>
          </div>

          <div className="space-y-2.5">
            <p className="text-sm font-semibold">{t("alat")}</p>
            <Button
              onClick={onOpenGallery}
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 rounded-full bg-card hover:bg-accent/60"
            >
              <Images className="h-4 w-4" aria-hidden="true" />
              {t("unggahGaleri")}
            </Button>
          </div>
        </aside>
      </div>

      {/* Step guide, full-width numbered rail below the workspace */}
      <TkReveal className="mx-auto w-full max-w-7xl px-4 pt-16 sm:px-6">
        <ol className="grid divide-y divide-border rounded-xl border border-border bg-card transition-colors hover:border-primary/40 md:grid-cols-3 md:divide-y-0 md:divide-x" aria-label={t("caraKerja")}>
          {steps.map((step) => (
            <li key={step.n} className="flex gap-4 px-6 py-5">
              <div className="tnum grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-primary">
                {step.n}
              </div>
              <div>
                <h3 className="text-sm font-semibold">{t(step.title)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(step.desc)}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t("disclaimer")}
        </p>
      </TkReveal>
    </div>
  );
}
