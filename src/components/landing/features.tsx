'use client';

import { useTranslations } from 'next-intl';
import { Bug, Droplets, History, MessagesSquare, ScanLine } from 'lucide-react';
import TkRevealClient from './tk-reveal-client';

const FEATURES = [
  { icon: Droplets, tk: 'sir', key: 'sirJudul', desc: 'sirDesc' },
  { icon: MessagesSquare, tk: 'forum', key: 'forumJudul', desc: 'forumDesc' },
  { icon: History, tk: 'riw', key: 'riwJudul', desc: 'riwDesc' },
  { icon: Bug, tk: 'hama', key: 'hamaJudul', desc: 'hamaDesc' },
] as const;

export default function Features() {
  const t = useTranslations('landing.features');
  const ti = (k: string) => t(`items.${k}`);
  return (
    <section id="fitur" className="bg-background py-24 sm:py-32 px-6">
      <div className="max-w-[1200px] mx-auto">
        <TkRevealClient>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-[-0.03em] text-foreground max-w-2xl">
            {t("judul")}
          </h2>
        </TkRevealClient>

        <TkRevealClient className="mt-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <div className="md:col-span-2 relative rounded-md overflow-hidden min-h-[320px] md:min-h-[420px]">
              <div
                className="absolute inset-0 bg-center bg-cover"
                style={{ backgroundImage: "url('/figma-assets/scanned-leaf.png')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col items-start gap-3">
                <span className="w-10 h-10 rounded-full bg-primary/20 text-primary-foreground flex items-center justify-center backdrop-blur-sm">
                  <ScanLine className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-semibold text-white">{t("scanJudul")}</h3>
                <p className="text-sm text-white/70 leading-relaxed max-w-md">
                  {t("scanDesc")}
                </p>
              </div>
            </div>

            {FEATURES.map((f) => (
              <div
                key={f.key}
                className="rounded-md border border-border bg-card p-6 sm:p-8 hover:border-primary/30 transition-colors"
              >
                <span className="w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center">
                  <f.icon className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-semibold text-card-foreground mt-5">{ti(f.key)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">{ti(f.desc)}</p>
              </div>
            ))}
          </div>
        </TkRevealClient>
      </div>
    </section>
  );
}
