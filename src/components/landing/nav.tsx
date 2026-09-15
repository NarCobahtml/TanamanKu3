'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

const NAV_LINKS = [
  { href: '#fitur', key: 'fitur' },
  { href: '#cara-kerja', key: 'caraKerja' },
  { href: '#komunitas', key: 'komunitas' },
] as const;

export default function Nav() {
  const t = useTranslations('landing.nav');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('#fitur');

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
        ? 'bg-[#E7EFE9] text-[#1B5E3F]'
        : 'text-[#59625D] hover:bg-[#E7EFE9] hover:text-[#1B5E3F]'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
      <Link href="/" className="flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma-assets/logo-fix-ink.svg" alt="TanamanKu" className="h-9 w-auto" />
      </Link>

      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-[#E5E8E4] rounded-full px-2 py-2 items-center gap-1">
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
          className="text-[#59625D] hover:bg-[#E7EFE9] hover:text-[#1B5E3F] transition-all duration-200 px-4 py-1.5 rounded-full text-sm font-medium"
        >
          {t("masuk")}
        </Link>
      </div>

      <button
        type="button"
        aria-label={t('bukaMenu')}
        onClick={() => setOpen(true)}
        className="md:hidden text-[#171B17] p-2"
      >
        <Menu className="w-6 h-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] bg-white flex flex-col">
          <div className="flex items-center justify-between p-4 sm:p-5">
            <div className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/figma-assets/logo-fix-ink.svg" alt="TanamanKu" className="h-9 w-auto" />
            </div>
            <button
              type="button"
              aria-label={t('tutupMenu')}
              onClick={() => setOpen(false)}
              className="text-[#171B17] p-2"
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
                className={`menu-item ${i === 0 ? 'menu-item-d1' : i === 1 ? 'menu-item-d2' : 'menu-item-d3'} text-[#171B17] text-3xl font-medium py-3`}
              >
                {t(link.key)}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="menu-item menu-item-d2 text-[#59625D] text-3xl font-medium py-3"
            >
              {t("masuk")}
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="menu-item menu-item-d3 mt-4 bg-[#1B5E3F] text-white text-lg font-semibold px-8 py-3.5 rounded-full"
            >
              {t("daftar")}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
