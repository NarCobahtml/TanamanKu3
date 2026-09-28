import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { formatForumPost, seedForumPostsIfEmpty } from '@/lib/forum';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await seedForumPostsIfEmpty();

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, photoUrl: true, role: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, photoUrl: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Postingan tidak ditemukan' },
        { status: 404 }
      );
    }

    const formatted = formatForumPost(post);

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Error fetching post detail from database:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil detail postingan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, error: 'Anda harus masuk untuk menghapus postingan.' },
        { status: 401 }
      );
    }

    const existing = await prisma.post.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Postingan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check authorization: author or ADMIN
    if (existing.authorId && existing.authorId !== authUser.id) {
      const user = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: { role: true },
      });
      if (user?.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Anda tidak memiliki hak akses untuk menghapus postingan ini.' },
          { status: 403 }
        );
      }
    }

    // Delete associated comments first
    await prisma.comment.deleteMany({
      where: { postId: id },
    });

    // Delete post
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Postingan berhasil dihapus dari database.',
    });
  } catch (error) {
    console.error('Error deleting post from database:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus postingan' },
      { status: 500 }
    );
  }
}
