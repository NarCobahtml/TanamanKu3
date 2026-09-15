'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Pencil, Sparkles, UserCog, CreditCard, Bell, BellRing } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale as useLocaleSetting } from '@/components/LocaleProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TkRevealClient from '@/components/landing/tk-reveal-client';
import { cn } from '@/lib/utils';

/** Manual switch - track w-9 h-5, knob w-4 (rounded-full allowed: switch track). */
function Switch({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={
        checked
          ? 'relative h-5 w-9 shrink-0 rounded-full bg-primary transition-colors'
          : 'relative h-5 w-9 shrink-0 rounded-full bg-secondary border border-border transition-colors'
      }
    >
      <span
        className={
          checked
            ? 'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform translate-x-4'
            : 'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform'
        }
      />
    </button>
  );
}

/** Settings section heading: icon + title + description row. */
function SettingsHeading({ icon: Icon, title, desc }: { icon: typeof UserCog; title: string; desc?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center bg-accent text-primary">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {desc && <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>}
      </div>
    </div>
  );
}

export default function ProfilPage() {
  const t = useTranslations('profil');
  const tc = useTranslations('common');
  const { locale, setLocale } = useLocaleSetting();
  const router = useRouter();
  const [name, setName] = useState('Alex Saputra');
  const [email, setEmail] = useState('alex.saputra@email.com');
  const [editOpen, setEditOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [theme, setTheme] = useState<'terang' | 'gelap'>('terang');
  const [checked, setChecked] = useState<Record<string, boolean>>({
    reminder: true,
    result: true,
    tips: false,
  });

  const togglePref = (id: string, v: boolean) => {
    setChecked((c) => ({ ...c, [id]: v }));
  };

  const navItems = [
    { href: '#account', label: t('akun'), icon: UserCog },
    { href: '/riwayat', label: t('riwayatScan'), icon: BellRing },
    { href: '/langganan', label: t('langganan'), icon: CreditCard },
    { href: '#preferences', label: t('preferensi'), icon: Bell },
    { href: '#keluar', label: t('keluar'), icon: LogOut },
  ];

  const notifPrefs = [
    { id: 'reminder', label: t('notifikasi'), desc: t('notifikasiDesc'), defaultChecked: true },
    { id: 'result', label: t('hasilScan'), desc: t('hasilScanDesc'), defaultChecked: true },
    { id: 'tips', label: t('tipsMingguan'), desc: t('tipsDesc'), defaultChecked: false },
  ];

  return (
    <div>
      <div className="mx-auto grid w-full max-w-7xl items-start gap-12 px-4 pt-12 sm:px-6 lg:grid-cols-[220px_1fr]">
        {/* Settings nav rail, vertical pills, konsisten pill nav */}
        <nav className="lg:sticky lg:top-24" aria-label={t('akun')}>
          <ul className="flex gap-1.5 overflow-x-auto lg:flex-col lg:gap-1">
            {navItems.map((item) => (
              <li key={item.href} className="shrink-0">
                <a
                  href={item.href}
                  onClick={(e) => {
                    if (item.href.startsWith('#')) return; // anchor: default
                    e.preventDefault();
                    router.push(item.href);
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

        <div className="space-y-16">
          {/* Account */}
          <TkRevealClient>
          <section id="account" className="scroll-mt-24">
            <SettingsHeading icon={UserCog} title={t('akun')} />
            <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
              <div className="flex flex-wrap items-center gap-4 p-5">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl font-semibold">AS</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{name}</p>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setEditOpen(true)}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  {t('editProfil')}
                </Button>
              </div>
              <dl className="grid gap-x-8 gap-y-4 border-t border-border bg-secondary/30 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">{t('nama')}</dt>
                  <dd className="mt-0.5 text-sm">{name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">{t('email')}</dt>
                  <dd className="mt-0.5 text-sm">{email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">{t('bergabung')}</dt>
                  <dd className="mt-0.5 text-sm">{locale === 'id' ? 'Januari 2026' : 'January 2026'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">{t('paket')}</dt>
                  <dd className="mt-0.5 text-sm">{t('gratis')}</dd>
                </div>
              </dl>
            </div>
          </section>
          </TkRevealClient>

          {/* Subscription */}
          <TkRevealClient>
          <section id="subscription" className="rule scroll-mt-24 pt-14">
            <SettingsHeading icon={CreditCard} title={t('langganan')} desc={t('preferensiDesc').split('.')[0] + '.'} />
            <div className="mt-5 grid gap-8 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/30">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-semibold">{t('paketGratis')}</h3>
                  <Badge variant="outline">{t('aktif')}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t('paketDesc')}</p>
                <p className="mt-4 text-sm text-muted-foreground">{t('perpanjangan')}</p>
              </div>
              <div className="rounded-xl border border-border p-5 sage-wash">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t('penggunaanScan')}</span>
                  <span className="tnum text-muted-foreground">{t('bulanIni', { count: 3 })}</span>
                </div>
                <div
                  className="mt-2 h-1.5 rounded-full bg-white"
                  role="progressbar"
                  aria-label="3/5"
                  aria-valuenow={3}
                  aria-valuemin={0}
                  aria-valuemax={5}
                >
                  <div className="h-full w-[60%] rounded-full bg-primary" />
                </div>
                <Button
                  className="btn-cta mt-4 w-full rounded-full"
                  onClick={() => undefined}
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {t('upgrade')}
                </Button>
              </div>
            </div>
          </section>
          </TkRevealClient>

          {/* Preferences */}
          <TkRevealClient>
          <section id="preferences" className="rule scroll-mt-24 pt-14">
            <SettingsHeading icon={Bell} title={t('preferensi')} desc={t('preferensiDesc')} />
            <div className="mt-5 divide-y divide-border rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
              {notifPrefs.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-sm font-medium">{p.label}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{p.desc}</p>
                  </div>
                  <Switch
                    checked={!!checked[p.id]}
                    onCheckedChange={(v) => togglePref(p.id, v)}
                    label={p.label}
                  />
                </div>
              ))}
              {/* Language, switcher fungsional */}
              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-medium">{t('bahasa')}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{t('bahasaDesc')}</p>
                </div>
                <div className="flex gap-1 rounded-full border border-border bg-card p-1" role="group" aria-label={t('bahasa')}>
                  <button
                    type="button"
                    aria-pressed={locale === 'id'}
                    onClick={() => setLocale('id')}
                    className={
                      locale === 'id'
                        ? 'rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground'
                        : 'rounded-full px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground'
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
                        ? 'rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground'
                        : 'rounded-full px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground'
                    }
                  >
                    English
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-medium">{t('tampilan')}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{t('tampilanDesc')}</p>
                </div>
                <div className="flex gap-1 rounded-full border border-border bg-card p-1" role="group" aria-label={t('tampilan')}>
                  <button
                    type="button"
                    aria-pressed={theme === 'terang'}
                    onClick={() => setTheme('terang')}
                    className={
                      theme === 'terang'
                        ? 'rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground'
                        : 'rounded-full px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground'
                    }
                  >
                    {t('terang')}
                  </button>
                  <button
                    type="button"
                    aria-pressed={theme === 'gelap'}
                    onClick={() => setTheme('gelap')}
                    className={
                      theme === 'gelap'
                        ? 'rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground'
                        : 'rounded-full px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground'
                    }
                  >
                    {t('gelap')}
                  </button>
                </div>
              </div>
            </div>
          </section>
          </TkRevealClient>

          {/* Logout */}
          <TkRevealClient>
          <section id="keluar" className="rule scroll-mt-24 pt-14">
            <div className="rounded-xl border-l-2 border-destructive bg-destructive/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{t('keluarAkun')}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t('keluarDesc')}</p>
                </div>
                <Button variant="destructive" className="rounded-full" onClick={() => setLogoutOpen(true)}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {t('keluar')}
                </Button>
              </div>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">{t('versi')}</p>
          </section>
          </TkRevealClient>
        </div>
      </div>

      {/* Edit profile dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editProfil')}</DialogTitle>
            <DialogDescription>{t('perbaruiInfo')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">{t('nama')}</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">{t('email')}</Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setEditOpen(false);
              }}
            >
              {tc('simpan')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout confirm dialog */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('keluarJudul')}</DialogTitle>
            <DialogDescription>{t('keluarDesc')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              {tc('batal')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setLogoutOpen(false);
                router.push('/login');
              }}
            >
              {t('keluar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
