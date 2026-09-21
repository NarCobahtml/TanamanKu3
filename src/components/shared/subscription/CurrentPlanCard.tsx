'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CurrentPlanCardProps {
  name: string;
  badgeLabel: string;
  description: string;
  renewalNote: string;
  className?: string;
}

export function CurrentPlanCard({
  name,
  badgeLabel,
  description,
  renewalNote,
  className,
}: CurrentPlanCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 sm:p-5 transition-colors hover:border-primary/40 hover:bg-accent/30',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-semibold">{name}</h3>
        <Badge variant="outline">{badgeLabel}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <p className="mt-4 text-sm text-muted-foreground">{renewalNote}</p>
    </div>
  );
}
