"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AuthTestimonialPanel,
  AuthSocialButtons,
  LoginForm,
  RegisterForm,
} from "./components";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const t = useTranslations("auth");
  const isLogin = mode === "login";
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSocialLogin = (provider: "google" | "facebook") => {
    setErrorMessage(null);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://chxnfvwdldhpickamcpm.supabase.co";
    const redirectUrl = `${window.location.origin}/auth/callback`;
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectUrl)}`;
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
    agreed: boolean;
  }) => {
    setErrorMessage(null);

    if (!agreed) {
      setErrorMessage("Silakan setujui Ketentuan dan Kebijakan Privasi terlebih dahulu.");
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

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Left: testimonial photo panel */}
      <AuthTestimonialPanel />

      {/* Right: form */}
      <div className="flex items-center justify-center bg-card px-6 py-12 sm:px-10 xl:px-20">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isLogin ? t("selamatDatang") : t("bergabung")}
          </h1>

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
        </div>
      </div>
    </div>
  );
}
