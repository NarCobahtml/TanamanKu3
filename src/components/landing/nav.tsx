'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Leaf, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '#fitur', label: 'Fitur' },
  { href: '#cara-kerja', label: 'Cara Kerja' },
  { href: '#komunitas', label: 'Komunitas' },
] as const;

export default function Nav() {
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
        ? 'bg-primary/10 text-primary'
        : 'text-ink/70 hover:bg-primary/10 hover:text-primary'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
      <Link href="/" className="flex items-center gap-2">
        <Leaf className="w-6 h-6 text-primary" />
        <span className="font-playfair text-2xl text-ink">TanamanKu</span>
      </Link>

      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-background rounded-full px-2 py-2 items-center gap-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setActive(link.href)}
            className={pillCls(link.href)}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/login"
          className="text-ink/70 hover:bg-primary/10 hover:text-primary transition-all duration-200 px-4 py-1.5 rounded-full text-sm font-medium"
        >
          Masuk
        </Link>
      </div>

      <button
        type="button"
        aria-label="Buka menu"
        onClick={() => setOpen(true)}
        className="md:hidden text-ink p-2"
      >
        <Menu className="w-6 h-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] bg-white flex flex-col">
          <div className="flex items-center justify-between p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-primary" />
              <span className="font-playfair text-2xl text-ink">TanamanKu</span>
            </div>
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setOpen(false)}
              className="text-ink p-2"
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
                className={`menu-item ${i === 0 ? 'menu-item-d1' : i === 1 ? 'menu-item-d2' : 'menu-item-d3'} text-ink text-3xl font-medium py-3`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="menu-item menu-item-d2 text-ink/70 text-3xl font-medium py-3"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="menu-item menu-item-d3 mt-4 bg-primary text-white text-lg font-semibold px-8 py-3.5 rounded-full"
            >
              Daftar
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
