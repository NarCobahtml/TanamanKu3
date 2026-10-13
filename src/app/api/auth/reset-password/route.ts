import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyOtp } from '@/lib/otp';
import { hashPassword } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = body?.email?.trim().toLowerCase();
    const otp = body?.otp?.trim();
    const newPassword = body?.newPassword?.trim();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, kode OTP, dan password baru wajib diisi' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password baru minimal harus 6 karakter' },
        { status: 400 }
      );
    }

    // Cari user di database
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verifikasi OTP
    const verification = await verifyOtp(user.id, otp);
    if (!verification.ok) {
      const errorMap: Record<string, string> = {
        NO_TOKEN: 'Kode verifikasi tidak ditemukan atau sudah dipakai.',
        EXPIRED: 'Kode verifikasi telah kedaluwarsa. Silakan minta kode baru.',
        MAX_ATTEMPTS: 'Batas percobaan habis. Silakan minta kode baru.',
        MISMATCH: 'Kode verifikasi salah.',
      };

      return NextResponse.json(
        {
          success: false,
          error: errorMap[verification.reason] || 'Verifikasi kode gagal.',
          attemptsLeft: verification.attemptsLeft,
        },
        { status: 400 }
      );
    }

    // 1. Update password di Supabase Auth
    try {
      const supabaseAdmin = createAdminClient();
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: newPassword,
      });
    } catch (sbError) {
      console.warn('Failed to update Supabase Auth password directly:', sbError);
    }

    // 2. Update password hash di database Prisma
    const newPasswordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        emailVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Kata sandi berhasil diatur ulang! Silakan masuk dengan kata sandi baru Anda.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengatur ulang kata sandi.' },
      { status: 500 }
    );
  }
}
