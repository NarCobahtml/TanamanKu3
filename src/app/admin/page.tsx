import type { Metadata } from 'next';
import AdminDashboard from '@/features/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Console - TanamanKu',
  description: 'Panel admin front-end TanamanKu untuk manajemen pengguna, diagnostik penyakit tanaman, dan moderasi forum.',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
