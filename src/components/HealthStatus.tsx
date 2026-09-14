import { CircleCheck, TriangleAlert, Virus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type HealthLevel = 'sehat' | 'perhatian' | 'penyakit' | 'info';

const conf: Record<HealthLevel, { icon: typeof CircleCheck; label: string; className: string }> = {
  sehat: {
    icon: CircleCheck,
    label: 'Sehat',
    className: 'border-success/30 bg-success/10 text-success',
  },
  perhatian: {
    icon: TriangleAlert,
    label: 'Perlu Perhatian',
    className: 'border-warning/30 bg-warning/10 text-warning',
  },
  penyakit: {
    icon: Virus,
    label: 'Terdeteksi Penyakit',
    className: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
  info: {
    icon: Info,
    label: 'Informasi',
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
      {label ?? c.label}
    </span>
  );
}
