'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

export function ExpertBadge() {
  const t = useTranslations('forum');
  return <Badge variant="outline" className="border-primary/30 bg-accent text-primary">{t('ahliTanaman')}</Badge>;
}
