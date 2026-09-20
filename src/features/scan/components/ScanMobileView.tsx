'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft, Camera, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RefObject } from 'react';

export interface ScanMobileViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  cameraState: 'loading' | 'ready' | 'error';
  cameraError: string;
  analyzing: boolean;
  onCapture: () => void;
  onRetryCamera: () => void;
  onOpenGallery: () => void;
  onBack: () => void;
}

export default function ScanMobileView({
  videoRef,
  cameraState,
  cameraError,
  analyzing,
  onCapture,
  onRetryCamera,
  onOpenGallery,
  onBack,
}: ScanMobileViewProps) {
  const t = useTranslations('scan');

  return (
    <div className="md:hidden fixed inset-0 z-40 bg-black flex flex-col justify-between overflow-hidden select-none">
      {/* Fullscreen Camera Stream */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        aria-label={t("pratinjauKamera")}
      />

      {/* Top Floating Bar: Back + Hint */}
      <div className="relative z-10 flex items-center justify-between p-4 pt-[calc(1rem+env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("kembali")}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-transform active:scale-95 border border-white/15 shadow-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <span className="rounded-full bg-black/45 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/90 backdrop-blur-md border border-white/15 shadow-lg">
          {t("bidikDaun")}
        </span>

        {/* Placeholder to balance the back button */}
        <div className="w-11" />
      </div>

      {/* Center Viewfinder / Reticle Overlay */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-8">
        <div className="relative aspect-square w-full max-w-[280px] xs:max-w-[300px]">
          {/* Dimmed surrounding via box-shadow */}
          <div className="absolute inset-0 rounded-2xl border border-white/25 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />

          {/* Glowing Green Corner Guides */}
          <div className="absolute -left-0.5 -top-0.5 h-8 w-8 rounded-tl-xl border-l-4 border-t-4 border-[#7ed8a4]" />
          <div className="absolute -right-0.5 -top-0.5 h-8 w-8 rounded-tr-xl border-r-4 border-t-4 border-[#7ed8a4]" />
          <div className="absolute -bottom-0.5 -left-0.5 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-[#7ed8a4]" />
          <div className="absolute -bottom-0.5 -right-0.5 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-[#7ed8a4]" />

          {/* Subtle Center Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="h-5 w-5 border-t border-b border-white" />
            <div className="absolute h-5 w-5 border-l border-r border-white" />
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar: Gallery + Big Shutter */}
      <div className="relative z-10 flex items-center justify-between px-10 pb-[calc(2.25rem+env(safe-area-inset-bottom))] pt-3">
        {/* Gallery Pick Button */}
        <button
          type="button"
          onClick={onOpenGallery}
          aria-label={t("unggahGaleri")}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-transform active:scale-95 border border-white/20 shadow-lg hover:bg-white/20"
        >
          <Images className="h-6 w-6 text-white" />
        </button>

        {/* Shutter Button */}
        <button
          type="button"
          onClick={onCapture}
          disabled={cameraState !== 'ready' || analyzing}
          aria-label={t("ambilFoto")}
          className="group relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/90 p-1 shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition-transform active:scale-95 disabled:opacity-50"
        >
          <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-[#123526] transition-all group-active:scale-90 group-hover:bg-[#7ed8a4]">
            <Camera className="h-8 w-8" />
          </span>
        </button>

        {/* Invisible spacer to balance layout */}
        <div className="w-12" />
      </div>

      {/* Loading overlay */}
      {cameraState === 'loading' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/80 backdrop-blur-sm text-white">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#7ed8a4] border-t-transparent" />
          <p className="text-sm font-medium">{t("membukaKamera")}</p>
        </div>
      )}

      {/* Error overlay with retry and gallery fallback */}
      {cameraState === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/92 p-8 text-center text-white">
          <Camera className="h-12 w-12 text-white/40" />
          <p className="max-w-xs text-sm text-white/80">{cameraError || t("kameraGagal")}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={onRetryCamera}
              variant="outline"
              size="sm"
              className="rounded-full bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              {t("cobaLagi")}
            </Button>
            <Button
              onClick={onOpenGallery}
              size="sm"
              className="rounded-full bg-[#7ed8a4] text-[#123526] hover:bg-[#6ec292] font-semibold"
            >
              {t("unggahGaleri")}
            </Button>
          </div>
        </div>
      )}

      {/* Analyzing overlay */}
      {analyzing && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/85 backdrop-blur-sm text-white">
          <div className="h-12 w-12 animate-spin rounded-full border-3 border-[#7ed8a4] border-t-transparent" />
          <p className="text-base font-semibold">{t("menganalisis")}</p>
        </div>
      )}
    </div>
  );
}
