import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const key = process.env.ROBOFLOW_API_KEY;
  const modelId = process.env.ROBOFLOW_MODEL_ID;
  if (!key || !modelId) {
    return NextResponse.json(
      { error: "Scan engine belum dikonfigurasi." },
      { status: 500 },
    );
  }

  let image: Blob;
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof Blob) || file.size === 0) throw new Error("no file");
    image = file;
  } catch {
    return NextResponse.json(
      { error: "Gambar tidak ditemukan pada request." },
      { status: 400 },
    );
  }

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
        { error: data?.message ?? "Klasifikasi gagal, coba lagi." },
        { status: 502 },
      );
    }
    return NextResponse.json({
      class: data.predictions?.[0]?.class ?? data.top,
      confidence: data.predictions?.[0]?.confidence ?? data.confidence,
    });
  } catch {
    return NextResponse.json(
      { error: "Tidak bisa menghubungi mesin scan. Coba lagi." },
      { status: 502 },
    );
  }
}
