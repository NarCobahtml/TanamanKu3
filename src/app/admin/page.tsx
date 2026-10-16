import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import AdminDashboard from '@/features/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Console - TanamanKu',
  description: 'Panel admin front-end TanamanKu untuk manajemen pengguna, diagnostik penyakit tanaman, dan moderasi forum.',
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/admin');
  }

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: user.id },
        ...(user.email ? [{ email: user.email.toLowerCase() }] : []),
      ],
    },
    select: { role: true },
  });

  if (dbUser?.role !== 'ADMIN') {
    redirect('/home');
  }

  return <AdminDashboard />;
}
