import type { Metadata, Viewport } from "next";
import { LocaleProvider } from "@/components/layout/LocaleProvider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import PwaPrompt from "@/components/shared/PwaPrompt";
import "./globals.css";
import "./fonts.css";

export const metadata: Metadata = {
  title: "TanamanKu, Platform Kesehatan Tanaman",
  description:
    "Deteksi penyakit tanaman dengan AI, pantau kondisi tanaman, dan kelola jadwal penyiraman dalam satu platform.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TanamanKu",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#123526",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LocaleProvider>{children}</LocaleProvider>
          <Toaster position="bottom-left" />
          <PwaPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
