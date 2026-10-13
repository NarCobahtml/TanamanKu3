'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, KeyRound, Loader2, MailWarning, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

const inputClass =
  "h-14 w-full rounded-lg border border-border bg-background px-4 text-center text-2xl font-semibold tracking-[0.5em] text-foreground placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent";

export interface VerifyOtpFormProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
  /** OTP dev-only dari server (dev tanpa RESEND_API_KEY) — dipakai biar bisa dites. */
  devOtp?: string;
}

/**
 * Step 2 dari register: input 6 digit OTP.
 * Auto-submit saat 6 digit terisi, plus countdown resend yang nilainya dikirim
 * server (server = sumber kebenaran; client cuma display).
 */
export function VerifyOtpForm({ email, onVerified, onBack, devOtp }: VerifyOtpFormProps) {
  const t = useTranslations('auth');
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);
  const [emailSent, setEmailSent] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Countdown resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  // Cross-tab auto-detection: jika user memverifikasi lewat tab lain, otomatis redirect
  useEffect(() => {
    const checkStatus = async () => {
      const userId = sessionStorage.getItem('tumbuhkita_pending_user');
      if (!userId) return;
      try {
        const res = await fetch(`/api/auth/verify-otp?userId=${encodeURIComponent(userId)}`);
        const json = await res.json();
        if (json.success && json.data?.verified) {
          sessionStorage.removeItem('tumbuhkita_pending_user');
          onVerified();
        }
      } catch {
        // silent ignore background error
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void checkStatus();
      }
    };

    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [onVerified]);

  const submit = async (otp: string) => {
    if (pending) return;
    setPending(true);
    setError(null);

    try {
      const userId = sessionStorage.getItem('tumbuhkita_pending_user');
      if (!userId) {
        setError(t('notFoundSession'));
        setPending(false);
        return;
      }

      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || t('verifikasiGagalUmum'));
        setCode('');
        autoSubmittedRef.current = false;
        setPending(false);
        return;
      }

      sessionStorage.removeItem('tumbuhkita_pending_user');
      onVerified();
    } catch {
      setError(t('serverUnreachable'));
      setPending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (code.length === 6 && !pending) {
      autoSubmittedRef.current = false;
      void submit(code);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    setError(null);

    if (digits.length === 6 && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      void submit(digits);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || pending) return;
    setError(null);

    try {
      const userId = sessionStorage.getItem('tumbuhkita_pending_user');
      if (!userId) {
        setError(t('notFoundSession'));
        return;
      }

      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || t('verifikasiGagalUmum'));
        return;
      }

      setCooldown(data.data?.resendCooldownSeconds ?? 60);
      setCode('');
      autoSubmittedRef.current = false;
      setEmailSent(data.data?.emailSent !== false);
      inputRef.current?.focus();
    } catch {
      setError(t('serverUnreachable'));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
        <MailWarning className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-muted-foreground">
          {t('kodeDikirimKe')} <span className="font-semibold text-foreground">{email}</span>.{' '}
          {t('cekSpam')}
        </p>
      </div>

      {!emailSent && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {t('verifikasiEmailGagal')}
        </div>
      )}

      {devOtp && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          <div>
            <span className="text-muted-foreground">{t('devOtpLabel')} </span>
            <span className="font-mono font-semibold tracking-widest text-foreground">{devOtp}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setCode(devOtp);
              autoSubmittedRef.current = true;
              void submit(devOtp);
            }}
            className="rounded bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 cursor-pointer"
          >
            {t('pakaiKodeDev')}
          </button>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="otp" className="text-sm font-medium">
            {t('kodeVerifikasi')}
          </label>
          <input
            ref={inputRef}
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            value={code}
            onChange={handleChange}
            placeholder={t('kodePlaceholder')}
            aria-describedby="otp-help"
            className={inputClass}
            disabled={pending}
          />
          <p id="otp-help" className="text-xs text-muted-foreground">
            {t('kodeBantu')}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <KeyRound className="size-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={code.length !== 6 || pending}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {pending ? t('memverifikasi') : t('verifikasi')}
        </button>
      </form>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t('ubahData')}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || pending}
          className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
        >
          {cooldown > 0 ? t('kirimUlangDetik', { n: cooldown }) : t('kirimUlang')}
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
        <span>{t('verifiedBadge')}</span>
      </div>
    </div>
  );
}