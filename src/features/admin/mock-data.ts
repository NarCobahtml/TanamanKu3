export interface AdminStat {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  period: string;
  iconName: string;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  plan: "Gratis" | "Pro";
  postsCount: number;
  joinDate: string;
  status: "Aktif" | "Ditangguhkan";
  lastActive: string;
}

export interface ModerationItem {
  id: string;
  postTitle: string;
  author: string;
  authorEmail: string;
  reportReason: string;
  reportsCount: number;
  category: string;
  date: string;
  snippet: string;
  status: "Perlu Tindakan" | "Diselesaikan" | "Diabaikan";
}

export interface TransactionItem {
  id: string;
  userName: string;
  userEmail: string;
  plan: string;
  amount: number;
  method: string;
  date: string;
  status: "Berhasil" | "Menunggu" | "Gagal";
}

export interface ForumCategoryStat {
  name: string;
  postsCount: number;
  percentage: number;
  color: string;
}

export const adminStats: AdminStat[] = [
  {
    title: "Total Pengguna",
    value: "14.280",
    change: "+12,5%",
    isPositive: true,
    period: "dari bulan lalu",
    iconName: "Users",
  },
  {
    title: "Pendapatan (MRR)",
    value: "Rp 42.850.000",
    change: "+18,2%",
    isPositive: true,
    period: "dari bulan lalu",
    iconName: "CreditCard",
  },
  {
    title: "Total Diskusi Forum",
    value: "5.420",
    change: "+16,2%",
    isPositive: true,
    period: "vs minggu lalu",
    iconName: "MessageSquare",
  },
  {
    title: "Laporan Perlu Tindakan",
    value: "2",
    change: "1 baru hari ini",
    isPositive: false,
    period: "antrean moderasi",
    iconName: "AlertTriangle",
  },
];

export const forumCategoryStats: ForumCategoryStat[] = [
  {
    name: "Hama & Masalah Perawatan",
    postsCount: 2180,
    percentage: 40,
    color: "bg-emerald-600",
  },
  {
    name: "Tips & Panduan Tumbuh",
    postsCount: 1620,
    percentage: 30,
    color: "bg-primary",
  },
  {
    name: "Nutrisi, Tanah & Pupuk",
    postsCount: 980,
    percentage: 18,
    color: "bg-amber-500",
  },
  {
    name: "Diskusi Umum & Komunitas",
    postsCount: 640,
    percentage: 12,
    color: "bg-blue-500",
  },
];

export const initialUsers: UserItem[] = [
  {
    id: "USR-001",
    name: "Alex Saputra",
    email: "alex.saputra@gmail.com",
    plan: "Pro",
    postsCount: 8,
    joinDate: "12 Jan 2026",
    status: "Aktif",
    lastActive: "10 menit lalu",
  },
  {
    id: "USR-002",
    name: "Siti Rahmawati",
    email: "siti.rahma@pertanian.id",
    plan: "Pro",
    postsCount: 23,
    joinDate: "18 Jan 2026",
    status: "Aktif",
    lastActive: "1 jam lalu",
  },
  {
    id: "USR-003",
    name: "Budi Hartono",
    email: "budi.h@kebunku.com",
    plan: "Gratis",
    postsCount: 3,
    joinDate: "02 Feb 2026",
    status: "Aktif",
    lastActive: "Kemarin",
  },
  {
    id: "USR-004",
    name: "Dewi Lestari",
    email: "dewi.lestari@yahoo.co.id",
    plan: "Gratis",
    postsCount: 1,
    joinDate: "14 Feb 2026",
    status: "Ditangguhkan",
    lastActive: "5 hari lalu",
  },
  {
    id: "USR-005",
    name: "Farhan Maulana",
    email: "farhan.m@hidroponik.net",
    plan: "Pro",
    postsCount: 15,
    joinDate: "01 Mar 2026",
    status: "Aktif",
    lastActive: "Baru saja",
  },
  {
    id: "USR-006",
    name: "Rina Wijaya",
    email: "rina.wjy@gmail.com",
    plan: "Gratis",
    postsCount: 5,
    joinDate: "10 Mar 2026",
    status: "Aktif",
    lastActive: "3 jam lalu",
  },
];

