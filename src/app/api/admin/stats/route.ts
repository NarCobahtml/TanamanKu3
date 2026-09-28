import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [userCount, plantCount, postCount, scanCount] = await Promise.all([
      prisma.user.count(),
      prisma.plant.count(),
      prisma.post.count(),
      prisma.scanRecord.count(),
    ]);

    // Fetch real users from Supabase DB
    const dbUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        _count: {
          select: {
            posts: true,
            plants: true,
            scanRecords: true,
          },
        },
      },
    });

    const formattedUsers = dbUsers.map((u) => {
      const d = new Date(u.createdAt);
      const joinDate = d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      return {
        id: u.id.slice(0, 10),
        fullId: u.id,
        name: u.name || 'Pengguna',
        email: u.email,
        plan: (u.role === 'ADMIN' ? 'Pro' : 'Gratis') as 'Gratis' | 'Pro',
        postsCount: u._count.posts,
        joinDate,
        status: 'Aktif' as const,
        lastActive: 'Baru saja',
      };
    });

    // Fetch recent posts for moderation table
    const dbPosts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        author: {
          select: { name: true, email: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    const formattedModerations = dbPosts.map((p, idx) => {
      const d = new Date(p.createdAt);
      const date = d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      let category = 'Perawatan';
      let snippet = p.content;
      try {
        if (p.content.startsWith('{')) {
          const parsed = JSON.parse(p.content);
          category = parsed.category || 'Perawatan';
          snippet = Array.isArray(parsed.body) ? parsed.body[0] : parsed.body;
        }
      } catch {
        // fallback
      }

      return {
        id: p.id,
        postTitle: p.title,
        author: p.author?.name || 'Komunitas',
        authorEmail: p.author?.email || 'user@tumbuhkita.id',
        reportReason: idx === 0 ? 'Konten terindikasi berulang' : 'Verifikasi ahli disarankan',
        reportsCount: p.isApproved ? 0 : 1,
        category,
        date,
        snippet: typeof snippet === 'string' ? snippet.slice(0, 80) + '...' : p.title,
        status: (p.isApproved ? 'Diselesaikan' : 'Perlu Tindakan') as 'Perlu Tindakan' | 'Diselesaikan' | 'Diabaikan',
      };
    });

    const adminStats = [
      {
        title: 'Total Pengguna',
        value: userCount.toLocaleString('id-ID'),
        change: '+100% aktif',
        isPositive: true,
        period: 'terdaftar di sistem',
        iconName: 'Users',
      },
      {
        title: 'Total Tanaman Dirawat',
        value: plantCount.toLocaleString('id-ID'),
        change: '+100% terpantau',
        isPositive: true,
        period: 'dalam basis data',
        iconName: 'CreditCard',
      },
      {
        title: 'Total Diskusi Forum',
        value: postCount.toLocaleString('id-ID'),
        change: 'aktif berkembang',
        isPositive: true,
        period: 'topik komunitas',
        iconName: 'MessageSquare',
      },
      {
        title: 'Total Diagnosis AI',
        value: scanCount.toLocaleString('id-ID'),
        change: 'hasil tersimpan',
        isPositive: true,
        period: 'riwayat pemindaian',
        iconName: 'AlertTriangle',
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        stats: adminStats,
        users: formattedUsers,
        moderations: formattedModerations,
        counts: {
          userCount,
          plantCount,
          postCount,
          scanCount,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat statistik admin dari database' },
      { status: 500 }
    );
  }
}
