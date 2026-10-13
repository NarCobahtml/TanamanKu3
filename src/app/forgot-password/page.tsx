import type { Metadata } from "next";
import ForgotPasswordForm from "@/features/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi - TanamanKu",
  description: "Atur ulang kata sandi akun TanamanKu Anda dengan aman.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
