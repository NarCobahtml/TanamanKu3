'use client';

import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomePage from "@/components/HomePage";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { Check, Droplets, Plus, ScanSearch } from "lucide-react";

export default function DashboardPage() {
  const t = useTranslations("home");
  const todaySchedule = [
    {
      id: 1,
      name: "Monstera Deliciosa",
      task: "siramPupuk",
      image: "/figma-assets/monstera.avif",
    },
    {
      id: 2,
      name: "Lidah Mertua",
      task: "siramSedikit",
      image: "/figma-assets/plant-lidahmertua.jpg",
    },
  ];

  return (
    <>
      {/* Desktop, t3 dashboard (tidak berubah) */}
      <div className="hidden lg:block">
        <div className="flex min-h-dvh flex-col">
          <Navbar />
          <main className="flex-1">
            <HomePage />
          </main>
          <Footer />
        </div>
      </div>

      {/* Mobile, mobile1 Figma */}
      <div className="app-shell pb-[86px] lg:hidden">
        <Header showProfile />

        <main className="app-container px-4 py-6 space-y-4">
          {/* Greeting */}
          <div>
            <p className="text-[14px] text-ink/70">{t("selamatPagi")}</p>
            <h1 className="text-[32px] leading-[1.1] font-bold text-ink">
              {t("halo")}
            </h1>
          </div>

          {/* Scan Package Card */}
          <div className="bg-[#1B5E20] rounded-2xl p-5 text-white flex items-center justify-between">
            <div>
              <p className="text-[12px] font-medium text-white opacity-80 mb-1">
                {t("paketGratis")}
              </p>
              <p className="text-[20px] font-bold tnum">{t("scanTersisa")}</p>
            </div>
            <button className="bg-white/20 px-5 py-3 rounded-[10px] text-[14px] font-semibold h-[40px] flex items-center">
              {t("upgradePaket")}
            </button>
          </div>

          {/* Plant Status Card */}
          <div className="bg-white rounded-2xl border border-ink/15 p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] tracking-[0.5px] text-ink/70 font-semibold">
                  {t("statusTanaman")}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#1B5E20]" strokeWidth={3} />
                  </span>
                  <span className="text-[18px] font-semibold text-ink">
                    {t("semuaSehat")}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[36px] leading-none font-bold tnum text-ink">
                  12
                </p>
                <p className="text-[12px] text-ink/70">{t("tanaman")}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-ink/15">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-[#1B5E20]" />
                </div>
                <div>
                  <p className="font-semibold text-[14px] text-ink mb-1">
                    {t("penyiramanHariIni")}
                  </p>
                  <p className="text-[12px] text-ink/70">{t("tanamanPerluAir")}</p>
                </div>
              </div>
              <Link
                href="/siram"
                className="text-primary font-semibold text-[14px]"
              >
                {t("lihat")}
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/scan"
              className="bg-[#1B5E20] rounded-2xl p-5 text-white flex flex-col justify-between items-start h-[112px]"
            >
              <ScanSearch className="w-8 h-8" strokeWidth={2.2} />
              <span className="text-[16px] font-semibold">{t("scanTanaman")}</span>
            </Link>

            <Link
              href="/siram"
              className="bg-primary/10 rounded-2xl p-5 text-[#1B5E20] flex flex-col justify-between items-start h-[112px]"
            >
              <Plus className="w-8 h-8" strokeWidth={2.2} />
              <span className="text-[16px] font-semibold">{t("tambahTanaman")}</span>
            </Link>
          </div>

          {/* Today's Schedule */}
          <div className="mt-6">
            <h2 className="text-[20px] font-bold mb-4 tracking-[-.02em] text-ink">
              {t("jadwalHariIni")}
            </h2>
            <div className="space-y-3">
              {todaySchedule.map((plant) => (
                <div
                  key={plant.id}
                  className="bg-white rounded-2xl border border-ink/15 p-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={plant.image}
                      alt={plant.name}
                      className="w-[56px] h-[56px] rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-semibold text-[16px] text-ink">
                        {plant.name}
                      </p>
                      <p className="text-[13px] text-ink/70">{t(plant.task)}</p>
                    </div>
                  </div>
                  <button
                    aria-label={`${t("tandai")}${plant.name}${t("selesaiKata")}`}
                    className="w-7 h-7 rounded-full border-2 border-ink/15 flex items-center justify-center shrink-0"
                  >
                    <Check className="w-4 h-4 text-ink/70" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
}
