"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { AuthTestimonialPanel } from "./components";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | undefined>(undefined);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Kirim permintaan tautan reset kata sandi ke email
  const handleRequestResetLink = async (e: React.FormEvent) => {
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
        throw new Error(data.error || "Gagal mengirim tautan reset kata sandi");
      }

      if (data.data?.devResetUrl) {
        setDevResetUrl(data.data.devResetUrl);
      }

      setIsSubmitted(true);
      toast.success("Tautan reset kata sandi telah dikirim ke email Anda.");
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

          {isSubmitted ? (
            <div className="py-6 space-y-5 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <CheckCircle2 className="size-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Periksa Email Anda
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Kami telah mengirimkan tautan reset kata sandi ke{" "}
                  <strong className="text-foreground font-medium">{email}</strong>.
                  Tautan berlaku selama 15 menit.
                </p>
              </div>

              {/* Banner Dev Shortcut (jika di local development) */}
              {devResetUrl && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-left text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">Mode Dev Link:</span>
                    <a
                      href={devResetUrl}
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      Buka Tautan Langsung
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                  <p className="font-mono text-muted-foreground break-all">{devResetUrl}</p>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2.5">
                <a
                  href={`mailto:${email}`}
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-ink text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Buka Aplikasi Email
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setDevResetUrl(undefined);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer py-1"
                >
                  Gunakan alamat email lain atau kirim ulang
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Lupa Kata Sandi?
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Masukkan alamat email akun Anda. Kami akan mengirimkan tautan ajaib (magic link) untuk mengatur ulang kata sandi.
                </p>
              </div>

              {errorMessage && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleRequestResetLink} className="space-y-4">
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
                  {pending ? "Mengirim Tautan..." : "Kirim Tautan Reset"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
