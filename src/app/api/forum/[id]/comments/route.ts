import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { formatRelativeTime } from '@/lib/forum';

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
        { success: false, error: 'Anda harus masuk terlebih dahulu untuk berkomentar.' },
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

    const body = await request.json();
    const { text, replyTo } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Komentar tidak boleh kosong' },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: authUser.id,
        content: JSON.stringify({
          text: text.trim(),
          replyTo: replyTo || undefined,
        }),
      },
      include: {
        author: {
          select: { id: true, name: true, photoUrl: true, role: true },
        },
      },
    });

    const formattedComment = {
      id: comment.id,
      authorId: comment.authorId,
      author: comment.author?.name || 'Pengguna TanamanKu',
      avatar: comment.author?.photoUrl || undefined,
      time: formatRelativeTime(comment.createdAt),
      text: text.trim(),
      replyTo: replyTo || undefined,
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedComment,
        message: 'Komentar berhasil dikirim!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error posting comment to database:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan komentar' },
      { status: 500 }
    );
  }
}
