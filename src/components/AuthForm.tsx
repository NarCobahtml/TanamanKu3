"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Eye, EyeOff, Loader2, Quote } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";

const inputClass =
  "h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const t = useTranslations("auth");
  const isLogin = mode === "login";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !agreed) return;
    setPending(true);
    // ponytail: placeholder auth, replace with real API call when backend exists
    setTimeout(() => {
      setPending(false);
      router.push('/siram');
    }, 900);
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Left: testimonial photo panel */}
      <div className="relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/figma-assets/hero-plant.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

        <div className="absolute left-8 top-8 grid size-10 place-items-center rounded-lg bg-white/90">
          <Quote className="size-5 text-ink" aria-hidden="true" />
        </div>

        <div className="absolute inset-x-8 bottom-8">
          <p className="max-w-md text-lg leading-relaxed text-white">
            &ldquo;Sekali foto daun, langsung ketahuan penyakitnya dan cara
            menanganinya. Tanaman cabai saya tertolong jauh lebih cepat.&rdquo;
          </p>
          <p className="mt-3 text-sm text-white/85">
            Alex Saputra, Petani cabai, Kediri
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
            tanamanku.id
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center bg-card px-6 py-12 sm:px-10 xl:px-20">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isLogin ? t("selamatDatang") : t("bergabung")}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder={t("namaLengkap")}
                autoComplete="name"
                className={inputClass}
                required
              />
            )}

            <input
              type="email"
              name="email"
              placeholder={t("email")}
              autoComplete="email"
              className={inputClass}
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t("password")}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className={`${inputClass} pr-12`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t("sembunyikan") : t("tampilkan")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-5" aria-hidden="true" />
                ) : (
                  <Eye className="size-5" aria-hidden="true" />
                )}
              </button>
            </div>

            {isLogin && (
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {t("lupaPassword")}
                </Link>
              </div>
            )}

            {!isLogin && (
              <>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirm"
                    placeholder={t("konfirmasiPassword")}
                    autoComplete="new-password"
                    className={`${inputClass} pr-12`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={
                      showConfirm
                        ? t("sembunyikan")
                        : t("tampilkan")
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? (
                      <EyeOff className="size-5" aria-hidden="true" />
                    ) : (
                      <Eye className="size-5" aria-hidden="true" />
                    )}
                  </button>
                </div>

                <label
                  className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  htmlFor="agree"
                >
                  <Checkbox
                    id="agree"
                    checked={agreed}
                    onCheckedChange={(v) => setAgreed(v === true)}
                    className="mt-0.5"
                  />
                  <span>
                    {t("setuju")}{" "}
                    <Link
                      href="/terms"
                      className="font-medium text-primary hover:underline"
                    >
                      {t("ketentuan")}
                    </Link>{" "}
                    dan{" "}
                    <Link
                      href="/privacy"
                      className="font-medium text-primary hover:underline"
                    >
                      {t("kebijakanPrivasi")}
                    </Link>
                    .
                  </span>
                </label>
              </>
            )}

            <button
              type="submit"
              disabled={pending}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pending && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              {pending ? t("memproses") : isLogin ? t("masuk") : t("buatAkun")}
            </button>
          </form>

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

          <div className="space-y-3">
            <button
              type="button"
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-secondary/60"
            >
              <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t("lanjutGoogle")}
            </button>
            <button
              type="button"
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-secondary/60"
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="#1877F2"
                aria-hidden="true"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              {t("lanjutFacebook")}
            </button>
          </div>

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
