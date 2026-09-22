'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useMounted } from '@/lib/use-mounted';

const NAV_LINKS = [
  { href: '#fitur', key: 'fitur' },
  { href: '#cara-kerja', key: 'caraKerja' },
  { href: '#komunitas', key: 'komunitas' },
] as const;

export default function Nav() {
  const t = useTranslations('landing.nav');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('#fitur');
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === 'dark';

  // scroll-spy: highlight mengikuti section yang terlihat
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1));
    const onScroll = () => {
      const line = window.innerHeight / 3;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = `#${id}`;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const pillCls = (href: string) =>
    `px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
      active === href
        ? 'bg-accent text-primary font-semibold'
        : 'text-muted-foreground hover:bg-accent hover:text-primary'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
      <Link
        href="/"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex items-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={isDark ? '/figma-assets/logo-fix.svg' : '/figma-assets/logo-fix-ink.svg'}
          alt="TanamanKu"
          className="h-9 w-auto"
        />
      </Link>

      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-md border border-border rounded-full px-2 py-2 items-center gap-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setActive(link.href)}
            className={pillCls(link.href)}
          >
            {t(link.key)}
          </Link>
        ))}
        <Link
          href="/login"
          className="text-muted-foreground hover:bg-accent hover:text-primary transition-all duration-200 px-4 py-1.5 rounded-full text-sm font-medium"
        >
          {t("masuk")}
        </Link>
      </div>

      <button
        type="button"
        aria-label={t('bukaMenu')}
        onClick={() => setOpen(true)}
        className="md:hidden text-foreground p-2"
      >
        <Menu className="w-6 h-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] bg-background flex flex-col">
          <div className="flex items-center justify-between p-4 sm:p-5">
            <Link
              href="/"
              onClick={() => {
                setOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={isDark ? '/figma-assets/logo-fix.svg' : '/figma-assets/logo-fix-ink.svg'}
                alt="TanamanKu"
                className="h-9 w-auto"
              />
            </Link>
            <button
              type="button"
              aria-label={t('tutupMenu')}
              onClick={() => setOpen(false)}
              className="text-foreground p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col items-start gap-2 px-6 mt-8">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`menu-item ${i === 0 ? 'menu-item-d1' : i === 1 ? 'menu-item-d2' : 'menu-item-d3'} text-foreground text-3xl font-medium py-3`}
              >
                {t(link.key)}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="menu-item menu-item-d2 text-muted-foreground text-3xl font-medium py-3"
            >
              {t("masuk")}
            </Link>
            <div className="flex flex-col w-full gap-3 mt-4">
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="menu-item menu-item-d3 bg-primary text-primary-foreground text-center text-lg font-semibold px-8 py-3.5 rounded-full"
              >
                {t("daftar")}
              </Link>
              <button
                type="button"
                onClick={async () => {
                  if (typeof window !== 'undefined' && window.triggerPwaInstall) {
                    await window.triggerPwaInstall();
                  }
                  setOpen(false);
                }}
                className="menu-item menu-item-d3 flex items-center justify-center gap-2 border border-primary text-primary text-base font-semibold px-6 py-3 rounded-full hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Install Aplikasi (PWA)
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
