import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force workspace root to THIS project — parent folder holds another
  // project's package-lock.json which misleads Turbopack module resolution.
  turbopack: {
    root: __dirname,
  },
  // Cloudflare quick-tunnel origin changes every restart — allow any
  // trycloudflare subdomain so dev chunks (/_next/*) don't 403 cross-origin.
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
