'use client';

import { toast } from 'sonner';
import { CreditCard, Sparkles, CircleCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import TkRevealClient from '@/components/landing/tk-reveal-client';

const plans = [
  {
    id: 'gratis',
    name: 'Paket Gratis',
    price: 'Gratis',
    period: 'selamanya',
    features: ['5 scan per bulan', 'Riwayat scan dasar', 'Forum komunitas'],
    buttonLabel: 'Paket Aktif',
    buttonVariant: 'outline' as const,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'Rp 29.000',
    period: 'per bulan',
    features: ['Scan tanpa batas', 'Riwayat lengkap + ekspor', 'Rekomendasi AI prioritas', 'Dukungan ahli'],
    buttonLabel: 'Upgrade Sekarang',
    buttonVariant: 'default' as const,
  },
];

export default function LanggananPage() {
  return (
    <div>
      <PageHeader
        overline="Paket & Tagihan"
        title="Langganan"
        accent="Langganan"
        description="Kelola paket aktif, penggunaan scan, dan upgrade ke Premium untuk akses penuh."
      >
        {/* Current usage stat */}
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <div>
            <p className="tnum text-4xl font-extrabold leading-none text-primary">3/5</p>
            <p className="overline mt-2">Scan terpakai bulan ini</p>
          </div>
          <div>
            <p className="tnum text-4xl font-extrabold leading-none">Gratis</p>
            <p className="overline mt-2">Paket aktif</p>
          </div>
        </div>
      </PageHeader>

      <div className="mx-auto w-full max-w-7xl space-y-16 px-4 pb-4 pt-14 sm:px-6">
        {/* Current plan + usage */}
        <TkRevealClient>
          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
              Paket Aktif
            </h2>
            <div className="mt-5 grid gap-8 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/30">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-semibold">Paket Gratis</h3>
                  <Badge variant="outline">Aktif</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Paket dasar untuk memulai perawatan tanamanmu.
                </p>
                <p className="mt-4 text-sm text-muted-foreground">Perpanjangan otomatis: tidak aktif</p>
              </div>
              <div className="rounded-xl border border-border p-5 sage-wash">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Penggunaan scan</span>
                  <span className="tnum text-muted-foreground">3/5 bulan ini</span>
                </div>
                <div
                  className="mt-2 h-1.5 rounded-full bg-white"
                  role="progressbar"
                  aria-label="3 dari 5 scan terpakai"
                  aria-valuenow={3}
                  aria-valuemin={0}
                  aria-valuemax={5}
                >
                  <div className="h-full w-[60%] rounded-full bg-primary" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Tersisa 2 scan bulan ini</p>
              </div>
            </div>
          </section>
        </TkRevealClient>

        {/* Plans */}
        <TkRevealClient>
          <section className="rule pt-14">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
              Pilih Paket
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
                    onClick={() =>
                      plan.id === 'premium'
                        ? toast.info('Fitur Premium segera hadir (demo)')
                        : toast.success('Kamu sudah menggunakan paket ini')
                    }
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
