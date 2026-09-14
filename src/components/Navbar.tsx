'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, Bell, ScanLine } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Logo, navItems, isActivePath } from './brand';

const notifications = [
  { id: 1, time: '08:12', text: 'Cabai Rawit, jadwal penyiraman hari ini.' },
  { id: 2, time: 'Kemarin', text: 'Scan Tomat Cherry: kondisi daun sehat.' },
  { id: 3, time: '2 hari lalu', text: 'Karet terlewat penyiraman 1 hari.' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />

        {/* Desktop nav — floating pill bar, konsisten dengan landing nav */}
        <nav className="hidden md:flex md:absolute md:left-1/2 md:-translate-x-1/2" aria-label="Navigasi utama">
          <div className="flex items-center gap-1 rounded-full border border-border bg-white/80 px-2 py-2 backdrop-blur-md">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ' +
                    (active
                      ? 'bg-accent text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-primary')
                  }
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Right cluster */}
        <div className="relative z-10 flex items-center gap-2.5">
          <Button asChild size="sm" className="btn-cta hidden gap-2 md:inline-flex">
            <Link href="/scan">
              <ScanLine className="h-4 w-4" aria-hidden="true" />
              Scan
            </Link>
          </Button>

          {/* Notification */}
          <div className="relative hidden md:block">
            <button
              type="button"
              aria-label="Notifikasi"
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
                  Notifikasi
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
                  Tutup
                </button>
              </div>
            )}
          </div>

          <Link href="/profil" aria-label="Pengaturan akun saya" className="hidden md:inline-block">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarFallback className="bg-accent text-xs font-semibold text-primary">AS</AvatarFallback>
            </Avatar>
          </Link>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Buka menu navigasi">
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetTitle className="sr-only">Menu navigasi</SheetTitle>
              <div className="mt-2 flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={
                        'rounded-sm border-l-2 px-3.5 py-3 text-[15px] font-medium transition-colors ' +
                        (active
                          ? 'border-primary bg-accent text-primary'
                          : 'border-transparent text-foreground hover:bg-secondary')
                      }
                    >
                      {item.name}
                    </Link>
                  );
                })}
                <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-accent text-xs font-semibold text-primary">AS</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-semibold">Alex Saputra</p>
                    <Link href="/profil" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                      Pengaturan
                    </Link>
                  </div>
                </div>
                <Button asChild className="btn-cta mt-4 w-full">
                  <Link href="/scan" onClick={() => setOpen(false)}>
                    <ScanLine className="h-4 w-4" aria-hidden="true" />
                    Scan Tanaman
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
