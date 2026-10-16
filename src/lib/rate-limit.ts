/**
 * Production-ready Rate Limiter
 * 
 * Mendukung 2 mode:
 * 1. Distributed Redis (Upstash REST API via fetch, zero dependencies) saat UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN ada.
 * 2. In-Memory Store dengan sliding window, auto-pruning (garbage collection tiap 60 detik), dan memory cap 10.000 entri untuk mencegah DoS / kebocoran memori.
 */

interface RateLimitEntry {
  attempts: number;
  blockedUntil: number | null;
  lastAttempt: number;
}

// In-memory sliding window cache
const memoryStore = new Map<string, RateLimitEntry>();
const MAX_MEMORY_ENTRIES = 10_000;

// Periodic cleanup untuk menghapus data usang dan mencegah memory leak
let lastCleanup = Date.now();
function cleanupExpired(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return; // Hanya jalankan maks 1x per menit
  lastCleanup = now;

  for (const [key, entry] of memoryStore.entries()) {
    const isExpired = now - entry.lastAttempt > windowMs;
    const isUnblocked = !entry.blockedUntil || entry.blockedUntil <= now;
    if (isExpired && isUnblocked) {
      memoryStore.delete(key);
    }
  }

  // Jika memori melebihi batas ekstrem, bersihkan entri tertua
  if (memoryStore.size > MAX_MEMORY_ENTRIES) {
    const entriesToDelete = memoryStore.size - MAX_MEMORY_ENTRIES;
    const iterator = memoryStore.keys();
    for (let i = 0; i < entriesToDelete; i++) {
      const nextKey = iterator.next().value;
      if (nextKey) memoryStore.delete(nextKey);
    }
  }
}

export interface RateLimitOptions {
  maxAttempts?: number;
  blockDurationMs?: number;
  windowMs?: number;
}

const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_BLOCK_DURATION_MS = 5 * 60 * 1000; // 5 menit
const DEFAULT_WINDOW_MS = 10 * 60 * 1000; // 10 menit

/**
 * Ekstraksi IP Client yang aman dari header reverse proxy
 */
export function getClientIp(request: Request): string {
  // Cloudflare
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp && cfIp.trim()) return cfIp.trim();

  // Nginx / Traefik / GCP load balancer
  const realIp = request.headers.get('x-real-ip');
  if (realIp && realIp.trim()) return realIp.trim();

  // Standar X-Forwarded-For: ambil IP pertama yang valid
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[0];
  }

  return '127.0.0.1';
}

/**
 * Periksa apakah IP / key saat ini sedang terblokir
 */
export async function checkRateLimit(
  key: string,
  options: RateLimitOptions = {}
): Promise<{ isBlocked: boolean; remainingSeconds: number }> {
  const blockDurationMs = options.blockDurationMs ?? DEFAULT_BLOCK_DURATION_MS;
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const now = Date.now();

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const res = await fetch(`${upstashUrl}/get/block:${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        const blockedUntil = json.result ? parseInt(json.result, 10) : null;
        if (blockedUntil && blockedUntil > now) {
          return {
            isBlocked: true,
            remainingSeconds: Math.ceil((blockedUntil - now) / 1000),
          };
        }
      }
    } catch (err) {
      console.warn('Upstash rate limit check fallback to memory:', err);
    }
  }

  // Fallback In-Memory
  cleanupExpired(windowMs);
  const record = memoryStore.get(key);
  if (record && record.blockedUntil && record.blockedUntil > now) {
    return {
      isBlocked: true,
      remainingSeconds: Math.ceil((record.blockedUntil - now) / 1000),
    };
  }

  return { isBlocked: false, remainingSeconds: 0 };
}

/**
 * Catat percobaan gagal dan kembalikan status batas percobaan
 */
export async function recordFailedAttempt(
  key: string,
  options: RateLimitOptions = {}
): Promise<{ attempts: number; remainingAttempts: number; isBlocked: boolean; remainingSeconds: number }> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const blockDurationMs = options.blockDurationMs ?? DEFAULT_BLOCK_DURATION_MS;
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const now = Date.now();

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const attemptsKey = `attempts:${encodeURIComponent(key)}`;
      const blockKey = `block:${encodeURIComponent(key)}`;

      const incrRes = await fetch(`${upstashUrl}/incr/${attemptsKey}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
        cache: 'no-store',
      });
      const incrJson = await incrRes.json();
      const attempts = incrJson.result ?? 1;

      // Set expiry on first attempt
      if (attempts === 1) {
        await fetch(`${upstashUrl}/expire/${attemptsKey}/${Math.ceil(windowMs / 1000)}`, {
          headers: { Authorization: `Bearer ${upstashToken}` },
          cache: 'no-store',
        });
      }

      if (attempts >= maxAttempts) {
        const blockedUntil = now + blockDurationMs;
        await fetch(`${upstashUrl}/set/${blockKey}/${blockedUntil}/ex/${Math.ceil(blockDurationMs / 1000)}`, {
          headers: { Authorization: `Bearer ${upstashToken}` },
          cache: 'no-store',
        });
        return {
          attempts,
          remainingAttempts: 0,
          isBlocked: true,
          remainingSeconds: Math.ceil(blockDurationMs / 1000),
        };
      }

      return {
        attempts,
        remainingAttempts: Math.max(0, maxAttempts - attempts),
        isBlocked: false,
        remainingSeconds: 0,
      };
    } catch (err) {
      console.warn('Upstash rate limit record fallback to memory:', err);
    }
  }

  // In-Memory Fallback
  cleanupExpired(windowMs);
  const existing = memoryStore.get(key);
  const attempts = (existing && now - existing.lastAttempt < windowMs ? existing.attempts : 0) + 1;
  const isBlocked = attempts >= maxAttempts;
  const blockedUntil = isBlocked ? now + blockDurationMs : null;

  memoryStore.set(key, { attempts, blockedUntil, lastAttempt: now });

  return {
    attempts,
    remainingAttempts: Math.max(0, maxAttempts - attempts),
    isBlocked,
    remainingSeconds: isBlocked ? Math.ceil(blockDurationMs / 1000) : 0,
  };
}

/**
 * Bersihkan riwayat percobaan gagal setelah login berhasil
 */
export async function resetRateLimit(key: string): Promise<void> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      await fetch(`${upstashUrl}/del/attempts:${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
        cache: 'no-store',
      });
      await fetch(`${upstashUrl}/del/block:${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
        cache: 'no-store',
      });
    } catch {
      // ignore
    }
  }

  memoryStore.delete(key);
}
