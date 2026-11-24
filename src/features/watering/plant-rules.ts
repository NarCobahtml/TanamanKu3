import type { SlotStatus } from './types';

export interface PlantBotanyProfile {
  category: 'Indoor' | 'Outdoor' | 'Kebun';
  waterNeed: 'low' | 'moderate' | 'high';
  kc: number; // Koefisien penguapan tanaman
  intervalDays: number;
  bestWateringWindow: 'morning' | 'late-afternoon' | 'any-cool';
  rainTolerance: boolean;
  notes: string;
}

export const KNOWN_PLANT_PROFILES: Record<string, Partial<PlantBotanyProfile>> = {
  // Profil kaktus dan sukulen
  'kaktus': { waterNeed: 'low', kc: 0.25, intervalDays: 10, bestWateringWindow: 'morning', rainTolerance: false },
  'lidah mertua': { waterNeed: 'low', kc: 0.3, intervalDays: 7, bestWateringWindow: 'morning', rainTolerance: false },
  'sansiviera': { waterNeed: 'low', kc: 0.3, intervalDays: 7, bestWateringWindow: 'morning', rainTolerance: false },
  'lidah buaya': { waterNeed: 'low', kc: 0.3, intervalDays: 7, bestWateringWindow: 'morning', rainTolerance: false },
  'sukulen': { waterNeed: 'low', kc: 0.25, intervalDays: 10, bestWateringWindow: 'morning', rainTolerance: false },

  // Profil tanaman hias tropis
  'monstera': { waterNeed: 'moderate', kc: 0.7, intervalDays: 3, bestWateringWindow: 'morning', rainTolerance: false },
  'calathea': { waterNeed: 'moderate', kc: 0.75, intervalDays: 2, bestWateringWindow: 'morning', rainTolerance: false },
  'aglaonema': { waterNeed: 'moderate', kc: 0.65, intervalDays: 3, bestWateringWindow: 'morning', rainTolerance: false },
  'philodendron': { waterNeed: 'moderate', kc: 0.7, intervalDays: 3, bestWateringWindow: 'morning', rainTolerance: false },
  'sirih gading': { waterNeed: 'moderate', kc: 0.65, intervalDays: 3, bestWateringWindow: 'any-cool', rainTolerance: true },
  'melati': { waterNeed: 'moderate', kc: 0.75, intervalDays: 2, bestWateringWindow: 'late-afternoon', rainTolerance: true },

  // Profil sayuran buah kebun
  'tomat': { waterNeed: 'high', kc: 1.1, intervalDays: 1, bestWateringWindow: 'morning', rainTolerance: true },
  'cabai': { waterNeed: 'high', kc: 1.0, intervalDays: 1, bestWateringWindow: 'morning', rainTolerance: true },
  'cabe': { waterNeed: 'high', kc: 1.0, intervalDays: 1, bestWateringWindow: 'morning', rainTolerance: true },
  'bayam': { waterNeed: 'high', kc: 1.15, intervalDays: 1, bestWateringWindow: 'morning', rainTolerance: true },
  'selada': { waterNeed: 'high', kc: 1.15, intervalDays: 1, bestWateringWindow: 'morning', rainTolerance: true },
  'terong': { waterNeed: 'high', kc: 1.05, intervalDays: 1, bestWateringWindow: 'morning', rainTolerance: true },
  'ceri': { waterNeed: 'moderate', kc: 0.85, intervalDays: 2, bestWateringWindow: 'late-afternoon', rainTolerance: true },
  'pisang': { waterNeed: 'high', kc: 1.1, intervalDays: 2, bestWateringWindow: 'late-afternoon', rainTolerance: true },
};

