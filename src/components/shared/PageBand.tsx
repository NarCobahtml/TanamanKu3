import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Judul dengan teks aksen
function TitleAccent({ title, accent }: { title: string; accent?: string }) {
  if (!accent || !title.includes(accent)) return <>{title}</>;
  const i = title.indexOf(accent);
  return (
    <>
      {title.slice(0, i)}
      <span className="font-playfair">{accent}</span>
      {title.slice(i + accent.length)}
    </>
  );
}

// Hero band editorial
export function PageBand({
  title,
  description,
  action,
  children,
  className,
  overline,
  accent,
  tone = 'sage',
  compact = false,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  // Konten tambahan judul
  children?: ReactNode;
  className?: string;
  // Label konteks bagian
  overline?: string;
  // Frasa aksen judul
  accent?: string;
  tone?: 'sage' | 'ink' | 'plain';
  // Band halaman detail
  compact?: boolean;
}) {
  const ink = tone === 'ink';
  return (
    <header
      className={cn('relative w-full border-b border-border', tone === 'sage' && 'sage-wash', ink && 'ink-panel', className)}
    >
      <div
        className={cn(
          'mx-auto w-full max-w-7xl px-4 sm:px-6',
          compact ? 'py-10 md:py-12' : 'py-14 md:py-20',
        )}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="min-w-0 max-w-3xl">
            {overline && <p className={cn('overline', ink && 'text-[#7ed8a4]')}>{overline}</p>}
            <h1
              className={cn(
                'hero-anim hero-fade mt-3 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-5xl',
                ink && 'text-white',
              )}
            >
              <TitleAccent title={title} accent={accent} />
            </h1>
            {description && (
              <p
                className={cn(
                  'hero-anim hero-fade mt-5 max-w-2xl text-base leading-relaxed',
                  ink ? 'text-white/80' : 'text-muted-foreground',
                )}
                style={{ animationDelay: '0.15s' }}
              >
                {description}
              </p>
            )}
          </div>
          {action && (
            <div
              className="hero-anim hero-fade flex shrink-0 flex-wrap items-center gap-2 lg:pb-1.5"
              style={{ animationDelay: '0.3s' }}
            >
              {action}
            </div>
          )}
        </div>
        {children && (
          <div className="hero-anim hero-fade mt-8" style={{ animationDelay: '0.4s' }}>
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
