import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { uploadToStorage } from '@/lib/storage';
import { resolveDiseaseForClass, formatScanRecord } from '@/lib/scan';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { class: scanClass, confidence = 0.95, photo, plantId } = body;

    if (!scanClass) {
      return NextResponse.json(
        { success: false, error: 'Kelas tanaman/penyakit wajib disertakan' },
        { status: 400 }
      );
    }

    // 1. Resolve User (Wajib Login)
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, error: 'Anda harus masuk terlebih dahulu untuk menyimpan hasil scan.' },
        { status: 401 }
      );
    }

    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: authUser.id }, { email: authUser.email || '' }],
      },
    });

    if (!dbUser) {
      const metaName =
        authUser.user_metadata?.name ||
        authUser.user_metadata?.full_name ||
        authUser.email?.split('@')[0] ||
        'Pengguna TanamanKu';

      dbUser = await prisma.user.create({
        data: {
          id: authUser.id,
          email: authUser.email || `user-${authUser.id}@tumbuhkita.id`,
          name: metaName,
          passwordHash: '',
          role: 'USER',
          subscriptionTier: 'FREE',
          scanQuotaUsed: 0,
        },
      });
    }

    const userId = dbUser.id;

    // 2. Resolve / Upsert Disease in database
    const diseaseData = resolveDiseaseForClass(scanClass);
    const disease = await prisma.disease.upsert({
      where: { id: diseaseData.id },
      update: {
        name: diseaseData.name,
        scientificName: diseaseData.scientificName,
        description: diseaseData.description,
        treatment: diseaseData.treatment,
        prevention: diseaseData.prevention,
        plantType: diseaseData.plantType,
      },
      create: diseaseData,
    });

    // 3. Handle photo upload if base64
    let imageUrl = '/figma-assets/plant-monstera.png';
    if (typeof photo === 'string' && photo.startsWith('data:image/')) {
      try {
        const matches = photo.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');

          // Validasi ukuran maksimal 5MB
          if (buffer.length > 5 * 1024 * 1024) {
            return NextResponse.json(
              { success: false, error: 'Ukuran foto maksimal 5MB.' },
              { status: 400 }
            );
          }

          let ext = 'jpg';
          if (mimeType.includes('png')) ext = 'png';
          else if (mimeType.includes('webp')) ext = 'webp';

          const fileName = `scan-${Date.now()}.${ext}`;
          const filePath = `scans/${userId}/${fileName}`;

          imageUrl = await uploadToStorage({
            fileBuffer: buffer,
            filePath,
            contentType: mimeType,
          });
        }
      } catch (uploadErr) {
        console.warn('Failed to upload scan image to Supabase Storage, using fallback:', uploadErr);
      }
    } else if (typeof photo === 'string' && photo.trim()) {
      imageUrl = photo.trim();
    }

    // 4. Create ScanRecord in PostgreSQL
    const scanRecord = await prisma.scanRecord.create({
      data: {
        id: `scan-${Date.now()}`,
        userId,
        plantId: plantId || null,
        diseaseId: disease.id,
        imageUrl,
        confidence: typeof confidence === 'number' ? confidence : parseFloat(confidence) || 0.95,
        status: 'BERHASIL',
      },
      include: {
        disease: true,
        plant: true,
      },
    });

    const formatted = formatScanRecord(scanRecord);

    return NextResponse.json(
      {
        success: true,
        data: formatted,
        message: 'Hasil scan berhasil disimpan ke riwayat!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving scan record to database:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan hasil diagnosis ke database' },
      { status: 500 }
    );
  }
}
