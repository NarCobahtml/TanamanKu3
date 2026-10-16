import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { webpush } from '@/lib/web-push-server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // 1. Verifikasi Otorisasi: CRON_SECRET atau Admin Session
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'tumbuhkita-watering-cron-secret-2026';
    const isCronAuthorized = authHeader === `Bearer ${cronSecret}`;

    let isAdmin = false;
    if (!isCronAuthorized) {
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
          });
          isAdmin = dbUser?.role === 'ADMIN';
        }
      } catch {
        isAdmin = false;
      }
    }

    if (!isCronAuthorized && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Memerlukan token Cron atau hak akses Admin.' },
        { status: 401 }
      );
    }

    // 2. Ambil seluruh tanaman yang masuk jadwal siram ('hari-ini' atau 'terlambat')
    const duePlants = await prisma.plant.findMany({
      where: {
        OR: [{ status: 'hari-ini' }, { status: 'terlambat' }],
      },
      select: {
        id: true,
        name: true,
        kategori: true,
        status: true,
        userId: true,
      },
    });

    // 3. Ambil seluruh langganan push yang aktif
    const allSubscriptions = await prisma.pushSubscription.findMany();

    if (allSubscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Tidak ada perangkat push terdaftar saat ini.',
        duePlantsCount: duePlants.length,
        sentCount: 0,
      });
    }

    // Kelompokkan tanaman per userId
    const plantsByUser = new Map<string, typeof duePlants>();
    for (const plant of duePlants) {
      if (plant.userId) {
        const list = plantsByUser.get(plant.userId) || [];
        list.push(plant);
        plantsByUser.set(plant.userId, list);
      }
    }

    let sentCount = 0;
    let failedCount = 0;
    let removedStaleCount = 0;

    for (const sub of allSubscriptions) {
      // Tentukan tanaman yang ditujukan untuk perangkat ini
      let userPlants = sub.userId ? plantsByUser.get(sub.userId) : null;

      // Jika subscription guest atau user tidak punya tanaman spesifik di DB tapi ada tanaman umum
      if (!userPlants && duePlants.length > 0) {
        userPlants = duePlants.slice(0, 3);
      }

      if (!userPlants || userPlants.length === 0) {
        continue;
      }

      let title = '';
      let body = '';
      let url = '/siram';

      if (userPlants.length === 1) {
        const p = userPlants[0];
        title = `🌱 Waktunya Siram: ${p.name}!`;
        body = `Tanaman ${p.name} (${p.kategori || 'Indoor'}) sudah masuk jadwal siram hari ini.`;
        url = `/siram/${p.id}`;
      } else {
        const names = userPlants.map((p) => p.name).slice(0, 2).join(', ');
        const remaining = userPlants.length - 2;
        title = `🌱 ${userPlants.length} Tanaman Menunggu Disiram!`;
        body = `${names}${remaining > 0 ? ` dan ${remaining} lainnya` : ''} perlu disiram hari ini. Jangan sampai layu!`;
        url = '/siram';
      }

      const payload = JSON.stringify({
        title,
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        vibrate: [100, 50, 100],
        url,
      });

      const pushSubObj = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubObj, payload);
        sentCount++;
      } catch (err: unknown) {
        failedCount++;
        const pushErr = err as { statusCode?: number };
        // Status 410 (Gone) atau 404 (Not Found) menandakan perangkat sudah mencabut izin atau uninstall
        if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
          try {
            await prisma.pushSubscription.delete({ where: { id: sub.id } });
            removedStaleCount++;
          } catch {}
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil memproses pengingat siram server.`,
      stats: {
        duePlantsTotal: duePlants.length,
        subscriptionsTotal: allSubscriptions.length,
        sentCount,
        failedCount,
        removedStaleCount,
      },
    });
  } catch (error) {
    console.error('Error in send-watering-reminders cron endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses pengingat notifikasi siram' },
      { status: 500 }
    );
  }
}
