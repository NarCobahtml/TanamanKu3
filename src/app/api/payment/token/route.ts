import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
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
    const {
      planId = "premium",
      planName = "Paket Premium TanamanKu",
      price = 29000,
    } = body;

    // Optional user authentication check
    let user = null;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (token) {
      const payload = verifyJwt(token);
      if (payload?.id) {
        user = await prisma.user.findUnique({
          where: { id: payload.id },
          select: { id: true, name: true, email: true },
        });
      }
    }

    const orderId = `TK-SUB-${Date.now()}`;
    const authHeader = `Basic ${Buffer.from(serverKey.trim() + ":").toString("base64")}`;

    const snapPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Number(price),
      },
      item_details: [
        {
          id: planId,
          price: Number(price),
          quantity: 1,
          name: planName.slice(0, 50),
        },
      ],
      customer_details: {
        first_name: user?.name || "Pelanggan TanamanKu",
        email: user?.email || "pelanggan@tanamanku.id",
      },
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
