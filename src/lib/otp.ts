import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';

// 6 digit OTP: 000000-999999, dari crypto.randomInt (CSPRNG).
const OTP_LENGTH = 6;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 menit
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 menit antar resend

export const OTP_POLICY = {
  length: OTP_LENGTH,
  ttlMinutes: OTP_TTL_MS / 60000,
  maxAttempts: MAX_ATTEMPTS,
  resendCooldownMs: RESEND_COOLDOWN_MS,
  maxPerHour: 5,
};

/**
 * OTP hanya 1 juta kombinasi, jadi hash polos bisa di-brute-force offline kalau DB bocor.
 * Karena itu hash dicampur pepper. Pepper diambil dari SUPABASE_SERVICE_ROLE_KEY
 * (server-only, tidak pernah masuk bundle client) supaya tidak menambah env var baru.
 */
function tokenHash(otp: string, userId: string): string {
  return crypto
    .createHash('sha256')
    .update(`${otp}.${userId}.${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''}`)
    .digest('hex');
}

/** Constant-time compare untuk hindari timing side-channel. */
function hashEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length || bufA.length === 0) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Issue OTP baru, membatalkan token aktif sebelumnya tanpa langsung menghapus riwayat
 * 1 jam terakhir agar kuota 5x per jam dapat dihitung secara akurat di DB.
 */
export async function issueOtp(userId: string, email: string): Promise<{ otp: string; expiresAt: Date }> {
  const otp = String(crypto.randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0');
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  // Bersihkan riwayat token yang sudah lebih dari 1 jam
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  await prisma.verificationToken.deleteMany({
    where: { userId, createdAt: { lt: hourAgo } },
  });

  // Nonaktifkan token aktif sebelumnya dengan mengubah expiresAt ke masa lalu
  await prisma.verificationToken.updateMany({
    where: { userId, expiresAt: { gt: new Date() } },
    data: { expiresAt: new Date(0) },
  });

  await prisma.verificationToken.create({
    data: { userId, email, tokenHash: tokenHash(otp, userId), expiresAt },
  });

  return { otp, expiresAt };
}

export type VerifyFailure = 'NO_TOKEN' | 'EXPIRED' | 'MAX_ATTEMPTS' | 'MISMATCH';

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: VerifyFailure; attemptsLeft: number };

/**
 * Verifikasi OTP. Selalu ambil token aktif milik user lalu constant-time compare,
 * supaya attempt counter naik walau OTP salah (anti brute-force).
 * Sukses → semua token user dihapus + User.emailVerified di-set true.
 */
export async function verifyOtp(userId: string, otp: string): Promise<VerifyResult> {
  const record = await prisma.verificationToken.findFirst({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    const latest = await prisma.verificationToken.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (latest) {
      return { ok: false, reason: 'EXPIRED', attemptsLeft: 0 };
    }
    return { ok: false, reason: 'NO_TOKEN', attemptsLeft: 0 };
  }

  // Token sudah salah 5x → nonaktifkan, paksa minta kode baru.
  if (record.attempts >= MAX_ATTEMPTS) {
    await prisma.verificationToken.update({
      where: { id: record.id },
      data: { expiresAt: new Date(0) },
    });
    return { ok: false, reason: 'MAX_ATTEMPTS', attemptsLeft: 0 };
  }

  if (!hashEquals(record.tokenHash, tokenHash(otp, userId))) {
    await prisma.verificationToken.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: 'MISMATCH', attemptsLeft: MAX_ATTEMPTS - (record.attempts + 1) };
  }

  await prisma.verificationToken.deleteMany({ where: { userId } });
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true, emailVerifiedAt: new Date() },
  });

  return { ok: true };
}

/**
 * Issue Magic Reset Token (32 bytes hex, aman di URL) dengan masa aktif 15 menit.
 */
export async function issuePasswordResetToken(
  userId: string,
  email: string
): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

  // Bersihkan riwayat token yang sudah lebih dari 1 jam
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  await prisma.verificationToken.deleteMany({
    where: { userId, createdAt: { lt: hourAgo } },
  });

  // Nonaktifkan token aktif sebelumnya
  await prisma.verificationToken.updateMany({
    where: { userId, expiresAt: { gt: new Date() } },
    data: { expiresAt: new Date(0) },
  });

  await prisma.verificationToken.create({
    data: {
      userId,
      email,
      tokenHash: tokenHash(token, userId),
      expiresAt,
    },
  });

  return { token, expiresAt };
}

/**
 * Verifikasi Magic Reset Token.
 * Mengembalikan user record jika token valid dan belum expired.
 */
export async function verifyPasswordResetToken(token: string): Promise<
  | { ok: true; userId: string; email: string }
  | { ok: false; reason: VerifyFailure }
> {
  if (!token || token.length < 32) {
    return { ok: false, reason: 'NO_TOKEN' };
  }

  // Cari semua token aktif yang belum expired
  const activeTokens = await prisma.verificationToken.findMany({
    where: { expiresAt: { gt: new Date() } },
    select: { id: true, userId: true, email: true, tokenHash: true },
  });

  for (const record of activeTokens) {
    if (hashEquals(record.tokenHash, tokenHash(token, record.userId))) {
      return { ok: true, userId: record.userId, email: record.email };
    }
  }

  return { ok: false, reason: 'EXPIRED' };
}

/**
 * Hapus token reset setelah berhasil digunakan untuk ganti kata sandi.
 */
export async function consumePasswordResetToken(userId: string): Promise<void> {
  await prisma.verificationToken.deleteMany({ where: { userId } });
}

/**
 * True kalau user masih dalam cooldown resend. Dihitung dari createdAt token terakhir.
 */
export async function isResendBlocked(
  userId: string,
): Promise<{ blocked: boolean; retryAfterSeconds: number }> {
  const record = await prisma.verificationToken.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  if (!record) return { blocked: false, retryAfterSeconds: 0 };

  const elapsed = Date.now() - record.createdAt.getTime();
  if (elapsed >= RESEND_COOLDOWN_MS) return { blocked: false, retryAfterSeconds: 0 };

  return { blocked: true, retryAfterSeconds: Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000) };
}