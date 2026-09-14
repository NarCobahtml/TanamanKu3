'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      {/* Desktop — t3 editorial auth */}
      <div className="hidden lg:block">
        <div className="flex min-h-dvh flex-col bg-secondary/40">
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-12 sm:px-6 md:py-16">
            <header className="hero-anim hero-fade mx-auto w-full max-w-5xl">
              <p className="overline">Plant Health Platform</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-extrabold leading-[1.1] tracking-[-0.03em] md:text-5xl">
                Pahami kesehatan{' '}
                <span className="font-playfair">tanamanmu</span>.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                Diagnosis penyakit tanaman lewat foto, pengingat penyiraman, dan forum komunitas —
                semua dalam satu tempat.
              </p>
            </header>
            <div
              className="hero-anim hero-fade mx-auto mt-12 flex w-full max-w-5xl flex-1 items-center"
              style={{ animationDelay: '0.15s' }}
            >
              <AuthForm mode="login" />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile — mobile1 Figma */}
      <div className="auth-page flex flex-col justify-center px-6 py-10 lg:hidden">
        <div className="auth-content space-y-7">
          <div>
            <h1 className="text-[28px] leading-[1.15] font-bold tracking-[-.03em] text-ink mb-2">Selamat Datang Kembali</h1>
            <p className="text-ink/70">Masuk untuk rawat tanaman Anda</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/70 pointer-events-none" />
                <input
                  type="email"
                  placeholder="your@mail.com"
                  className="auth-input w-full pl-12 pr-4"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/70 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password Anda"
                  className="auth-input w-full pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-ink/70"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="text-right mt-2">
                <Link href="#" className="text-sm text-[#1B5E20] font-semibold">Lupa Password?</Link>
              </div>
            </div>
            <button className="auth-button w-full text-white font-bold">Masuk</button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink/15" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-background text-[13px] text-ink/70">atau masuk dengan</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 h-12 bg-white border border-ink/15 rounded-xl font-semibold text-ink">
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 h-12 bg-white border border-ink/15 rounded-xl font-semibold text-ink">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          <p className="text-center text-ink/70">
            Belum punya akun?{' '}
            <Link href="/register" className="text-[#1B5E20] font-bold">Daftar Sekarang</Link>
          </p>
        </div>
      </div>
    </>
  );
}
