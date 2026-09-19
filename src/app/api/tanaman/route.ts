import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'node:crypto';

async function getCurrentUserId(request: Request): Promise<string | null> {
  try {
    let token: string | undefined;
    const cookieStore = await cookies();
    token = cookieStore.get('auth_token')?.value;
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    if (!token) return null;
    const payload = verifyJwt(token);
    return payload?.id || null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId(request);

    const plants = await prisma.plant.findMany({
      where: userId ? { OR: [{ userId }, { userId: null }] } : undefined,
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

    const userId = await getCurrentUserId(request);

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
