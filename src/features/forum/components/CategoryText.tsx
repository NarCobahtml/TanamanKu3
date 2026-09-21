'use client';

import { useTranslations } from 'next-intl';

export const CATEGORY_KEY: Record<string, string> = {
  'Hama & Penyakit': 'hama',
  Perawatan: 'perawatan',
  Nutrisi: 'nutrisi',
  'Tanya Ahli': 'tanyaAhli',
};

/** Category text translated; fallback raw string. */
export function CategoryText({ category }: { category: string }) {
  const t = useTranslations('forum');
  const tc = useTranslations('common');
  const k = CATEGORY_KEY[category];
  return <>{k ? k === 'tanyaAhli' ? tc(k) : t(k) : category}</>;
}
