import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { issuePasswordResetToken, isResendBlocked } from '@/lib/otp';
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
          error: `Tunggu ${resendCheck.retryAfterSeconds} detik sebelum meminta tautan baru.`,
          cooldownSeconds: resendCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // Terbitkan Magic Reset Token
    const { token, expiresAt } = await issuePasswordResetToken(user.id, user.email);

    // Ambil base URL host
    const origin =
      request.headers.get('origin') ||
      request.headers.get('x-forwarded-host') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';
    const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`;
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    // Kirim email via Resend
    const mailRes = await sendPasswordResetEmail({
      to: user.email,
      name: user.name || 'Pengguna',
      resetUrl,
      ttlMinutes: 15,
    });

    const isDev = process.env.NODE_ENV !== 'production' || !process.env.RESEND_API_KEY;

    return NextResponse.json({
      success: true,
      message: 'Tautan untuk mengatur ulang kata sandi telah dikirim ke email Anda.',
      data: {
        email: user.email,
        expiresAt,
        devResetUrl: isDev ? resetUrl : undefined,
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
