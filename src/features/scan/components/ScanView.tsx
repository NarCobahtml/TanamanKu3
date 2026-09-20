'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Camera, Images, Info, ArrowLeft } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TkReveal from '@/features/landing/tk-reveal-client';

const steps = [
  { n: 1, title: 'bukaKamera', desc: 'izinkanKamera' },
  { n: 2, title: 'ambilFoto', desc: 'bingkaiJelas' },
  { n: 3, title: 'lihatHasil', desc: 'langkah3Desc' },
];

export default function ScanView() {
  const t = useTranslations('scan');
  const tc = useTranslations('common');
  const router = useRouter();
  const videoDesktopRef = useRef<HTMLVideoElement>(null);
  const videoMobileRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [cameraError, setCameraError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => analyze(reader.result as string);
    reader.readAsDataURL(file);
  };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(t('tidakDidukung'));
      setCameraState('error');
      return;
    }

    setCameraState('loading');
    setCameraError('');
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      for (const video of [videoDesktopRef.current, videoMobileRef.current]) {
        if (!video) continue;
        video.srcObject = stream;
        try {
          await video.play();
        } catch {
          /* autoplay policy: muted video akan play sendiri; abaikan */
        }
      }
      setCameraState('ready');
    } catch (error) {
      const name = error instanceof DOMException ? error.name : '';
      setCameraError(
        name === 'NotAllowedError'
          ? t('ditolak')
          : t('kameraGagal'),
      );
      setCameraState('error');
    }
  }, [stopCamera, t]);

  // Kirim gambar ke /api/scan (proxy Roboflow), simpan hasil, pindah halaman.
  const analyze = async (dataUrl: string) => {
    setAnalyzing(true);
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const form = new FormData();
      form.append('file', blob, 'capture.jpg');
      const res = await fetch('/api/scan', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? t('analisisGagal'));
      sessionStorage.setItem('scan-result', JSON.stringify(data));
      try {
        sessionStorage.setItem('scan-capture', dataUrl); // tampil di halaman hasil
      } catch {
        /* quota penuh: foto besar, hasil tetap jalan tanpa preview */
      }
      router.push('/scan/result');
    } catch (err) {
      setAnalyzing(false);
      setCameraError(err instanceof Error ? err.message : t('analisisGagalLagi'));
      void startCamera();
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void startCamera();
    }, 0);
    return () => {
      window.clearTimeout(timer);
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const capturePhoto = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const video = (isMobile ? videoMobileRef.current : videoDesktopRef.current) ?? videoMobileRef.current ?? videoDesktopRef.current;
    if (!video || cameraState !== 'ready') return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    sessionStorage.setItem('scan-capture', dataUrl);
    stopCamera();
    void analyze(dataUrl);
  };

  return (
    <AppShell bare>
      {/* ========================================================================= */}
      {/* MOBILE EXPERIENCE: Fullscreen Camera Viewfinder ONLY                      */}
      {/* ========================================================================= */}
      <div className="md:hidden fixed inset-0 z-40 bg-black flex flex-col justify-between overflow-hidden select-none">
        {/* Fullscreen Camera Stream */}
        <video
          ref={videoMobileRef}
          autoPlay
          muted
          playsInline
          poster="/figma-assets/plant-bananaleaf.jpg"
          className="absolute inset-0 h-full w-full object-cover"
          aria-label={t("pratinjau")}
        />

        {/* Top bar: Floating Back Button */}
        <div className="relative z-10 flex items-center justify-between p-4 pt-[calc(1rem+env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Kembali"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-transform active:scale-95 border border-white/15 shadow-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Center: Viewfinder Reticle / "Kotak untuk mengepaskan foto" */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-8">
          <div className="relative aspect-square w-full max-w-[280px] xs:max-w-[300px]">
            {/* Darkened backdrop outside the framing box */}
            <div className="absolute inset-0 rounded-2xl border border-white/25 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />

            {/* Corner guide brackets (TumbuhKita Gen-5 mint accent #7ed8a4) */}
            <div className="absolute -left-0.5 -top-0.5 h-8 w-8 rounded-tl-xl border-l-4 border-t-4 border-[#7ed8a4]" />
            <div className="absolute -right-0.5 -top-0.5 h-8 w-8 rounded-tr-xl border-r-4 border-t-4 border-[#7ed8a4]" />
            <div className="absolute -bottom-0.5 -left-0.5 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-[#7ed8a4]" />
            <div className="absolute -bottom-0.5 -right-0.5 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-[#7ed8a4]" />

            {/* Center target crosshair indicator */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="h-5 w-5 border-t border-b border-white" />
              <div className="absolute h-5 w-5 border-l border-r border-white" />
            </div>
          </div>
        </div>

        {/* Bottom bar: Photo capture shutter button and gallery pick button */}
        <div className="relative z-10 flex items-center justify-between px-10 pb-[calc(2.25rem+env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label={t("unggahGaleri")}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-transform active:scale-95 border border-white/20 shadow-lg hover:bg-white/20"
          >
            <Images className="h-6 w-6 text-white" />
          </button>

          <button
            type="button"
            onClick={capturePhoto}
            disabled={cameraState !== 'ready' || analyzing}
            aria-label={t("ambilFoto")}
            className="group relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/90 p-1 shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition-transform active:scale-95 disabled:opacity-50"
          >
            <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-[#123526] transition-all group-active:scale-90 group-hover:bg-[#7ed8a4]">
              <Camera className="h-8 w-8 text-[#123526]" />
            </span>
          </button>

          <div className="h-12 w-12" aria-hidden="true" />
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
                onClick={() => void startCamera()}
                variant="outline"
                size="sm"
                className="rounded-full border-white/30 text-white hover:bg-white/20"
              >
                {t("cobaLagi")}
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="rounded-full border-white/30 text-white hover:bg-white/20"
              >
                <Images className="mr-1.5 h-4 w-4" />
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

      {/* Hidden file input for gallery uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-label={t("pilihGaleri")}
      />

      {/* ========================================================================= */}
      {/* DESKTOP EXPERIENCE: Full editorial scan studio                            */}
      {/* ========================================================================= */}
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
              ref={videoDesktopRef}
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
                <Button onClick={() => void startCamera()} variant="outline" size="sm" className="rounded-full">
                  {t("cobaLagi")}
                </Button>
              </div>
            )}

            {/* Capture / analyzing state */}
            {cameraState === 'ready' && !analyzing && (
              <div className="absolute inset-x-0 bottom-6 flex justify-center">
                <Button onClick={capturePhoto} size="lg" className="btn-cta gap-2 rounded-full px-7">
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
                onClick={() => fileInputRef.current?.click()}
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
    </AppShell>
  );
}
