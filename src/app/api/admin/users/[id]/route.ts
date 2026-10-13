import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { prisma } from '@/lib/prisma';

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, role: true },
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
    const { status, plan, role, resetQuota } = body;

    const targetUser = await prisma.user.findFirst({
      where: { OR: [{ id }, { id: { startsWith: id } }] },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'Pengguna tidak ditemukan.' },
        { status: 404 }
      );
    }

    const updateData: {
      bio?: string;
      subscriptionTier?: 'FREE' | 'PRO';
      subscriptionExpiresAt?: Date | null;
      role?: 'ADMIN' | 'USER';
      scanQuotaUsed?: number;
    } = {};

    if (status !== undefined) {
      const currentBio = targetUser.bio || '';
      if (status === 'Ditangguhkan') {
        if (!currentBio.startsWith('[SUSPENDED]')) {
          updateData.bio = `[SUSPENDED] ${currentBio}`.trim();
        }
      } else if (status === 'Aktif') {
        updateData.bio = currentBio.replace(/^\[SUSPENDED\]\s*/, '');
      }
    }

    if (plan !== undefined) {
      if (plan === 'Pro' || plan === 'PRO') {
        updateData.subscriptionTier = 'PRO';
        updateData.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      } else {
        updateData.subscriptionTier = 'FREE';
        updateData.subscriptionExpiresAt = null;
      }
    }

    if (role !== undefined) {
      updateData.role = role === 'ADMIN' ? 'ADMIN' : 'USER';
    }

    if (resetQuota === true) {
      updateData.scanQuotaUsed = 0;
    }

    const updated = await prisma.user.update({
      where: { id: targetUser.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscriptionTier: true,
        bio: true,
      },
    });

    const isSuspended = updated.bio?.startsWith('[SUSPENDED]');

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id.slice(0, 10),
        fullId: updated.id,
        name: updated.name,
        email: updated.email,
        plan: updated.subscriptionTier === 'PRO' ? 'Pro' : 'Gratis',
        status: isSuspended ? 'Ditangguhkan' : 'Aktif',
        role: updated.role,
      },
      message: 'Status pengguna berhasil diperbarui.',
    });
  } catch (error) {
    console.error('Update user admin error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui data pengguna.' },
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
    const targetUser = await prisma.user.findFirst({
      where: { OR: [{ id }, { id: { startsWith: id } }] },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'Pengguna tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Do not allow admin to delete themselves
    if (targetUser.id === admin.id) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak dapat menghapus akun Anda sendiri.' },
        { status: 400 }
      );
    }

    // 1. Delete associated data
    await prisma.postLike.deleteMany({ where: { userId: targetUser.id } });
    await prisma.comment.deleteMany({ where: { authorId: targetUser.id } });
    await prisma.post.deleteMany({ where: { authorId: targetUser.id } });
    await prisma.wateringSchedule.deleteMany({ where: { plant: { userId: targetUser.id } } });
    await prisma.plant.deleteMany({ where: { userId: targetUser.id } });
    await prisma.scanRecord.deleteMany({ where: { userId: targetUser.id } });
    await prisma.notification.deleteMany({ where: { userId: targetUser.id } });
    await prisma.verificationToken.deleteMany({ where: { userId: targetUser.id } });

    // 2. Delete User from Prisma
    await prisma.user.delete({ where: { id: targetUser.id } });

    // 3. Delete from Supabase Auth admin
    try {
      const supabaseAdmin = createAdminClient();
      await supabaseAdmin.auth.admin.deleteUser(targetUser.id);
    } catch (authErr) {
      console.warn('Failed to delete user from Supabase auth admin:', authErr);
    }

    return NextResponse.json({
      success: true,
      message: `Akun ${targetUser.name} (${targetUser.email}) berhasil dihapus permanen.`,
    });
  } catch (error) {
    console.error('Delete user admin error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus pengguna dari sistem.' },
      { status: 500 }
    );
  }
}
