import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

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

    const { user, token } = await registerUser({ email, password, name });

    const response = NextResponse.json(
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
          token,
        },
      },
      { status: 201 }
    );

    // Set HTTP-only cookie for session
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'EMAIL_ALREADY_EXISTS') {
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
