'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loggingOut: boolean;
  onLogout: () => void;
}

export function LogoutDialog({
  open,
  onOpenChange,
  loggingOut,
  onLogout,
}: LogoutDialogProps) {
  const t = useTranslations('profil');
  const tc = useTranslations('common');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('keluarAkun')}</DialogTitle>
          <DialogDescription>{t('konfirmasiKeluar')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loggingOut}>
            {tc('batal')}
          </Button>
          <Button
            variant="destructive"
            disabled={loggingOut}
            onClick={onLogout}
          >
            {loggingOut ? 'Memproses...' : t('keluar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
