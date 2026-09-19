import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signJwt } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, photoUrl, id } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: { message: 'Email tidak ditemukan dari akun Google.' } },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const displayName = name || normalizedEmail.split('@')[0];

    // 1. First check if user exists by email
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 2. If not found by email, check if user exists by ID
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
