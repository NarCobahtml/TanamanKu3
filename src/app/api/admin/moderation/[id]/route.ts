import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (dbUser?.role !== 'ADMIN') return null;
  return user;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Akses ditolak: Hanya administrator yang diizinkan.' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { action = 'approve' } = body;

    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Postingan tidak ditemukan.' },
        { status: 404 }
      );
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        isApproved: action === 'approve' || action === 'Abaikan',
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Status moderasi postingan berhasil diperbarui.',
    });
  } catch (error) {
    console.error('Update moderation error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui status moderasi postingan.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Akses ditolak: Hanya administrator yang diizinkan.' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Postingan tidak ditemukan.' },
        { status: 404 }
      );
    }

    await prisma.postLike.deleteMany({ where: { postId: id } });
    await prisma.comment.deleteMany({ where: { postId: id } });
    await prisma.post.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Postingan yang dilaporkan berhasil dihapus permanen dari forum.',
    });
  } catch (error) {
    console.error('Delete moderated post error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus postingan.' },
      { status: 500 }
    );
  }
}
