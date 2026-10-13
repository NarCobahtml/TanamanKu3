import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { issueOtp, isResendBlocked, OTP_POLICY } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/mailer';

/**
 * POST /api/auth/resend-otp
 * Kirim ulang OTP untuk user yang belum verifikasi.
 * Cooldown 1 menit per token, limit 5 send per jam per user (DB, bukan in-memory,
 * supaya tetap berlaku lintas restart dan lintas instance).
 */
export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'userId wajib diisi.' } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, emailVerified: true },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Pengguna tidak ditemukan.' } },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: true,
          data: { verified: true, message: 'Email sudah terverifikasi. Silakan masuk.' },
        },
        { status: 200 }
      );
    }

    const cooldown = await isResendBlocked(user.id);
    if (cooldown.blocked) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'COOLDOWN_ACTIVE',
            message: `Tunggu ${cooldown.retryAfterSeconds} detik sebelum meminta kode baru.`,
          },
          data: { retryAfterSeconds: cooldown.retryAfterSeconds },
        },
        { status: 429 }
      );
    }

    // Limit per jam memakai VerificationToken.createdAt. Token yang kadaluarsa atau
    // sudah dipakai terhapus, jadi hitungan ini bisa under-count — itu sebabnya
    // maxAttempts + cooldown jadi lapisan kedua. // ponytail: tabel EmailSendLog
    // yang bisa diaudit adalah upgrade path kalau kuota per jam harus tegas.
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.verificationToken.count({
      where: { userId: user.id, createdAt: { gte: hourAgo } },
    });
    if (recentCount >= OTP_POLICY.maxPerHour) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Jumlah permintaan kode sudah mencapai batas. Coba lagi nanti.',
          },
        },
        { status: 429 }
      );
    }

    const { otp, expiresAt } = await issueOtp(user.id, user.email);
    const mail = await sendOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      ttlMinutes: OTP_POLICY.ttlMinutes,
      idempotencyKey: `otp-resend/${user.id}/${Date.now()}`,
    });

    const devOtp =
      process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY ? otp : undefined;
    if (devOtp) console.log(`[otp] ${user.email} kode ulang (dev): ${devOtp}`);

    return NextResponse.json({
      success: true,
      data: {
        emailSent: mail.sent,
        email: user.email,
        expiresAt: expiresAt.toISOString(),
        resendCooldownSeconds: Math.ceil(OTP_POLICY.resendCooldownMs / 1000),
        ...(devOtp ? { devOtp } : {}),
      },
    });
  } catch (error: unknown) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Gagal mengirim kode baru.' } },
      { status: 500 }
    );
  }
}