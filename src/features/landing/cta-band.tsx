'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import TkRevealClient from '@/components/shared/tk-reveal-client';

export default function CtaBand() {
  const t = useTranslations('landing.cta');
  return (
    <section className="bg-background py-16 sm:py-28 md:py-36 px-5 sm:px-6">
      <TkRevealClient>
        <div className="max-w-[1200px] mx-auto flex flex-col items-center text-center">
          <h2 className="text-2xl sm:text-4xl md:text-6xl font-medium tracking-[-0.03em] leading-[1.15] sm:leading-[1.05] text-foreground max-w-3xl mx-auto">
            {t('judul')}
          </h2>
          <p className="mt-4 sm:mt-6 text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            {t('sub')}
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:gap-4 justify-center items-center">
            <Link
              href="/register"
              className="w-full sm:w-auto text-center bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base font-semibold px-8 py-3.5 sm:py-4 rounded-full transition-all hover:scale-[1.03] active:scale-95 shadow-md"
            >
              {t('mulai')}
            </Link>
            <Link
              href="/home"
              className="w-full sm:w-auto text-center border border-border hover:border-primary text-foreground text-sm sm:text-base font-medium px-8 py-3.5 sm:py-4 rounded-full transition-colors hover:bg-primary/5"
            >
              Coba Demo (Mode Tamu)
            </Link>
          </div>
        </div>
      </TkRevealClient>
    </section>
  );
}
