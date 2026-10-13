import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const FREE_SCAN_LIMIT = 5;

// GET /api/scan: Dapatkan status kuota dan paket langganan user saat ini
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, error: "Tidak terautentikasi" },
        { status: 401 },
      );
    }

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: authUser.id }, { email: authUser.email || "" }],
      },
      select: {
        id: true,
        subscriptionTier: true,
        scanQuotaUsed: true,
        subscriptionExpiresAt: true,
      },
    });

    const isPro =
      dbUser?.subscriptionTier === "PRO" &&
      (!dbUser.subscriptionExpiresAt || dbUser.subscriptionExpiresAt > new Date());

    const used = dbUser?.scanQuotaUsed ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        tier: dbUser?.subscriptionTier ?? "FREE",
        used,
        max: isPro ? null : FREE_SCAN_LIMIT,
        remaining: isPro ? null : Math.max(0, FREE_SCAN_LIMIT - used),
        isPro,
      },
    });
  } catch (error) {
    console.error("Error fetching scan quota:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat kuota scan" },
      { status: 500 },
    );
  }
}

// POST /api/scan: Jalankan scan daun lewat AI Roboflow dengan validasi auth & kuota paket
export async function POST(request: Request) {
  // 1. Verifikasi Autentikasi Pengguna
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return NextResponse.json(
      {
        success: false,
        error: "Anda harus masuk terlebih dahulu untuk melakukan scan tanaman.",
      },
      { status: 401 },
    );
  }

  // 2. Cek Akun Pengguna di Database
  let dbUser = await prisma.user.findFirst({
    where: {
      OR: [{ id: authUser.id }, { email: authUser.email || "" }],
    },
    select: {
      id: true,
      subscriptionTier: true,
      scanQuotaUsed: true,
      subscriptionExpiresAt: true,
    },
  });

  if (!dbUser) {
    const metaName =
      authUser.user_metadata?.name ||
      authUser.user_metadata?.full_name ||
      authUser.email?.split("@")[0] ||
      "Pengguna";

    dbUser = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email || `user-${authUser.id}@tumbuhkita.id`,
        name: metaName,
        passwordHash: "",
        role: "USER",
        subscriptionTier: "FREE",
        scanQuotaUsed: 0,
      },
      select: {
        id: true,
        subscriptionTier: true,
        scanQuotaUsed: true,
        subscriptionExpiresAt: true,
      },
    });
  }

  // 3. Verifikasi Status Langganan & Batas Kuota
  const isPro =
    dbUser.subscriptionTier === "PRO" &&
    (!dbUser.subscriptionExpiresAt || dbUser.subscriptionExpiresAt > new Date());

  if (!isPro && dbUser.scanQuotaUsed >= FREE_SCAN_LIMIT) {
    return NextResponse.json(
      {
        success: false,
        code: "QUOTA_EXCEEDED",
        error: `Batas kuota scan gratis Anda telah habis (${dbUser.scanQuotaUsed}/${FREE_SCAN_LIMIT}). Silakan upgrade ke paket Premium untuk scan tanpa batas.`,
        used: dbUser.scanQuotaUsed,
        max: FREE_SCAN_LIMIT,
      },
      { status: 403 },
    );
  }

  // 4. Cek Konfigurasi Roboflow
  const key = process.env.ROBOFLOW_API_KEY;
  const modelId = process.env.ROBOFLOW_MODEL_ID;
  if (!key || !modelId) {
    return NextResponse.json(
      { success: false, error: "Scan engine belum dikonfigurasi." },
      { status: 500 },
    );
  }

  // 5. Validasi File Gambar
  let image: Blob;
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof Blob) || file.size === 0) throw new Error("no file");

    // Batasi ukuran gambar maksimal 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Ukuran gambar terlalu besar. Maksimal 10MB." },
        { status: 400 },
      );
    }

    image = file;
  } catch {
    return NextResponse.json(
      { success: false, error: "Gambar tidak ditemukan pada request." },
      { status: 400 },
    );
  }

  // 6. Kirim ke Upstream Engine (Roboflow)
  try {
    const upstream = new FormData();
    upstream.append("file", image, "capture.jpg");
    const res = await fetch(
      `https://classify.roboflow.com/${modelId}?api_key=${key}`,
      { method: "POST", body: upstream },
    );
    const data = await res.json();
    if (!res.ok || !data?.top) {
      return NextResponse.json(
        { success: false, error: data?.message ?? "Klasifikasi gagal, coba lagi." },
        { status: 502 },
      );
    }

    // 7. Tambah Pemakaian Kuota Scan di Database
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        scanQuotaUsed: { increment: 1 },
      },
      select: {
        scanQuotaUsed: true,
      },
    });

    return NextResponse.json({
      success: true,
      class: data.predictions?.[0]?.class ?? data.top,
      confidence: data.predictions?.[0]?.confidence ?? data.confidence,
      quota: {
        used: updatedUser.scanQuotaUsed,
        max: isPro ? null : FREE_SCAN_LIMIT,
        remaining: isPro ? null : Math.max(0, FREE_SCAN_LIMIT - updatedUser.scanQuotaUsed),
        isPro,
        tier: dbUser.subscriptionTier,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Tidak bisa menghubungi mesin scan. Coba lagi." },
      { status: 502 },
    );
  }
}

