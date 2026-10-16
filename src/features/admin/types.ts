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
  fullId?: string;
  name: string;
  email: string;
  role?: string;
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

export interface ActivityLogItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  type: "user" | "mod" | "system" | "payment";
}

export interface PlantTypeItem {
  id: string;
  name: string;
  slug: string;
  scientificName?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  defaultIntervalDays: number;
  waterNeed?: string | null;
  plantsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}


