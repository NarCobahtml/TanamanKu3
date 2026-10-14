import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyPasswordResetToken,
  consumePasswordResetToken,
  verifyOtp,
} from '@/lib/otp';
import { hashPassword } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET: Cek validitas token sebelum menampilkan form reset password
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token')?.trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token reset tidak ditemukan' },
        { status: 400 }
      );
    }

    const verification = await verifyPasswordResetToken(token);
    if (!verification.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            verification.reason === 'EXPIRED'
              ? 'Tautan reset kata sandi telah kedaluwarsa. Silakan minta tautan baru.'
              : 'Tautan reset kata sandi tidak valid atau sudah digunakan.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      email: verification.email,
    });
  } catch (error) {
    console.error('Verify reset token error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memverifikasi tautan reset' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const token = body?.token?.trim();
    const email = body?.email?.trim().toLowerCase();
    const otp = body?.otp?.trim();
    const newPassword = body?.newPassword?.trim();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password baru minimal harus 6 karakter' },
        { status: 400 }
      );
    }

    let targetUserId: string | null = null;

    // Alur 1: Menggunakan Magic Reset Token (Prioritas Utama)
    if (token) {
      const tokenVerification = await verifyPasswordResetToken(token);
      if (!tokenVerification.ok) {
        return NextResponse.json(
          {
            success: false,
            error:
              tokenVerification.reason === 'EXPIRED'
                ? 'Tautan reset kata sandi telah kedaluwarsa. Silakan minta tautan baru.'
                : 'Tautan reset kata sandi tidak valid atau sudah digunakan.',
          },
          { status: 400 }
        );
      }
      targetUserId = tokenVerification.userId;
    } else if (email && otp) {
      // Alur 2: Fallback OTP jika masih ada request berbasis OTP
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Pengguna tidak ditemukan' },
          { status: 404 }
        );
      }

      const otpVerification = await verifyOtp(user.id, otp);
      if (!otpVerification.ok) {
        return NextResponse.json(
          { success: false, error: 'Kode verifikasi tidak valid atau kedaluwarsa' },
          { status: 400 }
        );
      }
      targetUserId = user.id;
    } else {
      return NextResponse.json(
        { success: false, error: 'Tautan reset kata sandi atau kode verifikasi wajib disertakan' },
        { status: 400 }
      );
    }

    const userId = targetUserId;

    // 1. Update password di Supabase Auth
    try {
      const supabaseAdmin = createAdminClient();
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
      });
    } catch (sbError) {
      console.warn('Failed to update Supabase Auth password directly:', sbError);
    }

    // 2. Update password hash di database Prisma
    const newPasswordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        emailVerified: true,
      },
    });

    // 3. Bersihkan token reset yang telah dipakai
    await consumePasswordResetToken(userId);

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
