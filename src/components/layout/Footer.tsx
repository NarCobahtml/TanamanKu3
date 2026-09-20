'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Logo } from './brand';

export default function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');

  const cols = [
    {
      title: t('produk'),
      links: [
        { name: nav('tanamanSaya'), href: '/siram' },
        { name: t('scanPenyakit'), href: '/scan' },
        { name: t('riwayatScan'), href: '/riwayat' },
        { name: t('penyiraman'), href: '/siram' },
      ],
    },
    {
      title: t('komunitas'),
      links: [
        { name: t('forumDiskusi'), href: '/forum' },
        { name: t('buatPostingan'), href: '/forum/create' },
      ],
    },
    {
      title: t('akun'),
      links: [
        { name: t('pengaturan'), href: '/profil' },
        { name: t('masuk'), href: '/login' },
        { name: t('daftar'), href: '/register' },
      ],
    },
  ];

  return (
    <footer className="ink-panel border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <Logo dark />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">{t('deskripsi')}</p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/80">
              <span className="font-playfair text-white">{t('tagline1')}</span>{' '}
              {t('tagline2')}
            </p>
          </div>
          {cols.map((col) => (
            <nav key={col.title} className="md:col-span-2" aria-label={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.name}>
                    <Link href={l.href} className="text-sm text-white/70 transition-colors hover:text-white">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>{t('hakCipta')}</p>
          <div className="flex gap-5">
            <Link href="/" className="transition-colors hover:text-white">{t('privasi')}</Link>
            <Link href="/" className="hover:text-white">{t('syarat')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
