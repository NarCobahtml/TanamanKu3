'use client';

import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProfileNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface ProfileNavRailProps {
  navItems: ProfileNavItem[];
  onNavigate: (href: string) => void;
}

export function ProfileNavRail({ navItems, onNavigate }: ProfileNavRailProps) {
  const t = useTranslations('profil');

  return (
    <nav className="hidden lg:sticky lg:top-24 lg:block" aria-label={t('akun')}>
      <ul className="flex flex-col gap-1">
        {navItems.map((item) => (
          <li key={item.href} className="shrink-0">
            <a
              href={item.href}
              onClick={(e) => {
                if (item.href.startsWith('#')) return; // anchor: default
                e.preventDefault();
                onNavigate(item.href);
              }}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                item.href === '#keluar'
                  ? 'text-destructive hover:bg-destructive/10'
                  : 'text-muted-foreground hover:bg-accent hover:text-primary',
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
