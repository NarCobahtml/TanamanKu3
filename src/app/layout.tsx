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
    icon: [
      { url: "/icons/logo only.svg", type: "image/svg+xml" },
      { url: "/icons/logo-only.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.deferredPwaPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.deferredPwaPrompt = e;
                window.dispatchEvent(new Event('pwa-prompt-ready'));
              });
              if ('serviceWorker' in navigator) {
                var registerSw = function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                };
                if (document.readyState === 'complete') {
                  registerSw();
                } else {
                  window.addEventListener('load', registerSw);
                }
              }
            `,
          }}
        />
      </head>
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
