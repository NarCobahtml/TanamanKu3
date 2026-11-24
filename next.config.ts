import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const projectRoot =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Matikan header X-Powered-By
  poweredByHeader: false,

  // Konfigurasi Security Headers
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

  // Root workspace Turbopack
  turbopack: {
    root: projectRoot,
  },
  // Origin tunnel Cloudflare dev
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
