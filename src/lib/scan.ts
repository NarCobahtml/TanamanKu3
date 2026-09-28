import { prisma } from '@/lib/prisma';
import { SCAN_CONTENT, type ScanClass } from '@/features/scan/scan-content';

export interface ScanHistoryItem {
  id: string;
  plant: string;
  disease: string;
  date: string;
  accuracy: number;
  status: 'sehat' | 'terinfeksi';
  photo?: string;
  createdAt: string;
}

// In-memory cache flag to avoid querying count on every single request
let isScanSeeded = false;

const MOCK_DISEASES = [
  {
    id: 'disease-apple-black-rot',
    name: 'Busuk Hitam (Black Rot)',
    scientificName: 'Botryosphaeria obtusa',
    description: SCAN_CONTENT['Apple___Black_rot'].aiAnalysis,
    treatment: JSON.stringify(SCAN_CONTENT['Apple___Black_rot'].treatments),
    prevention: SCAN_CONTENT['Apple___Black_rot'].headline,
    plantType: 'Apel',
  },
  {
    id: 'disease-corn-gray-leaf-spot',
    name: 'Bercak Daun Abu-abu (Gray Leaf Spot)',
    scientificName: 'Cercospora zeae-maydis',
    description: SCAN_CONTENT['Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot'].aiAnalysis,
    treatment: JSON.stringify(SCAN_CONTENT['Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot'].treatments),
    prevention: SCAN_CONTENT['Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot'].headline,
    plantType: 'Jagung',
  },
  {
    id: 'disease-apple-healthy',
    name: 'Tanaman Sehat',
    scientificName: 'Malus domestica',
    description: SCAN_CONTENT['Apple___healthy'].aiAnalysis,
    treatment: JSON.stringify(SCAN_CONTENT['Apple___healthy'].treatments),
    prevention: SCAN_CONTENT['Apple___healthy'].headline,
    plantType: 'Apel',
  },
  {
    id: 'disease-corn-healthy',
    name: 'Tanaman Sehat',
    scientificName: 'Zea mays',
    description: SCAN_CONTENT['Corn_(maize)___healthy'].aiAnalysis,
    treatment: JSON.stringify(SCAN_CONTENT['Corn_(maize)___healthy'].treatments),
    prevention: SCAN_CONTENT['Corn_(maize)___healthy'].headline,
    plantType: 'Jagung',
  },
  {
    id: 'disease-chili-phytophthora',
    name: 'Busuk Daun (Phytophthora)',
    scientificName: 'Phytophthora capsici',
    description: 'Bercak busuk basah kehitaman pada daun dan batang tanaman cabai, menyebar cepat saat curah hujan tinggi.',
    treatment: 'Pangkas bagian tanaman yang terinfeksi dan semprotkan fungisida tembaga hidroksida.',
    prevention: 'Perbaiki drainase tanah dan hindari penyiraman langsung ke daun.',
    plantType: 'Cabai Rawit',
  },
  {
    id: 'disease-tomat-sehat',
    name: 'Sehat, tidak ada gejala',
    scientificName: 'Solanum lycopersicum',
    description: 'Kondisi tanaman tomat sangat prima tanpa tanda defisiensi maupun serangan patogen.',
    treatment: 'Lanjutkan perawatan dan pemupukan berkala.',
    prevention: 'Penyiraman teratur pada pangkal tanaman.',
    plantType: 'Tomat Ceri',
  },
  {
    id: 'disease-monstera-sehat',
    name: 'Sehat, tidak ada gejala',
    scientificName: 'Monstera deliciosa',
    description: 'Daun hijau mengkilap dengan fenestrasi optimal, bebas hama tungau atau kutu daun.',
    treatment: 'Bersihkan debu daun dengan kain lembap secara rutin.',
    prevention: 'Jaga kelembapan udara ruangan dan letakkan di tempat dengan cahaya tidak langsung.',
    plantType: 'Monstera Deliciosa',
  },
  {
    id: 'disease-lidahmertua-xanthomonas',
    name: 'Bercak Bakteri (Xanthomonas)',
    scientificName: 'Xanthomonas campestris',
    description: 'Bercak berair kekuningan hingga cokelat pada helai daun tebal lidah mertua.',
    treatment: 'Potong helai daun yang sakit menggunakan gunting steril dan semprot bakterisida.',
    prevention: 'Kurangi intensitas penyiraman, biarkan media tanam kering sebelum disiram kembali.',
    plantType: 'Lidah Mertua',
  },
  {
    id: 'disease-calathea-sehat',
    name: 'Sehat, tidak ada gejala',
    scientificName: 'Calathea orbifolia',
    description: 'Pola garis daun tegas dan segar tanpa tanda tepi daun mengering (crispy edges).',
    treatment: 'Gunakan air yang telah diendapkan untuk penyiraman.',
    prevention: 'Hindari paparan sinar matahari langsung yang menyengat.',
    plantType: 'Calathea Orbifolia',
  },
];

