'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Compass,
  Droplets,
  HeartHandshake,
  Leaf,
  ScanLine,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/layout/LocaleProvider';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageCtaBand } from '@/components/shared/PageCtaBand';
import TkRevealClient from '@/components/shared/tk-reveal-client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TEAM_MEMBERS } from './constants';

export default function AboutPage() {
  const t = useTranslations('about');
  const tc = useTranslations('common');
  const { locale } = useLocale();
  const isId = locale === 'id';

  const pillars = [
    {
      icon: ScanLine,
      title: t('pilar1Judul'),
      desc: t('pilar1Desc'),
    },
    {
      icon: Droplets,
      title: t('pilar2Judul'),
      desc: t('pilar2Desc'),
    },
    {
      icon: Users,
      title: t('pilar3Judul'),
      desc: t('pilar3Desc'),
    },
  ];

  const missions = [
    {
      number: '01',
      title: t('misi1Judul'),
      desc: t('misi1Desc'),
    },
    {
      number: '02',
      title: t('misi2Judul'),
      desc: t('misi2Desc'),
    },
    {
      number: '03',
      title: t('misi3Judul'),
      desc: t('misi3Desc'),
    },
    {
      number: '04',
      title: t('misi4Judul'),
      desc: t('misi4Desc'),
    },
  ];

  return (
    <div>
      <PageHeader
        tone="ink"
        overline={t('overline')}
        title={t('judul')}
        accent="TanamanKu"
        description={t('deskripsi')}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-full border-white/25 bg-transparent px-5 text-sm font-medium text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {tc('kembali')}
              </Link>
            </Button>
            <Button
              asChild
              className="h-10 rounded-full bg-white px-5 text-sm font-semibold text-[#123526] hover:bg-white/90"
            >
              <Link href="/home">{t('bukaBeranda')}</Link>
            </Button>
          </div>
        }
      />

      {/* Latar Belakang & Pilar Utama */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <TkRevealClient>
          <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start">
            <div>
              <p className="overline text-primary">{t('ceritaOverline')}</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.02em] text-foreground sm:text-4xl">
                {t('ceritaJudul')}
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>{t('ceritaParagraf1')}</p>
              <p>{t('ceritaParagraf2')}</p>
            </div>
          </div>
        </TkRevealClient>

        <TkRevealClient className="mt-12">
          <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40 sm:p-7"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-primary">
                  <pillar.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-card-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </TkRevealClient>
      </section>

      {/* Visi & Misi */}
      <section
        id="visi-misi"
        className="scroll-mt-24 border-y border-border bg-secondary/50 py-14 sm:py-20"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <TkRevealClient>
            <div className="max-w-2xl">
              <p className="overline text-primary">{t('visiMisiOverline')}</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.02em] text-foreground sm:text-4xl">
                {t('visiMisiJudul')}
              </h2>
            </div>
          </TkRevealClient>

          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            {/* Kartu Visi */}
            <TkRevealClient className="lg:col-span-5">
              <div className="ink-panel flex h-full flex-col justify-between rounded-2xl p-6 sm:p-8">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-[#7ed8a4] uppercase">
                    <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('visiLabel')}
                  </span>
                  <h3 className="mt-5 text-xl font-bold leading-snug text-white sm:text-2xl">
                    {t('visiTeks')}
                  </h3>
                </div>
                <div className="mt-8 flex items-center gap-2.5 border-t border-white/15 pt-5 text-xs text-white/75">
                  <Leaf className="h-4 w-4 shrink-0 text-[#7ed8a4]" aria-hidden="true" />
                  <span>{t('visiCatatan')}</span>
                </div>
              </div>
            </TkRevealClient>

            {/* Daftar Misi */}
            <TkRevealClient className="lg:col-span-7">
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold tracking-wider text-primary uppercase">
                  <Target className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('misiLabel')}
                </span>
                <div className="mt-6 divide-y divide-border">
                  {missions.map((mission) => (
                    <div
                      key={mission.number}
                      className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <span className="tnum flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary">
                        {mission.number}
                      </span>
                      <div>
                        <h4 className="text-base font-semibold text-card-foreground">
                          {mission.title}
                        </h4>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {mission.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TkRevealClient>
          </div>
        </div>
      </section>

      {/* Tim Pembuat */}
      <section
        id="tim"
        className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 pt-14 sm:px-6 sm:pt-20"
      >
        <TkRevealClient>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="overline text-primary">{t('timOverline')}</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.02em] text-foreground sm:text-4xl">
                {t('timJudul')}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t('timSub')}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-secondary/70 px-4 py-2 text-xs font-medium text-muted-foreground sm:self-auto">
              <HeartHandshake className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{t('timBadge')}</span>
            </div>
          </div>
        </TkRevealClient>

        <TkRevealClient className="mt-10">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.id}
                className="flex flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center gap-3.5">
                  <Avatar className="h-12 w-12 border border-border">
                    <AvatarFallback className="bg-accent text-sm font-bold text-primary">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-card-foreground">
                      {member.name}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-primary">
                      {isId ? member.roleId : member.roleEn}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {isId ? member.focusId : member.focusEn}
                </p>
                <div className="mt-auto pt-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    TanamanKu Team
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TkRevealClient>
      </section>

      <PageCtaBand
        heading={t('ctaJudul')}
        accent={isId ? 'tanamanmu' : 'plants'}
        description={t('ctaDesc')}
        primary={{ href: '/scan', label: tc('scanTanaman') }}
        secondary={{ href: '/forum', label: tc('tanyaKomunitas') }}
      />
    </div>
  );
}
