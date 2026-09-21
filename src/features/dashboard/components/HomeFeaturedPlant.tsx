'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Leaf, ArrowRight, Camera, Bug, CalendarCheck } from 'lucide-react';
import TkRevealClient from '@/components/shared/tk-reveal-client';
import { HealthStatus } from '@/components/shared/HealthStatus';
import type { Tanaman } from '@/features/plants';
import type { PlantHealth } from '../mock';

export interface HomeFeaturedPlantProps {
  heroPlant: Tanaman;
  heroHealth: PlantHealth;
}

export function HomeFeaturedPlant({ heroPlant, heroHealth }: HomeFeaturedPlantProps) {
  const t = useTranslations("home");

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-16 sm:px-6" aria-label={t("tanamanUnggulan")}>
      <TkRevealClient>
        <div className="grid overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40 lg:grid-cols-[1fr_1fr]">
          <Link
            href={`/siram/${heroPlant.id}`}
            className="group relative block aspect-[16/10] w-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {heroPlant.photo ? (
              <img
                src={heroPlant.photo}
                alt={heroPlant.nama}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-accent" aria-hidden="true">
                <Leaf className="size-12 text-primary/40" />
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent p-5 pt-12">
              <span className="min-w-0">
                <span className="block font-bold text-white">{heroPlant.nama}</span>
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                {t("lihatDetail")}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </span>
          </Link>

          <div className="flex flex-col">
            {/* Quick actions, detection first */}
            <div className="grid flex-1 grid-cols-3 divide-x divide-border">
              {[
                { href: '/scan', icon: Camera, label: t('scanBaru') },
                { href: '/riwayat', icon: Bug, label: t('diagnosis') },
                { href: '/siram', icon: CalendarCheck, label: t('penyiraman') },
              ].map((q) => (
                <Link
                  key={q.label}
                  href={q.href}
                  className="flex flex-col items-center justify-center gap-2 px-3 py-8 text-center transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:bg-accent/40"
                >
                  <q.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                  <span className="text-sm font-semibold">{q.label}</span>
                </Link>
              ))}
            </div>

            {/* Latest health note */}
            <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4 text-sm text-muted-foreground">
              <span>
                {t("scanTerakhir")} <strong className="font-semibold text-foreground">{heroHealth.lastScan}</strong>
              </span>
              <HealthStatus level={heroHealth.level} />
            </div>
          </div>
        </div>
      </TkRevealClient>
    </section>
  );
}
