"use client";

import { useState } from "react";

export function OverviewCharts() {
  const [activeDay, setActiveDay] = useState<number | null>(2); // Default Rabu (peak day)

  const weeklyData = [
    { day: "Sen", thisWeek: 65, lastWeek: 45, scans: 650 },
    { day: "Sel", thisWeek: 82, lastWeek: 55, scans: 820 },
    { day: "Rab", thisWeek: 94, lastWeek: 70, scans: 942 },
    { day: "Kam", thisWeek: 76, lastWeek: 50, scans: 760 },
    { day: "Jum", thisWeek: 88, lastWeek: 60, scans: 880 },
    { day: "Sab", thisWeek: 60, lastWeek: 40, scans: 600 },
    { day: "Min", thisWeek: 72, lastWeek: 52, scans: 720 },
  ];

  // Donut chart calculations (Radius 45 -> Circumference = 282.74)
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // ~282.74

  const mobilePercent = 58;
  const desktopPercent = 32;
  const otherPercent = 10;

  const mobileOffset = 0;
  const desktopOffset = -(mobilePercent / 100) * circumference;
  const otherOffset = -((mobilePercent + desktopPercent) / 100) * circumference;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Bar Chart Card (8 cols) */}
      <div className="lg:col-span-8 rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/40">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-foreground">
              Aktivitas Pengguna & Diagnosis AI
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tren pemindaian penyakit daun dan keaktifan forum mingguan
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-foreground" />
              <span className="text-muted-foreground font-medium">Minggu Ini</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <span className="text-muted-foreground font-medium">Minggu Lalu</span>
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="pt-6 pb-2">
          <div className="relative h-56 sm:h-64 flex flex-col justify-between">
            {/* Background horizontal grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[100, 75, 50, 25, 0].map((val) => (
                <div key={val} className="w-full flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground/70 font-mono w-6 text-right tabular-nums">
                    {val}
                  </span>
                  <div className="flex-1 border-b border-border/30" />
                </div>
              ))}
            </div>

            {/* Bars container */}
            <div className="relative z-10 pl-9 pr-2 h-full flex items-end justify-between gap-2 sm:gap-4">
              {weeklyData.map((item, idx) => {
                const isSelected = activeDay === idx;

                return (
                  <div
                    key={item.day}
                    onMouseEnter={() => setActiveDay(idx)}
                    className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                  >
                    {/* Tooltip pill on active bar */}
                    {isSelected && (
                      <div className="mb-2 px-2.5 py-1 rounded-lg bg-foreground text-background text-[11px] font-semibold tabular-nums shadow-md whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                        {item.scans} Scan
                      </div>
                    )}

                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                      {/* Last week bar */}
                      <div
                        className="w-2.5 sm:w-3.5 rounded-t-md bg-muted-foreground/25 transition-all group-hover:bg-muted-foreground/40"
                        style={{ height: `${item.lastWeek}%` }}
                      />
                      {/* This week bar */}
                      <div
                        className={`w-2.5 sm:w-3.5 rounded-t-md transition-all ${
                          isSelected
                            ? "bg-foreground shadow-xs scale-y-[1.02] origin-bottom"
                            : "bg-foreground/80 group-hover:bg-foreground"
                        }`}
                        style={{ height: `${item.thisWeek}%` }}
                      />
                    </div>

                    {/* Day label */}
                    <span
                      className={`text-[11px] mt-2 font-medium transition-colors ${
                        isSelected ? "text-foreground font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Donut Chart Card (4 cols) */}
      <div className="lg:col-span-4 rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div className="pb-4 border-b border-border/40">
          <h2 className="text-sm sm:text-base font-semibold text-foreground">
            Perangkat Pengguna
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Platform akses petani & pekebun
          </p>
        </div>

        {/* SVG Donut */}
        <div className="py-4 flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
              {/* Background circle track */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-muted/40"
                strokeWidth="14"
                fill="transparent"
              />
              {/* Mobile segment */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-foreground transition-all duration-500"
                strokeWidth="14"
                strokeDasharray={`${(mobilePercent / 100) * circumference} ${circumference}`}
                strokeDashoffset={mobileOffset}
                fill="transparent"
              />
              {/* Desktop segment */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-muted-foreground/60 transition-all duration-500"
                strokeWidth="14"
                strokeDasharray={`${(desktopPercent / 100) * circumference} ${circumference}`}
                strokeDashoffset={desktopOffset}
                fill="transparent"
              />
              {/* Tablet segment */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-border transition-all duration-500"
                strokeWidth="14"
                strokeDasharray={`${(otherPercent / 100) * circumference} ${circumference}`}
                strokeDashoffset={otherOffset}
                fill="transparent"
              />
            </svg>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-xl font-bold tracking-tight text-foreground tabular-nums">
                5.4K
              </span>
              <span className="text-[10px] uppercase font-medium text-muted-foreground">
                Total Sesi
              </span>
            </div>
          </div>
        </div>

        {/* Legend List */}
        <div className="pt-3 border-t border-border/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-foreground" />
              <span className="text-muted-foreground">Mobile App</span>
            </div>
            <span className="font-semibold text-foreground tabular-nums">{mobilePercent}%</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/60" />
              <span className="text-muted-foreground">Web Desktop</span>
            </div>
            <span className="font-semibold text-foreground tabular-nums">{desktopPercent}%</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-border" />
              <span className="text-muted-foreground">Tablet / Lainnya</span>
            </div>
            <span className="font-semibold text-foreground tabular-nums">{otherPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
