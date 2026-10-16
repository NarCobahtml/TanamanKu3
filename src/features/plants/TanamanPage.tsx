'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Pencil, Search, SearchX, Trash2, Bell, BellRing } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HealthStatus } from '@/components/shared/HealthStatus';
import { ActionButton } from '@/components/ui/action-button';
import { PageCtaBand } from '@/components/shared/PageCtaBand';
import TkRevealClient from '@/components/shared/tk-reveal-client';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  isWateringNotificationEnabled,
  setWateringNotificationEnabled,
  requestWateringNotificationPermission,
  checkAndTriggerWateringReminders,
} from '@/lib/watering-notifications';
import {
  registerServerWebPush,
  unsubscribeServerWebPush,
} from '@/lib/web-push-client';
import { useTanamanList, type Tanaman, type KategoriTanaman as Kategori } from './tanaman-store';
import EditTanamanDialog from './EditTanamanDialog';
import HapusTanamanDialog from './HapusTanamanDialog';
import { StatusSiramBadge } from './StatusSiramBadge';
import { PlantCard, PlantThumb } from './PlantCard';
import { FilterPill } from '@/components/ui/filter-pill';
import { kategoriList, healthLevel } from './constants';

export default function TanamanPage({ onTambah }: { onTambah: () => void }) {
  const ts = useTranslations('siram');
  const tc = useTranslations('common');
  const tanamanList = useTanamanList();
  const [query, setQuery] = useState('');
  const [kategori, setKategori] = useState<'Semua' | Kategori>('Semua');
  const [editingPlant, setEditingPlant] = useState<Tanaman | null>(null);
  const [deletingPlant, setDeletingPlant] = useState<Tanaman | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    setNotifEnabled(isWateringNotificationEnabled());
    const handlePrefChange = () => setNotifEnabled(isWateringNotificationEnabled());
    window.addEventListener('tanamanku-notif-pref-changed', handlePrefChange);
    return () => window.removeEventListener('tanamanku-notif-pref-changed', handlePrefChange);
  }, []);

  const handleToggleNotif = async () => {
    if (!notifEnabled) {
      // 1. Coba daftarkan Server Web Push
      const pushRes = await registerServerWebPush();
      if (pushRes.success) {
        setNotifEnabled(true);
        setWateringNotificationEnabled(true);
        toast.success('Pengingat Siram Server Web Push Aktif!', {
          description: 'Anda akan diingatkan otomatis saat jadwal siram tiba, bahkan saat aplikasi ditutup.',
        });
        await checkAndTriggerWateringReminders(tanamanList, { force: true });
      } else {
        // Fallback ke izin lokal
        const { granted, status } = await requestWateringNotificationPermission();
        if (granted) {
          setNotifEnabled(true);
          toast.success('Pengingat siram lokal diaktifkan!');
          await checkAndTriggerWateringReminders(tanamanList, { force: true });
        } else if (status === 'denied') {
          toast.error('Izin notifikasi diblokir browser', {
            description: 'Silakan buka pengaturan browser / info situs untuk mengizinkan notifikasi.',
          });
        } else {
          toast.error(pushRes.error || 'Gagal mengaktifkan Web Push.');
        }
      }
    } else {
      await unsubscribeServerWebPush();
      setWateringNotificationEnabled(false);
      setNotifEnabled(false);
      toast.info('Pengingat siram dinonaktifkan.');
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tanamanList.filter(
      (t) =>
        (kategori === 'Semua' || t.kategori === kategori) &&
        (q === '' || t.nama.toLowerCase().includes(q)),
    );
  }, [tanamanList, query, kategori]);

  const counts = useMemo(
    () => ({
      total: tanamanList.length,
      terlambat: tanamanList.filter((t) => t.status === 'terlambat').length,
      hariIni: tanamanList.filter((t) => t.status === 'hari-ini').length,
    }),
    [tanamanList],
  );

  return (
    <div>
      <PageHeader
        overline={ts("koleksi")}
        title={ts("tanamanSaya")}
        accent={ts("saya")}
        description={ts("deskripsi")}
        actions={
          <>
            {/* Watering ledger inline in the header, actionable summary */}
            <span className="hidden items-center gap-4 text-xs text-muted-foreground md:flex">
              <span>
                <strong className="tnum text-sm font-bold text-foreground">{counts.hariIni}</strong> {ts("siramHariIni")} {ts("ini")}
              </span>
              <span className="h-4 w-px bg-border" aria-hidden="true" />
              <span>
                <strong className="tnum text-sm font-bold text-destructive">{counts.terlambat}</strong> {ts("terlambat")}
              </span>
            </span>

            {/* Tombol Pengingat Notifikasi Siram PWA */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleNotif}
              className={cn(
                "rounded-xl gap-2 text-xs font-semibold cursor-pointer border transition-colors",
                notifEnabled
                  ? "border-emerald-500/40 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title={notifEnabled ? "Pengingat siram aktif. Klik untuk menonaktifkan." : "Aktifkan notifikasi pengingat siram"}
            >
              {notifEnabled ? (
                <BellRing className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Bell className="size-3.5" />
              )}
              <span className="hidden sm:inline">
                {notifEnabled ? "Pengingat Siram Aktif" : "Aktifkan Pengingat"}
              </span>
            </Button>

            <ActionButton onClick={onTambah}>
              {ts("tambah")}
            </ActionButton>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl space-y-12 px-4 pt-12 pb-24 sm:px-6">
      {/* Toolbar: search + filter kategori + view switch */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={ts("cari")}
              aria-label={ts("cariAria")}
              className="rounded-xl border-border bg-card pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={ts("filterKategori")}>
            {kategoriList.map((k) => (
              <FilterPill
                key={k}
                active={kategori === k}
                onClick={() => setKategori(k)}
              >
                {k === "Semua" ? tc("semua") : tc(k.toLowerCase())}
              </FilterPill>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {ts("menampilkan", { count: filtered.length, total: counts.total })}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" aria-hidden="true" />}
          title={ts("tidakAdaCocok")}
          message={ts("cobaKata")}
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery('');
                setKategori('Semua');
              }}
            >
              {ts("resetPencarian")}
            </Button>
          }
        />
      ) : (
        <TkRevealClient>
        <Tabs defaultValue="grid">
          <div className="flex justify-end">
            <TabsList className="rounded-full border border-border bg-card p-1">
              <TabsTrigger value="grid" className="rounded-full px-3.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none after:hidden">{ts("kartu")}</TabsTrigger>
              <TabsTrigger value="tabel" className="rounded-full px-3.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none after:hidden">{ts("tabel")}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((t) => (
                <div key={t.id}>
                  <PlantCard
                    plant={t}
                    onEdit={setEditingPlant}
                    onHapus={setDeletingPlant}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tabel">
            <div className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border bg-secondary/50 hover:bg-secondary/50">
                      <TableHead className="py-3.5 pl-5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{ts("tanamanKolom")}</TableHead>
                      <TableHead className="py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{ts("kategoriKolom")}</TableHead>
                      <TableHead className="py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{ts("kesehatanKolom")}</TableHead>
                      <TableHead className="py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{ts("statusSiram")}</TableHead>
                      <TableHead className="hidden py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground md:table-cell">{ts("jadwalBerikutnya")}</TableHead>
                      <TableHead className="py-3.5 pr-5 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                        <span className="sr-only">{ts("aksi")}</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((t) => (
                      <TableRow key={t.id} className="border-border transition-colors hover:bg-secondary">
                        <TableCell className="py-4 pl-5">
                          <span className="flex items-center gap-3">
                            <PlantThumb t={t} className="rounded-lg" />
                            <span className="block font-medium">{t.nama}</span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{tc(t.kategori.toLowerCase())}</Badge>
                        </TableCell>
                        <TableCell>
                          <HealthStatus level={healthLevel(t)} />
                        </TableCell>
                        <TableCell>
                          <StatusSiramBadge status={t.status} />
                        </TableCell>
                        <TableCell className="hidden whitespace-normal text-muted-foreground md:table-cell">{ts(t.nextWater)}</TableCell>
                        <TableCell className="py-4 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              aria-label={`Edit ${t.nama}`}
                              onClick={() => setEditingPlant(t)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              aria-label={`Hapus ${t.nama}`}
                              onClick={() => setDeletingPlant(t)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                              <Link href={`/siram/${t.id}`} aria-label={`${ts("lihatDetail")} ${t.nama}`}>
                                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </TkRevealClient>
      )}

      {/* Edit and Delete Dialogs */}
      <EditTanamanDialog
        plant={editingPlant}
        open={!!editingPlant}
        onOpenChange={(open) => !open && setEditingPlant(null)}
      />
      <HapusTanamanDialog
        plant={deletingPlant}
        open={!!deletingPlant}
        onOpenChange={(open) => !open && setDeletingPlant(null)}
      />

      </div>

      <PageCtaBand
        heading={ts("tanamanBaruMenunggu")}
        accent="dirawat"
        description={ts("tambahkanKoleksi")}
        primary={{ href: '/scan', label: tc('scanTanaman') }}
        secondary={{ href: '/forum', label: tc('tanyaKomunitas') }}
      />
    </div>
  );
}
