import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { issueOtp, isResendBlocked } from '@/lib/otp';
import { sendPasswordResetEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = body?.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Cari user di database
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    // Jika user tidak ditemukan, jangan ekspos keberadaan email (Timing & enumeration protection)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Jika email terdaftar, instruksi reset kata sandi telah dikirimkan.',
        data: { email },
      });
    }

    // Cek cooldown resend
    const resendCheck = await isResendBlocked(user.id);
    if (resendCheck.blocked) {
      return NextResponse.json(
        {
          success: false,
          error: `Tunggu ${resendCheck.retryAfterSeconds} detik sebelum meminta kode baru.`,
          cooldownSeconds: resendCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // Terbitkan OTP reset password
    const { otp, expiresAt } = await issueOtp(user.id, user.email);

    // Kirim email via Resend
    const mailRes = await sendPasswordResetEmail({
      to: user.email,
      name: user.name || 'Pengguna',
      otp,
      ttlMinutes: 10,
    });

    const isDev = process.env.NODE_ENV !== 'production' || !process.env.RESEND_API_KEY;

    return NextResponse.json({
      success: true,
      message: 'Kode reset kata sandi telah dikirimkan ke email Anda.',
      data: {
        email: user.email,
        userId: user.id,
        expiresAt,
        devOtp: isDev ? otp : undefined,
        mailDelivered: mailRes.sent,
      },
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses permintaan reset kata sandi.' },
      { status: 500 }
    );
  }
}
