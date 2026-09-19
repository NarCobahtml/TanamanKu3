'use client';

export interface SettingsSwitchProps {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
}

export function SettingsSwitch({
  checked,
  onCheckedChange,
  label,
}: SettingsSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={
        checked
          ? 'relative h-6 w-11 shrink-0 rounded-full bg-primary transition-colors p-0.5 cursor-pointer'
          : 'relative h-6 w-11 shrink-0 rounded-full bg-secondary border border-border transition-colors p-0.5 cursor-pointer'
      }
    >
      <span
        className={
          checked
            ? 'block h-5 w-5 rounded-full bg-white transition-transform translate-x-5'
            : 'block h-5 w-5 rounded-full bg-white transition-transform'
        }
      />
    </button>
  );
}
