'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FilterPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
  children: React.ReactNode;
}

export function FilterPill({
  active,
  children,
  className,
  ...props
}: FilterPillProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'bg-primary text-primary-foreground border border-primary'
          : 'border border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-accent/60 hover:text-primary',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
