'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTanamanList, tanamanStore, EditTanamanDialog, HapusTanamanDialog } from '@/features/plants';
import { useWeather } from '../use-weather';
import SiramDesktopView from './SiramDesktopView';
import SiramMobileView from './SiramMobileView';

export default function SiramDetailView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const tanamanList = useTanamanList();
  const plant = tanamanList.find((x) => x.id === id) ?? tanamanStore.getById(id) ?? tanamanList[0];
  const weather = useWeather();

  const [sudahDisiram, setSudahDisiram] = useState(false);
  const [notifOn, setNotifOn] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [hapusOpen, setHapusOpen] = useState(false);

  const handleSiram = async () => {
    if (!plant || sudahDisiram) return;
    setSudahDisiram(true);
    await tanamanStore.editAsync(plant.id, {
      status: 'terjadwal',
      nextWater: 'nw.berikutnyaBesok',
    });
    toast.success(`${plant.nama} berhasil disiram! Status disinkronkan ke database.`);
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
        onToggleNotif={() => setNotifOn((v) => !v)}
        onEdit={() => setEditOpen(true)}
        onHapus={() => setHapusOpen(true)}
        weather={weather}
      />

      <SiramMobileView
        plant={plant}
        sudahDisiram={sudahDisiram}
        onSiram={handleSiram}
        notifOn={notifOn}
        onToggleNotif={() => setNotifOn((v) => !v)}
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
