'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Leaf, ArrowRight, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TkRevealClient from '@/components/shared/tk-reveal-client';
import type { Tanaman } from '@/features/plants';
import type { PlantHealth } from '../mock';

export interface HomePlantCollectionProps {
  plants: Tanaman[];
  healthById: Record<string, PlantHealth>;
}

export function HomePlantCollection({ plants, healthById }: HomePlantCollectionProps) {
  const t = useTranslations("home");
  const ts = useTranslations("siram");

  return (
    <section aria-labelledby="tanaman-saya" className="rule pt-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="overline">{t("koleksi")}</p>
          <h2 id="tanaman-saya" className="mt-1.5 text-3xl font-extrabold tracking-tight md:text-4xl">
            {t("tanaman")} <span className="font-playfair">{t("saya")}</span>
          </h2>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full bg-card hover:bg-accent/60">
          <Link href="/siram">
            {t("kelolaSemua")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <TkRevealClient>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plants.slice(0, 8).map((plant) => {
            const h = healthById[plant.id] ?? { level: 'sehat', lastScan: '-' };
            return (
              <Link
                key={plant.id}
                href={`/siram/${plant.id}`}
                className="group block overflow-hidden rounded-xl border border-border bg-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-primary/40 hover:bg-accent/30"
              >
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
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold leading-tight">{plant.nama}</h3>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm text-foreground">
                      <Droplets className="h-4 w-4" aria-hidden="true" />
                      {ts(plant.nextWater)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80">{t("scanTerakhir")} {h.lastScan}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </TkRevealClient>
    </section>
  );
}
