'use client';

import { useTranslations } from 'next-intl';
import { Leaf } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SectionHeader } from '@/components/shared/PageHeader';
import { HealthStatus } from '@/components/shared/HealthStatus';
import TkRevealClient from '@/components/shared/tk-reveal-client';
import type { recentScans } from '../mock';

export interface HomeRecentScansProps {
  scans: typeof recentScans;
}

export function HomeRecentScans({ scans }: HomeRecentScansProps) {
  const t = useTranslations("home");

  return (
    <section aria-labelledby="scan-terakhir" className="min-w-0">
      <SectionHeader title={t("diagnosis")} href="/riwayat" />
      <TkRevealClient>
        <div className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
          {/* Mobile scan cards (< sm) */}
          <div className="divide-y divide-border sm:hidden">
            {scans.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  {s.photo ? (
                    <img src={s.photo} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <Leaf className="h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{s.plant}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{s.disease}</p>
                  </div>
                </div>
                <div className="shrink-0">
                  <HealthStatus level={s.level} />
                </div>
              </div>
            ))}
          </div>

          {/* Full table (>= sm) */}
          <div className="hidden overflow-x-auto sm:block">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="py-4 pl-5 text-xs font-bold uppercase tracking-[0.08em] text-foreground">{t("tanaman")}</TableHead>
                  <TableHead className="py-4 text-xs font-bold uppercase tracking-[0.08em] text-foreground">{t("diagnosis")}</TableHead>
                  <TableHead className="hidden py-4 text-xs font-bold uppercase tracking-[0.08em] text-foreground sm:table-cell">{t("keyakinan")}</TableHead>
                  <TableHead className="hidden py-4 text-xs font-bold uppercase tracking-[0.08em] text-foreground md:table-cell">{t("tanggal")}</TableHead>
                  <TableHead className="py-4 pr-5 text-right text-xs font-bold uppercase tracking-[0.08em] text-foreground">{t("status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans.map((s) => (
                  <TableRow key={s.id} className="border-border transition-colors hover:bg-secondary">
                    <TableCell className="py-4 text-[15px]">
                      <span className="flex items-center gap-3">
                        {s.photo ? (
                          <img src={s.photo} alt="" className="h-9 w-9 rounded-lg object-cover" />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                            <Leaf className="h-4 w-4" aria-hidden="true" />
                          </span>
                        )}
                        <span className="font-medium">{s.plant}</span>
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] whitespace-normal text-[15px] text-foreground/80">{s.disease}</TableCell>
                    <TableCell className="tnum hidden text-[15px] font-semibold sm:table-cell">{s.confidence}%</TableCell>
                    <TableCell className="tnum hidden whitespace-nowrap text-[15px] font-medium md:table-cell">{s.date}</TableCell>
                    <TableCell className="py-4 pr-5 text-right">
                      <HealthStatus level={s.level} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="border-t border-border bg-secondary/30 px-5 py-3 text-sm text-muted-foreground">
            {t("laporan30")}
          </p>
        </div>
      </TkRevealClient>
    </section>
  );
}
