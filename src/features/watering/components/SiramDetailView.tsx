'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTanamanList, tanamanStore, EditTanamanDialog, HapusTanamanDialog } from '@/features/plants';
import { useWeather } from '../use-weather';
import {
  isPlantNotificationEnabled,
  setPlantNotificationEnabled,
  requestWateringNotificationPermission,
  showLocalNotification,
} from '@/lib/watering-notifications';
import { registerServerWebPush } from '@/lib/web-push-client';
import SiramDesktopView from './SiramDesktopView';
import SiramMobileView from './SiramMobileView';

export default function SiramDetailView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const tanamanList = useTanamanList();
  const plant = tanamanList.find((x) => x.id === id) ?? tanamanStore.getById(id) ?? tanamanList[0];
  const weather = useWeather({
    plantName: plant?.nama,
    plantCategory: plant?.kategori,
    plantType: plant?.jenis,
  });

  const [sudahDisiram, setSudahDisiram] = useState(false);
  const [notifOn, setNotifOn] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [hapusOpen, setHapusOpen] = useState(false);

  useEffect(() => {
    if (plant?.id) {
      setNotifOn(isPlantNotificationEnabled(plant.id));
    }
  }, [plant?.id]);

  const handleSiram = async () => {
    if (!plant || sudahDisiram) return;
    setSudahDisiram(true);
    await tanamanStore.editAsync(plant.id, {
      status: 'terjadwal',
      nextWater: 'nw.berikutnyaBesok',
    });
    toast.success(`${plant.nama} berhasil disiram! Status disinkronkan ke database.`);
  };

  const handleToggleNotif = async () => {
    if (!plant) return;

    if (!notifOn) {
      // 1. Daftarkan ke Server Web Push
      const pushRes = await registerServerWebPush();
      if (pushRes.success) {
        setPlantNotificationEnabled(plant.id, true);
        setNotifOn(true);
        toast.success(`Pengingat siram aktif untuk ${plant.nama}`, {
          description: 'Server Web Push aktif! Anda akan diingatkan bahkan saat aplikasi ditutup.',
        });
        showLocalNotification(`🌱 Pengingat Siram: ${plant.nama}`, {
          body: `Notifikasi aktif! Anda akan diingatkan saat jadwal siram ${plant.nama} tiba.`,
          tag: `tanamanku-notif-${plant.id}`,
          data: { url: `/siram/${plant.id}` },
        });
      } else {
        const { granted, status } = await requestWateringNotificationPermission();
        if (granted) {
          setPlantNotificationEnabled(plant.id, true);
          setNotifOn(true);
          toast.success(`Pengingat lokal aktif untuk ${plant.nama}`);
        } else if (status === 'denied') {
          toast.error('Izin notifikasi diblokir browser', {
            description: 'Silakan buka pengaturan browser / info situs untuk mengizinkan notifikasi.',
          });
        } else {
          toast.error(pushRes.error || 'Gagal mengaktifkan notifikasi.');
        }
      }
    } else {
      setPlantNotificationEnabled(plant.id, false);
      setNotifOn(false);
      toast.info(`Pengingat siram untuk ${plant.nama} dinonaktifkan.`);
    }
  };

  if (!plant) {
    return null;
  }

  return (
    <>
      <SiramDesktopView
        plant={plant}
        sudahDisiram={sudahDisiram}
        onSiram={handleSiram}
        notifOn={notifOn}
        onToggleNotif={handleToggleNotif}
        onEdit={() => setEditOpen(true)}
        onHapus={() => setHapusOpen(true)}
        weather={weather}
      />

      <SiramMobileView
        plant={plant}
        sudahDisiram={sudahDisiram}
        onSiram={handleSiram}
        notifOn={notifOn}
        onToggleNotif={handleToggleNotif}
        onEdit={() => setEditOpen(true)}
        onHapus={() => setHapusOpen(true)}
        onBack={() => router.push('/siram')}
        weather={weather}
      />

      {/* Edit and Delete Dialogs */}
      <EditTanamanDialog
        plant={plant}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <HapusTanamanDialog
        plant={plant}
        open={hapusOpen}
        onOpenChange={setHapusOpen}
        onDeleted={() => router.push('/siram')}
      />
    </>
  );
}
