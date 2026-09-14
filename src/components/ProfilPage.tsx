'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LogOut, Pencil, Sparkles, UserCog, CreditCard, Bell, BellRing, Languages } from 'lucide-react';
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
import { PageHeader } from '@/components/PageHeader';
import TkRevealClient from '@/components/landing/tk-reveal-client';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '#account', label: 'Akun', icon: UserCog },
  { href: '/riwayat', label: 'Riwayat Scan', icon: BellRing },
  { href: '/langganan', label: 'Langganan', icon: CreditCard },
  { href: '#preferences', label: 'Preferensi', icon: Bell },
  { href: '#keluar', label: 'Keluar', icon: LogOut },
];

const notifPrefs = [
  { id: 'reminder', label: 'Notifikasi', desc: 'Pengingat penyiraman tanaman', defaultChecked: true },
  { id: 'result', label: 'Hasil scan', desc: 'Notifikasi saat hasil scan siap dilihat', defaultChecked: true },
  { id: 'tips', label: 'Tips mingguan', desc: 'Tips perawatan tanaman tiap minggu', defaultChecked: false },
];

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
  const router = useRouter();
  const [name, setName] = useState('Alex Saputra');
  const [email, setEmail] = useState('alex.saputra@email.com');
  const [editOpen, setEditOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [theme, setTheme] = useState<'terang' | 'gelap'>('terang');
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(notifPrefs.map((p) => [p.id, p.defaultChecked])),
  );

  const togglePref = (id: string, v: boolean) => {
    setChecked((c) => ({ ...c, [id]: v }));
    toast.success('Preferensi notifikasi tersimpan.');
  };

  return (
    <div>
      <PageHeader
        overline="Akun"
        title="Pengaturan"
        accent="Pengaturan"
        description="Kelola akun, langganan, dan preferensi aplikasi TanamanKu."
      />

      <div className="mx-auto grid w-full max-w-7xl items-start gap-12 px-4 pt-12 sm:px-6 lg:grid-cols-[220px_1fr]">
        {/* Settings nav rail — vertical pills, konsisten pill nav */}
        <nav className="lg:sticky lg:top-24" aria-label="Navigasi pengaturan">
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
            <SettingsHeading icon={UserCog} title="Akun" />
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
                  Edit Profil
                </Button>
              </div>
              <dl className="grid gap-x-8 gap-y-4 border-t border-border bg-secondary/30 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Nama</dt>
                  <dd className="mt-0.5 text-sm">{name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Email</dt>
                  <dd className="mt-0.5 text-sm">{email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Bergabung</dt>
                  <dd className="mt-0.5 text-sm">Januari 2026</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Paket</dt>
                  <dd className="mt-0.5 text-sm">Gratis</dd>
                </div>
              </dl>
            </div>
          </section>
          </TkRevealClient>

          {/* Subscription */}
          <TkRevealClient>
          <section id="subscription" className="rule scroll-mt-24 pt-14">
            <SettingsHeading icon={CreditCard} title="Langganan" desc="Paket dan penggunaan scan bulan ini." />
            <div className="mt-5 grid gap-8 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/30">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-semibold">Paket Gratis</h3>
                  <Badge variant="outline">Aktif</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Paket dasar untuk memulai perawatan tanamanmu.
                </p>
                <p className="mt-4 text-sm text-muted-foreground">Perpanjangan otomatis: tidak aktif</p>
              </div>
              <div className="rounded-xl border border-border p-5 sage-wash">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Penggunaan scan</span>
                  <span className="tnum text-muted-foreground">3/5 bulan ini</span>
                </div>
                <div
                  className="mt-2 h-1.5 rounded-full bg-white"
                  role="progressbar"
                  aria-label="3 dari 5 scan terpakai"
                  aria-valuenow={3}
                  aria-valuemin={0}
                  aria-valuemax={5}
                >
                  <div className="h-full w-[60%] rounded-full bg-primary" />
                </div>
                <Button
                  className="btn-cta mt-4 w-full rounded-full"
                  onClick={() => toast.info('Fitur Premium segera hadir (demo)')}
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Upgrade ke Premium
                </Button>
              </div>
            </div>
          </section>
          </TkRevealClient>

          {/* Preferences */}
          <TkRevealClient>
          <section id="preferences" className="rule scroll-mt-24 pt-14">
            <SettingsHeading icon={Bell} title="Preferensi" desc="Notifikasi dan tampilan aplikasi." />
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
              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-medium">Bahasa</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">Bahasa tampilan aplikasi.</p>
                </div>
                <Badge variant="outline" className="gap-1.5">
                  <Languages className="h-3 w-3" aria-hidden="true" />
                  Indonesia
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-medium">Tampilan</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">Mode terang atau gelap.</p>
                </div>
                <div className="flex gap-1 rounded-full border border-border bg-card p-1" role="group" aria-label="Mode tampilan">
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
                    Terang
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
                    Gelap
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
                  <h3 className="font-semibold">Keluar dari Akun</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Anda perlu masuk kembali untuk mengakses tanaman dan riwayat scan Anda.
                  </p>
                </div>
                <Button variant="destructive" className="rounded-full" onClick={() => setLogoutOpen(true)}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Keluar
                </Button>
              </div>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">TanamanKu v1.0.0 (demo)</p>
          </section>
          </TkRevealClient>
        </div>
      </div>

      {/* Edit profile dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profil</DialogTitle>
            <DialogDescription>Perbarui informasi akun Anda.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nama</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
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
                toast.success('Profil berhasil diperbarui.');
              }}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout confirm dialog */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keluar dari akun?</DialogTitle>
            <DialogDescription>
              Anda perlu masuk kembali untuk mengakses tanaman dan riwayat scan Anda.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setLogoutOpen(false);
                toast.success('Anda telah keluar dari akun.');
                router.push('/login');
              }}
            >
              Keluar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
