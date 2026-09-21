'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, UserCog, CreditCard, Bell, BellRing, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useLocale as useLocaleSetting } from '@/components/layout/LocaleProvider';
import { useMounted } from '@/lib/use-mounted';
import { useAuth } from '@/lib/use-auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SettingsHeading } from './SettingsHeading';
import { CurrentPlanCard } from '@/components/shared/subscription/CurrentPlanCard';
import { ScanUsageCard } from '@/components/shared/subscription/ScanUsageCard';
import { ProfileNavRail } from './components/ProfileNavRail';
import { ProfileAccountSection } from './components/ProfileAccountSection';
import { ProfilePreferencesSection } from './components/ProfilePreferencesSection';
import { EditProfileDialog } from './components/EditProfileDialog';
import { LogoutDialog } from './components/LogoutDialog';

export default function ProfilPage() {
  const t = useTranslations('profil');
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
        <ProfileNavRail navItems={navItems} onNavigate={(href) => router.push(href)} />

        <div className="space-y-8 sm:space-y-16">
          <ProfileAccountSection
            user={user}
            displayName={displayName}
            displayEmail={displayEmail}
            joinedDate={joinedDate}
            initials={initials}
            onEdit={() => setEditOpen(true)}
          />

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

          <ProfilePreferencesSection
            notifPrefs={notifPrefs}
            checked={checked}
            onTogglePref={togglePref}
            currentTheme={currentTheme}
            setTheme={setTheme}
            locale={locale}
            setLocale={setLocale}
          />

          {/* PWA Install Card in Profile */}
          <section className="rule scroll-mt-24 pt-6 sm:pt-10">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-xl bg-[#123526] p-2 flex items-center justify-center shrink-0 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/icon-192x192.png" alt="TanamanKu" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-foreground">Pasang Aplikasi TanamanKu (PWA)</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Buka lebih cepat di layar utama tanpa browser dan hemat kuota internet.</p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.triggerPwaInstall) {
                    window.triggerPwaInstall();
                  }
                }}
                className="rounded-full bg-[#1B5E20] hover:bg-[#17491a] text-white px-5 text-xs font-semibold shrink-0 cursor-pointer h-10"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Install di HP
              </Button>
            </div>
          </section>

          {/* Logout Section */}
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

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        name={name}
        setName={setName}
        email={email}
        photo={photo}
        setPhoto={setPhoto}
        userPhotoUrl={user?.photoUrl}
        initials={initials}
        saving={saving}
        onSave={handleSaveProfile}
        onPickPhoto={onPickPhoto}
        fileInputRef={fileInputRef}
      />

      <LogoutDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        loggingOut={loggingOut}
        onLogout={handleLogout}
      />
    </div>
  );
}
