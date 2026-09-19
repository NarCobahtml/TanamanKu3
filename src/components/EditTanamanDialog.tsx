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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { tanamanStore, type Tanaman, type KategoriTanaman, type StatusSiram } from '@/lib/tanaman-store';

function EditTanamanForm({
  plant,
  onClose,
}: {
  plant: Tanaman;
  onClose: () => void;
}) {
  const ts = useTranslations('siram');
  const tc = useTranslations('common');
  const td = useTranslations('tanamanDetail');

  const [form, setForm] = useState({
    nama: plant.nama,
    kategori: plant.kategori,
    status: plant.status,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim() || submitting) return;
    setSubmitting(true);

    try {
      await tanamanStore.editAsync(plant.id, {
        nama: form.nama.trim(),
        kategori: form.kategori,
        status: form.status,
      });

      toast.success('Tanaman berhasil diperbarui', {
        description: `Data tanaman ${form.nama} telah diperbarui di Supabase.`,
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Gagal memperbarui tanaman di database.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{td('editTanaman') || 'Edit Tanaman'}</DialogTitle>
        <DialogDescription>
          Perbarui informasi detail tanaman Anda di sini.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="edit-plant-name">{ts('namaTanaman') || 'Nama Tanaman'}</Label>
          <Input
            id="edit-plant-name"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            placeholder="Contoh: Monstera Deliciosa"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="edit-plant-kategori">{td('kategori') || 'Kategori'}</Label>
            <Select
              value={form.kategori}
              onValueChange={(val: KategoriTanaman) => setForm({ ...form, kategori: val })}
            >
              <SelectTrigger id="edit-plant-kategori" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Indoor">Indoor</SelectItem>
                <SelectItem value="Outdoor">Outdoor</SelectItem>
                <SelectItem value="Kebun">Kebun</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-plant-status">Status Siram</Label>
            <Select
              value={form.status}
              onValueChange={(val: StatusSiram) => setForm({ ...form, status: val })}
            >
              <SelectTrigger id="edit-plant-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hari-ini">{ts('hariIni') || 'Hari Ini'}</SelectItem>
                <SelectItem value="terjadwal">{ts('terjadwal') || 'Terjadwal'}</SelectItem>
                <SelectItem value="terlambat">{ts('terlambat') || 'Terlambat'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-6 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            {tc('batal') || 'Batal'}
          </Button>
          <Button type="submit" disabled={submitting || !form.nama.trim()}>
            {submitting ? 'Menyimpan...' : (tc('simpan') || 'Simpan')}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default function EditTanamanDialog({
  plant,
  open,
  onOpenChange,
}: {
  plant: Tanaman | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {plant && (
        <EditTanamanForm
          key={plant.id}
          plant={plant}
          onClose={() => onOpenChange(false)}
        />
      )}
    </Dialog>
  );
}
