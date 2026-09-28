'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/layout/LocaleProvider';
import { useAuth } from '@/lib/use-auth';
import { PageCtaBand } from '@/components/shared/PageCtaBand';
import { useTanamanList, initialTanamanList } from '@/features/plants';
import type { HealthLevel } from '@/components/shared/HealthStatus';
import {
  HomeHeroBand,
  HomeFeaturedPlant,
  HomeRecentScans,
  HomeWateringSchedule,
  HomePlantCollection,
} from './components';
import { healthById, recentScans as defaultScans, wateringToday as defaultWatering } from './mock';

export default function HomePage() {
  const t = useTranslations("home");
  const { locale: lang } = useLocale();
  const { user } = useAuth();
  const tanamanList = useTanamanList();
  const heroPlant = tanamanList[0] || initialTanamanList[0];
  const heroHealth = healthById[heroPlant.id] ?? { level: (heroPlant.status === 'terlambat' ? 'penyakit' : 'sehat') as HealthLevel, lastScan: '-' };

  const [liveScans, setLiveScans] = useState<typeof defaultScans>(defaultScans);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/scan/history')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0 && isMounted) {
          const formatted = json.data.slice(0, 5).map((s: {
            id: string | number;
            plant: string;
            disease: string;
            accuracy: number;
            date: string;
            status: string;
            photo?: string;
          }) => ({
            id: s.id,
            plant: s.plant,
            disease: s.disease,
            confidence: s.accuracy,
            date: s.date,
            level: (s.status === 'sehat' ? 'sehat' : 'penyakit') as HealthLevel,
            photo: s.photo,
          }));
          setLiveScans(formatted);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const total = tanamanList.length;
  const sehat = tanamanList.filter((p) => p.status !== 'terlambat').length;
  const penyakit = total - sehat;

  const dynamicWatering = useMemo(() => {
    if (tanamanList.length === 0) return defaultWatering;
    return tanamanList.slice(0, 4).map((p) => {
      let state: 'completed' | 'upcoming' | 'overdue' = 'upcoming';
      let time = '17:00';
      if (p.status === 'terlambat') {
        state = 'overdue';
        time = 'Terlewat';
      } else if (p.status === 'terjadwal') {
        state = 'completed';
        time = 'Selesai';
      } else {
        state = 'upcoming';
        time = '17:00';
      }
      return {
        time,
        plant: p.nama,
        state,
      };
    });
  }, [tanamanList]);

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
          <HomeRecentScans scans={liveScans} />
          <HomeWateringSchedule tasks={dynamicWatering} />
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
