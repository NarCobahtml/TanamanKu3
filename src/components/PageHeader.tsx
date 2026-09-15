'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { PageBand } from '@/components/PageBand';

/**
 * Page hero with a bottom rule and larger rhythm, full-width editorial
 * opening for content pages (kept for back-compat with tanaman detail).
 * `tone` and `accent` are passed through to the hero band.
 */
export function PageHeader({
  title,
  description,
  actions,
  children,
  className,
  overline,
  accent,
  tone = 'sage',
  compact,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  overline?: string;
  accent?: string;
  tone?: 'sage' | 'ink' | 'plain';
  compact?: boolean;
}) {
  return (
    <PageBand
      title={title}
      description={description}
      action={actions}
      overline={overline}
      accent={accent}
      tone={tone}
      compact={compact}
      className={cn('border-b border-border', className)}
    >
      {children}
    </PageBand>
  );
}

/** Section heading with optional "see all" link. */
export function SectionHeader({
  title,
  href,
  hrefLabel,
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  const tc = useTranslations('common');
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      {href && (
        <a href={href} className="shrink-0 text-sm font-medium text-primary hover:underline">
          {hrefLabel ?? tc("lihatSemua")}
        </a>
      )}
    </div>
  );
}
