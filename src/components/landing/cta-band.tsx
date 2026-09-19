'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import TkRevealClient from './tk-reveal-client';

export default function CtaBand() {
  const t = useTranslations('landing.cta');
  return (
    <section className="bg-background py-28 sm:py-36 px-6 hidden md:block">
      <TkRevealClient>
        <div className="max-w-[1200px] mx-auto flex flex-col items-center">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-[-0.03em] leading-[1.05] text-foreground max-w-3xl mx-auto text-center">
            {t('judul')}
          </h2>
          <p className="mt-6 text-muted-foreground text-center max-w-md mx-auto">
            {t('sub')}
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link
              href="/register"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold px-8 py-4 rounded-full transition-all hover:scale-[1.03] active:scale-95 shadow-md"
            >
              {t('mulai')}
            </Link>
            <Link
              href="/login"
              className="border border-border hover:border-primary text-foreground text-base font-medium px-8 py-4 rounded-full transition-colors"
            >
              {t('sudah')} {t('masuk')}
            </Link>
          </div>
        </div>
      </TkRevealClient>
    </section>
  );
}
