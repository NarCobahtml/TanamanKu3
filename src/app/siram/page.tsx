'use client';

import SitePage from '@/components/SitePage';
import TanamanPage, { tanamanList } from '@/components/TanamanPage';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { Check, TriangleAlert, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export default function Page() {
  const filters = ['Semua', 'Indoor', 'Outdoor', 'Kantor'];

  type PlantStatus = 'done' | 'soon' | 'overdue';
  
  const statusVisual: Record<PlantStatus, { icon: LucideIcon; iconClass: string; circleClass: string; textClass: string }> = {
    done: { icon: Check, iconClass: 'text-primary', circleClass: 'bg-primary/10', textClass: 'text-ink' },
    soon: { icon: TriangleAlert, iconClass: 'text-ink/70', circleClass: 'bg-ink/15', textClass: 'text-ink/70' },
    overdue: { icon: X, iconClass: 'text-destructive', circleClass: 'bg-destructive/10', textClass: 'text-destructive' },
  };

  const statusMap: Record<'hari-ini' | 'terlambat' | 'terjadwal', PlantStatus> = {
    'hari-ini': 'soon',
    'terlambat': 'overdue',
    'terjadwal': 'soon',
  };

  return (
    <>
      {/* Desktop — t3 (tidak berubah) */}
      <div className="hidden lg:block">
        <SitePage>
          <TanamanPage />
        </SitePage>
      </div>

      {/* Mobile — mobile1 Figma */}
      <div className="app-shell pb-[86px] lg:hidden">
        <Header showProfile />

        <main className="app-container">
          {/* Filter chips */}
          <div className="px-4 py-4 overflow-x-auto">
            <div className="flex gap-2">
              {filters.map((f, i) => (
                <button
                  key={f}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold ${
                    i === 0 ? 'bg-[#1B5E20] text-white' : 'bg-white text-ink border border-ink/15'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Plant list */}
          <div className="px-4 pb-6 space-y-3">
            {tanamanList.map((plant) => {
              const mappedStatus = statusMap[plant.status];
              const v = statusVisual[mappedStatus];
              const Icon = v.icon;
              return (
                <Link key={plant.id} href={`/siram/${plant.id}`} className="block bg-white rounded-2xl p-5 relative">
                  <span className={`absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center ${v.circleClass}`}>
                    <Icon className={`w-5 h-5 ${v.iconClass}`} strokeWidth={2.5} />
                  </span>
                  <h2 className="text-[20px] font-bold text-ink pr-12">{plant.nama}</h2>
                  <p className="text-[12px] text-ink/70 mt-3">Jadwal Berikutnya</p>
                  <p className={`text-sm font-semibold ${v.textClass}`}>{plant.nextWater}</p>
                </Link>
              );
            })}
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
}
