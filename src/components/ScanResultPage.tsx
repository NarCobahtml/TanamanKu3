'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookmarkPlus,
  ScanLine,
  TriangleAlert,
  Bug,
  ShieldCheck,
  FlaskConical,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PageHeader, SectionHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import TkRevealClient from '@/components/landing/tk-reveal-client';
import { getContent } from '@/lib/scan-content';
import { useLocale } from '@/components/LocaleProvider';
import { useScanResult, useScanPhoto } from '@/lib/use-scan-result';

interface ScanData {
  class: string;
  confidence: number;
}

export default function ScanResultPage() {
  const t = useTranslations('scanResult');
  const [saved, setSaved] = useState(false);
  const data = useScanResult<ScanData>();
  const photo = useScanPhoto();

  const handleSave = () => {
    setSaved(true);
  };

  const content = data ? getContent(data.class) : null;
  const accuracy = data ? Math.round(data.confidence * 100) : 0;
  const { locale } = useLocale();
  const timestamp = new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date());

  if (!data || !content) {
    return (
      <div>
        <PageHeader
          overline={t("laporanAI")}
          title={t("hasilDiagnosis")}
          accent={t("diagnosis")}
          tone="ink"
          description={t("laporanDesc")}
        />
        <div className="mx-auto w-full max-w-3xl px-4 pt-14 sm:px-6">
          <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            {data ? t('kelasDikenali') : t('belumAdaHasil')}
          </p>
          <Button asChild variant="outline" className="mt-6 rounded-full">
            <Link href="/scan">{t("kembaliScan")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        overline={t("laporanAI")}
        title={t("hasilDiagnosis")}
        accent={t("diagnosis")}
        tone="ink"
        description={t("laporanDesc")}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-full border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/scan">
                <ScanLine className="h-4 w-4" aria-hidden="true" />
                {t("scanUlang")}
              </Link>
            </Button>
            <Button onClick={handleSave} disabled={saved} className="btn-cta rounded-full bg-white px-6 text-[#123526] hover:bg-primary/10">
              <BookmarkPlus className="h-4 w-4" aria-hidden="true" />
              {saved ? t('tersimpan') : t('simpanRiwayat')}
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap items-baseline gap-x-12 gap-y-6">
          <div>
            <p className="overline text-[#7ed8a4]">{t("keyakinanModel")}</p>
            <p className="tnum mt-2 text-4xl font-extrabold leading-none text-white md:text-5xl">{accuracy}%</p>
          </div>
          <div>
            <p className="overline text-[#7ed8a4]">{t("tingkatRisiko")}</p>
            <div className="mt-2.5 flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 ${content.healthy ? 'bg-[#7ed8a4]' : 'bg-warning'}`} aria-hidden="true" />
              <span className="text-2xl font-bold text-white">{content.healthy ? t('rendah') : t('sedang')}</span>
            </div>
          </div>
          <div>
            <p className="overline text-[#7ed8a4]">{t("spesimen")}</p>
            <p className="mt-2 text-2xl font-bold leading-tight text-white">{content.crop}</p>
            <p className="text-sm italic text-white/70">{content.healthy ? t('tanamanSehat') : content.label}</p>
          </div>
        </div>
      </PageHeader>

      <div className="mx-auto w-full max-w-7xl space-y-16 px-4 pt-14 sm:px-6">
      <section aria-label={t("ringkasan")}>
        <TkRevealClient>
          <div className="grid overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40 md:grid-cols-[1fr_1.4fr]">
            <div className="relative">
              <img
                src={photo || '/figma-assets/scanned-leaf.png'}
                alt={t("daunAnalisis")}
                className="aspect-[4/3] h-full w-full object-cover md:aspect-auto"
              />
              <p className="absolute inset-x-0 bottom-0 bg-ink/80 px-4 py-2 text-xs font-medium text-white">
                {t("spesimen")} · {timestamp}
              </p>
            </div>

            <div className="flex flex-col justify-center gap-6 p-6 md:p-10">
              <div>
                <p className="overline flex items-center gap-1.5">
                  {content.healthy ? <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <Bug className="h-3.5 w-3.5" aria-hidden="true" />}
                  {t("diagnosis")}
                </p>
                <p className={`mt-2 text-3xl font-extrabold tracking-tight md:text-4xl ${content.healthy ? 'text-primary' : 'text-destructive'}`}>
                  {content.label}{' '}
                  {!content.healthy && <span className="font-playfair">({content.latin})</span>}
                </p>
              </div>

              <div className="rule pt-6">
                <p className="text-base leading-relaxed text-foreground/85">{content.aiAnalysis}</p>
              </div>

              <div className={`flex gap-2.5 rounded-xl border px-4 py-3.5 text-sm ${content.healthy ? 'border-primary/30 bg-primary/10 text-primary' : 'border-warning/30 bg-warning/10 text-warning'}`}>
                {content.healthy ? (
                  <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                <p>{content.headline}</p>
              </div>
            </div>
          </div>
        </TkRevealClient>
      </section>

      <div className="grid gap-12 lg:grid-cols-2">
        <TkRevealClient>
        <section aria-labelledby="gejala">
          <SectionHeader title={content.healthy ? t('ciriTerdeteksi') : t('gejalaTerdeteksi')} />
          <ul className="divide-y divide-border rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
            {content.symptoms.map((s) => (
              <li key={s} className="flex gap-3 px-5 py-4 transition-colors hover:bg-secondary/60">
                <span className={`mt-2 h-1.5 w-1.5 shrink-0 ${content.healthy ? 'bg-primary' : 'bg-destructive'}`} aria-hidden="true" />
                <p className="text-sm font-medium">{s}</p>
              </li>
            ))}
          </ul>
        </section>
        </TkRevealClient>

        <TkRevealClient>
        <section aria-labelledby="penanganan">
          <SectionHeader title={content.healthy ? t('rekomendasiPerawatan') : t('rekomendasiPenanganan')} />
          <ol className="divide-y divide-border rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
            {content.treatments.map((t, i) => (
              <li key={t.title} className="flex gap-4 px-5 py-4 transition-colors hover:bg-secondary/60">
                <span className="tnum grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{t.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        </TkRevealClient>
      </div>

      <TkRevealClient>
        <section aria-labelledby="pencegahan" className="rounded-xl border border-border p-6 sage-wash md:p-10">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 id="pencegahan" className="text-lg font-bold tracking-tight">{t("produkRekomendasi")}</h2>
          </div>
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {content.products.map((p) => (
              <li key={p.name} className="rounded-lg border-l-2 border-primary/40 bg-card px-4 py-4 text-sm leading-relaxed transition-colors hover:bg-accent/40">
                <p className="font-semibold">{p.name}</p>
                <p className="mt-1 text-muted-foreground">{p.note}</p>
              </li>
            ))}
          </ul>
        </section>
      </TkRevealClient>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
        <Button asChild variant="outline" className="rounded-full bg-card hover:bg-accent/60">
          <Link href="/home">{t("kembaliBeranda")}</Link>
        </Button>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
          {t("disclaimer")}
        </p>
      </div>
      </div>
    </div>
  );
}
