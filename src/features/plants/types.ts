export type KategoriTanaman = 'Indoor' | 'Outdoor' | 'Kebun';
export type StatusSiram = 'hari-ini' | 'terlambat' | 'terjadwal';

export interface Tanaman {
  id: string; // ID string numerik unik
  nama: string;
  jenis?: string;
  kategori: KategoriTanaman;
  status: StatusSiram;
  nextWater: string;
  photo?: string;
  notes?: string | null;
  userId?: string | null;
}
