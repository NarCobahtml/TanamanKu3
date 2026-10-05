import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/auth';

interface RateLimitRecord {
  attempts: number;
  blockedUntil: number | null;
  lastAttempt: number;
}

// In-memory rate limiting map per client IP (OWASP A07: Authentication Failures)
const loginRateLimitMap = new Map<string, RateLimitRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 5 * 60 * 1000; // 5 menit blokir jika 5x gagal
const WINDOW_DURATION_MS = 10 * 60 * 1000; // 10 menit batas window percobaan

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const now = Date.now();
    const rateLimit = loginRateLimitMap.get(ip);

    // Cek apakah IP sedang diblokir karena brute-force
    if (rateLimit && rateLimit.blockedUntil && rateLimit.blockedUntil > now) {
      const remainingSeconds = Math.ceil((rateLimit.blockedUntil - now) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Terlalu banyak percobaan masuk yang gagal. Silakan tunggu ${remainingSeconds} detik lagi sebelum mencoba kembali.`,
          },
        },
        { status: 429 }
      );
    }

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

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = await createClient();

    // 1. Authenticate with official Supabase Auth (sets HTTP-only cookie automatically)
    let { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    // 2. Seamless Migration Fallback:
    // If Supabase returns invalid credentials, check if user exists in Prisma with legacy scrypt hash
    if (error && (error.message.includes('Invalid login credentials') || error.status === 400)) {
      const legacyUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (legacyUser?.passwordHash && legacyUser.passwordHash.includes(':')) {
        const isMatch = await comparePassword(password, legacyUser.passwordHash);
        if (isMatch) {
          // Upgrade user to Supabase Auth seamlessly!
          const admin = createAdminClient();
          const { data: existingAuth } = await admin.auth.admin.getUserById(legacyUser.id);
          if (existingAuth?.user) {
            await admin.auth.admin.updateUserById(legacyUser.id, {
              password,
              email_confirm: true,
            });
          } else {
            await admin.auth.admin.createUser({
              id: legacyUser.id,
              email: normalizedEmail,
              password,
              email_confirm: true,
              user_metadata: { name: legacyUser.name },
            });
          }

          // Retry sign in to establish official Supabase session cookies
          const reSignIn = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });
          data = reSignIn.data;
          error = reSignIn.error;
        }
      }
    }

    if (error || !data.user) {
      const existing = loginRateLimitMap.get(ip);
      const attempts =
        (existing && now - existing.lastAttempt < WINDOW_DURATION_MS
          ? existing.attempts
          : 0) + 1;
      const blockedUntil = attempts >= MAX_FAILED_ATTEMPTS ? now + BLOCK_DURATION_MS : null;
      loginRateLimitMap.set(ip, { attempts, blockedUntil, lastAttempt: now });

      const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - attempts);
      const warningText =
        remainingAttempts > 0
          ? ` Sisa percobaan: ${remainingAttempts} kali.`
          : ' Akun/IP terkunci sementara selama 5 menit karena terlalu banyak percobaan gagal.';

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: `Email atau password yang Anda masukkan salah.${warningText}`,
          },
        },
        { status: 401 }
      );
    }

    // Berhasil login: bersihkan riwayat gagal untuk IP ini
    loginRateLimitMap.delete(ip);

    const authUser = data.user;

    // 3. Ensure profile in Prisma public.User is present and in sync
    let user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    }

    const metaName =
      authUser.user_metadata?.name ||
      authUser.user_metadata?.full_name ||
      normalizedEmail.split('@')[0];

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: authUser.id,
          email: normalizedEmail,
          name: metaName,
          passwordHash: '',
          role: 'USER',
        },
      });
    }

    return NextResponse.json(
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
          session: {
            access_token: data.session?.access_token,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
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
