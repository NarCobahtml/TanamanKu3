'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    deferredPwaPrompt?: BeforeInstallPromptEvent | null;
    triggerPwaInstall?: () => Promise<void>;
  }
}

export default function PwaPrompt() {
  const [, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Daftarkan Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('TanamanKu PWA: Service Worker terdaftar dengan scope:', reg.scope);
          })
          .catch((err) => {
            console.error('TanamanKu PWA: Pendaftaran Service Worker gagal:', err);
          });
      });
    }

    // 2. Cek apakah sudah terinstal sebagai standalone PWA
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    if (checkStandalone()) return;

    // 3. Cek apakah perangkat iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIos(isIosDevice);

    // Cek apakah user pernah menutup banner install dalam 24 jam terakhir
    const dismissedAt = localStorage.getItem('tanamanku_pwa_dismissed');
    const wasDismissedRecently = dismissedAt && Date.now() - Number(dismissedAt) < 24 * 60 * 60 * 1000;

    // 4. Periksa apakah prompt sudah tertangkap sebelumnya oleh early script di head
    if (typeof window !== 'undefined' && window.deferredPwaPrompt) {
      setDeferredPrompt(window.deferredPwaPrompt);
      if (!wasDismissedRecently) {
        setShowPrompt(true);
      }
    }

    const handlePromptReady = () => {
      if (window.deferredPwaPrompt) {
        setDeferredPrompt(window.deferredPwaPrompt);
        if (!wasDismissedRecently) {
          setShowPrompt(true);
        }
      }
    };

    // Tangkap event beforeinstallprompt untuk Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.deferredPwaPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      if (!wasDismissedRecently) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);

    // Fungsi global agar tombol apapun di website (nav, profil, banner) langsung memicu download/install prompt
    window.triggerPwaInstall = async () => {
      const promptEvent = window.deferredPwaPrompt;
      if (promptEvent) {
        try {
          // Panggil prompt() SEGERA dalam user gesture tanpa delay agar langsung muncul di layar
          promptEvent.prompt();
          const choiceResult = await promptEvent.userChoice;
          if (choiceResult.outcome === 'accepted') {
            setShowPrompt(false);
            window.deferredPwaPrompt = null;
            toast.success('Aplikasi TanamanKu berhasil dipasang!');
          }
        } catch (err) {
          console.error('Error saat memicu prompt PWA:', err);
          toast.error('Gagal memicu pemasangan aplikasi.');
        }
      } else if (isIosDevice) {
        // Hanya di iOS Safari yang butuh petunjuk (karena Apple memblokir trigger otomatis dari kode)
        setShowGuideModal(true);
      } else {
        // Di Android/Chrome: jangan munculkan tutorial step by step, langsung beri info status
        toast.info('Browser sedang menyiapkan aplikasi atau sudah terpasang di perangkat Anda.');
      }
    };

    // Tampilkan banner ajakan instalasi setelah 2 detik jika belum di-dismiss
    let fallbackTimer: NodeJS.Timeout | null = null;
    if (!wasDismissedRecently) {
      fallbackTimer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (window.triggerPwaInstall) {
      await window.triggerPwaInstall();
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('tanamanku_pwa_dismissed', Date.now().toString());
  };

  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Banner Ajakan Install PWA */}
      {showPrompt && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 sm:max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-xl backdrop-blur-md dark:border-primary/30">
            <div className="flex items-start gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-[#123526] p-2 flex items-center justify-center shrink-0 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/icon-192x192.png"
                  alt="Logo TanamanKu"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-foreground truncate">Pasang Aplikasi TanamanKu</h4>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    <Sparkles className="h-2.5 w-2.5" /> PWA
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Akses cepat tanpa buka browser, hemat kuota, dan tetap bisa dibuka saat offline.
                </p>

                {isIos ? (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-secondary/80 text-[11px] text-muted-foreground flex items-center gap-2">
                    <Share className="h-4 w-4 shrink-0 text-primary" />
                    <span>
                      Tekan tombol <strong>Bagikan (Share)</strong> di Safari lalu pilih <strong>&apos;Tambah ke Layar Utama&apos;</strong>
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      onClick={handleInstallClick}
                      size="sm"
                      className="h-8 rounded-xl px-4 text-xs font-semibold bg-[#1B5E20] hover:bg-[#17491a] text-white shadow-xs cursor-pointer"
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Install Sekarang
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-xl px-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Nanti Saja
                    </Button>
                  </div>
                )}
              </div>

              <button
                onClick={handleDismiss}
                aria-label="Tutup ajakan instalasi"
                className="absolute top-3.5 right-3.5 p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Panduan Cara Pasang PWA */}
      <Dialog open={showGuideModal} onOpenChange={setShowGuideModal}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader className="text-left space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-[#123526] p-2 flex items-center justify-center shrink-0 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/icon-192x192.png" alt="TanamanKu" className="h-full w-full object-contain" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Cara Pasang Aplikasi di HP
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Pasang sebagai Web App langsung di layar utama HP Anda.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-3 space-y-2.5 text-xs sm:text-sm">
            {isIos ? (
              <div className="space-y-3 rounded-xl bg-secondary/50 p-4 border border-border">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">1</span>
                  <p className="leading-relaxed">Buka situs ini di browser <strong>Safari</strong> pada iPhone/iPad.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">2</span>
                  <p className="leading-relaxed">Ketuk tombol <strong>Bagikan (Share)</strong> <Share className="inline h-3.5 w-3.5 text-primary mx-0.5" /> (ikon kotak panah ke atas di bawah layar).</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">3</span>
                  <p className="leading-relaxed">Gulir ke bawah dan ketuk opsi <strong>&apos;Tambah ke Layar Utama&apos; (Add to Home Screen)</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">4</span>
                  <p className="leading-relaxed">Ketuk <strong>&apos;Tambah&apos;</strong> di pojok kanan atas. Selesai!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 rounded-xl bg-secondary/50 p-4 border border-border">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">1</span>
                  <p className="leading-relaxed">Ketuk ikon menu <strong>titik tiga (⋮)</strong> di pojok kanan atas browser (Chrome / Edge).</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">2</span>
                  <p className="leading-relaxed">Pilih menu <strong>&apos;Instal aplikasi&apos;</strong> atau <strong>&apos;Tambahkan ke Layar Utama&apos;</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">3</span>
                  <p className="leading-relaxed">Ketuk <strong>&apos;Instal&apos;</strong> pada konfirmasi yang muncul. Aplikasi langsung terpasang di HP Anda!</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 sm:justify-end">
            <Button
              onClick={() => setShowGuideModal(false)}
              className="w-full sm:w-auto rounded-full bg-[#1B5E20] hover:bg-[#17491a] text-white px-6 font-semibold cursor-pointer"
            >
              Saya Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
