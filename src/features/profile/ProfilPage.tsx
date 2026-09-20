'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, UserCog, CreditCard, Bell, BellRing, Camera, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useLocale as useLocaleSetting } from '@/components/layout/LocaleProvider';
import { useMounted } from '@/lib/use-mounted';
import { useAuth } from '@/features/auth/use-auth';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { SettingsSwitch } from './SettingsSwitch';
import { SettingsHeading } from './SettingsHeading';
import { CurrentPlanCard } from '@/components/shared/subscription/CurrentPlanCard';
import { ScanUsageCard } from '@/components/shared/subscription/ScanUsageCard';
import { cn } from '@/lib/utils';

export default function ProfilPage() {
  const t = useTranslations('profil');
  const tc = useTranslations('common');
  const { locale, setLocale } = useLocaleSetting();
  const router = useRouter();
  const { user, initials, logout, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhoto(user.photoUrl || '');
    }
  }, [user]);

  const displayName = user?.name || name || 'Pengguna TanamanKu';
  const displayEmail = user?.email || email || 'Belum masuk';

  const joinedDate = useMemo(() => {
    if (!user?.createdAt) return locale === 'id' ? 'Januari 2026' : 'January 2026';
    const d = new Date(user.createdAt);
    return d.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' });
  }, [user?.createdAt, locale]);

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 3MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const updated = await updateProfile({
        name: name.trim(),
        photoUrl: photo,
      });
      if (updated?.photoUrl !== undefined) {
        setPhoto(updated.photoUrl || '');
      }
      toast.success('Profil berhasil diperbarui');
      setEditOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui profil';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast.success('Berhasil keluar dari akun');
    } catch {
      toast.error('Gagal keluar');
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  };

  const currentTheme = mounted ? (theme === 'dark' || resolvedTheme === 'dark' ? 'gelap' : 'terang') : 'terang';
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
      <div className="mx-auto grid w-full max-w-7xl items-start gap-6 px-4 pt-6 pb-24 sm:gap-12 sm:px-6 sm:pt-12 sm:pb-16 lg:grid-cols-[220px_1fr]">
        {/* Settings nav rail (desktop only) */}
        <nav className="hidden lg:sticky lg:top-24 lg:block" aria-label={t('akun')}>
          <ul className="flex flex-col gap-1">
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

        <div className="space-y-8 sm:space-y-16">
          {/* Account */}
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
                <Button variant="outline" size="sm" className="h-10 rounded-full w-full sm:w-auto px-5" onClick={() => setEditOpen(true)}>
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

          {/* Subscription */}
          <section id="subscription" className="rule scroll-mt-24 pt-6 sm:pt-14">
            <SettingsHeading title={t('langganan')} desc={t('preferensiDesc').split('.')[0] + '.'} />
            <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-8 md:grid-cols-2">
              <CurrentPlanCard
                name={t('paketGratis')}
                badgeLabel={t('aktif')}
                description={t('paketDesc')}
                renewalNote={t('perpanjangan')}
              />
              <ScanUsageCard
                title={t('penggunaanScan')}
                usageText={t('bulanIni', { count: 3 })}
                current={3}
                max={5}
              >
                <Button
                  asChild
                  className="btn-cta mt-4 h-11 w-full rounded-full text-sm font-semibold cursor-pointer"
                >
                  <Link href="/langganan">
                    {t('upgrade')}
                  </Link>
                </Button>
              </ScanUsageCard>
            </div>
          </section>

          {/* Preferences */}
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
                    onCheckedChange={(v) => togglePref(p.id, v)}
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

          {/* Logout */}
          <section id="keluar" className="rule scroll-mt-24 pt-6 sm:pt-14 pb-8">
            <div className="rounded-xl border-l-2 border-destructive bg-destructive/5 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-base">{t('keluarAkun')}</h3>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{t('keluarDesc')}</p>
                </div>
                <Button variant="destructive" className="h-11 w-full rounded-full sm:w-auto px-6 font-semibold" onClick={() => setLogoutOpen(true)}>
                  {t('keluar')}
                </Button>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground sm:mt-6">{t('versi')}</p>
          </section>
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
            {/* Foto Profil */}
            <div className="flex flex-col items-center justify-center pb-2 pt-1">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
                  aria-label="Ubah foto profil"
                >
                  <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-sm transition-opacity group-hover:opacity-90">
                    {photo ? (
                      <AvatarImage src={photo} alt={name || 'Avatar'} className="object-cover" />
                    ) : user?.photoUrl ? (
                      <AvatarImage src={user.photoUrl} alt={name || 'Avatar'} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="text-2xl font-bold bg-accent text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <span
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-110 active:scale-95 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <Camera className="size-4" />
                  </span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onPickPhoto}
              />

              {(photo || user?.photoUrl) && (
                <button
                  type="button"
                  onClick={() => {
                    setPhoto('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="mt-2 text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                >
                  Hapus foto
                </button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-name">{t('nama')}</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Lengkap"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">{t('email')}</Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed opacity-75"
              />
              <p className="text-[11px] text-muted-foreground">Email akun terdaftar dan tidak dapat diubah langsung.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              {tc('batal')}
            </Button>
            <Button onClick={handleSaveProfile} disabled={saving || !name.trim()}>
              {saving ? 'Menyimpan...' : tc('simpan')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout confirmation dialog */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('keluarAkun')}</DialogTitle>
            <DialogDescription>{t('konfirmasiKeluar')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutOpen(false)} disabled={loggingOut}>
              {tc('batal')}
            </Button>
            <Button
              variant="destructive"
              disabled={loggingOut}
              onClick={handleLogout}
            >
              {loggingOut ? 'Memproses...' : t('keluar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
