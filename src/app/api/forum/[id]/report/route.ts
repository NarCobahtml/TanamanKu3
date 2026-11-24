import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { forumPosts as initialMockPosts } from '@/features/forum/mock';

const REPORT_REASONS_MAP: Record<string, string> = {
  spam: 'Spam atau Promosi Ilegal',
  misleading: 'Informasi Sesat / Membahayakan',
  harassment: 'Ujaran Kebencian & Pelecehan',
  offtopic: 'Konten Tidak Relevan (Off-topic)',
  other: 'Alasan Lainnya',
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request);
    const rateCheck = await checkRateLimit(`report:${ip}`, {
      maxAttempts: 20,
      windowMs: 5 * 60 * 1000,
    });

    if (rateCheck.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          error: 'Terlalu banyak permintaan pelaporan. Silakan coba lagi nanti.',
        },
        { status: 429 }
      );
    }

    const { id: postId } = await params;
    let post = await prisma.post.findUnique({
      where: { id: postId },
    });

    // Jika post belum tersinkron di DB namun ada di mock default, sinkronkan ke DB sekarang
    if (!post) {
      const mockPost = initialMockPosts.find((p) => p.id === postId);
      if (mockPost) {
        post = await prisma.post.create({
          data: {
            id: mockPost.id,
            title: mockPost.title,
            imageUrl: mockPost.image || null,
            content: JSON.stringify({
              category: mockPost.category,
              body: mockPost.content || [mockPost.excerpt],
              likes: mockPost.likes || 0,
              views: mockPost.views || 1,
              authorName: mockPost.author,
              authorAvatar: mockPost.avatar,
              expert: mockPost.expert || false,
            }),
          },
        });
      }
    }

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Postingan tidak ditemukan.' },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const reasonKey = typeof body.reason === 'string' ? body.reason.trim() : '';
    const details =
      typeof body.details === 'string' ? body.details.trim().slice(0, 1000) : '';

    if (!reasonKey) {
      return NextResponse.json(
        { success: false, error: 'Alasan pelaporan wajib dipilih.' },
        { status: 400 }
      );
    }

    // Resolusi nama alasan pelaporan
    const reasonLabel = REPORT_REASONS_MAP[reasonKey] || reasonKey;

    // Ambil identitas pengguna login
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    let userId: string | null = null;
    if (authUser) {
      let dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: authUser.id },
            ...(authUser.email ? [{ email: authUser.email.toLowerCase() }] : []),
          ],
        },
        select: { id: true },
      });

      // Jika user belum ada di Prisma, buatkan profilnya agar foreign key valid
      if (!dbUser && authUser.email) {
        try {
          dbUser = await prisma.user.create({
            data: {
              id: authUser.id,
              email: authUser.email.toLowerCase(),
              name:
                authUser.user_metadata?.name ||
                authUser.user_metadata?.full_name ||
                authUser.email.split('@')[0],
              passwordHash: '',
              role: 'USER',
            },
            select: { id: true },
          });
        } catch {
          // Jika terjadi perlombaan kondisi pembuatan user, cari ulang
          dbUser = await prisma.user.findFirst({
            where: {
              OR: [
                { id: authUser.id },
                { email: authUser.email.toLowerCase() },
              ],
            },
            select: { id: true },
          });
        }
      }

      if (dbUser) {
        userId = dbUser.id;

        // Cek laporan ganda pengguna pada postingan yang sama
        const existingReport = await prisma.postReport.findFirst({
          where: { postId: post.id, userId: dbUser.id },
        });

        if (existingReport) {
          return NextResponse.json({
            success: true,
            message: 'Laporan Anda untuk postingan ini sudah tersimpan.',
          });
        }
      }
    }

    // Simpan data laporan baru ke tabel PostReport
    const createdReport = await prisma.postReport.create({
      data: {
        postId: post.id,
        userId,
        reason: reasonLabel,
        details: details || null,
        status: 'PENDING',
      },
    });

    // Tandai status moderasi postingan agar muncul di antrean tindakan admin
    await prisma.post.update({
      where: { id: post.id },
      data: { isApproved: false },
    });

    return NextResponse.json({
      success: true,
      data: createdReport,
      message: 'Laporan berhasil dikirim ke moderator TanamanKu.',
    });
  } catch (error) {
    console.error('Report post error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses laporan.' },
      { status: 500 }
    );
  }
}
