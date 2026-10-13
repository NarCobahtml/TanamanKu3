"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  KeyRound,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { AuthTestimonialPanel } from "./components";

type Step = "request" | "verify";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined);
  const [isSuccess, setIsSuccess] = useState(false);

  // 1. Kirim permintaan kode reset OTP ke email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setPending(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengirim kode reset kata sandi");
      }

      if (data.data?.devOtp) {
        setDevOtp(data.data.devOtp);
      }

      toast.success(data.message || "Kode reset telah dikirim ke email Anda.");
      setStep("verify");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setErrorMessage(msg);
    } finally {
      setPending(false);
    }
  };

  // 2. Submit verifikasi OTP dan simpan password baru
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !newPassword.trim()) return;

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Kata sandi baru minimal harus 6 karakter");
      return;
    }

    setPending(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
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
      setErrorMessage(msg);
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

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {isSuccess
                ? "Kata Sandi Diperbarui"
                : step === "request"
                  ? "Lupa Kata Sandi?"
                  : "Atur Ulang Kata Sandi"}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {isSuccess
                ? "Kata sandi Anda telah berhasil diubah. Mengalihkan ke halaman masuk..."
                : step === "request"
                  ? "Masukkan alamat email Anda untuk menerima 6 digit kode verifikasi reset kata sandi."
                  : `Masukkan 6 digit kode yang dikirim ke ${email} dan kata sandi baru Anda.`}
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-6 text-center space-y-3">
              <CheckCircle2 className="size-10 text-primary mx-auto" />
              <p className="text-sm font-medium text-primary">
                Berhasil mengatur ulang kata sandi!
              </p>
              <ButtonLink href="/login">Masuk Sekarang</ButtonLink>
            </div>
          ) : step === "request" ? (
            /* Form Request Email */
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3.5 text-sm transition-colors focus:border-primary focus:outline-none"
                    disabled={pending}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pending || !email}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {pending && <Loader2 className="size-4 animate-spin" />}
                {pending ? "Mengirim Kode..." : "Kirim Kode Verifikasi"}
              </button>
            </form>
          ) : (
            /* Form Masukkan OTP & Password Baru */
            <form onSubmit={handleResetPassword} className="space-y-4">
              {devOtp && (
                <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
                  <span className="flex items-center gap-1.5 font-mono">
                    <KeyRound className="size-3.5" />
                    Kode Dev: <strong>{devOtp}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtp(devOtp)}
                    className="font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Pakai Kode
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium">
                  Kode 6 Digit OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="h-11 w-full text-center font-mono text-lg tracking-widest rounded-lg border border-border bg-background transition-colors focus:border-primary focus:outline-none"
                  disabled={pending}
                />
              </div>

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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                disabled={pending || otp.length !== 6 || !newPassword}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {pending && <Loader2 className="size-4 animate-spin" />}
                {pending ? "Memperbarui Kata Sandi..." : "Simpan Kata Sandi Baru"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("request");
                    setErrorMessage(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Ubah email tujuan
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ButtonLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
    >
      {children}
    </Link>
  );
}
