import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { seedScanDataIfEmpty, formatScanRecord } from '@/lib/scan';

export async function GET() {
  try {
    // Ensure initial disease & scan entries are present in PostgreSQL
    await seedScanDataIfEmpty();

    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch {
      // Unauthenticated / guest mode
    }

    // If authenticated, fetch scans belonging to user or global demo scans
    const records = await prisma.scanRecord.findMany({
      where: userId ? { OR: [{ userId }, { id: { startsWith: 'scan-' } }] } : undefined,
      include: {
        disease: true,
        plant: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const formatted = records.map(formatScanRecord);

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Error fetching scan history:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil riwayat scan dari database' },
      { status: 500 }
    );
  }
}
