'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { tanamanStore, type Tanaman } from './tanaman-store';

export default function HapusTanamanDialog({
  plant,
  open,
  onOpenChange,
  onDeleted,
}: {
  plant: Tanaman | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDeleted?: () => void;
}) {
  const tc = useTranslations('common');
  const td = useTranslations('tanamanDetail');

  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!plant || submitting) return;
    setSubmitting(true);
    try {
      await tanamanStore.hapusAsync(plant.id);
      toast.success('Tanaman berhasil dihapus', {
        description: `${plant.nama} telah dihapus dari Supabase.`,
      });
      onOpenChange(false);
      onDeleted?.();
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus tanaman dari database.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            {td('hapusTanaman') || 'Hapus Tanaman'}
          </DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus <strong>{plant?.nama}</strong>? Tindakan ini akan menghapus tanaman dari jadwal penyiraman dan catatan kesehatan secara permanen.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {tc('batal') || 'Batal'}
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Menghapus...' : (tc('hapus') || 'Hapus')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
