import type { Metadata } from "next";
import { LocaleProvider } from "@/components/LocaleProvider";
import "./globals.css";
import "./fonts.css";

export const metadata: Metadata = {
  title: "TanamanKu, Platform Kesehatan Tanaman",
  description:
    "Deteksi penyakit tanaman dengan AI, pantau kondisi tanaman, dan kelola jadwal penyiraman dalam satu platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
