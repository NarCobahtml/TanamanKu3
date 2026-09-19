import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email dan password wajib diisi.',
          },
        },
        { status: 400 }
      );
    }

    const { user, token } = await loginUser({ email, password });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            photoUrl: user.photoUrl,
            bio: user.bio,
          },
          token,
        },
      },
      { status: 200 }
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
    if (message === 'INVALID_CREDENTIALS') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Email atau password yang Anda masukkan salah.',
          },
        },
        { status: 401 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Terjadi kesalahan saat masuk. Silakan coba lagi.',
        },
      },
      { status: 500 }
    );
  }
}
