'use client';

import { CircleCheck, TriangleAlert, Virus, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type HealthLevel = 'sehat' | 'perhatian' | 'penyakit' | 'info';

/** Map label string dari data demo ke message key. */
const HEALTH_LABELS: Record<string, string> = {
  Sehat: 'sehat',
  Terinfeksi: 'terinfeksi',
  'Perlu Perhatian': 'perluPerhatian',
  'Terdeteksi Penyakit': 'terdeteksiPenyakit',
  Informasi: 'informasi',
};

const conf: Record<HealthLevel, { icon: typeof CircleCheck; labelKey: string; className: string }> = {
  sehat: {
    icon: CircleCheck,
    labelKey: 'sehat',
    className: 'border-success/30 bg-success/10 text-success',
  },
  perhatian: {
    icon: TriangleAlert,
    labelKey: 'perluPerhatian',
    className: 'border-warning/30 bg-warning/10 text-warning',
  },
  penyakit: {
    icon: Virus,
    labelKey: 'terdeteksiPenyakit',
    className: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
  info: {
    icon: Info,
    labelKey: 'informasi',
    className: 'border-info/30 bg-info/10 text-info',
  },
};

/** Status chip: icon + label + tone. Never color-only (a11y). */
export function HealthStatus({
  level,
  label,
  className,
}: {
  level: HealthLevel;
  label?: string;
  className?: string;
}) {
  const th = useTranslations('health');
  const c = conf[level];
  const Icon = c.icon;
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 border px-2.5 py-1 text-sm font-semibold',
        c.className,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {label ? (HEALTH_LABELS[label] ? th(HEALTH_LABELS[label]) : label) : th(c.labelKey)}
    </span>
  );
}
