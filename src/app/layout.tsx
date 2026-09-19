import type { Metadata, Viewport } from "next";
import { LocaleProvider } from "@/components/LocaleProvider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import "./fonts.css";

export const metadata: Metadata = {
  title: "TanamanKu, Platform Kesehatan Tanaman",
  description:
    "Deteksi penyakit tanaman dengan AI, pantau kondisi tanaman, dan kelola jadwal penyiraman dalam satu platform.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LocaleProvider>{children}</LocaleProvider>
          <Toaster position="bottom-left" />
        </ThemeProvider>
      </body>
    </html>
  );
}
