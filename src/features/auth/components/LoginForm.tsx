'use client';

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

const inputClass =
  "h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent";

export interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
  pending: boolean;
}

export function LoginForm({ onSubmit, pending }: LoginFormProps) {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const rawData = new FormData(e.currentTarget);
    const email = (formData.email || (rawData.get("email") as string) || "").trim();
    const password = formData.password || (rawData.get("password") as string) || "";
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder={t("email")}
        autoComplete="email"
        className={inputClass}
        required
      />

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={t("password")}
          autoComplete="current-password"
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

      <div className="text-right">
        <Link
          href="/forgot-password"
          className="text-xs font-medium text-primary hover:underline"
        >
          {t("lupaPassword")}
        </Link>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending && (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        )}
        {pending ? t("memproses") : t("masuk")}
      </button>
    </form>
  );
}
