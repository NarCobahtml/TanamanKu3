'use client';

import TkRevealClient from './tk-reveal-client';
import { useTranslations } from 'next-intl';

export default function Statement() {
  const t = useTranslations('landing.statement');
  return (
    <section className="bg-background py-32 sm:py-40 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <TkRevealClient>
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.2em] mb-6">
            {t('judul')}
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-[-0.03em] leading-[1.05] text-foreground">
            {t('teks')}
          </h2>
          <p className="mt-8 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t('body')}
          </p>
        </TkRevealClient>
      </div>
    </section>
  );
}
