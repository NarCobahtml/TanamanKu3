import type { HealthLevel } from '@/components/shared/HealthStatus';
import { initialTanamanList as tanamanList, type Tanaman } from '@/features/plants';

/* ---- placeholder data (frontend-only, no backend) ---- */

export type PlantHealth = { level: HealthLevel; lastScan: string };

export const healthById: Record<string, PlantHealth> = {
  // Numeric IDs matching initialTanamanList
  '1': { level: 'sehat', lastScan: '27.08.2026' },
  '2': { level: 'penyakit', lastScan: '25.08.2026' },
  '3': { level: 'sehat', lastScan: '02.09.2026' },
  '4': { level: 'sehat', lastScan: '01.09.2026' },
  '5': { level: 'sehat', lastScan: '22.08.2026' },
  '6': { level: 'penyakit', lastScan: '01.09.2026' },
  '7': { level: 'sehat', lastScan: '30.08.2026' },
  '8': { level: 'sehat', lastScan: '28.08.2026' },

  // Slugs matching plant names
  monstera: { level: 'sehat', lastScan: '27.08.2026' },
  'lidah-mertua': { level: 'penyakit', lastScan: '25.08.2026' },
  pisang: { level: 'sehat', lastScan: '02.09.2026' },
  ceri: { level: 'sehat', lastScan: '01.09.2026' },
  calathea: { level: 'sehat', lastScan: '22.08.2026' },
  'tomat-ceri': { level: 'penyakit', lastScan: '01.09.2026' },
  cabai: { level: 'sehat', lastScan: '30.08.2026' },
  melati: { level: 'sehat', lastScan: '28.08.2026' },
};

/**
 * Resilient lookup helper: looks up by plant ID, slug, or derives from status.
 */
export function getPlantHealth(plant?: Tanaman | { id?: string; nama?: string; status?: string | null } | null): PlantHealth {
  if (!plant) return { level: 'sehat', lastScan: '-' };
  if (plant.id && healthById[plant.id]) return healthById[plant.id];

  const slug = (plant.nama || '').toLowerCase().trim().replace(/\s+/g, '-');
  if (healthById[slug]) return healthById[slug];

  for (const [k, v] of Object.entries(healthById)) {
    if (slug.includes(k) || k.includes(slug)) return v;
  }

  return {
    level: (plant.status === 'terlambat' ? 'penyakit' : 'sehat') as HealthLevel,
    lastScan: '-',
  };
}

export const recentScans = [
  { id: 1, plant: 'Tomat Ceri', disease: 'Early Blight (Alternaria solani)', confidence: 94, date: '01.09.2026', level: 'penyakit' as HealthLevel, photo: '/figma-assets/plant-tomat-chery.webp' },
  { id: 2, plant: 'Pisang', disease: 'Sehat, tidak ada gejala', confidence: 88, date: '02.09.2026', level: 'sehat' as HealthLevel, photo: '/figma-assets/plant-bananaleaf.webp' },
  { id: 3, plant: 'Cabai Rawit', disease: 'Sehat, tidak ada gejala', confidence: 98, date: '30.08.2026', level: 'sehat' as HealthLevel, photo: '/figma-assets/plant-chili.webp' },
  { id: 4, plant: 'Lidah Mertua', disease: 'Bercak Bakteri (Xanthomonas)', confidence: 91, date: '25.08.2026', level: 'penyakit' as HealthLevel, photo: '/figma-assets/plant-lidahmertua.webp' },
  { id: 5, plant: 'Monstera Deliciosa', disease: 'Sehat, tidak ada gejala', confidence: 96, date: '27.08.2026', level: 'sehat' as HealthLevel, photo: '/figma-assets/plant-monstera.webp' },
];

export const wateringToday = [
  { time: '08:00', plant: 'Tomat Ceri', state: 'completed' as const },
  { time: '09:30', plant: 'Calathea', state: 'upcoming' as const },
  { time: '16:00', plant: 'Cabai Rawit', state: 'overdue' as const },
];

/* ---- derived health counts ---- */

export const total = tanamanList.length;
export const sehat = Object.values(healthById).filter((h) => h.level === 'sehat').length;
export const penyakit = Object.values(healthById).filter((h) => h.level === 'penyakit').length;
