'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('landing.footer');
  const n = useTranslations('landing.nav');
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E5E8E4] py-14 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div>
            <div className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/figma-assets/logo-fix-ink.svg" alt="TanamanKu" className="h-8 w-auto" />
            </div>
            <p className="text-sm text-[#59625D] max-w-xs mt-4">
              {t("desk")}
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <h3 className="text-xs uppercase tracking-[0.15em] text-[#59625D] font-semibold">
                {n("produk")}
              </h3>
              <Link
                href="#fitur"
                className="block py-2 text-sm text-[#59625D] hover:text-[#1B5E3F] transition-colors"
              >
                {n("fitur")}
              </Link>
              <Link
                href="#cara-kerja"
                className="block py-2 text-sm text-[#59625D] hover:text-[#1B5E3F] transition-colors"
              >
                {n("caraKerja")}
              </Link>
              <Link
                href="#komunitas"
                className="block py-2 text-sm text-[#59625D] hover:text-[#1B5E3F] transition-colors"
              >
                {n("komunitas")}
              </Link>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-[0.15em] text-[#59625D] font-semibold">
                {n("akun")}
              </h3>
              <Link
                href="/login"
                className="block py-2 text-sm text-[#59625D] hover:text-[#1B5E3F] transition-colors"
              >
                {n("masuk")}
              </Link>
              <Link
                href="/register"
                className="block py-2 text-sm text-[#59625D] hover:text-[#1B5E3F] transition-colors"
              >
                {n("daftar")}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E5E8E4] flex flex-col sm:flex-row justify-between gap-4 text-xs text-[#59625D]">
          <p>© 2026 TanamanKu</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-[#1B5E3F] transition-colors">
              {t("privasi")}
            </Link>
            <Link href="#" className="hover:text-[#1B5E3F] transition-colors">
              {t("syarat")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
