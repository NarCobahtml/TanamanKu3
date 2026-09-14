// Konten edukatif per kelas output model Roboflow (resnet34-t1, 4 kelas).
// Akurasi TIDAK di sini — datang dari response Roboflow di runtime.

export type ScanClass =
  | 'Apple___Black_rot'
  | 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot'
  | 'Apple___healthy'
  | 'Corn_(maize)___healthy';

export interface Treatment {
  title: string;
  description: string;
}

export interface ProductRec {
  name: string;
  note: string;
}

export interface ClassContent {
  label: string;
  latin: string;
  pathogen: string | null; // 'Jamur' | null untuk sehat
  healthy: boolean;
  crop: 'Apel' | 'Jagung';
  headline: string; // kalimat peringatan/intro di bawah judul
  aiAnalysis: string;
  symptoms: string[];
  affectedParts: string;
  treatments: Treatment[];
  products: ProductRec[];
}

const npk: ProductRec[] = [
  { name: 'Pupuk NPK Seimbang', note: 'Mendukung pertumbuhan optimal' },
  { name: 'Pupuk Organik Cair', note: 'Menjaga kesuburan tanah secara alami' },
];

export const SCAN_CONTENT: Record<ScanClass, ClassContent> = {
  'Apple___Black_rot': {
    label: 'Busuk Hitam (Black Rot)',
    latin: 'Botryosphaeria obtusa',
    pathogen: 'Jamur',
    healthy: false,
    crop: 'Apel',
    headline:
      'Penyakit ini dapat menyebar cepat pada cuaca hangat dan lembap, serta berpotensi merusak batang dan buah jika dibiarkan. Segera ambil tindakan untuk mencegah penyebaran ke tanaman lain.',
    aiAnalysis:
      'Berdasarkan gambar yang diunggah, AI mendeteksi bercak berwarna cokelat keunguan berbentuk bulat dengan pola cincin konsentris (menyerupai lingkaran target) pada permukaan daun. Pola ini sangat khas untuk infeksi jamur Botryosphaeria obtusa. Keberadaan kayu mati atau buah yang mengering di sekitar tanaman kemungkinan menjadi sumber penyebaran spora.',
    symptoms: ['Bercak cokelat cincin konsentris', 'Tepi daun menguning'],
    affectedParts: 'Daun, buah, dan cabang/ranting',
    treatments: [
      {
        title: 'Pangkas Kayu Mati & Kanker',
        description:
          'Potong dan buang ranting mati atau bagian batang yang menunjukkan kanker (luka lelekuk kecoklatan), karena bagian ini menjadi sumber utama penyebaran spora.',
      },
      {
        title: 'Buang Buah yang Membusuk/Mengering',
        description:
          'Ambil dan musnahkan buah yang membusuk atau mengering (mummified) di pohon maupun yang jatuh, jangan dikomposkan.',
      },
      {
        title: 'Aplikasi Fungisida',
        description:
          'Semprotkan fungisida berbahan aktif captan atau myclobutanil sesuai dosis anjuran, terutama pada awal musim tanam saat tunas mulai muncul.',
      },
    ],
    products: [
      { name: 'Fungisida Captan', note: 'Efektif mencegah penyebaran spora jamur' },
      { name: 'Fungisida Myclobutanil', note: 'Mengendalikan infeksi lanjutan' },
    ],
  },

  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': {
    label: 'Bercak Daun Abu-abu (Gray Leaf Spot)',
    latin: 'Cercospora zeae-maydis',
    pathogen: 'Jamur',
    healthy: false,
    crop: 'Jagung',
    headline:
      'Penyakit ini menyebar cepat pada kondisi lembap dan dapat menyebabkan kehilangan hasil panen signifikan jika menyerang daun bagian atas. Segera ambil tindakan untuk mencegah penyebaran ke tanaman lain.',
    aiAnalysis:
      'Berdasarkan gambar yang diunggah, AI mendeteksi bercak kecil memanjang berwarna abu-abu kecoklatan dengan bentuk persegi panjang mengikuti arah tulang daun. Pola ini sangat khas untuk infeksi jamur Cercospora zeae-maydis. Kelembapan tinggi dan sisa tanaman jagung musim sebelumnya kemungkinan menjadi sumber infeksi.',
    symptoms: ['Bercak abu-abu memanjang', 'Bentuk persegi mengikuti tulang daun'],
    affectedParts: 'Daun bawah & tengah',
    treatments: [
      {
        title: 'Rotasi Tanaman',
        description:
          'Hindari menanam jagung secara terus-menerus di lahan yang sama; gunakan rotasi dengan tanaman lain minimal satu musim untuk memutus siklus jamur.',
      },
      {
        title: 'Bersihkan Sisa Tanaman',
        description:
          'Buang atau benamkan sisa-sisa tanaman jagung dari musim sebelumnya, karena jamur ini bertahan pada residu tanaman yang membusuk di lahan.',
      },
      {
        title: 'Aplikasi Fungisida',
        description:
          'Semprotkan fungisida berbahan aktif strobilurin atau triazole saat gejala awal muncul, terutama pada fase pertumbuhan sebelum berbunga.',
      },
    ],
    products: [
      { name: 'Fungisida Strobilurin', note: 'Efektif untuk infeksi jamur pada fase awal' },
      { name: 'Fungisida Triazole', note: 'Mengendalikan penyebaran lanjutan' },
    ],
  },

  'Apple___healthy': {
    label: 'Tanaman Sehat',
    latin: 'Tidak Ada Patogen Terdeteksi',
    pathogen: null,
    healthy: true,
    crop: 'Apel',
    headline:
      'Tanaman kamu dalam kondisi baik. Tetap pantau secara rutin untuk menjaga kesehatan tanaman dan mendeteksi masalah sejak dini.',
    aiAnalysis:
      'Berdasarkan gambar yang diunggah, AI tidak menemukan tanda-tanda bercak, perubahan warna abnormal, maupun lesi pada permukaan daun. Warna hijau daun merata dan tekstur permukaan terlihat normal, menunjukkan tanaman dalam kondisi pertumbuhan yang sehat.',
    symptoms: ['Warna daun hijau merata', 'Tidak ada bercak atau lesi'],
    affectedParts: 'Daun',
    treatments: [
      {
        title: 'Pertahankan Jadwal Siram',
        description:
          'Lanjutkan jadwal penyiraman yang sudah berjalan, sesuaikan dengan kondisi cuaca agar kelembapan tanah tetap stabil.',
      },
      {
        title: 'Pantau Secara Berkala',
        description:
          'Lakukan scan ulang setiap 1-2 minggu untuk memastikan tidak ada gejala penyakit yang muncul lebih awal.',
      },
      {
        title: 'Pemupukan Rutin',
        description:
          'Berikan pupuk sesuai fase pertumbuhan tanaman untuk mendukung produktivitas dan daya tahan terhadap penyakit.',
      },
    ],
    products: npk,
  },

  'Corn_(maize)___healthy': {
    label: 'Tanaman Sehat',
    latin: 'Tidak Ada Patogen Terdeteksi',
    pathogen: null,
    healthy: true,
    crop: 'Jagung',
    headline:
      'Tanaman kamu dalam kondisi baik. Tetap pantau secara rutin untuk menjaga kesehatan tanaman dan mendeteksi masalah sejak dini.',
    aiAnalysis:
      'Berdasarkan gambar yang diunggah, AI tidak menemukan bercak, garis nekrotik, maupun perubahan warna abnormal pada daun jagung. Struktur daun terlihat utuh dengan warna hijau segar, menandakan tanaman tumbuh dengan baik tanpa gejala infeksi jamur maupun bakteri.',
    symptoms: ['Warna daun hijau segar', 'Struktur daun utuh'],
    affectedParts: 'Daun',
    treatments: [
      {
        title: 'Pertahankan Jadwal Siram',
        description: 'Lanjutkan jadwal penyiraman otomatis yang sudah berjalan sesuai kebutuhan tanaman jagung.',
      },
      {
        title: 'Pantau Secara Berkala',
        description:
          'Lakukan scan ulang secara rutin, terutama menjelang musim hujan saat risiko penyakit daun meningkat.',
      },
      {
        title: 'Jaga Jarak Tanam',
        description:
          'Pastikan jarak antar tanaman cukup untuk sirkulasi udara yang baik, mengurangi risiko kelembapan berlebih penyebab jamur.',
      },
    ],
    products: npk,
  },
};

export function getContent(cls: string): ClassContent | null {
  return (SCAN_CONTENT as Record<string, ClassContent>)[cls] ?? null;
}
