import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { getSystemSettings, saveSystemSettings } from '@/lib/admin-settings';

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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

  const settings = getSystemSettings();
  return NextResponse.json({ success: true, data: settings });
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
    const { allowRegistration, maintenanceMode } = body;

    const updated = saveSystemSettings({
      ...(typeof allowRegistration === 'boolean' ? { allowRegistration } : {}),
      ...(typeof maintenanceMode === 'boolean' ? { maintenanceMode } : {}),
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Pengaturan sistem berhasil diperbarui.',
    });
  } catch (error) {
    console.error('Save admin settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui pengaturan sistem.' },
      { status: 500 }
    );
  }
}
