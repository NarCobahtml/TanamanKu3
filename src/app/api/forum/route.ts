import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { uploadToStorage } from '@/lib/storage';
import { formatForumPost, seedForumPostsIfEmpty, extractHashtags } from '@/lib/forum';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    const tag = searchParams.get('tag');

    // Ensure database has initial community posts if freshly started
    await seedForumPostsIfEmpty();

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, photoUrl: true, role: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, photoUrl: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    let formatted = posts.map(formatForumPost);

    if (category && category !== 'Semua') {
      formatted = formatted.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (tag && tag.trim()) {
      const cleanTag = tag.trim().toLowerCase().replace(/^#/, '');
      formatted = formatted.filter((p) => {
        const postTags = (p.tags || []).map((t) => t.toLowerCase().replace(/^#/, ''));
        const text = `${p.title} ${p.excerpt} ${(p.content || []).join(' ')}`.toLowerCase();
        return (
          postTags.includes(cleanTag) ||
          text.includes(`#${cleanTag}`) ||
          text.includes(cleanTag)
        );
      });
    }

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      const cleanQ = q.replace(/^#/, '');
      formatted = formatted.filter((p) => {
        const postTags = (p.tags || []).map((t) => t.toLowerCase().replace(/^#/, ''));
        const text = `${p.title} ${p.excerpt} ${p.author} ${p.category} ${(p.content || []).join(' ')}`.toLowerCase();
        return (
          text.includes(q) ||
          text.includes(cleanQ) ||
          postTags.some((t) => t.includes(cleanQ))
        );
      });
    }

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data forum dari database' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, error: 'Anda harus masuk terlebih dahulu untuk membuat postingan.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, category = 'Perawatan', image, tags } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Judul postingan wajib diisi.' },
        { status: 400 }
      );
    }

    if (!content || (Array.isArray(content) ? content.length === 0 : !content.trim())) {
      return NextResponse.json(
        { success: false, error: 'Isi postingan wajib diisi.' },
        { status: 400 }
      );
    }

    let finalImageUrl: string | null = null;

    // Handle base64 image upload to Supabase Storage if provided
    if (typeof image === 'string' && image.startsWith('data:image/')) {
      try {
        const matches = image.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');

          let ext = 'jpg';
          if (mimeType.includes('png')) ext = 'png';
          else if (mimeType.includes('webp')) ext = 'webp';

          const fileName = `forum-${Date.now()}.${ext}`;
          const filePath = `forum/${authUser.id}/${fileName}`;

          finalImageUrl = await uploadToStorage({
            fileBuffer: buffer,
            filePath,
            contentType: mimeType,
          });
        }
      } catch (uploadErr) {
        console.warn('Failed to upload forum image to Supabase Storage:', uploadErr);
      }
    } else if (typeof image === 'string' && image.startsWith('http')) {
      finalImageUrl = image;
    }

    const bodyArray = Array.isArray(content)
      ? content.map((s) => String(s).trim()).filter(Boolean)
      : [content.trim()];

    const textToScan = `${title.trim()} ${bodyArray.join(' ')}`;
    const extractedTags = extractHashtags(textToScan);
    const explicitTags = Array.isArray(tags) ? tags.map((t: string) => String(t).replace(/^#/, '').toLowerCase()) : [];
    const combinedTags = Array.from(new Set([...explicitTags, ...extractedTags]));

    const newPost = await prisma.post.create({
      data: {
        id: `post-${Date.now()}`,
        title: title.trim(),
        imageUrl: finalImageUrl,
        authorId: authUser.id,
        content: JSON.stringify({
          category: category || 'Perawatan',
          body: bodyArray,
          likes: 0,
          views: 1,
          tags: combinedTags,
        }),
      },
      include: {
        author: {
          select: { id: true, name: true, photoUrl: true, role: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, photoUrl: true, role: true },
            },
          },
        },
      },
    });

    const formatted = formatForumPost(newPost);

    return NextResponse.json(
      {
        success: true,
        data: formatted,
        message: 'Postingan berhasil diterbitkan!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating forum post in database:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat postingan di database.' },
      { status: 500 }
    );
  }
}
