'use client';

import { useTranslations } from 'next-intl';
import { SettingsHeading } from '../SettingsHeading';
import { SettingsSwitch } from '../SettingsSwitch';

export interface ProfilePreferencesSectionProps {
  notifPrefs: Array<{ id: string; label: string; desc: string; defaultChecked: boolean }>;
  checked: Record<string, boolean>;
  onTogglePref: (id: string, val: boolean) => void;
  currentTheme: string;
  setTheme: (theme: string) => void;
  locale: string;
  setLocale: (locale: 'id' | 'en') => void;
}

export function ProfilePreferencesSection({
  notifPrefs,
  checked,
  onTogglePref,
  currentTheme,
  setTheme,
  locale,
  setLocale,
}: ProfilePreferencesSectionProps) {
  const t = useTranslations('profil');

  return (
    <section id="preferences" className="rule scroll-mt-24 pt-6 sm:pt-14">
      <SettingsHeading title={t('preferensi')} desc={t('preferensiDesc')} />
      <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-card transition-colors hover:border-primary/40 sm:mt-5">
        {notifPrefs.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3 p-4 sm:p-5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{p.label}</p>
              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">{p.desc}</p>
            </div>
            <SettingsSwitch
              checked={!!checked[p.id]}
              onCheckedChange={(v) => onTogglePref(p.id, v)}
              label={p.label}
            />
          </div>
        ))}

        {/* Language, switcher fungsional */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5">
          <div>
            <p className="text-sm font-medium">{t('bahasa')}</p>
            <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">{t('bahasaDesc')}</p>
          </div>
          <div className="flex gap-1 rounded-full border border-border bg-card p-1 self-start sm:self-auto" role="group" aria-label={t('bahasa')}>
            <button
              type="button"
              aria-pressed={locale === 'id'}
              onClick={() => setLocale('id')}
              className={
                locale === 'id'
                  ? 'rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground min-h-[36px]'
                  : 'rounded-full px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground min-h-[36px]'
              }
            >
              Indonesia
            </button>
            <button
              type="button"
              aria-pressed={locale === 'en'}
              onClick={() => setLocale('en')}
              className={
                locale === 'en'
                  ? 'rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground min-h-[36px]'
                  : 'rounded-full px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground min-h-[36px]'
              }
            >
              English
            </button>
          </div>
        </div>

        {/* Theme, switcher fungsional */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5">
          <div>
            <p className="text-sm font-medium">{t('tampilan')}</p>
            <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">{t('tampilanDesc')}</p>
          </div>
          <div className="flex gap-1 rounded-full border border-border bg-card p-1 self-start sm:self-auto" role="group" aria-label={t('tampilan')}>
            <button
              type="button"
              aria-pressed={currentTheme === 'terang'}
              onClick={() => setTheme('light')}
              className={
                currentTheme === 'terang'
                  ? 'rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground min-h-[36px]'
                  : 'rounded-full px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground min-h-[36px]'
              }
            >
              {t('terang')}
            </button>
            <button
              type="button"
              aria-pressed={currentTheme === 'gelap'}
              onClick={() => setTheme('dark')}
              className={
                currentTheme === 'gelap'
                  ? 'rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground min-h-[36px]'
                  : 'rounded-full px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground min-h-[36px]'
              }
            >
              {t('gelap')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
