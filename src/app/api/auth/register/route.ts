import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
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

    // 1. Create user in Supabase Auth with bcrypt hash and confirmed email
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

    // 2. Create public.User profile row in Prisma
    const user = await prisma.user.create({
      data: {
        id: authUser.id,
        email: normalizedEmail,
        name: name.trim(),
        passwordHash: '',
        role: 'USER',
      },
    });

    // 3. Establish official Supabase session cookies via signInWithPassword
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
          },
          session: {
            access_token: sessionData?.session?.access_token,
          },
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
