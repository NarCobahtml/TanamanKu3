'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ScanUsageCardProps {
  title: string;
  usageText: string;
  current: number;
  max: number;
  barHeightClass?: string;
  children?: React.ReactNode;
  className?: string;
}

export function ScanUsageCard({
  title,
  usageText,
  current,
  max,
  barHeightClass = 'h-2',
  children,
  className,
}: ScanUsageCardProps) {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  return (
    <div className={cn('rounded-xl border border-border p-4 sm:p-5 sage-wash', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{title}</span>
        <span className="tnum text-muted-foreground">{usageText}</span>
      </div>
      <div
        className={cn('mt-2 rounded-full bg-card border border-border/50 overflow-hidden', barHeightClass)}
        role="progressbar"
        aria-label={`${current}/${max}`}
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {children}
    </div>
  );
}
