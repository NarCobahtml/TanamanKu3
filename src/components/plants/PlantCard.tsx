'use client';

import Link from 'next/link';
import { Droplets, Leaf, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Tanaman } from '@/lib/tanaman-store';
import { StatusSiramBadge } from './StatusSiramBadge';
import { cn } from '@/lib/utils';

export function PlantThumb({ t, className }: { t: Tanaman; className?: string }) {
  return t.photo ? (
    <img src={t.photo} alt={t.nama} className={cn('h-10 w-10 rounded-sm object-cover', className)} />
  ) : (
    <span className={cn('flex h-10 w-10 items-center justify-center bg-accent', className)} aria-hidden="true">
      <Leaf className="size-5 text-primary/40" />
    </span>
  );
}

export interface PlantCardProps {
  plant: Tanaman;
  onEdit?: (plant: Tanaman) => void;
  onHapus?: (plant: Tanaman) => void;
}

export function PlantCard({
  plant,
  onEdit,
  onHapus,
}: PlantCardProps) {
  const ts = useTranslations('siram');

  return (
    <div className="group block overflow-hidden rounded-xl border border-border bg-card transition-colors focus-within:ring-2 focus-within:ring-ring hover:border-primary/40 hover:bg-accent/30">
      <Link href={`/siram/${plant.id}`} className="block focus:outline-none">
        {plant.photo ? (
          <img
            src={plant.photo}
            alt={plant.nama}
            className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-accent" aria-hidden="true">
            <Leaf className="size-10 text-primary/40" />
          </div>
        )}
      </Link>
      <div className="space-y-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/siram/${plant.id}`} className="min-w-0 flex-1 hover:underline">
            <h3 className="font-semibold leading-tight">{plant.nama}</h3>
          </Link>
          {(onEdit || onHapus) && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(plant)}
                  aria-label={`Edit ${plant.nama}`}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {onHapus && (
                <button
                  type="button"
                  onClick={() => onHapus(plant)}
                  aria-label={`Hapus ${plant.nama}`}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2">
          <StatusSiramBadge status={plant.status} />
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
            {ts(plant.nextWater)}
          </span>
        </div>
      </div>
    </div>
  );
}
