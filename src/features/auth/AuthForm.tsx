"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AuthTestimonialPanel,
  AuthSocialButtons,
  LoginForm,
  RegisterForm,
  VerifyOtpForm,
} from "./components";
import { createClient } from "@/lib/supabase/client";

const PENDING_USER_KEY = 'tumbuhkita_pending_user';

type Step = 'credentials' | 'verify';

export default function AuthForm({
  mode,
  verified,
}: {
  mode: "login" | "register";
  verified?: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const isLogin = mode === "login";
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('credentials');
  const [pendingEmail, setPendingEmail] = useState('');
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined);

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setErrorMessage(null);
    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) {
        setErrorMessage(error.message);
      }
    } catch (err) {
      console.error("Social login error:", err);
      setErrorMessage("Gagal menghubungkan ke layanan login.");
    }
  };

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    setErrorMessage(null);
    setPending(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Akun dibuat tapi belum verifikasi email → arahkan ke step OTP
        // daripada menampilkan error biasa.
        if (data.error?.code === "EMAIL_NOT_VERIFIED" && data.error?.data?.userId) {
          sessionStorage.setItem(PENDING_USER_KEY, data.error.data.userId);
          setPendingEmail(email);
          setDevOtp(undefined);
          setStep("verify");
          setErrorMessage(null);
          setPending(false);
          return;
        }
        setErrorMessage(data.error?.message || "Terjadi kesalahan saat memproses permintaan.");
        setPending(false);
        return;
      }

      // Store user session info in localStorage for fast UI reflection
      if (data.data?.user) {
        localStorage.setItem("tumbuhkita_user", JSON.stringify(data.data.user));
        window.dispatchEvent(new Event("auth-changed"));
      }

      router.push("/home");
      router.refresh();
    } catch (err) {
      console.error("Auth request error:", err);
      setErrorMessage("Tidak dapat terhubung ke server. Silakan coba lagi.");
      setPending(false);
    }
  };

  const handleRegister = async ({
    name,
    email,
    password,
    confirm,
    agreed,
  }: {
    name: string;
    email: string;
    password: string;
    confirm: string;
    agreed?: boolean;
  }) => {
    setErrorMessage(null);

    if (agreed === false) {
      setErrorMessage("Silakan setujui syarat dan ketentuan untuk mendaftar.");
      return;
    }

    if (password !== confirm) {
      setErrorMessage("Password dan konfirmasi password tidak cocok.");
      return;
    }

    setPending(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || "Terjadi kesalahan saat memproses permintaan.");
        setPending(false);
        return;
      }

      // Gate verifikasi email: akun baru wajib OTP sebelum bisa masuk.
      // userId disimpan di sessionStorage (bukan localStorage) supaya hilang
      // saat tab ditutup dan tidak bertahan setelah verifikasi.
      if (data.data?.requiresVerification && data.data?.userId) {
        sessionStorage.setItem(PENDING_USER_KEY, data.data.userId);
        setPendingEmail(data.data.email ?? email);
        setDevOtp(data.data.devOtp);
        setStep("verify");
        setPending(false);
        return;
      }

      // Store user session info in localStorage for fast UI reflection
      if (data.data?.user) {
        localStorage.setItem("tumbuhkita_user", JSON.stringify(data.data.user));
        window.dispatchEvent(new Event("auth-changed"));
      }

      router.push("/home");
      router.refresh();
    } catch (err) {
      console.error("Auth request error:", err);
      setErrorMessage("Tidak dapat terhubung ke server. Silakan coba lagi.");
      setPending(false);
    }
  };

  const handleOtpVerified = () => {
    // Verifikasi sukses → akun aktif tapi belum punya session. Arahkan ke login
    // supaya user bisa langsung masuk dengan email + password yang sama.
    router.push("/login?verified=1");
    router.refresh();
  };

  const handleOtpBack = () => {
    setStep("credentials");
    setErrorMessage(null);
    setDevOtp(undefined);
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Left: testimonial photo panel */}
      <AuthTestimonialPanel />

      {/* Right: form */}
      <div className="flex items-center justify-center bg-card px-6 py-12 sm:px-10 xl:px-20">
        <div className="w-full max-w-md space-y-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              <span>{tc("kembali")}</span>
            </Link>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">
            {step === "verify" ? t("verifikasiEmail") : isLogin ? t("selamatDatang") : t("bergabung")}
          </h1>

          {step === "verify" ? (
            <VerifyOtpForm
              email={pendingEmail}
              onVerified={handleOtpVerified}
              onBack={handleOtpBack}
              devOtp={devOtp}
            />
          ) : (
            <>
          {verified && !errorMessage && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-3.5 text-sm text-primary flex items-center gap-2.5">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{t("emailBerhasilDiverifikasi")}</span>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isLogin ? (
            <LoginForm onSubmit={handleLogin} pending={pending} />
          ) : (
            <RegisterForm onSubmit={handleRegister} pending={pending} />
          )}

          <div className="relative" aria-hidden="true">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-sm text-muted-foreground">
                {t("atau")}
              </span>
            </div>
          </div>

          <AuthSocialButtons onSocialLogin={handleSocialLogin} />

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? t("belumPunya") + " " : t("sudahPunya") + " "}
            <Link
              href={isLogin ? "/register" : "/login"}
              className="font-semibold text-primary hover:underline"
            >
              {isLogin ? t("daftar") : t("masuk")}
            </Link>
          </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