const INITIAL_MOCK_SCANS = [
  {
    id: 'scan-1',
    diseaseId: 'disease-chili-phytophthora',
    imageUrl: '/figma-assets/plant-chili.jpg',
    confidence: 0.94,
    status: 'BERHASIL' as const,
    createdAt: new Date('2026-09-01T10:00:00Z'),
  },
  {
    id: 'scan-2',
    diseaseId: 'disease-tomat-sehat',
    imageUrl: '',
    confidence: 0.98,
    status: 'BERHASIL' as const,
    createdAt: new Date('2026-08-30T14:30:00Z'),
  },
  {
    id: 'scan-3',
    diseaseId: 'disease-monstera-sehat',
    imageUrl: '/figma-assets/plant-monstera.png',
    confidence: 0.96,
    status: 'BERHASIL' as const,
    createdAt: new Date('2026-08-27T09:15:00Z'),
  },
  {
    id: 'scan-4',
    diseaseId: 'disease-lidahmertua-xanthomonas',
    imageUrl: '/figma-assets/plant-lidahmertua.jpg',
    confidence: 0.91,
    status: 'BERHASIL' as const,
    createdAt: new Date('2026-08-25T16:45:00Z'),
  },
  {
    id: 'scan-5',
    diseaseId: 'disease-calathea-sehat',
    imageUrl: '/figma-assets/plant-calathea-figma.jpg',
    confidence: 0.97,
    status: 'BERHASIL' as const,
    createdAt: new Date('2026-08-22T11:20:00Z'),
  },
];

export async function seedScanDataIfEmpty() {
  if (isScanSeeded) return;

  try {
    // 1. Seed Diseases
    const diseaseCount = await prisma.disease.count();
    if (diseaseCount === 0) {
      for (const d of MOCK_DISEASES) {
        await prisma.disease.upsert({
          where: { id: d.id },
          update: {},
          create: d,
        });
      }
    }

    // 2. Seed ScanRecords if table is empty
    const scanCount = await prisma.scanRecord.count();
    if (scanCount === 0) {
      let seedUser = await prisma.user.findFirst();
      if (!seedUser) {
        seedUser = await prisma.user.create({
          data: {
            id: 'demo-user',
            email: 'demo@tumbuhkita.id',
            name: 'Pengguna Demo',
            passwordHash: '',
            role: 'USER',
          },
        });
      }

      for (const s of INITIAL_MOCK_SCANS) {
        await prisma.scanRecord.create({
          data: {
            id: s.id,
            userId: seedUser.id,
            diseaseId: s.diseaseId,
            imageUrl: s.imageUrl,
            confidence: s.confidence,
            status: s.status,
            createdAt: s.createdAt,
          },
        });
      }
    }

    isScanSeeded = true;
  } catch (error) {
    console.error('Error seeding initial scan data:', error);
  }
}

export function formatScanRecord(record: {
  id: string;
  createdAt: Date;
  confidence: number | null;
  imageUrl: string;
  plant?: { name: string } | null;
  disease?: { name: string; plantType: string | null; scientificName: string | null } | null;
}): ScanHistoryItem {
  const plantName =
    record.plant?.name ||
    record.disease?.plantType ||
    'Tanaman';

  const diseaseName = record.disease?.name || 'Sehat, tidak ada gejala';
  const isHealthy =
    diseaseName.toLowerCase().includes('sehat') ||
    diseaseName.toLowerCase().includes('tidak ada patogen');

  const accuracy = Math.round((record.confidence ?? 0.95) * 100);

  const dateObj = new Date(record.createdAt);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const dateFormatted = `${day}.${month}.${year}`;

  return {
    id: record.id,
    plant: plantName,
    disease: diseaseName,
    date: dateFormatted,
    accuracy,
    status: isHealthy ? 'sehat' : 'terinfeksi',
    photo: record.imageUrl && record.imageUrl.trim() ? record.imageUrl : undefined,
    createdAt: record.createdAt.toISOString(),
  };
}

export function resolveDiseaseForClass(className: string) {
  const content = SCAN_CONTENT[className as ScanClass];
  if (!content) {
    return {
      id: `disease-${className.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: className,
      scientificName: null,
      description: 'Hasil deteksi scan AI',
      treatment: 'Pantau perkembangan tanaman.',
      prevention: 'Lakukan perawatan rutin.',
      plantType: 'Tanaman',
    };
  }

  const idMap: Record<ScanClass, string> = {
    'Apple___Black_rot': 'disease-apple-black-rot',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': 'disease-corn-gray-leaf-spot',
    'Apple___healthy': 'disease-apple-healthy',
    'Corn_(maize)___healthy': 'disease-corn-healthy',
  };

  return {
    id: idMap[className as ScanClass] || `disease-${className.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: content.label,
    scientificName: content.latin,
    description: content.aiAnalysis,
    treatment: JSON.stringify(content.treatments),
    prevention: content.headline,
    plantType: content.crop,
  };
}
