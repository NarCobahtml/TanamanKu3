import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma, pool } from '@/lib/prisma';
import { formatRelativeTime, seedForumPostsIfEmpty } from '@/lib/forum';
import { forumPosts } from '@/features/forum/mock';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, error: 'Anda harus masuk terlebih dahulu untuk berkomentar.' },
        { status: 401 }
      );
    }

    await seedForumPostsIfEmpty();

    let post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      const mockPost = forumPosts.find((p) => p.id === postId);
      if (mockPost) {
        post = await prisma.post.create({
          data: {
            id: mockPost.id,
            title: mockPost.title,
            content: JSON.stringify({
              category: mockPost.category,
              body: mockPost.content ?? [mockPost.excerpt],
              likes: mockPost.likes,
              views: mockPost.views,
              authorName: mockPost.author,
              authorAvatar: mockPost.avatar,
              expert: mockPost.expert,
            }),
            imageUrl: mockPost.image,
          },
        });
      }
    }

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Postingan tidak ditemukan' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { text, replyTo, parentId } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Komentar tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Verify or ensure user exists in database
    const userRes = await pool.query(
      'SELECT id, name, "photoUrl" FROM "User" WHERE id = $1',
      [authUser.id]
    );
    let authorProfile = userRes.rows[0];
    let validAuthorId: string | null = authorProfile ? authUser.id : null;

    if (!authorProfile) {
      const name =
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email?.split('@')[0] ||
        'Pengguna TanamanKu';
      const photoUrl =
        authUser.user_metadata?.avatar_url ||
        authUser.user_metadata?.picture ||
        null;
      try {
        const newUser = await pool.query(
          `INSERT INTO "User" (id, email, name, "photoUrl", role, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, 'USER', NOW(), NOW())
           ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
           RETURNING id, name, "photoUrl"`,
          [authUser.id, authUser.email || `${authUser.id}@user.local`, name, photoUrl]
        );
        authorProfile = newUser.rows[0];
        validAuthorId = authUser.id;
      } catch (err) {
        console.warn('Could not sync user for comment author:', err);
      }
    }

    // Validate parentId against existing Comment in database to protect FK constraint
    let validParentId: string | null = null;
    if (parentId && typeof parentId === 'string') {
      const parentCheck = await pool.query(
        'SELECT id FROM "Comment" WHERE id = $1',
        [parentId]
      );
      if (parentCheck.rows.length > 0) {
        validParentId = parentId;
      }
    }

    const commentId = 'cm_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
    const contentPayload = JSON.stringify({
      text: text.trim(),
      replyTo: replyTo || undefined,
      parentId: parentId || undefined,
    });

    const insertRes = await pool.query(
      `INSERT INTO "Comment" ("id", "postId", "authorId", "parentId", "content", "isApproved", "createdAt")
       VALUES ($1, $2, $3, $4, $5, true, NOW())
       RETURNING *`,
      [commentId, postId, validAuthorId, validParentId, contentPayload]
    );
    const comment = insertRes.rows[0];

    const formattedComment = {
      id: comment.id,
      authorId: comment.authorId || authUser.id,
      author: authorProfile?.name || 'Pengguna TanamanKu',
      avatar: authorProfile?.photoUrl || undefined,
      time: formatRelativeTime(comment.createdAt),
      text: text.trim(),
      replyTo: replyTo || undefined,
      parentId: parentId || undefined,
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedComment,
        message: 'Komentar berhasil dikirim!',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error posting comment to database:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menambahkan komentar' },
      { status: 500 }
    );
  }
}
