'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Droplets, CircleCheck, Clock, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TkRevealClient from '@/components/shared/tk-reveal-client';
import type { wateringToday } from '../mock';

export interface HomeWateringScheduleProps {
  tasks: typeof wateringToday;
}

export function HomeWateringSchedule({ tasks }: HomeWateringScheduleProps) {
  const t = useTranslations("home");

  return (
    <section aria-labelledby="penyiraman-hari-ini" className="min-w-0">
      <TkRevealClient>
        <div className="sage-wash rounded-xl border border-border p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="penyiraman-hari-ini" className="flex items-center gap-2 text-base font-bold tracking-tight sm:text-lg">
              <Droplets className="h-5 w-5 text-primary" aria-hidden="true" />
              {t("penyiramanHariIni")}
            </h2>
            <Link href="/siram" className="shrink-0 text-sm font-medium text-primary hover:underline">
              {t("jadwal")}
            </Link>
          </div>
          <ol className="divide-y divide-border rounded-xl border border-border bg-card">
            {tasks.map((w) => {
              const meta = {
                completed: { label: t('selesai'), icon: CircleCheck, cls: 'text-success' },
                upcoming: { label: t('akanDatang'), icon: Clock, cls: 'text-muted-foreground' },
                overdue: { label: t('terlewat'), icon: TriangleAlert, cls: 'text-destructive' },
              }[w.state];
              return (
                <li key={w.time + w.plant} className="flex items-center justify-between gap-3 p-3.5 transition-colors hover:bg-secondary/60 sm:px-5 sm:py-4">
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <span className="tnum w-11 shrink-0 text-xs font-bold sm:w-12 sm:text-sm">{w.time}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{w.plant}</p>
                      <p className="text-xs text-muted-foreground sm:text-sm">{t("penyiraman")}</p>
                    </div>
                  </div>
                  <span className={'flex shrink-0 items-center gap-1.5 text-xs font-semibold sm:text-sm ' + meta.cls}>
                    <meta.icon className="h-4 w-4" aria-hidden="true" />
                    {meta.label}
                  </span>
                </li>
              );
            })}
          </ol>
          <Button asChild variant="outline" className="mt-4 w-full rounded-full bg-card hover:bg-accent/60">
            <Link href="/siram">{t("bukaJadwal")}</Link>
          </Button>
        </div>
      </TkRevealClient>
    </section>
  );
}
