import type { HealthLevel } from '@/components/shared/HealthStatus';
import type { KategoriTanaman, Tanaman } from './types';

export const kategoriList: Array<'Semua' | KategoriTanaman> = ['Semua', 'Indoor', 'Outdoor', 'Kebun'];

export function healthLevel(t: Tanaman): HealthLevel {
  return t.status === 'terlambat' ? 'perhatian' : 'sehat';
}

// ponytail: hari & tanggal statis (frontend-only), ganti dengan data backend saat tersedia.
export const HARI = ['sen', 'sel', 'rab', 'kam', 'jum', 'sab', 'min'];
export const HARI_1 = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];
export const TODAY_IDX = 2; // Rabu
export const isWaterDay = (i: number) => i % 2 === 0;

export const riwayatKesehatan: Array<{ tanggal: string; catatan: string; level: HealthLevel }> = [
  { tanggal: '02.09.2026', catatan: 'scanRutin', level: 'sehat' },
  { tanggal: '27.08.2026', catatan: 'tepiKuning', level: 'perhatian' },
  { tanggal: '20.08.2026', catatan: 'scanPertama', level: 'sehat' },
];
