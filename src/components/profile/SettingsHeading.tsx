'use client';

export interface SettingsHeadingProps {
  title: string;
  desc?: string;
}

export function SettingsHeading({ title, desc }: SettingsHeadingProps) {
  return (
    <div>
      <h2 className="text-base sm:text-lg font-bold tracking-tight">{title}</h2>
      {desc && <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">{desc}</p>}
    </div>
  );
}
