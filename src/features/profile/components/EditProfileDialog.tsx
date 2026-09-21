'use client';

import { useTranslations } from 'next-intl';
import { Camera } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { RefObject, ChangeEvent } from 'react';

export interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  setName: (name: string) => void;
  email: string;
  photo: string;
  setPhoto: (photo: string) => void;
  userPhotoUrl?: string | null;
  initials: string;
  saving: boolean;
  onSave: () => void;
  onPickPhoto: (e: ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  name,
  setName,
  email,
  photo,
  setPhoto,
  userPhotoUrl,
  initials,
  saving,
  onSave,
  onPickPhoto,
  fileInputRef,
}: EditProfileDialogProps) {
  const t = useTranslations('profil');
  const tc = useTranslations('common');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('editProfil')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Avatar picker */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="size-20">
                {photo || userPhotoUrl ? (
                  <AvatarImage src={photo || userPhotoUrl || ''} alt="Preview" className="object-cover" />
                ) : null}
                <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                aria-label="Ubah foto profil"
              >
                <span className="sr-only">Upload foto</span>
                <span aria-hidden="true">
                  <Camera className="size-4" />
                </span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={onPickPhoto}
            />

            {(photo || userPhotoUrl) && (
              <button
                type="button"
                onClick={() => {
                  setPhoto('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="mt-2 text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                Hapus foto
              </button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-name">{t('nama')}</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Lengkap"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">{t('email')}</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              disabled
              className="bg-muted text-muted-foreground cursor-not-allowed opacity-75"
            />
            <p className="text-[11px] text-muted-foreground">Email akun terdaftar dan tidak dapat diubah langsung.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {tc('batal')}
          </Button>
          <Button onClick={onSave} disabled={saving || !name.trim()}>
            {saving ? 'Menyimpan...' : tc('simpan')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
