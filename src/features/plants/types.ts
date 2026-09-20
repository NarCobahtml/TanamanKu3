export type KategoriTanaman = 'Indoor' | 'Outdoor' | 'Kebun';
export type StatusSiram = 'hari-ini' | 'terlambat' | 'terjadwal';

export interface Tanaman {
  id: string; // pure numeric ID string e.g. "1", "2", "1789701234567"
  nama: string;
  jenis?: string;
  kategori: KategoriTanaman;
  status: StatusSiram;
  nextWater: string;
  photo?: string;
  notes?: string | null;
  userId?: string | null;
}
