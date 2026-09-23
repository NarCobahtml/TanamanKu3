import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const projectRoot =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
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
