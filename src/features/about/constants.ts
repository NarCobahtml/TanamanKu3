export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  roleId: string;
  roleEn: string;
  focusId: string;
  focusEn: string;
}

// Ubah nama dan peran anggota tim di sini sesuai daftar pengembang proyek
export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'member-1',
    name: 'Anggota Tim 1',
    initials: 'A1',
    roleId: 'Project Lead & Full-Stack',
    roleEn: 'Project Lead & Full-Stack',
    focusId: 'Arsitektur aplikasi Next.js, autentikasi, dan integrasi API.',
    focusEn: 'Next.js application architecture, authentication, and API integration.',
  },
  {
    id: 'member-2',
    name: 'Anggota Tim 2',
    initials: 'A2',
    roleId: 'AI & Computer Vision',
    roleEn: 'AI & Computer Vision',
    focusId: 'Pelatihan model deteksi penyakit daun dan kurasi rekomendasi perawatan.',
    focusEn: 'Leaf disease detection model training and treatment curation.',
  },
  {
    id: 'member-3',
    name: 'Anggota Tim 3',
    initials: 'A3',
    roleId: 'UI/UX & Frontend',
    roleEn: 'UI/UX & Frontend',
    focusId: 'Sistem desain editorial, tata letak responsif, dan pengalaman pengguna.',
    focusEn: 'Editorial design system, responsive layout, and user experience.',
  },
  {
    id: 'member-4',
    name: 'Anggota Tim 4',
    initials: 'A4',
    roleId: 'Backend & Database',
    roleEn: 'Backend & Database',
    focusId: 'Skema PostgreSQL/Prisma, manajemen jadwal siram, dan notifikasi.',
    focusEn: 'PostgreSQL/Prisma schema, watering schedule engine, and notifications.',
  },
];
