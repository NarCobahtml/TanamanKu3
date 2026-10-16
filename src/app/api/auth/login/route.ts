import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/auth';
import { checkRateLimit, recordFailedAttempt, resetRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // Cek apakah IP sedang diblokir karena brute-force
    const rateCheck = await checkRateLimit(ip);
    if (rateCheck.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Terlalu banyak percobaan masuk yang gagal. Silakan tunggu ${rateCheck.remainingSeconds} detik lagi sebelum mencoba kembali.`,
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

    let normalizedEmail = email.trim().toLowerCase();

    // Mendukung login menggunakan username maupun email
    if (!normalizedEmail.includes('@')) {
      const userByName = await prisma.user.findFirst({
        where: { name: { equals: email.trim(), mode: 'insensitive' } },
        select: { email: true },
      });
      if (userByName?.email) {
        normalizedEmail = userByName.email.toLowerCase();
      }
    }

    // 0. Gate verifikasi email: akun dari /register (passwordHash scrypt) baru bisa
    //    login setelah OTP benar. User legacy & social login lolos — keduanya sudah
    //    punya passwordHash yang bukan scrypt hash kita, jadi Supabase yang pegang
    //    otorisasi dan email-nya sudah terverifikasi di sana.
    const preAuthUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, emailVerified: true, passwordHash: true },
    });
    // passwordHash === '' artinya akun dibuat lewat Supabase (social login) atau
    // sudah dimigrasi dari legacy scrypt. Supabase sudah memverifikasi email-nya,
    // jadi jangan dikunci oleh gate OTP.
    const isSocialOrMigrated = preAuthUser?.passwordHash === '';
    if (preAuthUser && !preAuthUser.emailVerified && !isSocialOrMigrated) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_NOT_VERIFIED',
            message:
              'Email belum diverifikasi. Periksa inbox Anda untuk kode OTP, atau minta kode baru.',
            data: { userId: preAuthUser.id },
          },
        },
        { status: 403 }
      );
    }

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
      const record = await recordFailedAttempt(ip);

      const warningText =
        record.remainingAttempts > 0
          ? ` Sisa percobaan: ${record.remainingAttempts} kali.`
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
    await resetRateLimit(ip);

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

    // Blokir jika user sedang ditangguhkan (SUSPENDED) oleh admin
    if (user?.bio?.startsWith('[SUSPENDED]')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ACCOUNT_SUSPENDED',
            message: 'Akun Anda telah ditangguhkan oleh administrator. Silakan hubungi tim dukungan.',
          },
        },
        { status: 403 }
      );
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
          emailVerified: true, // social/OAuth: Supabase sudah verifikasi email
          emailVerifiedAt: new Date(),
        },
      });
    } else if (!user.emailVerified && user.passwordHash === '') {
      // Backfill akun social yang dibuat sebelum fitur OTP ada.
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
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
