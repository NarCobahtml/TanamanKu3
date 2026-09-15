'use client';

import { CreditCard, Sparkles, CircleCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import TkRevealClient from '@/components/landing/tk-reveal-client';

export default function LanggananPage() {
  const t = useTranslations('langganan');

  const plans = [
    {
      id: 'gratis',
      name: t('paketGratis'),
      price: t('gratis'),
      period: t('selamanya'),
      features: [t('scanBulan'), t('fitur1'), t('fitur2')],
      buttonLabel: t('paketAktif'),
      buttonVariant: 'outline' as const,
    },
    {
      id: 'premium',
      name: t('premium'),
      price: t('harga'),
      period: t('perBulan'),
      features: [t('fiturPremium1'), t('fiturPremium2'), t('fiturPremium3'), t('fiturPremium4')],
      buttonLabel: t('upgradeSekarang'),
      buttonVariant: 'default' as const,
    },
  ];

  return (
    <div>
      <PageHeader
        overline={t('paketTagihan')}
        title={t('langganan')}
        accent={t('langganan')}
        description={t('langgananDesc')}
      >
        {/* Current usage stat */}
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <div>
            <p className="tnum text-4xl font-extrabold leading-none text-primary">3/5</p>
            <p className="overline mt-2">{t('scanTerpakai')}</p>
          </div>
          <div>
            <p className="tnum text-4xl font-extrabold leading-none">{t('gratis')}</p>
            <p className="overline mt-2">{t('paketAktif')}</p>
          </div>
        </div>
      </PageHeader>

      <div className="mx-auto w-full max-w-7xl space-y-16 px-4 pb-4 pt-14 sm:px-6">
        {/* Current plan + usage */}
        <TkRevealClient>
          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
              {t('paketAktif')}
            </h2>
            <div className="mt-5 grid gap-8 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/30">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-semibold">{t('paketGratis')}</h3>
                  <Badge variant="outline">{t('aktif')}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('paketDesc')}
                </p>
                <p className="mt-4 text-sm text-muted-foreground">{t('perpanjangan')}</p>
              </div>
              <div className="rounded-xl border border-border p-5 sage-wash">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t('penggunaanScan')}</span>
                  <span className="tnum text-muted-foreground">3/5</span>
                </div>
                <div
                  className="mt-2 h-1.5 rounded-full bg-white"
                  role="progressbar"
                  aria-label="3/5"
                  aria-valuenow={3}
                  aria-valuemin={0}
                  aria-valuemax={5}
                >
                  <div className="h-full w-[60%] rounded-full bg-primary" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{t('tersisa')}</p>
              </div>
            </div>
          </section>
        </TkRevealClient>

        {/* Plans */}
        <TkRevealClient>
          <section className="rule pt-14">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
              {t('pilihPaket')}
            </h2>
            <div className="mt-5 grid gap-8 md:grid-cols-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
                >
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-primary">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CircleCheck className="h-4 w-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.buttonVariant}
                    className="mt-6 w-full rounded-full"
                    onClick={() => undefined}
                  >
                    {plan.buttonLabel}
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </TkRevealClient>
      </div>
    </div>
  );
}
