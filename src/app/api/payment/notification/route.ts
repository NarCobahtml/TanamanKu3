import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// Webhook notifikasi pembayaran Midtrans
export async function POST(request: Request) {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error('MIDTRANS_SERVER_KEY is not set on the server.');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Invalid notification payload' },
        { status: 400 }
      );
    }

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      custom_field1: userId,
      custom_field2: planId,
    } = body;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return NextResponse.json(
        { success: false, error: 'Missing required signature verification fields' },
        { status: 400 }
      );
    }

    // 1. Verifikasi signature SHA-512
    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey.trim()}`)
      .digest('hex');

    if (signature_key !== expectedSignature) {
      console.warn(`[Midtrans Webhook] Invalid signature rejected for order ${order_id}`);
      return NextResponse.json(
        { success: false, error: 'Invalid transaction signature' },
        { status: 403 }
      );
    }

    // 2. Evaluasi Status Transaksi
    const isSuccess =
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status === 'accept');

    if (isSuccess) {
      // Cari user terkait pembayaran
      let targetUser = null;
      if (userId) {
        targetUser = await prisma.user.findUnique({ where: { id: userId } });
      }

      if (targetUser) {
        const isAnnual = planId === 'annual';
        const durationDays = isAnnual ? 365 : 30;
        const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

        // Upgrade akun ke PRO
        await prisma.user.update({
          where: { id: targetUser.id },
          data: {
            subscriptionTier: 'PRO',
            subscriptionExpiresAt: expiresAt,
          },
        });

        // Buat notifikasi akun
        await prisma.notification.create({
          data: {
            id: `notif-pay-${Date.now()}`,
            userId: targetUser.id,
            type: 'SCAN_RESULT',
            title: 'Pembayaran Langganan Berhasil! 🎉',
            body: `Selamat! Akun Anda telah berhasil di-upgrade ke Paket Premium (${isAnnual ? '1 Tahun' : '1 Bulan'}). Nikmati fitur scan tanpa batas!`,
            isRead: false,
          },
        });

        console.log(`[Midtrans Webhook] Successfully upgraded user ${targetUser.id} to PRO`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Notification processed for order ${order_id} with status ${transaction_status}`,
    });
  } catch (error) {
    console.error('Midtrans notification webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing notification' },
      { status: 500 }
    );
  }
}
