import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscription, userAgent } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { success: false, error: 'Subscription data tidak valid' },
        { status: 400 }
      );
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    if (!p256dh || !auth) {
      return NextResponse.json(
        { success: false, error: 'Kunci enkripsi p256dh atau auth tidak ditemukan' },
        { status: 400 }
      );
    }

    const userId = await getCurrentUserId();

    const saved = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh,
        auth,
        userAgent: userAgent || null,
        userId: userId || undefined,
        updatedAt: new Date(),
      },
      create: {
        endpoint,
        p256dh,
        auth,
        userAgent: userAgent || null,
        userId: userId || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Perangkat berhasil didaftarkan untuk Web Push!',
      data: { id: saved.id },
    });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan langganan notifikasi push' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: 'Endpoint diperlukan untuk membatalkan langganan' },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });

    return NextResponse.json({
      success: true,
      message: 'Langganan notifikasi push berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting push subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus langganan notifikasi push' },
      { status: 500 }
    );
  }
}