export const initialModeration: ModerationItem[] = [
  {
    id: "MOD-101",
    postTitle: "JUAL BIBIT ANGGREK MURAH DISKON 80% KLIK LINK DIBAWAH",
    author: "SpammerBot99",
    authorEmail: "spambot@promo-fake.com",
    reportReason: "Spam & Tautan Ilegal/Promosi",
    reportsCount: 6,
    category: "Lainnya",
    date: "21 Sep 2026 · 09:15",
    snippet:
      "Promo terbatas bibit anggrek hutan asli gratis ongkir seluruh Indonesia chat wa 08129999xxxx diskon gila-gilaan...",
    status: "Perlu Tindakan",
  },
  {
    id: "MOD-102",
    postTitle: "Apakah boleh menyiram media tanam pakai pemutih pakaian?",
    author: "PemulaTani22",
    authorEmail: "pemulatani@gmail.com",
    reportReason: "Informasi Berbahaya & Menyesatkan",
    reportsCount: 4,
    category: "Perawatan",
    date: "20 Sep 2026 · 16:40",
    snippet:
      "Ada tetangga yang bilang pemutih baju bisa membunuh semua jamur di pot, apakah benar aman untuk tanaman?",
    status: "Perlu Tindakan",
  },
  {
    id: "MOD-103",
    postTitle: "Diskusi racun pestisida kimia ilegal dosis tinggi",
    author: "Anonim123",
    authorEmail: "anonim123@proton.me",
    reportReason: "Pelanggaran Regulasi Komunitas",
    reportsCount: 3,
    category: "Hama & Penyakit",
    date: "19 Sep 2026 · 14:10",
    snippet:
      "Saya pakai obat yang dilarang pemerintah ini hasilnya tokcer banget sekali semprot mati semua...",
    status: "Diselesaikan",
  },
  {
    id: "MOD-104",
    postTitle: "Pertanyaan seputar pencahayaan lampu grow light",
    author: "CitraKirana",
    authorEmail: "citra.k@gmail.com",
    reportReason: "Laporan Salah (False Positive)",
    reportsCount: 1,
    category: "Perawatan",
    date: "18 Sep 2026 · 11:25",
    snippet:
      "Mau tanya rekomendasi watt lampu grow light untuk tanaman indoor di kamar tanpa jendela...",
    status: "Diabaikan",
  },
];

export const initialTransactions: TransactionItem[] = [
  {
    id: "TRX-20260921-001",
    userName: "Alex Saputra",
    userEmail: "alex.saputra@gmail.com",
    plan: "TumbuhKita Pro (Bulanan)",
    amount: 19000,
    method: "QRIS Gopay",
    date: "21 Sep 2026 · 11:02",
    status: "Berhasil",
  },
  {
    id: "TRX-20260921-002",
    userName: "Siti Rahmawati",
    userEmail: "siti.rahma@pertanian.id",
    plan: "TumbuhKita Pro (Tahunan)",
    amount: 199000,
    method: "BCA Virtual Account",
    date: "21 Sep 2026 · 10:15",
    status: "Berhasil",
  },
  {
    id: "TRX-20260921-003",
    userName: "Dewi Lestari",
    userEmail: "dewi.lestari@yahoo.co.id",
    plan: "TumbuhKita Pro (Bulanan)",
    amount: 19000,
    method: "Mandiri Virtual Account",
    date: "21 Sep 2026 · 08:50",
    status: "Menunggu",
  },
  {
    id: "TRX-20260920-004",
    userName: "Farhan Maulana",
    userEmail: "farhan.m@hidroponik.net",
    plan: "TumbuhKita Pro (Bulanan)",
    amount: 19000,
    method: "ShopeePay",
    date: "20 Sep 2026 · 19:33",
    status: "Berhasil",
  },
  {
    id: "TRX-20260920-005",
    userName: "Rina Wijaya",
    userEmail: "rina.wjy@gmail.com",
    plan: "TumbuhKita Pro (Bulanan)",
    amount: 19000,
    method: "DANA",
    date: "20 Sep 2026 · 14:12",
    status: "Berhasil",
  },
];

export const platformActivityLogs = [
  {
    id: 1,
    title: "Pembayaran Pro Berhasil",
    desc: "Alex Saputra memperpanjang paket TumbuhKita Pro via QRIS",
    time: "15 menit lalu",
    type: "success",
  },
  {
    id: 2,
    title: "Laporan Konten Baru",
    desc: "Pengguna melaporkan postingan spam promosi di kategori Lainnya",
    time: "45 menit lalu",
    type: "warning",
  },
  {
    id: 3,
    title: "Pendaftaran Akun Baru",
    desc: "12 akun baru terdaftar dalam 1 jam terakhir",
    time: "1 jam lalu",
    type: "info",
  },
  {
    id: 4,
    title: "Backup Data Sistem",
    desc: "Automated backup database forum dan akun berhasil",
    time: "4 jam lalu",
    type: "success",
  },
];
