import { Suspense } from "react";
import type { Metadata } from "next";
import ResetPasswordForm from "@/features/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Atur Ulang Kata Sandi - TanamanKu",
  description: "Buat kata sandi baru untuk akun TanamanKu Anda.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
