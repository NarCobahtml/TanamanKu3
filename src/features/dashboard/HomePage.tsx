'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/layout/LocaleProvider';
import { useAuth } from '@/lib/use-auth';
import { PageCtaBand } from '@/components/shared/PageCtaBand';
import { initialTanamanList as tanamanList } from '@/features/plants';
import type { HealthLevel } from '@/components/shared/HealthStatus';
import {
  HomeHeroBand,
  HomeFeaturedPlant,
  HomeRecentScans,
  HomeWateringSchedule,
  HomePlantCollection,
} from './components';
import { healthById, recentScans, wateringToday, total, sehat, penyakit } from './mock';

export default function HomePage() {
  const t = useTranslations("home");
  const { locale: lang } = useLocale();
  const { user } = useAuth();
  const heroPlant = tanamanList[0];
  const heroHealth = healthById[heroPlant.id] ?? { level: 'sehat' as HealthLevel, lastScan: '-' };

  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : 'Pekebun';

  return (
    <div>
      <HomeHeroBand
        firstName={firstName}
        total={total}
        sehat={sehat}
        penyakit={penyakit}
      />

      <HomeFeaturedPlant
        heroPlant={heroPlant}
        heroHealth={heroHealth}
      />

      <div className="mx-auto w-full max-w-7xl space-y-20 px-4 pb-4 pt-16 sm:px-6">
        <div className="grid min-w-0 gap-12 lg:grid-cols-[1.7fr_1fr]">
          <HomeRecentScans scans={recentScans} />
          <HomeWateringSchedule tasks={wateringToday} />
        </div>

        <HomePlantCollection plants={tanamanList} healthById={healthById} />
      </div>

      <PageCtaBand
        heading={t("daunMencurigakan")}
        accent={lang === "id" ? "mencurigakan" : "suspicious"}
        description={t("cukupSatuFoto")}
        primary={{ href: '/scan', label: t('scanTanaman') }}
        secondary={{ href: '/forum', label: t('tanyaKomunitas') }}
      />
    </div>
  );
}
