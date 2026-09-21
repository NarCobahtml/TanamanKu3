'use client';

import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SettingsHeading } from '../SettingsHeading';
import type { UserSession } from '@/lib/use-auth';

export interface ProfileAccountSectionProps {
  user: UserSession | null;
  displayName: string;
  displayEmail: string;
  joinedDate: string;
  initials: string;
  onEdit: () => void;
}

export function ProfileAccountSection({
  user,
  displayName,
  displayEmail,
  joinedDate,
  initials,
  onEdit,
}: ProfileAccountSectionProps) {
  const t = useTranslations('profil');

  return (
    <section id="account" className="scroll-mt-24">
      <SettingsHeading title={t('akun')} />
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40 sm:mt-5">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3.5">
            <Avatar className="h-14 w-14 sm:h-16 sm:w-16">
              {user?.photoUrl ? (
                <AvatarImage src={user.photoUrl} alt={displayName} className="object-cover" />
              ) : null}
              <AvatarFallback className="text-lg font-semibold sm:text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-base sm:text-lg">{displayName}</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{displayEmail}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-10 rounded-full w-full sm:w-auto px-5" onClick={onEdit}>
            {t('editProfil')}
          </Button>
        </div>
        <dl className="grid grid-cols-2 gap-4 border-t border-border bg-secondary/30 p-4 sm:p-5">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">{t('nama')}</dt>
            <dd className="mt-0.5 text-sm font-medium">{displayName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">{t('email')}</dt>
            <dd className="mt-0.5 text-sm font-medium truncate">{displayEmail}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">{t('bergabung')}</dt>
            <dd className="mt-0.5 text-sm font-medium">{joinedDate}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">{t('paket')}</dt>
            <dd className="mt-0.5 text-sm font-medium">{user?.role === 'ADMIN' ? 'Admin' : t('gratis')}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
