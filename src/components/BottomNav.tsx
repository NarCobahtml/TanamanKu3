'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav({ plantMode = false }: { plantMode?: boolean }) {
  const pathname = usePathname();

  const figmaIcons: Record<string, string> = {
    home: '/figma-assets/icons-scan/scan-6.svg',
    scan: '/figma-assets/icons-scan/scan-7.svg',
    forum: '/figma-assets/icons-scan/scan-10.svg',
    siram: '/figma-assets/icons-scan/scan-11.svg',
    plant: '/nav-icons/plant.svg',
    tips: '/nav-icons/tips.svg',
    profile: '/nav-icons/profile.svg',
  };

  const navItems = plantMode ? [
    { name: 'Beranda', href: '/', icon: 'home' }, { name: 'Tanaman', href: '/siram', icon: 'plant' },
    { name: 'Scan', href: '/scan', icon: 'scan' }, { name: 'Tips', href: '/forum', icon: 'tips' }, { name: 'Profil', href: '/profil', icon: 'profile' },
  ] : [
    { name: 'Beranda', href: '/', icon: 'home' }, { name: 'Scan', href: '/scan', icon: 'scan' },
    { name: 'Forum', href: '/forum', icon: 'forum' }, { name: 'Siram', href: '/siram', icon: 'siram' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-30 safe-area-inset-bottom">
      <div className="app-container flex justify-around items-center h-full">
        <div className="desktop-brand hidden lg:flex" aria-label="TanamanKu">
          <span className="desktop-brand-mark">T</span>
          <span>
            <strong>TanamanKu</strong>
            <small>Ruang rawat tanaman</small>
          </span>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[12px] ${isActive(item.href) ? 'active' : ''}`}
          >
            <div className={`nav-icon w-9 h-8 flex items-center justify-center ${isActive(item.href) ? 'active' : ''}`}>
              <img src={figmaIcons[item.icon]} alt="" aria-hidden="true" />
            </div>
            <span className={isActive(item.href) ? 'font-medium' : ''}>
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
