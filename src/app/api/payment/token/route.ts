import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "MIDTRANS_SERVER_KEY belum dikonfigurasi di server.",
          },
        },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { planId = "premium" } = body;

    const VALID_PLANS: Record<string, { name: string; price: number }> = {
      premium: { name: "Paket Premium TanamanKu", price: 29000 },
      annual: { name: "Paket Premium TanamanKu (1 Tahun)", price: 290000 },
    };

    const selectedPlan = VALID_PLANS[planId] || VALID_PLANS.premium;
    const planName = selectedPlan.name;
    const verifiedPrice = selectedPlan.price;

    // 1. Verifikasi Autentikasi Pengguna (Wajib Login untuk Berlangganan)
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Anda harus masuk terlebih dahulu untuk membeli paket langganan.",
          },
        },
        { status: 401 },
      );
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ id: authUser.id }, { email: authUser.email || "" }],
      },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: authUser.id,
          email: authUser.email || `user-${authUser.id}@tumbuhkita.id`,
          name: authUser.user_metadata?.name || "Pengguna",
          passwordHash: "",
          role: "USER",
          subscriptionTier: "FREE",
          scanQuotaUsed: 0,
        },
        select: { id: true, name: true, email: true },
      });
    }

    const orderId = `TK-SUB-${user.id.slice(0, 8)}-${Date.now()}`;
    const authHeader = `Basic ${Buffer.from(serverKey.trim() + ":").toString("base64")}`;

    const snapPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: verifiedPrice,
      },
      item_details: [
        {
          id: planId,
          price: verifiedPrice,
          quantity: 1,
          name: planName.slice(0, 50),
        },
      ],
      customer_details: {
        first_name: user.name || "Pelanggan TanamanKu",
        email: user.email,
      },
      custom_field1: user.id,
      custom_field2: planId,
    };

    const midtransRes = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(snapPayload),
      },
    );

    const data = await midtransRes.json();

    if (!midtransRes.ok || !data.token) {
      console.error("Midtrans error response:", data);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: data.error_messages
              ? data.error_messages.join(", ")
              : "Gagal membuat sesi pembayaran Midtrans.",
          },
        },
        { status: midtransRes.status || 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        token: data.token,
        redirectUrl: data.redirect_url,
        orderId,
      },
    });
  } catch (error: unknown) {
    console.error("Create payment token error:", error);
    const msg =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan pada server pembayaran.";
    return NextResponse.json(
      { success: false, error: { message: msg } },
      { status: 500 },
    );
  }
}
