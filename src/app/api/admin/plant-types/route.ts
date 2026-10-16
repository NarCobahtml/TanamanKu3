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

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Akses ditolak: Hanya administrator yang diizinkan.' },
      { status: 403 }
    );
  }

  try {
    const types = await prisma.plantType.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Hitung jumlah tanaman yang menggunakan masing-masing tipe
    const typesWithCount = await Promise.all(
      types.map(async (t) => {
        const count = await prisma.plant.count({
          where: {
            OR: [
              { type: t.slug },
              { type: t.name },
            ],
          },
        });
        return {
          ...t,
          plantsCount: count,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: typesWithCount,
    });
  } catch (error) {
    console.error('Error fetching admin plant types:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat jenis tanaman dari database' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Akses ditolak: Hanya administrator yang diizinkan.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      name,
      slug: customSlug,
      scientificName,
      defaultIntervalDays = 2,
      waterNeed = 'sedang',
      description = '',
      imageUrl = '',
      icon = '',
    } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nama jenis tanaman wajib diisi.' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const slug = (
      customSlug && typeof customSlug === 'string' && customSlug.trim()
        ? customSlug.trim()
        : trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    ) || `type-${Date.now()}`;

    // Cek duplikasi nama atau slug
    const existing = await prisma.plantType.findFirst({
      where: {
        OR: [{ name: trimmedName }, { slug }],
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `Jenis tanaman dengan nama "${trimmedName}" atau slug "${slug}" sudah ada.`,
        },
        { status: 409 }
      );
    }

    const created = await prisma.plantType.create({
      data: {
        id: `pt-${Date.now()}`,
        name: trimmedName,
        slug,
        scientificName: scientificName?.trim() || null,
        defaultIntervalDays: Number.isInteger(Number(defaultIntervalDays))
          ? Math.max(1, Number(defaultIntervalDays))
          : 2,
        waterNeed: ['rendah', 'sedang', 'tinggi'].includes(waterNeed) ? waterNeed : 'sedang',
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        icon: icon?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...created,
          plantsCount: 0,
        },
        message: `Jenis tanaman "${created.name}" berhasil ditambahkan.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating plant type:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan jenis tanaman ke database' },
      { status: 500 }
    );
  }
}
