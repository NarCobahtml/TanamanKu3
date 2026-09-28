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

    const body = await request.json().catch(() => ({}));
    const increment = body.liked !== false;

    const parsed = parsePostContent(post.content);
    const newLikes = Math.max(0, parsed.likes + (increment ? 1 : -1));

    await prisma.post.update({
      where: { id: postId },
      data: {
        content: JSON.stringify({
          ...parsed,
          likes: newLikes,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      likes: newLikes,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengubah status like' },
      { status: 500 }
    );
  }
}
