import Link from 'next/link';
import { Logo } from './brand';

const cols = [
  {
    title: 'Produk',
    links: [
      { name: 'Tanaman Saya', href: '/siram' },
      { name: 'Scan Penyakit', href: '/scan' },
      { name: 'Riwayat Scan', href: '/riwayat' },
      { name: 'Penyiraman', href: '/siram' },
    ],
  },
  {
    title: 'Komunitas',
    links: [
      { name: 'Forum Diskusi', href: '/forum' },
      { name: 'Buat Postingan', href: '/forum/create' },
    ],
  },
  {
    title: 'Akun',
    links: [
      { name: 'Pengaturan', href: '/profil' },
      { name: 'Masuk', href: '/login' },
      { name: 'Daftar', href: '/register' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="ink-panel border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <Logo dark />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/15">
              Platform pemantauan kesehatan tanaman: deteksi penyakit berbantuan AI,
              jadwal penyiraman terstruktur, dan riwayat diagnosis yang rapi.
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink/15">
              <span className="font-playfair text-white">Tumbuh</span> bersama tanamanmu.
            </p>
          </div>
          {cols.map((col) => (
            <nav key={col.title} className="md:col-span-2" aria-label={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.name}>
                    <Link href={l.href} className="text-sm text-ink/15 transition-colors hover:text-white">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-ink/15 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 TanamanKu. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/" className="transition-colors hover:text-white">Kebijakan Privasi</Link>
            <Link href="/" className="hover:text-white">Syarat Layanan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
