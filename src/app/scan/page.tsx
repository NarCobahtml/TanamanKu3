'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Camera, Images, Zap, Info, ArrowLeft, RotateCcw } from 'lucide-react';
import SitePage from '@/components/SitePage';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TkReveal from '@/components/landing/tk-reveal-client';
const steps = [
  { n: 1, title: 'bukaKamera', desc: 'izinkanKamera' },
  { n: 2, title: 'ambilFoto', desc: 'bingkaiJelas' },
  { n: 3, title: 'lihatHasil', desc: 'langkah3Desc' },
];

export default function ScanPage() {
  const t = useTranslations('scan');
  const tc = useTranslations('common');
  const router = useRouter();
  const videoDesktopRef = useRef<HTMLVideoElement>(null);
  const videoMobileRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [flashOn, setFlashOn] = useState(false);
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
        /* quota penuh: foto besar, hasil tetap jalan tanpa preview */ // ponytail: resize sebelum simpan jika jadi masalah
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
    const video = videoDesktopRef.current ?? videoMobileRef.current;
    if (!video || cameraState !== 'ready' || video.videoWidth === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    sessionStorage.setItem('scan-capture', canvas.toDataURL('image/jpeg', 0.9));
    stopCamera();
    void analyze(sessionStorage.getItem('scan-capture')!);
  };

  const toggleFlash = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;

    const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
    if (!capabilities.torch) {
      setFlashOn((value) => !value);
      return;
    }

    const nextValue = !flashOn;
    await track.applyConstraints({ advanced: [{ torch: nextValue }] } as unknown as MediaTrackConstraints);
    setFlashOn(nextValue);
  };

  return (
    <>
      {/* Desktop, t3 editorial scan studio */}
      <div className="hidden lg:block">
    <SitePage>
      <div>
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
              onClick={() => void toggleFlash()}
              variant={flashOn ? 'secondary' : 'outline'}
              size="sm"
              className="w-full justify-start gap-2 rounded-full"
              aria-label={t("kilatToggle")}
            >
              <Zap className="h-4 w-4" aria-hidden="true" />
              {flashOn ? t('kilatAktif') : t('kilat')}
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 rounded-full bg-card hover:bg-accent/60"
            >
              <Images className="h-4 w-4" aria-hidden="true" />
              {t("unggahGaleri")}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              aria-label={t("pilihGaleri")}
            />
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
    </SitePage>
      </div>

      {/* Mobile, dari tumbuhkita #1 */}
      <div className="lg:hidden">
        <div className="relative min-h-screen overflow-hidden bg-ink text-white">
      <video ref={videoMobileRef} className="absolute inset-0 h-full w-full object-cover" autoPlay muted playsInline />
      <div className="absolute inset-0 bg-black/25" />

      <header className="absolute left-0 right-0 top-0 z-10 bg-black/45">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <button onClick={() => window.history.back()} className="text-white" aria-label={tc("kembali")}>
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">{t("judul")}</h1>
          <button className="text-white" onClick={() => void startCamera()} aria-label={t("muatUlang")}>
            <RotateCcw className="h-6 w-6" />
          </button>
        </div>
      </header>

      <main className="relative z-[1] flex min-h-screen items-center justify-center px-6">
        <div className="relative h-[min(68vh,480px)] w-[min(82vw,320px)]">
          <div className="absolute left-0 top-0 h-16 w-16 rounded-tl-lg border-l-4 border-t-4 border-white" />
          <div className="absolute right-0 top-0 h-16 w-16 rounded-tr-lg border-r-4 border-t-4 border-white" />
          <div className="absolute bottom-0 left-0 h-16 w-16 rounded-bl-lg border-b-4 border-l-4 border-white" />
          <div className="absolute bottom-0 right-0 h-16 w-16 rounded-br-lg border-b-4 border-r-4 border-white" />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-6 py-3 backdrop-blur-sm">
            <p className="text-center text-sm">
              {analyzing
? t('menganalisis')
                : cameraState === 'ready'
? t('posisikanDaun')
                  : cameraState === 'loading'
? t('membukaKamera')
                    : cameraError}
            </p>
            {cameraState === 'error' && !analyzing && <button className="mt-2 block w-full text-xs font-semibold text-[#7ed8a4]" onClick={() => void startCamera()}>{t("cobaLagiKecil")}</button>}
          </div>
        </div>
      </main>

      <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between px-8 py-8">
          <label className="flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-white/60 bg-white/10">
            <Images className="h-6 w-6 text-white" aria-hidden="true" />
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
          <button onClick={capturePhoto} disabled={cameraState !== 'ready' || analyzing} className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white disabled:opacity-50" aria-label={t("ambilFotoAria")}>
            <span className={`flex h-16 w-16 items-center justify-center rounded-full ${analyzing ? 'animate-pulse' : ''} bg-[#1B5E20]`}>
              <Camera className="h-8 w-8 text-white" aria-hidden="true" />
            </span>
          </button>
          <button onClick={() => void toggleFlash()} className={`flex h-16 w-16 items-center justify-center rounded-full ${flashOn ? 'bg-white/20' : 'bg-black/60'}`} aria-label={t("kilat")}>
            <Zap className={`h-6 w-6 ${flashOn ? 'text-[#7ed8a4]' : 'text-white'}`} fill={flashOn ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
        </div>
      </div>
    </>
  );
}

