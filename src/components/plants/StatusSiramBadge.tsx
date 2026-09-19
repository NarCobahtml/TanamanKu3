'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { StatusSiram } from '@/lib/tanaman-store';

const statusSiramBadge: Record<StatusSiram, { label: string; className: string }> = {
  'hari-ini': { label: 'hariIni', className: 'border-warning/30 bg-warning/10 text-warning' },
  terlambat: { label: 'terlambat', className: 'border-destructive/30 bg-destructive/10 text-destructive' },
  terjadwal: { label: 'terjadwal', className: '' },
};

export function StatusSiramBadge({ status }: { status: StatusSiram }) {
  const ts = useTranslations('siram');
  const s = statusSiramBadge[status];
  return (
    <Badge variant={status === 'terjadwal' ? 'secondary' : 'outline'} className={s.className}>
      {ts(s.label)}
    </Badge>
  );
}
