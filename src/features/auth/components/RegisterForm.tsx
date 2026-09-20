'use client';

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";

const inputClass =
  "h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent";

export interface RegisterFormProps {
  onSubmit: (data: {
    name: string;
    email: string;
    password: string;
    confirm: string;
    agreed: boolean;
  }) => void;
  pending: boolean;
}

export function RegisterForm({ onSubmit, pending }: RegisterFormProps) {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
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
    const name = (formData.name || (rawData.get("name") as string) || "").trim();
    const confirm = formData.confirm || (rawData.get("confirm") as string) || "";

    const checkboxEl = document.getElementById("agree");
    const isAgreeChecked =
      agreed ||
      checkboxEl?.getAttribute("data-state") === "checked" ||
      checkboxEl?.getAttribute("aria-checked") === "true";

    onSubmit({ name, email, password, confirm, agreed: isAgreeChecked });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder={t("namaLengkap")}
        autoComplete="name"
        className={inputClass}
        required
      />

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
          autoComplete="new-password"
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

      <div className="relative">
        <input
          type={showConfirm ? "text" : "password"}
          name="confirm"
          value={formData.confirm}
          onChange={handleChange}
          placeholder={t("konfirmasiPassword")}
          autoComplete="new-password"
          className={`${inputClass} pr-12`}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirm((v) => !v)}
          aria-label={showConfirm ? t("sembunyikan") : t("tampilkan")}
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

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending && (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        )}
        {pending ? t("memproses") : t("buatAkun")}
      </button>
    </form>
  );
}
