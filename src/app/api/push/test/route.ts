import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { webpush } from '@/lib/web-push-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    let targetSub = null;

    if (endpoint) {
      targetSub = await prisma.pushSubscription.findUnique({
        where: { endpoint },
      });
    }

    if (!targetSub) {
      // Ambil langganan push terbaru jika tidak ditentukan
      targetSub = await prisma.pushSubscription.findFirst({
        orderBy: { updatedAt: 'desc' },
      });
    }

    if (!targetSub) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada perangkat terdaftar yang ditemukan' },
        { status: 404 }
      );
    }

    const payload = JSON.stringify({
      title: '🌿 Tes Server Web Push Berhasil!',
      body: 'Notifikasi latar belakang TumbuhKita bekerja dengan sempurna langsung dari server.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      url: '/siram',
    });

    const pushSubscription = {
      endpoint: targetSub.endpoint,
      keys: {
        p256dh: targetSub.p256dh,
        auth: targetSub.auth,
      },
    };

    await webpush.sendNotification(pushSubscription, payload);

    return NextResponse.json({
      success: true,
      message: 'Notifikasi push server berhasil dikirim ke perangkat Anda!',
    });
  } catch (error: unknown) {
    console.error('Error sending test push notification:', error);
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json(
      {
        success: false,
        error: `Gagal mengirim push: ${err.message || 'Error tidak diketahui'}`,
      },
      { status: 500 }
    );
  }
}
