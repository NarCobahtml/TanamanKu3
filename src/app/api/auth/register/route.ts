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

    // Check if user already exists in Prisma
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

    // 1. Create user in Supabase Auth. email_confirm: true di Supabase karena kita
    //    yang memegang otorisasi login — verifikasi email ditegakkan lewat gate
    //    emailVerified di /api/auth/login (lihat file tersebut).
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

    // 2. Create public.User profile row in Prisma.
    //    passwordHash diisi dengan scrypt hash asli (bukan '') karena login gate
    //    memakai passwordHash === '' sebagai penanda "akun ini milik Supabase
    //    (social/OAuth), email-nya sudah terverifikasi di sana" — akun yang daftar
    //    lewat form wajib lewat OTP, jadi harus punya hash.
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

    // 3. Issue OTP + kirim email. Sengaja TIDAK ada signInWithPassword di sini:
    //    session cookie baru dibuat setelah OTP terverifikasi, saat user login.
    const { otp, expiresAt } = await issueOtp(user.id, user.email);
    const mail = await sendOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      ttlMinutes: OTP_POLICY.ttlMinutes,
      idempotencyKey: `otp-register/${user.id}/${Date.now()}`,
    });

    // ponytail: OTP dikembalikan ke client hanya di development tanpa RESEND_API_KEY,
    // supaya flow bisa dites tanpa setup email. Hilangkan blok ini saat prod punya key.
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