'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useMounted } from '@/lib/use-mounted';

export default function Footer() {
  const t = useTranslations('landing.footer');
  const n = useTranslations('landing.nav');
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <footer className="bg-background border-t border-border py-14 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div>
            <Link
              href="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={isDark ? '/figma-assets/logo-fix.svg' : '/figma-assets/logo-fix-ink.svg'}
                alt="TanamanKu"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mt-4">
              {t("desk")}
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <h3 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                {n("produk")}
              </h3>
              <Link
                href="#fitur"
                className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {n("fitur")}
              </Link>
              <Link
                href="#cara-kerja"
                className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {n("caraKerja")}
              </Link>
              <Link
                href="#komunitas"
                className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {n("komunitas")}
              </Link>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                {n("akun")}
              </h3>
              <Link
                href="/login"
                className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {n("masuk")}
              </Link>
              <Link
                href="/register"
                className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {n("daftar")}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 TanamanKu</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary transition-colors">
              {t("privasi")}
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              {t("syarat")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
