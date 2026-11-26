import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes legacy `/figma-assets/*.jpg|jpeg|png` paths to `.webp` so stale
 * database or localStorage entries resolve to existing WebP assets.
 */
export function normalizePlantAssetUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (/^\/figma-assets\/.*\.(?:jpg|jpeg|png)$/i.test(trimmed)) {
    return trimmed.replace(/\.(?:jpg|jpeg|png)$/i, '.webp');
  }
  return trimmed;
}
