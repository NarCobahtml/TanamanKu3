import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { signJwt } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://chxnfvwdldhpickamcpm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { access_token } = body;

    if (!access_token || typeof access_token !== 'string') {
      return NextResponse.json(
        { success: false, error: { message: 'Token OAuth wajib diisi.' } },
        { status: 400 }
      );
    }

    // Verifikasi token OAuth langsung ke Supabase Auth server-side
    const { data, error: authError } = await supabase.auth.getUser(access_token);

    if (authError || !data?.user) {
      console.error('Supabase OAuth token verification failed:', authError);
      return NextResponse.json(
        { success: false, error: { message: 'Token OAuth tidak valid atau sudah kedaluwarsa.' } },
        { status: 401 }
      );
    }

    const authUser = data.user;
    const { id, email, user_metadata } = authUser;

    if (!email) {
      return NextResponse.json(
        { success: false, error: { message: 'Email tidak ditemukan dari akun OAuth.' } },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const rawName =
      user_metadata?.full_name ||
      user_metadata?.name ||
      user_metadata?.custom_claims?.global_name ||
      '';
    const displayName = rawName || normalizedEmail.split('@')[0];
    const photoUrl =
      user_metadata?.avatar_url ||
      user_metadata?.picture ||
      null;

    // 1. First check if user exists by email
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 2. If not found by email, check if user exists by Supabase auth ID
    if (!user && id) {
      user = await prisma.user.findUnique({
        where: { id },
      });
    }

    if (!user) {
      // Ensure target ID is not already used to prevent P2002 constraint error
      let finalId = id || crypto.randomUUID();
      if (id) {
        const idCheck = await prisma.user.findUnique({ where: { id } });
        if (idCheck) {
          finalId = crypto.randomUUID();
        }
      }

      // Create new user profile in public.User
      user = await prisma.user.create({
        data: {
          id: finalId,
          email: normalizedEmail,
          name: displayName,
          passwordHash: '', // OAuth user without local password
          photoUrl: photoUrl || null,
          role: 'USER',
        },
      });
    } else {
      // Update missing photoUrl or name if needed
      const updateData: { photoUrl?: string; name?: string } = {};
      if (!user.photoUrl && photoUrl) updateData.photoUrl = photoUrl;
      if ((!user.name || user.name.includes('@')) && displayName) updateData.name = displayName;

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    }

    const token = signJwt({ id: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({
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
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: unknown) {
    console.error('OAuth sync error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: { message: `Gagal menyinkronkan akun: ${message}` } },
      { status: 500 }
    );
  }
}
