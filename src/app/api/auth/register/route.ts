import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { prisma } from '@/lib/prisma';
import { issueOtp, OTP_POLICY } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/mailer';
import { hashPassword } from '@/lib/auth';
import { getSystemSettings } from '@/lib/admin-settings';

export async function POST(request: Request) {
  try {
    const settings = getSystemSettings();
    if (!settings.allowRegistration) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'REGISTRATION_CLOSED',
            message: 'Pendaftaran pengguna baru sedang ditutup sementara oleh administrator.',
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email, password, dan nama lengkap wajib diisi.',
          },
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Password minimal 6 karakter.',
          },
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Cek duplikasi akun Prisma
    const existingPrisma = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingPrisma) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Email sudah terdaftar. Silakan masuk atau gunakan email lain.',
          },
        },
        { status: 409 }
      );
    }

    // 1. Buat user Supabase
    const admin = createAdminClient();
    const { data: createData, error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { name: name.trim() },
    });

    if (createError) {
      if (createError.message.includes('already registered') || createError.status === 422) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'EMAIL_ALREADY_EXISTS',
              message: 'Email sudah terdaftar. Silakan masuk atau gunakan email lain.',
            },
          },
          { status: 409 }
        );
      }
      throw createError;
    }

    const authUser = createData.user;

    // 2. Buat profil Prisma
    const user = await prisma.user.create({
      data: {
        id: authUser.id,
        email: normalizedEmail,
        name: name.trim(),
        passwordHash: await hashPassword(password),
        role: 'USER',
        emailVerified: false,
      },
    });

    // 3. Terbitkan OTP verifikasi
    const { otp, expiresAt } = await issueOtp(user.id, user.email);
    const mail = await sendOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      ttlMinutes: OTP_POLICY.ttlMinutes,
      idempotencyKey: `otp-register/${user.id}/${Date.now()}`,
    });

    // Output dev mode lokal
    const devOtp =
      process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY ? otp : undefined;
    if (devOtp) {
      console.log(`[otp] ${user.email} kode verifikasi (dev): ${devOtp}`);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          requiresVerification: true,
          userId: user.id,
          email: user.email,
          emailSent: mail.sent,
          expiresAt: expiresAt.toISOString(),
          resendCooldownSeconds: Math.ceil(OTP_POLICY.resendCooldownMs / 1000),
          ...(devOtp ? { devOtp } : {}),
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Terjadi kesalahan saat pendaftaran. Silakan coba lagi.',
        },
      },
      { status: 500 }
    );
  }
}