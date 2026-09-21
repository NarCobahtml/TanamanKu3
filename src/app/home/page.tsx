'use client';

import AppShell from '@/components/layout/AppShell';
import HomePage from '@/features/dashboard/HomePage';

export default function Page() {
  return (
    <AppShell>
      <HomePage />
    </AppShell>
  );
}
