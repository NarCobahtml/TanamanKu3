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
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Pengaturan Sistem Admin
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Konfigurasi parameter operasional platform, pengumuman publik,
          dan kontrol akses.
        </p>
      </div>

      {/* Broadcast Announcement */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-foreground">
          Siarkan Pengumuman ke Pengguna (Broadcast)
        </h3>
        <p className="text-xs text-muted-foreground">
          Pesan pengumuman akan ditampilkan pada banner atas beranda
          seluruh pengguna aplikasi.
        </p>
        <form onSubmit={onSendBroadcast} className="flex gap-3">
          <Input
            placeholder="Tulis pengumuman penting (misal: Maintenance malam ini pukul 23:00 WIB)..."
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            disabled={isSubmittingBroadcast}
            className="bg-card rounded-xl text-xs flex-1"
          />
          <Button type="submit" size="sm" disabled={isSubmittingBroadcast} className="cursor-pointer">
            <Send className="mr-1.5 h-3.5 w-3.5" />
            {isSubmittingBroadcast ? "Mengirim..." : "Kirim Banner"}
          </Button>
        </form>
      </div>

      {/* Access Controls */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-foreground">
          Kontrol Akses Platform
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-foreground">
              Pendaftaran Pengguna Baru
            </p>
            <p className="text-xs text-muted-foreground">
              Bila dinonaktifkan, pendaftaran akun baru akan ditutup
              sementara.
            </p>
          </div>
          <Button
            variant={allowRegistration ? "default" : "outline"}
            size="sm"
            className="cursor-pointer"
            onClick={() => {
              onUpdateSettings({ allowRegistration: !allowRegistration });
            }}
          >
            {allowRegistration ? "Diizinkan" : "Ditutup"}
          </Button>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-destructive">
              Mode Pemeliharaan (Maintenance Mode)
            </p>
            <p className="text-xs text-muted-foreground">
              Hanya administrator yang dapat mengakses website bila
              diaktifkan.
            </p>
          </div>
          <Button
            variant={maintenanceMode ? "destructive" : "outline"}
            size="sm"
            className="cursor-pointer"
            onClick={() => {
              onUpdateSettings({ maintenanceMode: !maintenanceMode });
            }}
          >
            {maintenanceMode ? "Sedang Aktif" : "Non-Aktif"}
          </Button>
        </div>
      </div>

      {/* Server Web Push Diagnostics & Testing */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-foreground">
              Testing & Manajemen Notifikasi Server (Web Push)
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pusat pengujian dan pengiriman notifikasi latar belakang server (Google FCM & Apple APNs) yang masuk bahkan saat browser/aplikasi ditutup.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Tes ke Perangkat Admin */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">Tes ke Perangkat Ini</h4>
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-medium",
                    isRegistered
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  )}
                >
                  {isRegistered ? "Perangkat Terdaftar" : "Belum Terdaftar"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">
                Kirim sinyal push instan dari server untuk memastikan HP/laptop ini dapat menerima notifikasi saat aplikasi ditutup.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {!isRegistered && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRegisterCurrentDevice}
                  disabled={isRegistering}
                  className="text-xs cursor-pointer rounded-xl h-8"
                >
                  {isRegistering ? "Mendaftarkan..." : "Daftarkan Perangkat Ini"}
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleSendTestPush}
                disabled={isTesting}
                className="text-xs cursor-pointer rounded-xl h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Bell className="mr-1.5 h-3.5 w-3.5" />
                {isTesting ? "Mengirim..." : "Kirim Tes Notifikasi"}
              </Button>
            </div>
          </div>

          {/* Card 2: Broadcast Jadwal Siram (Simulasi Cron) */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">Kirim Jadwal Siram (Cron)</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-medium">
                  Broadcast Masal
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">
                Server memfilter seluruh tanaman yang butuh disiram hari ini dan mengirimkan notifikasi ke semua HP pengguna.
              </p>
            </div>
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSendWateringReminders}
                disabled={isSendingWatering}
                className="text-xs cursor-pointer rounded-xl h-8 w-full sm:w-auto"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                {isSendingWatering ? "Memproses..." : "Kirim Pengingat ke Semua Pengguna"}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-background/50 p-3 text-[11px] text-muted-foreground">
          <p>
            💡 <strong>Otomatisasi Cron Server:</strong> Anda dapat memanggil endpoint berikut via cron-job berkala (misal: tiap jam 07:00 WIB dan 16:00 WIB) dengan header <code className="bg-muted px-1 py-0.5 rounded text-[10px]">Authorization: Bearer {'<CRON_SECRET>'}</code>:
          </p>
          <code className="block mt-1.5 font-mono text-[10px] bg-muted/60 p-2 rounded-lg break-all select-all">
            POST /api/push/send-watering-reminders
          </code>
        </div>
      </div>
    </div>
  );
}
