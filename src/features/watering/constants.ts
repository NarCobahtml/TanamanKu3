import { AlertTriangle, Check, Cloud, CloudRain, CloudSun, Sun, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SlotStatus } from './types';

/* Data bersama, konten SAMA untuk desktop & mobile (sumber: tumbuhkita #1) */
export const weatherNum = { temp: '27°C', tempRange: '27°C / 26°C', sunset: '17:30', humidity: '53%' };

export const timeSlots: Array<{ time: string; status: SlotStatus }> = [
  { time: 'Now', status: 'unfavourable' },
  { time: '4 PM', status: 'unfavourable' },
  { time: '5 PM', status: 'unfavourable' },
  { time: '6 PM', status: 'moderate' },
  { time: '7 PM', status: 'optimal' },
];

export const forecast: Array<{ day: string; temp: string; icon: LucideIcon }> = [
  { day: 'sel', temp: '27°C', icon: CloudSun },
  { day: 'rab', temp: '27°C', icon: CloudSun },
  { day: 'kam', temp: '27°C', icon: Cloud },
  { day: 'jum', temp: '27°C', icon: CloudRain },
  { day: 'sab', temp: '27°C', icon: CloudRain },
  { day: 'min', temp: '26°C', icon: Cloud },
  { day: 'sen', temp: '28°C', icon: Sun },
];

export const slotVisual: Record<SlotStatus, { icon: LucideIcon; chip: string; text: string }> = {
  optimal: { icon: Check, chip: 'border-primary/30 bg-primary/10', text: 'text-primary' },
  moderate: { icon: AlertTriangle, chip: 'border-ink/15 bg-ink/10', text: 'text-ink/70' },
  unfavourable: { icon: X, chip: 'border-destructive/30 bg-destructive/10', text: 'text-destructive' },
};
