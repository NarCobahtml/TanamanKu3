import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/home';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const authUser = data.user;
      const normalizedEmail = authUser.email?.trim().toLowerCase();

      if (normalizedEmail) {
        // Sync user profile to public.User in Prisma
        let user = await prisma.user.findUnique({
          where: { id: authUser.id },
        });

        if (!user) {
          user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });
        }

        const rawName =
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          authUser.user_metadata?.custom_claims?.global_name ||
          '';
        const displayName = rawName || normalizedEmail.split('@')[0];
        const photoUrl =
          authUser.user_metadata?.avatar_url ||
          authUser.user_metadata?.picture ||
          null;

        if (!user) {
          await prisma.user.create({
            data: {
              id: authUser.id,
              email: normalizedEmail,
              name: displayName,
              passwordHash: '',
              photoUrl,
              role: 'USER',
            },
          });
        } else {
          const updateData: { photoUrl?: string; name?: string } = {};
          if (!user.photoUrl && photoUrl) updateData.photoUrl = photoUrl;
          if ((!user.name || user.name.includes('@')) && displayName) updateData.name = displayName;
          if (Object.keys(updateData).length > 0) {
            await prisma.user.update({
              where: { id: user.id },
              data: updateData,
            });
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If code exchange failed or no code present, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
