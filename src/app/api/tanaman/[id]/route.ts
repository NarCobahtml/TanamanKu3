import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plant = await prisma.plant.findUnique({
      where: { id },
      include: { wateringSchedule: true },
    });

    if (!plant) {
      return NextResponse.json(
        { success: false, error: 'Tanaman tidak ditemukan' },
        { status: 404 }
      );
    }

    const formatted = {
      id: plant.id,
      nama: plant.name,
      jenis: plant.type,
      kategori: plant.kategori || 'Indoor',
      status: plant.status || 'terjadwal',
      nextWater: plant.nextWater || 'nw.berikutnyaBesok',
      photo: plant.photoUrl || undefined,
      notes: plant.notes,
      userId: plant.userId,
      createdAt: plant.createdAt,
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching plant detail:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil detail tanaman' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Anda harus masuk terlebih dahulu untuk mengubah tanaman' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { nama, jenis, kategori, status, nextWater, foto, notes } = body;

    const existing = await prisma.plant.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Tanaman tidak ditemukan di database' },
        { status: 404 }
      );
    }

    // Verify ownership: only the owner or an ADMIN can modify the plant
    if (existing.userId && existing.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki hak akses untuk mengubah tanaman ini' },
        { status: 403 }
      );
    }

    const updated = await prisma.plant.update({
      where: { id },
      data: {
        ...(nama ? { name: nama.trim() } : {}),
        ...(jenis ? { type: jenis } : {}),
        ...(kategori ? { kategori } : {}),
        ...(status ? { status } : {}),
        ...(nextWater ? { nextWater } : {}),
        ...(foto !== undefined ? { photoUrl: foto || null } : {}),
        ...(notes !== undefined ? { notes } : {}),
        updatedAt: new Date(),
      },
    });

    // Sync to WateringSchedule table if plant is being watered
    if (status === 'terjadwal') {
      try {
        const { resolvePlantProfile } = await import('@/features/watering/plant-rules');
        const profile = resolvePlantProfile(updated.name, updated.kategori || undefined, updated.type);
        const nextDate = new Date(Date.now() + profile.intervalDays * 24 * 60 * 60 * 1000);

        await prisma.wateringSchedule.upsert({
          where: { plantId: id },
          update: {
            lastWateredAt: new Date(),
            nextWateringAt: nextDate,
            updatedAt: new Date(),
          },
          create: {
            id: `sched-${id}`,
            plantId: id,
            lastWateredAt: new Date(),
            nextWateringAt: nextDate,
            isAuto: true,
            reminderEnabled: true,
            reminderMinutes: 30,
          },
        });
      } catch (schedErr) {
        console.warn('Failed to sync WateringSchedule:', schedErr);
      }
    }

    const formatted = {
      id: updated.id,
      nama: updated.name,
      jenis: updated.type,
      kategori: updated.kategori || 'Indoor',
      status: updated.status || 'terjadwal',
      nextWater: updated.nextWater || 'nw.berikutnyaBesok',
      photo: updated.photoUrl || undefined,
      notes: updated.notes,
      userId: updated.userId,
      createdAt: updated.createdAt,
    };

    return NextResponse.json({
      success: true,
      data: formatted,
      message: 'Tanaman berhasil diperbarui di Supabase',
    });
  } catch (error) {
    console.error('Error updating plant in Supabase:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui data tanaman' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Anda harus masuk terlebih dahulu untuk menghapus tanaman' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await prisma.plant.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Tanaman tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verify ownership: only the owner can delete the plant
    if (existing.userId && existing.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki hak akses untuk menghapus tanaman ini' },
        { status: 403 }
      );
    }

    await prisma.wateringSchedule.deleteMany({
      where: { plantId: id },
    });

    await prisma.scanRecord.updateMany({
      where: { plantId: id },
      data: { plantId: null },
    });

    await prisma.plant.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Tanaman berhasil dihapus dari Supabase',
    });
  } catch (error) {
    console.error('Error deleting plant from Supabase:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus tanaman' },
      { status: 500 }
    );
  }
}
