'use client';

import { useState, useEffect } from "react";
import { Send, Bell, BellRing, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  registerServerWebPush,
  getExistingPushSubscription,
  triggerServerPushTest,
} from "@/lib/web-push-client";

interface SettingsTabProps {
  broadcastMessage: string;
  setBroadcastMessage: (val: string) => void;
  isSubmittingBroadcast: boolean;
  onSendBroadcast: (e: React.FormEvent) => void;
  allowRegistration: boolean;
  maintenanceMode: boolean;
  onUpdateSettings: (updates: { allowRegistration?: boolean; maintenanceMode?: boolean }) => void;
}

export function SettingsTab({
  broadcastMessage,
  setBroadcastMessage,
  isSubmittingBroadcast,
  onSendBroadcast,
  allowRegistration,
  maintenanceMode,
  onUpdateSettings,
}: SettingsTabProps) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSendingWatering, setIsSendingWatering] = useState(false);

  useEffect(() => {
    getExistingPushSubscription().then((sub) => {
      setIsRegistered(Boolean(sub));
    });
  }, []);

  const handleRegisterCurrentDevice = async () => {
    setIsRegistering(true);
    try {
      const res = await registerServerWebPush();
      if (res.success) {
        setIsRegistered(true);
        toast.success("Perangkat admin berhasil didaftarkan ke Web Push!");
      } else {
        toast.error(res.error || "Gagal mendaftarkan perangkat");
      }
    } catch {
      toast.error("Terjadi kesalahan saat mendaftarkan perangkat");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSendTestPush = async () => {
    setIsTesting(true);
    try {
      const res = await triggerServerPushTest();
      if (res.success) {
        toast.success("Notifikasi tes terkirim dari server!", {
          description: "Periksa bilah notifikasi HP / komputer Anda.",
        });
      } else {
        toast.error("Gagal mengirim tes push", {
          description: res.message,
        });
      }
    } catch {
      toast.error("Terjadi kesalahan saat memicu tes push server.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendWateringReminders = async () => {
    setIsSendingWatering(true);
    try {
      const res = await fetch("/api/push/send-watering-reminders", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success("Pengingat siram berhasil diproses!", {
          description: `Terkirim ke ${json.stats?.sentCount ?? 0} perangkat (${json.stats?.duePlantsTotal ?? 0} tanaman masuk jadwal siram).`,
        });
      } else {
        toast.error("Gagal memproses pengingat", {
          description: json.error || "Terjadi kesalahan pada server",
        });
      }
    } catch {
      toast.error("Gagal menghubungi endpoint server.");
    } finally {
      setIsSendingWatering(false);
    }
  };
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-2 border-b border-border/50">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Pengaturan Sistem Admin
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Konfigurasi parameter operasional platform, pengumuman publik, dan kontrol akses sistem TanamanKu.
        </p>
      </div>

      {/* Broadcast Announcement */}
      <div className="rounded-xl border border-border/70 bg-card p-5 sm:p-6 shadow-2xs space-y-3.5">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-foreground">
            Siarkan Pengumuman ke Pengguna (Broadcast)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pesan pengumuman akan ditampilkan pada banner atas beranda seluruh pengguna aplikasi.
          </p>
        </div>

        <form onSubmit={onSendBroadcast} className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <Input
            placeholder="Tulis pengumuman penting (misal: Maintenance server malam ini pukul 23:00 WIB)..."
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            disabled={isSubmittingBroadcast}
            className="bg-card rounded-lg text-xs flex-1 h-9 border-border/70 focus-visible:ring-1"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isSubmittingBroadcast}
            className="cursor-pointer h-9 px-4 rounded-lg text-xs font-semibold shrink-0 gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            {isSubmittingBroadcast ? "Mengirim..." : "Kirim Banner"}
          </Button>
        </form>
      </div>

      {/* Access Controls */}
      <div className="rounded-xl border border-border/70 bg-card p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-foreground">
            Kontrol Akses Platform
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Atur ketersediaan pendaftaran dan mode keamanan platform.
          </p>
        </div>

        <div className="divide-y divide-border/50">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                Pendaftaran Pengguna Baru
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                Bila dinonaktifkan, calon pengguna baru tidak dapat mendaftarkan akun.
              </p>
            </div>
            <Button
              variant={allowRegistration ? "default" : "outline"}
              size="sm"
              className={`cursor-pointer h-8 px-3 rounded-lg text-xs font-medium ${
                allowRegistration
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "border-border/80 hover:bg-muted"
              }`}
              onClick={() => {
                onUpdateSettings({ allowRegistration: !allowRegistration });
              }}
            >
              {allowRegistration ? "Pendaftaran Dibuka" : "Pendaftaran Ditutup"}
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-destructive">
                Mode Pemeliharaan (Maintenance Mode)
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                Hanya akun administrator yang dapat mengakses sistem saat mode ini aktif.
              </p>
            </div>
            <Button
              variant={maintenanceMode ? "destructive" : "outline"}
              size="sm"
              className="cursor-pointer h-8 px-3 rounded-lg text-xs font-medium"
              onClick={() => {
                onUpdateSettings({ maintenanceMode: !maintenanceMode });
              }}
            >
              {maintenanceMode ? "Mode Pemeliharaan Aktif" : "Non-Aktif (Normal)"}
            </Button>
          </div>
        </div>
      </div>

      {/* Diagnostik Web Push */}
      <div className="rounded-xl border border-border/70 bg-card p-5 sm:p-6 shadow-2xs space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-primary" />
            <h3 className="text-sm sm:text-base font-semibold text-foreground">
              Testing & Manajemen Notifikasi Server (Web Push)
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pusat pengujian dan pengiriman notifikasi latar belakang server (Google FCM & Apple APNs) yang masuk bahkan saat browser/aplikasi ditutup.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Kartu tes perangkat admin */}
          <div className="rounded-lg border border-border/70 bg-muted/30 p-4 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-foreground">Tes ke Perangkat Ini</h4>
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-md font-medium border",
                    isRegistered
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  )}
                >
                  {isRegistered ? "Perangkat Terdaftar" : "Belum Terdaftar"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">
                Kirim sinyal push instan dari server untuk memastikan perangkat ini dapat menerima notifikasi saat aplikasi diminimalkan.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {!isRegistered && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRegisterCurrentDevice}
                  disabled={isRegistering}
                  className="text-xs cursor-pointer rounded-lg h-8 border-border"
                >
                  {isRegistering ? "Mendaftarkan..." : "Daftarkan Perangkat Ini"}
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleSendTestPush}
                disabled={isTesting}
                className="text-xs cursor-pointer rounded-lg h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                <Bell className="mr-1.5 h-3.5 w-3.5" />
                {isTesting ? "Mengirim..." : "Kirim Tes Notifikasi"}
              </Button>
            </div>
          </div>

          {/* Kartu broadcast simulasi cron */}
          <div className="rounded-lg border border-border/70 bg-muted/30 p-4 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-foreground">Kirim Jadwal Siram (Cron)</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
                  Broadcast Masal
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">
                Server memfilter seluruh tanaman yang butuh disiram hari ini dan mengirimkan notifikasi ke semua perangkat pengguna.
              </p>
            </div>
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSendWateringReminders}
                disabled={isSendingWatering}
                className="text-xs cursor-pointer rounded-lg h-8 w-full sm:w-auto border-border hover:bg-muted font-medium"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                {isSendingWatering ? "Memproses..." : "Kirim Pengingat ke Semua Pengguna"}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-[11px] text-muted-foreground">
          <p>
            💡 <strong className="text-foreground">Otomatisasi Cron Server:</strong> Anda dapat memanggil endpoint berikut via cron-job berkala (misal: tiap jam 07:00 WIB dan 16:00 WIB) dengan header <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">Authorization: Bearer {'<CRON_SECRET>'}</code>:
          </p>
          <code className="block mt-1.5 font-mono text-[10px] bg-muted/60 p-2 rounded-md break-all select-all text-foreground border border-border/40">
            POST /api/push/send-watering-reminders
          </code>
        </div>
      </div>
    </div>
  );
}
