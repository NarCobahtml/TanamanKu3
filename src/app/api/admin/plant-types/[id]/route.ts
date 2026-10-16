import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (dbUser?.role !== 'ADMIN') return null;
  return user;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Akses ditolak: Hanya administrator yang diizinkan.' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      slug,
      scientificName,
      defaultIntervalDays,
      waterNeed,
      description,
      imageUrl,
      icon,
    } = body;

    const existing = await prisma.plantType.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Jenis tanaman tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Cek duplikasi jika nama atau slug diubah
    if (name && name.trim() !== existing.name) {
      const duplicateName = await prisma.plantType.findFirst({
        where: { name: name.trim(), NOT: { id } },
      });
      if (duplicateName) {
        return NextResponse.json(
          { success: false, error: `Nama "${name.trim()}" sudah digunakan jenis tanaman lain.` },
          { status: 409 }
        );
      }
    }

    if (slug && slug.trim() !== existing.slug) {
      const duplicateSlug = await prisma.plantType.findFirst({
        where: { slug: slug.trim(), NOT: { id } },
      });
      if (duplicateSlug) {
        return NextResponse.json(
          { success: false, error: `Slug "${slug.trim()}" sudah digunakan jenis tanaman lain.` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.plantType.update({
      where: { id },
      data: {
        ...(name?.trim() ? { name: name.trim() } : {}),
        ...(slug?.trim() ? { slug: slug.trim() } : {}),
        ...(scientificName !== undefined ? { scientificName: scientificName?.trim() || null } : {}),
        ...(defaultIntervalDays !== undefined
          ? { defaultIntervalDays: Math.max(1, Number(defaultIntervalDays) || 2) }
          : {}),
        ...(waterNeed !== undefined && ['rendah', 'sedang', 'tinggi'].includes(waterNeed)
          ? { waterNeed }
          : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(imageUrl !== undefined ? { imageUrl: imageUrl?.trim() || null } : {}),
        ...(icon !== undefined ? { icon: icon?.trim() || null } : {}),
      },
    });

    const plantsCount = await prisma.plant.count({
      where: {
        OR: [{ type: updated.slug }, { type: updated.name }],
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        plantsCount,
      },
      message: `Jenis tanaman "${updated.name}" berhasil diperbarui.`,
    });
  } catch (error) {
    console.error('Error updating plant type:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui jenis tanaman.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Akses ditolak: Hanya administrator yang diizinkan.' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const existing = await prisma.plantType.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Jenis tanaman tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Cek apakah ada tanaman yang terhubung dengan jenis tanaman ini
    const plantsUsingType = await prisma.plant.count({
      where: {
        OR: [{ type: existing.slug }, { type: existing.name }],
      },
    });

    if (plantsUsingType > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Tidak dapat menghapus jenis tanaman "${existing.name}" karena masih digunakan oleh ${plantsUsingType} tanaman di sistem.`,
        },
        { status: 400 }
      );
    }

    await prisma.plantType.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Jenis tanaman "${existing.name}" berhasil dihapus.`,
    });
  } catch (error) {
    console.error('Error deleting plant type:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus jenis tanaman.' },
      { status: 500 }
    );
  }
}
