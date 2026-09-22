'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AppShell from '@/components/layout/AppShell';
import { useAuthGuard } from '@/components/shared/AuthGuardModal';
import ScanMobileView from './ScanMobileView';
import ScanDesktopView from './ScanDesktopView';

export default function ScanView() {
  const t = useTranslations('scan');
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

  const { checkAuth, AuthModal } = useAuthGuard();

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

  const handleCapture = () => {
    if (
      !checkAuth({
        title: 'Login untuk Scan Tanaman',
        actionName: 'Scan Diagnosa AI',
        description:
          'Fitur diagnosis penyakit tanaman dan penyimpanan riwayat kesehatan membutuhkan akun terdaftar. Silakan masuk atau buat akun baru.',
      })
    ) {
      return;
    }
    capturePhoto();
  };

  const handleOpenGallery = () => {
    if (
      !checkAuth({
        title: 'Login untuk Scan Tanaman',
        actionName: 'Scan Diagnosa AI',
        description:
          'Fitur diagnosis penyakit tanaman dan penyimpanan riwayat kesehatan membutuhkan akun terdaftar. Silakan masuk atau buat akun baru.',
      })
    ) {
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <AppShell bare>
      <ScanMobileView
        videoRef={videoMobileRef}
        cameraState={cameraState}
        cameraError={cameraError}
        analyzing={analyzing}
        onCapture={handleCapture}
        onRetryCamera={() => void startCamera()}
        onOpenGallery={handleOpenGallery}
        onBack={() => router.push('/home')}
      />

      {/* Hidden file input for gallery uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-label={t("pilihGaleri")}
      />

      <ScanDesktopView
        videoRef={videoDesktopRef}
        cameraState={cameraState}
        cameraError={cameraError}
        analyzing={analyzing}
        onCapture={handleCapture}
        onRetryCamera={() => void startCamera()}
        onOpenGallery={handleOpenGallery}
      />
      {AuthModal}
    </AppShell>
  );
}
