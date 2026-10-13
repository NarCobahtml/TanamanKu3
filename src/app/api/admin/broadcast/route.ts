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

export async function POST(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Akses ditolak: Hanya administrator yang diizinkan.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { message, title = 'Pengumuman Penting dari Admin 📢' } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Pesan pengumuman wajib diisi.' },
        { status: 400 }
      );
    }

    const allUsers = await prisma.user.findMany({
      select: { id: true },
    });

    if (allUsers.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: 'Tidak ada pengguna di sistem.',
      });
    }

    const now = new Date();
    const notifs = allUsers.map((u, i) => ({
      id: `notif-bc-${Date.now()}-${i}-${u.id.slice(0, 5)}`,
      userId: u.id,
      type: 'FORUM_REPLY' as const,
      title: title.trim(),
      body: message.trim(),
      isRead: false,
      createdAt: now,
    }));

    await prisma.notification.createMany({
      data: notifs,
    });

    return NextResponse.json({
      success: true,
      count: notifs.length,
      message: `Pengumuman berhasil disiarkan ke ${notifs.length} pengguna!`,
    });
  } catch (error) {
    console.error('Send broadcast error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengirim pengumuman siaran.' },
      { status: 500 }
    );
  }
}
