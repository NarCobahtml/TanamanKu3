'use client';

import { useState } from 'react';
import SitePage from '@/components/SitePage';
import RiwayatPage from '@/components/RiwayatPage';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { CircleCheck, CircleX, ScanLine, TriangleAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type ScanStatus = 'sehat' | 'perhatian' | 'penyakit';

type Scan = {
  id: number;
  plant: string;
  disease: string;
  date: string;
  accuracy: number;
  status: ScanStatus;
  photo: string | undefined;
};

// Data sama dengan RiwayatPage desktop + 1 dummy perhatian (sesuai Figma)
const scans: Scan[] = [
  { id: 1, plant: 'Cabai Rawit', disease: 'Busuk Daun (Phytophthora)', date: '01.09.2026', accuracy: 94, status: 'penyakit', photo: '/figma-assets/forum-chili.png' },
  { id: 2, plant: 'Tomat Cherry', disease: 'Sehat, tidak ada gejala', date: '30.08.2026', accuracy: 98, status: 'sehat', photo: undefined },
  { id: 3, plant: 'Monstera Deliciosa', disease: 'Sehat, tidak ada gejala', date: '27.08.2026', accuracy: 96, status: 'sehat', photo: '/figma-assets/plant-monstera.png' },
  { id: 4, plant: 'Lidah Mertua', disease: 'Bercak Bakteri (Xanthomonas)', date: '25.08.2026', accuracy: 91, status: 'penyakit', photo: '/figma-assets/plant-sansevieria.png' },
  { id: 5, plant: 'Calathea Orbifolia', disease: 'Sehat, tidak ada gejala', date: '22.08.2026', accuracy: 97, status: 'sehat', photo: '/figma-assets/plant-calathea.jpg' },
  { id: 6, plant: 'Mint', disease: 'Daun menguning — perlu monitoring', date: '20.08.2026', accuracy: 88, status: 'perhatian', photo: undefined },
];

const filters: { id: 'semua' | ScanStatus; name: string }[] = [
  { id: 'semua', name: 'Semua' },
  { id: 'sehat', name: 'Sehat' },
  { id: 'perhatian', name: 'Perhatian' },
  { id: 'penyakit', name: 'Penyakit' },
];

const statusVisual: Record<ScanStatus, { icon: LucideIcon; iconClass: string; bgClass: string }> = {
  sehat: { icon: CircleCheck, iconClass: 'text-primary', bgClass: 'bg-primary/10' },
  perhatian: { icon: TriangleAlert, iconClass: 'text-warning', bgClass: 'bg-warning/10' },
  penyakit: { icon: CircleX, iconClass: 'text-destructive', bgClass: 'bg-destructive/10' },
};

export default function Page() {
  const [filter, setFilter] = useState<'semua' | ScanStatus>('semua');
  const rows = filter === 'semua' ? scans : scans.filter((s) => s.status === filter);

  return (
    <>
      {/* Desktop — t3 (tidak berubah) */}
      <div className="hidden lg:block">
        <SitePage>
          <RiwayatPage />
        </SitePage>
      </div>

      {/* Mobile — mobile1 Figma */}
      <div className="app-shell pb-[86px] lg:hidden">
        <Header showBack title="Riwayat Scan" />

        <main className="app-container">
          {/* Filter chips */}
          <div className="px-4 py-4 overflow-x-auto">
            <div className="flex gap-2">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold ${
                    filter === f.id
                      ? 'bg-[#1B5E20] text-white'
                      : 'bg-white text-ink border border-ink/15'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Scan list */}
          <div className="px-4 pb-6 space-y-3">
            {rows.length === 0 ? (
              <p className="text-center text-sm text-ink/70 py-10">Belum ada scan dengan status ini.</p>
            ) : (
              rows.map((s) => {
                const v = statusVisual[s.status];
                const Icon = v.icon;
                return (
                  <div key={s.id} className="bg-white rounded-xl p-4 border border-ink/15 flex items-center gap-3">
                    {s.photo ? (
                      <img src={s.photo} alt={`Foto ${s.plant}`} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    ) : (
                      <span className="w-14 h-14 rounded-lg bg-background text-ink/70 flex items-center justify-center shrink-0">
                        <ScanLine className="w-6 h-6" aria-hidden="true" />
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-[16px] font-bold text-ink leading-tight">{s.plant}</h2>
                      <p className="text-[13px] text-ink/70 mt-0.5 truncate">{s.disease}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="tnum text-[12px] text-ink/70">{s.date}</span>
                        <span className="tnum text-[11px] font-semibold text-[#1B5E20] bg-primary/10 rounded-full px-2 py-0.5">
                          {s.accuracy}%
                        </span>
                      </div>
                    </div>
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${v.bgClass}`}>
                      <Icon className={`w-5 h-5 ${v.iconClass}`} strokeWidth={2.5} aria-hidden="true" />
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
}
