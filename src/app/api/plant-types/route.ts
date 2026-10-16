import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const types = await prisma.plantType.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: types,
    });
  } catch (error) {
    console.error('Error fetching plant types:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat daftar jenis tanaman' },
      { status: 500 }
    );
  }
}
