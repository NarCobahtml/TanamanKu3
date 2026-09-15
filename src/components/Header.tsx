'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
  showProfile?: boolean;
  showSearch?: boolean;
}

export default function Header({ showBack, title, showProfile, showSearch }: HeaderProps) {
  const home = useTranslations('home');
  return (
    <header className="page-header sticky top-0 z-20">
      <div className="app-container h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button onClick={() => window.history.back()} className="p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/figma-assets/logo-mark.png" alt="" aria-hidden="true" className="w-8 h-8 rounded-lg object-cover" />
          )}
          {title && <h1 className="text-xl font-bold tracking-[-.03em]">{title}</h1>}
        </div>
        <div className="desktop-header-context hidden lg:block">
          <span>PLANT CARE WORKSPACE</span>
          <strong>{title || home('ringkasanKebun')}</strong>
        </div>
        
        <div className="flex items-center gap-3">
          {showSearch && (
            <button className="p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          )}
          {showProfile && (
            <Link href="/profil" className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              <img src="/figma-assets/profile-1.jpg" alt="Profile" className="w-full h-full object-cover" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