export function resolvePlantProfile(name?: string, category?: string, type?: string): PlantBotanyProfile {
  const normName = (name || '').toLowerCase().trim();
  const cat = (category === 'Outdoor' || category === 'Kebun') ? category : 'Indoor';

  // Cocokkan nama jenis tanaman
  let matched: Partial<PlantBotanyProfile> | undefined;
  for (const [key, prof] of Object.entries(KNOWN_PLANT_PROFILES)) {
    if (normName.includes(key)) {
      matched = prof;
      break;
    }
  }

  // Profil default kategori tanaman
  if (!matched) {
    if (type === 'sayuran' || cat === 'Kebun') {
      matched = { waterNeed: 'high', kc: 1.05, intervalDays: 1, bestWateringWindow: 'morning', rainTolerance: true };
    } else if (type === 'buah') {
      matched = { waterNeed: 'moderate', kc: 0.9, intervalDays: 2, bestWateringWindow: 'late-afternoon', rainTolerance: true };
    } else if (cat === 'Outdoor') {
      matched = { waterNeed: 'moderate', kc: 0.8, intervalDays: 2, bestWateringWindow: 'morning', rainTolerance: true };
    } else {
      // Standard indoor foliage
      matched = { waterNeed: 'moderate', kc: 0.65, intervalDays: 3, bestWateringWindow: 'morning', rainTolerance: false };
    }
  }

  return {
    category: cat,
    waterNeed: matched.waterNeed || 'moderate',
    kc: matched.kc ?? 0.7,
    intervalDays: matched.intervalDays ?? 2,
    bestWateringWindow: matched.bestWateringWindow || 'morning',
    rainTolerance: matched.rainTolerance ?? (cat !== 'Indoor'),
    notes: matched.notes || '',
  };
}

export interface HourlySlotEvaluation {
  time: string;
  hour: number;
  temp: number;
  code: number;
  humidity: number;
  status: SlotStatus;
  reason: string;
}

// Evaluasi kelayakan jam penyiraman
export function evaluatePlantHourlySlot(
  hour: number,
  temp: number,
  code: number,
  humidity: number,
  plant: PlantBotanyProfile
): { status: SlotStatus; reason: string } {
  const isRaining = code >= 51;
  const isOutdoor = plant.category === 'Outdoor' || plant.category === 'Kebun';

  // 1. Kondisi hujan luar
  if (isRaining && isOutdoor) {
    return {
      status: 'unfavourable',
      reason: 'Sedang hujan, tanaman outdoor sudah terairi air hujan alami.',
    };
  }

  // 2. Panas terik siang
  if (hour >= 11 && hour <= 14) {
    return {
      status: 'unfavourable',
      reason: 'Matahari terik, evaporasi air terlalu tinggi dan daun berisiko gosong.',
    };
  }

  if (temp >= 33) {
    return {
      status: 'unfavourable',
      reason: 'Suhu lingkungan sangat tinggi (>32°C), hindari penyiraman saat terik.',
    };
  }

  // 3. Waktu larut malam
  if (hour >= 20 || hour < 5) {
    if (plant.category === 'Indoor' || plant.waterNeed === 'low') {
      return {
        status: 'unfavourable',
        reason: 'Malam hari tanpa sirkulasi matahari meningkatkan risiko jamur akar.',
      };
    }
  }

  // 4. Kelembapan tinggi sukulen
  if (plant.waterNeed === 'low' && humidity > 80) {
    return {
      status: 'unfavourable',
      reason: 'Kelembapan udara terlalu tinggi untuk sukulen / kaktus.',
    };
  }

  // 5. Waktu pagi optimal
  if (hour >= 6 && hour <= 8) {
    return {
      status: 'optimal',
      reason: 'Waktu terbaik! Suhu sejuk dan tanaman bersiap menyerap nutrisi fotosintesis.',
    };
  }

  // Jam sore tanaman kebun
  if (hour >= 16 && hour <= 18) {
    if (temp <= 30) {
      return {
        status: 'optimal',
        reason: 'Suhu mulai mendingin menjelang petang, laju evaporasi rendah.',
      };
    }
    return {
      status: 'moderate',
      reason: 'Suhu masih hangat, penyiraman dapat dilakukan perlahan.',
    };
  }

  // 6. Jam cuaca sejuk
  if (hour >= 9 && hour <= 10) {
    if (temp < 29) {
      return {
        status: 'moderate',
        reason: 'Matahari mulai menghangatkan tanah, siram di dekat pangkal akar.',
      };
    }
    return {
      status: 'unfavourable',
      reason: 'Suhu meningkat cepat, lebih disarankan tunda hingga sore hari.',
    };
  }

  // Kondisi tanaman ruangan moderat
  if (plant.category === 'Indoor' && temp <= 28) {
    return {
      status: 'moderate',
      reason: 'Kondisi ruangan cukup stabil untuk penyiraman ringan.',
    };
  }

  return {
    status: 'moderate',
    reason: 'Kondisi cuaca netral.',
  };
}
