import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
