import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyOtp } from '@/lib/otp';

// Rate limit per IP (in-memory, OWASP A07) — OTP 6 digit = 1 juta kombinasi,
// jadi tanpa limiter ini bisa di-brute-forceonline dengan request paralel.
interface Bucket {
  attempts: number;
  blockedUntil: number | null;
  lastAttempt: number;
}
/**
 * POST /api/auth/verify-otp — body: { userId, otp }
 *
 * userId sengaja dipakai, bukan opaque challenge token: id itu sudah bukan rahasia
 * di model app ini (/api/auth/login dan /api/auth/me sama-sama mengirimnya ke
 * client, dan UI menyimpannya di localStorage). Yang melindungi akun adalah OTP
 * 6 digit + TTL + maxAttempts + rate limit IP, bukan kerahasiaan userId.
 *
 * known limit: pre-registration squatting — penyerang bisa mendaftarkan email
 * korban lebih dulu sehingga korban tidak bisa mendaftar. Mitigasi penuh butuh
 * OTP juga saat login (lalu hapus user unverified yang sudah tua). // ponytail
 */
const otpRateLimitMap = new Map<string, Bucket>();
const MAX_IP_ATTEMPTS = 10;
const BLOCK_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const now = Date.now();

    const bucket = otpRateLimitMap.get(ip);
    if (bucket && bucket.blockedUntil && bucket.blockedUntil > now) {
      const retryAfter = Math.ceil((bucket.blockedUntil - now) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Terlalu banyak percobaan verifikasi. Coba lagi dalam ${retryAfter} detik.`,
          },
        },
        { status: 429 }
      );
    }

    const { userId, otp } = await request.json();

    if (!userId || !otp) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'userId dan kode OTP wajib diisi.' },
        },
        { status: 400 }
      );
    }

    const code = String(otp).trim();
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FORMAT',
            message: 'Kode OTP harus 6 digit angka.',
          },
        },
        { status: 400 }
      );
    }

    const result = await verifyOtp(userId, code);

    if (result.ok) {
      otpRateLimitMap.delete(ip);
      return NextResponse.json(
        { success: true, data: { verified: true } },
        { status: 200 }
      );
    }

    // Catat percobaan gagal di level IP
    const prev = otpRateLimitMap.get(ip);
    const attempts = prev && now - prev.lastAttempt < BLOCK_MS ? prev.attempts + 1 : 1;
    const blockedUntil = attempts >= MAX_IP_ATTEMPTS ? now + BLOCK_MS : null;
    otpRateLimitMap.set(ip, { attempts, blockedUntil, lastAttempt: now });

    const messages: Record<string, string> = {
      NO_TOKEN: 'Kode tidak ditemukan atau sudah dipakai. Silakan minta kode baru.',
      EXPIRED: 'Kode OTP sudah kedaluwarsa. Silakan minta kode baru.',
      MAX_ATTEMPTS: 'Terlalu banyak percobaan salah. Silakan minta kode baru.',
      MISMATCH: `Kode OTP salah. Sisa percobaan: ${result.attemptsLeft} kali.`,
    };

    return NextResponse.json(
      {
        success: false,
        error: {
          code: result.reason,
          message: messages[result.reason] ?? 'Verifikasi gagal.',
          attemptsLeft: result.attemptsLeft,
        },
      },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Verifikasi gagal. Silakan coba lagi.' },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/verify-otp?userId=... — cek apakah user sudah terverifikasi,
 * dipakai halaman OTP untuk auto-redirect kalau user membuka tab lain yang
 * sudah menyelesaikan verifikasi.
 */
export async function GET(request: Request) {
  try {
    const userId = new URL(request.url).searchParams.get('userId');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'userId wajib diisi.' } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true, email: true },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Pengguna tidak ditemukan.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { verified: user.emailVerified, email: user.email },
    });
  } catch (error: unknown) {
    console.error('Verify OTP status error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Gagal memeriksa status.' } },
      { status: 500 }
    );
  }
}