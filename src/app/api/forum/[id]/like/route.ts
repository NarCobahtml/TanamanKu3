import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { parsePostContent } from '@/lib/forum';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, error: 'Anda harus masuk untuk menyukai postingan' },
        { status: 401 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Postingan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Ensure user exists in Prisma
    let dbUser = await prisma.user.findFirst({
      where: { OR: [{ id: authUser.id }, { email: authUser.email || '' }] },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: authUser.id,
          email: authUser.email || `user-${authUser.id}@tumbuhkita.id`,
          name: authUser.user_metadata?.name || 'Pengguna',
          passwordHash: '',
          role: 'USER',
        },
      });
    }

    const body = await request.json().catch(() => ({}));
    const shouldLike = body.liked !== false;

    // Check existing like
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: dbUser.id,
        },
      },
    });

    if (shouldLike && !existingLike) {
      await prisma.postLike.create({
        data: {
          postId,
          userId: dbUser.id,
        },
      });
    } else if (!shouldLike && existingLike) {
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });
    }

    const totalLikes = await prisma.postLike.count({
      where: { postId },
    });

    const parsed = parsePostContent(post.content);
    await prisma.post.update({
      where: { id: postId },
      data: {
        content: JSON.stringify({
          ...parsed,
          likes: totalLikes,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      likes: totalLikes,
      liked: shouldLike,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengubah status like' },
      { status: 500 }
    );
  }
}
