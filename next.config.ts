import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const projectRoot =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Matikan header X-Powered-By agar tidak mengekspos teknologi server (OWASP A02)
  poweredByHeader: false,

  // Konfigurasi Security Headers (OWASP A02: Security Misconfiguration)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=(self)',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none';",
          },
        ],
      },
    ];
  },

  // Force workspace root to THIS project — parent folder holds another
  // project's package-lock.json which misleads Turbopack module resolution.
  turbopack: {
    root: projectRoot,
  },
  // Cloudflare quick-tunnel origin changes every restart — allow any
  // trycloudflare subdomain so dev chunks (/_next/*) don't 403 cross-origin.
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
