'use client';

import { useTranslations } from 'next-intl';
import { Camera, ClipboardCheck, ScanLine, ScanSearch } from 'lucide-react';
import TkRevealClient from './tk-reveal-client';

const STEPS = [
  { icon: Camera, title: 's1', desc: 's1d' },
  { icon: ScanSearch, title: 's2', desc: 's2d' },
  { icon: ClipboardCheck, title: 's3', desc: 's3d' },
] as const;

export default function HowItWorks() {
  const t = useTranslations('landing.how');
  return (
    <section id="cara-kerja" className="bg-background py-24 sm:py-32 px-6">
      <div className="max-w-[1200px] mx-auto">
        <TkRevealClient>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-[-0.03em] text-foreground max-w-2xl">
            {t("judul")}
          </h2>
          <p className="mt-5 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
            {t("sub")}
          </p>
        </TkRevealClient>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mt-14 items-center">
          <div className="flex flex-col gap-10">
            {STEPS.map((step, i) => (
              <TkRevealClient key={step.title} className={i > 0 ? 'delay-75' : ''}>
                <div className="flex items-start gap-4">
                  <span className="w-12 h-12 rounded-full border border-primary/40 text-primary flex items-center justify-center shrink-0">
                    <step.icon className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{t(step.title)}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2 max-w-md">{t(step.desc)}</p>
                  </div>
                </div>
              </TkRevealClient>
            ))}
          </div>

          <TkRevealClient>
            <div className="rounded-md border border-border bg-card overflow-hidden max-w-md mx-auto lg:ml-auto">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                <ScanLine className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{t("hasil")}</span>
              </div>
              <img
                src="/figma-assets/scanned-leaf.png"
                alt={t("alt")}
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-semibold text-card-foreground">{t("embun")}</h3>
                  <span className="text-xs rounded-full bg-accent text-primary px-3 py-1 font-medium">
                    {t("akurasi")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                  {t("embunDesc")}
                </p>
              </div>
            </div>
          </TkRevealClient>
        </div>
      </div>
    </section>
  );
}
