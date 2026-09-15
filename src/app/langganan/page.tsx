'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import SitePage from '@/components/SitePage';
import LanggananPage from '@/components/LanggananPage';
import { ArrowLeft } from 'lucide-react';

export default function Page() {
  const router = useRouter();
  const t = useTranslations('langganan');
  const tc = useTranslations('common');

  return (
    <>
      {/* Desktop, t3 editorial */}
      <div className="hidden lg:block">
        <SitePage>
          <LanggananPage />
        </SitePage>
      </div>

      {/* Mobile, Figma mockup exact */}
      <div className="min-h-screen bg-background lg:hidden">
        {/* Header minimal, back button only */}
        <header className="flex items-center px-4 py-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60 backdrop-blur-sm transition-colors hover:bg-white"
            aria-label={tc("kembali")}
          >
            <ArrowLeft className="h-5 w-5 text-ink" />
          </button>
        </header>

        {/* Title + Price */}
        <div className="px-6 pt-2">
          <h1 className="text-[26px] font-bold leading-tight text-ink">{t("tumbuhKitaPro")}</h1>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-[52px] font-bold leading-none text-ink">{t("hargaPro")}</span>
            <span className="text-[16px] text-ink/70">{t("perBulan")}</span>
          </div>
          <p className="mt-3 text-[14px] leading-[20px] text-ink/70">
            {t("upgradeKuota")}
          </p>
        </div>

        {/* Comparison Card */}
        <div className="mx-4 mt-8 rounded-2xl bg-white p-5 shadow-sm">
          {/* Header row, GRATIS | PRO */}
          <div className="grid grid-cols-2 gap-4 border-b border-background pb-3">
            <div className="text-center">
              <p className="text-[12px] font-medium uppercase tracking-wide text-ink/70">{t("gratis")}</p>
            </div>
            <div className="text-center">
              <p className="text-[12px] font-medium uppercase tracking-wide text-ink/70">{t("pro")}</p>
            </div>
          </div>

          {/* Feature rows */}
          <div className="space-y-5 pt-5">
            {/* Scan tanaman */}
            <div>
              <p className="mb-2 text-[14px] text-ink/70">{t("scanTanaman")}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center text-[16px] text-ink/70">{t("xBulan", { n: 10 })}</div>
                <div className="text-center text-[16px] font-bold text-ink">{t("xBulan", { n: 100 })}</div>
              </div>
            </div>

            {/* Jadwal penyiraman */}
            <div>
              <p className="mb-2 text-[14px] text-ink/70">{t("jadwalPenyiraman")}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center text-[16px] text-ink/70">{t("hari", { n: 7 })}</div>
                <div className="text-center text-[16px] font-bold text-ink">{t("hari", { n: 30 })}</div>
              </div>
            </div>

            {/* Riwayat scan */}
            <div>
              <p className="mb-2 text-[14px] text-ink/70">{t("riwayatScanFitur")}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center text-[16px] text-ink/70">{t("hari", { n: 7 })}</div>
                <div className="text-center text-[16px] font-bold text-ink">{t("takTerbatas")}</div>
              </div>
            </div>

            {/* Features PRO (right column only) */}
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div></div>
                <div className="text-center">
                  <p className="text-[12px] text-ink/70">{t("semuaFiturGratis")}</p>
                  <p className="mt-1 text-[14px] font-bold text-ink">{t("komunitasNotifikasi")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button + Disclaimer */}
        <div className="px-4 pt-6">
          <button
            type="button"
            className="w-full rounded-xl bg-primary py-4 text-[16px] font-bold text-white transition-colors hover:bg-primary active:bg-primary"
            onClick={() => {
              // ponytail: wire payment flow ketika ready
              alert(t('pembayaranDemo'));
            }}
          >
            {t('aktifkanPro')}
          </button>
          <p className="mt-3 text-center text-[14px] text-ink/70">{t("batalkanKapanSaja")}</p>
        </div>
      </div>
    </>
  );
}
