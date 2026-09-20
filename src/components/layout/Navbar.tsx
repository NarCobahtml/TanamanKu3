'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, ChevronDown, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo, navItems, isActivePath } from './brand';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/layout/LocaleProvider';
import { useAuth } from '@/lib/use-auth';
import { cn } from '@/lib/utils';

const notifications = [
  { id: 1, time: '08:12', text: 'Cabai Rawit, jadwal penyiraman hari ini.' },
  { id: 2, time: 'Kemarin', text: 'Scan Tomat Ceri: kondisi daun sehat.' },
  { id: 3, time: '2 hari lalu', text: 'Pisang terlewat penyiraman 1 hari.' },
];

/** nama i18n untuk nav, fallback ke nama asli bila tidak ada mapping. */
const NAV_KEY: Record<string, string> = {
  Beranda: 'beranda',
  Scan: 'scan',
  Forum: 'forum',
  Siram: 'siram',
};

export default function Navbar() {
  const pathname = usePathname();
  const isAuth = pathname === '/login' || pathname === '/register';
  const isScan = pathname === '/scan';
  const [notifOpen, setNotifOpen] = useState(false);
  const nav = useTranslations('nav');
  const tp = useTranslations('profil');
  const { locale, setLocale } = useLocale();
  const navName = (name: string) => (NAV_KEY[name] ? nav(NAV_KEY[name]) : name);
  const { user, initials } = useAuth();

  return (
    <header className={cn("sticky top-0 z-50 border-b border-border bg-background", (isAuth || isScan) && "hidden lg:block")}>
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Nav SATU instance: <lg bar bawah thumb-friendly, >=lg pill melayang di header */}
        <nav
          aria-label="Navigasi utama"
          className={cn(
            (isAuth || isScan) ? "hidden lg:flex" : "fixed inset-x-0 bottom-0 z-50 flex",
            "items-stretch justify-around border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:inset-auto lg:absolute lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:justify-center lg:gap-1 lg:rounded-full lg:border lg:border-border lg:bg-card/80 lg:px-2 lg:py-2 lg:backdrop-blur-md lg:pb-2"
          )}
        >
          <div className="contents">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    'flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-all duration-200 lg:min-h-0 lg:flex-none lg:flex-row lg:gap-2 lg:rounded-full lg:px-4 lg:py-1.5 lg:text-sm ' +
                    (active
                      ? 'text-primary lg:bg-accent lg:text-primary'
                      : 'text-muted-foreground hover:text-foreground lg:text-muted-foreground lg:hover:bg-accent lg:hover:text-primary')
                  }
                >
                  <NavIcon name={item.href} active={active} />
                  {navName(item.name)}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Right cluster */}
        <div className="relative z-10 flex items-center gap-2.5">
          {/* Bilingual Language Dropdown */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={tp('bahasa')}
                  className="flex h-9 items-center gap-1 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none cursor-pointer"
                >
                  <span>{locale}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 shadow-lg">
                <DropdownMenuItem
                  onClick={() => setLocale('id')}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    locale === 'id' ? "bg-accent text-primary font-semibold" : "hover:bg-secondary"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🇮🇩</span>
                    <span>Bahasa Indonesia</span>
                  </div>
                  {locale === 'id' && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setLocale('en')}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    locale === 'en' ? "bg-accent text-primary font-semibold" : "hover:bg-secondary"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🇬🇧</span>
                    <span>English</span>
                  </div>
                  {locale === 'en' && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Notification (hidden on auth pages) */}
          {!isAuth && (
            <div className="relative hidden md:block">
              <button
                type="button"
                aria-label={nav("notifikasi")}
                aria-expanded={notifOpen}
                onClick={() => setNotifOpen((v) => !v)}
                className="relative grid h-9 w-9 place-items-center rounded-sm border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-secondary hover:text-foreground"
              >
                <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" aria-hidden="true" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-11 z-50 w-80 border border-border bg-popover shadow-md">
                  <div className="border-b border-border px-4 py-3 text-sm font-bold">
                    {nav("notifikasi")}
                  </div>
                  <ul className="divide-y divide-border">
                    {notifications.map((n) => (
                      <li key={n.id} className="px-4 py-3">
                        <p className="text-sm leading-snug">{n.text}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setNotifOpen(false)}
                    className="w-full border-t border-border bg-secondary/50 px-4 py-2.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {nav("tutup")}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Avatar Profile (hidden on auth pages) */}
          {!isAuth && (
            <Link href="/profil" aria-label={nav("pengaturanAkun")} className="inline-block">
              <Avatar className="h-9 w-9 border border-border">
                {user?.photoUrl ? (
                  <AvatarImage src={user.photoUrl} alt={user.name || 'User'} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-accent text-xs font-semibold text-primary">
                  {initials || 'TK'}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}

        </div>
      </div>
    </header>
  );
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const cls = 'h-6 w-6 lg:hidden';
  const sw = active ? 2.4 : 2;
  const path =
    name === '/home' ? 'M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5'
    : name === '/scan' ? 'M4 7V5a1 1 0 0 1 1-1h2m10 0h2a1 1 0 0 1 1 1v2m0 10v2a1 1 0 0 1-1 1h-2M7 19H5a1 1 0 0 1-1-1v-2m4-5h8'
    : name === '/forum' ? 'M8 10h8m-8 4h5m-8 6 2-4h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v13Z'
    : 'M12 3c3 4 6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 3-6 6-10Z';
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={sw} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}
