'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CircleCheck, Droplets, Eye, EyeOff, Loader2, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const perks = [
  { icon: ScanLine, text: '5 scan AI gratis setiap bulan' },
  { icon: Droplets, text: 'Pengingat penyiraman otomatis' },
  { icon: CircleCheck, text: 'Akses penuh forum komunitas' },
];

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const isLogin = mode === 'login';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !agreed) {
      toast.error('Centang persetujuan ketentuan untuk melanjutkan.');
      return;
    }
    setPending(true);
    // ponytail: placeholder auth, replace with real API call when backend exists
    setTimeout(() => {
      setPending(false);
      toast.success(
        isLogin
          ? 'Berhasil masuk. Selamat datang kembali!'
          : 'Akun berhasil dibuat. Selamat datang!',
      );
      router.push('/siram');
    }, 900);
  };

  return (
    <div className="grid w-full border border-border lg:grid-cols-2">
      {/* Left: identity block */}
      <div className="ink-panel hidden flex-col justify-between p-10 lg:flex xl:p-14">
        <span className="text-xl font-bold text-white">Tanaman<span className="text-primary/10">Ku</span></span>
        <div>
          <p className="overline text-primary/10">Plant Health Platform</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight xl:text-4xl">
            Pahami kesehatan <span className="font-playfair">tanamanmu</span>.
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink/15">
            Diagnosis penyakit tanaman lewat foto, ingatkan kamu menyiram, dan diskusikan
            bersama ribuan pecinta tanaman lain.
          </p>
          <ul className="mt-9 space-y-4">
            {perks.map((p) => (
              <li key={p.text} className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center border border-white/15 bg-white/5">
                  <p.icon className="h-4 w-4 text-primary/10" aria-hidden="true" />
                </span>
                <span className="text-sm text-white/90">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/70">
          Data kamu aman dan tidak dibagikan ke pihak lain.
        </p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center bg-card p-6 sm:p-10">
        <div className="w-full max-w-md space-y-7">
          <div>
            <span className="text-lg font-bold text-primary lg:hidden">TanamanKu</span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight lg:mt-0">
              {isLogin ? 'Masuk' : 'Daftar'}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {isLogin
                ? 'Masuk untuk melanjutkan perawatan tanamanmu.'
                : 'Buat akun gratis untuk memulai perjalanan menanam.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isLogin && (
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Lupa password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Konfirmasi Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      name="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
                <label className="flex items-start gap-2.5 text-sm text-muted-foreground" htmlFor="agree">
                  <Checkbox
                    id="agree"
                    checked={agreed}
                    onCheckedChange={(v) => setAgreed(v === true)}
                    className="mt-0.5"
                  />
                  <span>
                    Saya setuju dengan{' '}
                    <Link href="/terms" className="font-medium text-primary hover:underline">
                      Ketentuan
                    </Link>{' '}
                    dan{' '}
                    <Link href="/privacy" className="font-medium text-primary hover:underline">
                      Kebijakan Privasi
                    </Link>
                    .
                  </span>
                </label>
              </>
            )}

            <Button type="submit" className="btn-cta w-full rounded-full" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {pending ? 'Memproses…' : isLogin ? 'Masuk' : 'Daftar'}
            </Button>
          </form>

          <p className="border-t border-border pt-5 text-center text-sm text-muted-foreground">
            {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <Link
              href={isLogin ? '/register' : '/login'}
              className="font-semibold text-primary hover:underline"
            >
              {isLogin ? 'Daftar gratis' : 'Masuk'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
