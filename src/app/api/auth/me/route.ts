import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { uploadToStorage, deleteFromStorage } from '@/lib/storage';

async function getAuthenticatedUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const authUser = await getAuthenticatedUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, data: null, message: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        photoUrl: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user && authUser.email) {
      user = await prisma.user.findUnique({
        where: { email: authUser.email.trim().toLowerCase() },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          photoUrl: true,
          bio: true,
          createdAt: true,
        },
      });
    }

    if (!user) {
      // Auto-create profile if missing
      const metaName =
        authUser.user_metadata?.name ||
        authUser.user_metadata?.full_name ||
        authUser.email?.split('@')[0] ||
        'User';

      user = await prisma.user.create({
        data: {
          id: authUser.id,
          email: authUser.email!.trim().toLowerCase(),
          name: metaName,
          passwordHash: '',
          role: 'USER',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          photoUrl: true,
          bio: true,
          createdAt: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { success: false, data: null, message: 'Terjadi kesalahan saat memuat profil' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, data: null, message: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const userId = authUser.id;
    const body = await request.json();
    const { name, bio, photoUrl } = body;

    let finalPhotoUrl = photoUrl;

    // Handle profile photo upload / replacement
    if (photoUrl !== undefined) {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { photoUrl: true },
      });

      if (typeof photoUrl === 'string' && photoUrl.startsWith('data:image/')) {
        // 1. Delete previous avatar in Supabase Storage if it exists
        if (existingUser?.photoUrl) {
          await deleteFromStorage(existingUser.photoUrl);
        }

        // 2. Parse base64 and upload to Supabase bucket
        const matches = photoUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');

          let ext = 'jpg';
          if (mimeType.includes('png')) ext = 'png';
          else if (mimeType.includes('webp')) ext = 'webp';
          else if (mimeType.includes('gif')) ext = 'gif';

          const fileName = `avatar-${Date.now()}.${ext}`;
          const filePath = `avatars/${userId}/${fileName}`;

          finalPhotoUrl = await uploadToStorage({
            fileBuffer: buffer,
            filePath,
            contentType: mimeType,
          });
        }
      } else if (!photoUrl && existingUser?.photoUrl) {
        await deleteFromStorage(existingUser.photoUrl);
        finalPhotoUrl = null;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(finalPhotoUrl !== undefined ? { photoUrl: finalPhotoUrl } : {}),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        photoUrl: true,
        bio: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { user: updatedUser },
      message: 'Profil berhasil diperbarui di database.',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    const msg = error instanceof Error ? error.message : 'Gagal memperbarui profil';
    return NextResponse.json(
      { success: false, data: null, message: msg },
      { status: 500 }
    );
  }
}
