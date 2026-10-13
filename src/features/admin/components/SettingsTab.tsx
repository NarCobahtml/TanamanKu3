"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    </div>
  );
}
