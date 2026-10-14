"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { AuthTestimonialPanel } from "./components";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";

  const [verifying, setVerifying] = useState(Boolean(token));
  const [tokenError, setTokenError] = useState<string | null>(
    token ? null : "Tautan reset kata sandi tidak valid atau tidak memiliki token."
  );
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Verifikasi token sesi dari URL saat halaman dimuat
  useEffect(() => {
    if (!token) {
      return;
    }

    let isCancelled = false;

    const checkToken = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (isCancelled) return;

        if (!res.ok || !data.success) {
          setTokenError(data.error || "Tautan reset kata sandi tidak valid atau sudah kedaluwarsa.");
        } else {
          setUserEmail(data.email);
        }
      } catch {
        if (!isCancelled) {
          setTokenError("Gagal menghubungi server untuk memvalidasi tautan.");
        }
      } finally {
        if (!isCancelled) {
          setVerifying(false);
        }
      }
    };

    void checkToken();

    return () => {
      isCancelled = true;
    };
  }, [token]);

  // Simpan kata sandi baru
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;

    if (newPassword !== confirmPassword) {
      setFormError("Konfirmasi kata sandi tidak cocok");
      return;
    }

    if (newPassword.length < 6) {
      setFormError("Kata sandi baru minimal harus 6 karakter");
      return;
    }

    setPending(true);
    setFormError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengatur ulang kata sandi");
      }

      setIsSuccess(true);
      toast.success("Kata sandi berhasil diatur ulang! Silakan masuk kembali.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setFormError(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Left Panel */}
      <AuthTestimonialPanel />

      {/* Right Form Panel */}
      <div className="flex items-center justify-center bg-card px-6 py-12 sm:px-10 xl:px-20">
        <div className="w-full max-w-md space-y-6">
          <div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
            >
              <ArrowLeft
                className="size-4 transition-transform group-hover:-translate-x-1"
                aria-hidden="true"
              />
              <span>Kembali ke Masuk</span>
            </Link>
          </div>

          {verifying ? (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="mx-auto size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Memvalidasi tautan reset Anda...</p>
            </div>
          ) : tokenError ? (
            <div className="py-8 text-center space-y-5">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="size-8" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Tautan Tidak Valid
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tokenError}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/forgot-password"
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-ink text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Minta Tautan Baru
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <CheckCircle2 className="size-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Kata Sandi Berhasil Diubah!
                </h2>
                <p className="text-sm text-muted-foreground">
                  Akun Anda sudah diperbarui. Mengalihkan ke halaman masuk...
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-ink text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Masuk Sekarang
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Buat Kata Sandi Baru
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  {userEmail ? (
                    <>
                      Atur kata sandi baru untuk akun{" "}
                      <strong className="text-foreground font-medium">{userEmail}</strong>.
                    </>
                  ) : (
                    "Masukkan kata sandi baru Anda minimal 6 karakter."
                  )}
                </p>
              </div>

              {formError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="h-11 w-full rounded-lg border border-border bg-background px-3.5 pr-10 text-sm transition-colors focus:border-primary focus:outline-none"
                      disabled={pending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Ulangi Kata Sandi Baru
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm transition-colors focus:border-primary focus:outline-none"
                    disabled={pending}
                  />
                </div>

                <button
                  type="submit"
                  disabled={pending || !newPassword || !confirmPassword}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {pending && <Loader2 className="size-4 animate-spin" />}
                  {pending ? "Menyimpan..." : "Simpan Kata Sandi"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
