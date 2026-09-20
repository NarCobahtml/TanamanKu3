'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTanamanList, tanamanStore, EditTanamanDialog, HapusTanamanDialog } from '@/features/plants';
import SiramDesktopView from './SiramDesktopView';
import SiramMobileView from './SiramMobileView';

export default function SiramDetailView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const tanamanList = useTanamanList();
  const plant = tanamanList.find((x) => x.id === id) ?? tanamanStore.getById(id) ?? tanamanList[0];

  const [sudahDisiram, setSudahDisiram] = useState(false);
  const [notifOn, setNotifOn] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [hapusOpen, setHapusOpen] = useState(false);

  if (!plant) {
    return null;
  }

  return (
    <>
      <SiramDesktopView
        plant={plant}
        sudahDisiram={sudahDisiram}
        onSiram={() => setSudahDisiram(true)}
        notifOn={notifOn}
        onToggleNotif={() => setNotifOn((v) => !v)}
        onEdit={() => setEditOpen(true)}
        onHapus={() => setHapusOpen(true)}
      />

      <SiramMobileView
        plant={plant}
        sudahDisiram={sudahDisiram}
        onSiram={() => setSudahDisiram(true)}
        notifOn={notifOn}
        onToggleNotif={() => setNotifOn((v) => !v)}
        onEdit={() => setEditOpen(true)}
        onHapus={() => setHapusOpen(true)}
        onBack={() => router.push('/siram')}
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
