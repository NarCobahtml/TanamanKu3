import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { formatRelativeTime } from '@/lib/forum';

export async function GET() {
  try {
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) userId = authUser.id;
    } catch {
      // Unauthenticated
    }

    if (!userId) {
      const firstUser = await prisma.user.findFirst();
      userId = firstUser ? firstUser.id : 'demo-user';
    }

    // Seed initial notifications if user has none
    const count = await prisma.notification.count({ where: { userId } });
    if (count === 0 && userId) {
      try {
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (userExists) {
          await prisma.notification.createMany({
            data: [
              {
                id: `notif-${Date.now()}-1`,
                userId,
                type: 'WATERING_REMINDER',
                title: 'Penyiraman Tanaman',
                body: 'Cabai Rawit, jadwal penyiraman hari ini.',
                isRead: false,
                createdAt: new Date(),
              },
              {
                id: `notif-${Date.now()}-2`,
                userId,
                type: 'SCAN_RESULT',
                title: 'Hasil Diagnosis AI',
                body: 'Scan Tomat Ceri: kondisi daun sehat tanpa patogen.',
                isRead: false,
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
              {
                id: `notif-${Date.now()}-3`,
                userId,
                type: 'WATERING_REMINDER',
                title: 'Penyiraman Terlewat',
                body: 'Pisang terlewat penyiraman 1 hari.',
                isRead: true,
                createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
              },
            ],
          });
        }
      } catch (seedErr) {
        console.warn('Notification seeder warning:', seedErr);
      }
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const formatted = notifications.map((n) => ({
      id: n.id,
      text: n.body,
      title: n.title,
      time: formatRelativeTime(n.createdAt),
      isRead: n.isRead,
      type: n.type,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data notifikasi dari database' },
      { status: 500 }
    );
  }
}
