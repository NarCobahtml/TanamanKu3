import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'node:crypto';

async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    const plants = await prisma.plant.findMany({
      where: userId ? { OR: [{ userId }, { userId: null }] } : { userId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        wateringSchedule: true,
      },
    });

    const formatted = plants.map((p) => ({
      id: p.id,
      nama: p.name,
      jenis: p.type || 'hias',
      kategori: p.kategori || 'Indoor',
      status: p.status || 'terjadwal',
      nextWater: p.nextWater || 'nw.berikutnyaBesok',
      photo: p.photoUrl || undefined,
      notes: p.notes,
      userId: p.userId,
      createdAt: p.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Error fetching plants from Supabase:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data tanaman dari database' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id: customId, nama, jenis = 'hias', kategori, status = 'terjadwal', nextWater = 'nw.berikutnyaBesok', foto, notes } = body;

    if (!nama || typeof nama !== 'string' || !nama.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nama tanaman wajib diisi' },
        { status: 400 }
      );
    }

    const userId = await getCurrentUserId();

    // Use pure numeric ID (either passed in or generated from Date.now())
    const plantId = customId && /^\d+$/.test(customId) ? customId : Date.now().toString();

    let resolvedKategori = kategori;
    if (!resolvedKategori) {
      if (jenis === 'hias') resolvedKategori = 'Indoor';
      else if (jenis === 'sayuran' || jenis === 'buah') resolvedKategori = 'Kebun';
      else resolvedKategori = 'Outdoor';
    }

    const newPlant = await prisma.plant.create({
      data: {
        id: plantId,
        name: nama.trim(),
        type: jenis,
        kategori: resolvedKategori,
        status: status || 'terjadwal',
        nextWater: nextWater || 'nw.berikutnyaBesok',
        photoUrl: foto || null,
        notes: notes || null,
        userId: userId || null,
        wateringSchedule: {
          create: {
            id: `sched-${randomUUID()}`,
            nextWateringAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            isAuto: true,
            reminderEnabled: true,
            reminderMinutes: 30,
          },
        },
      },
    });

    const formatted = {
      id: newPlant.id,
      nama: newPlant.name,
      jenis: newPlant.type,
      kategori: newPlant.kategori || 'Indoor',
      status: newPlant.status || 'terjadwal',
      nextWater: newPlant.nextWater || 'nw.berikutnyaBesok',
      photo: newPlant.photoUrl || undefined,
      notes: newPlant.notes,
      userId: newPlant.userId,
      createdAt: newPlant.createdAt,
    };

    return NextResponse.json(
      { success: true, data: formatted, message: 'Tanaman berhasil ditambahkan ke Supabase' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating plant in Supabase:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan tanaman ke database' },
      { status: 500 }
    );
  }
}
