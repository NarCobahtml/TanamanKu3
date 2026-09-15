import Link from 'next/link';

/**
 * Ink CTA band closing long pages, pattern from landing cta-band.tsx.
 * Green identity band, Playfair accent heading, rounded-full buttons.
 */
export function PageCtaBand({
  heading,
  accent,
  description,
  primary,
  secondary,
}: {
  heading: string;
  /** Phrase inside `heading` rendered as Playfair italic. */
  accent?: string;
  description?: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  const parts = accent && heading.includes(accent)
    ? [
        heading.slice(0, heading.indexOf(accent)),
        heading.slice(heading.indexOf(accent), heading.indexOf(accent) + accent.length),
        heading.slice(heading.indexOf(accent) + accent.length),
      ]
    : null;

  return (
    <section className="ink-panel mt-20">
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 md:py-28">
        <h2 className="mx-auto max-w-3xl text-3xl font-extrabold leading-[1.08] tracking-[-0.03em] text-white md:text-5xl">
          {parts ? (
            <>
              {parts[0]}
              <span className="font-playfair">{parts[1]}</span>
              {parts[2]}
            </>
          ) : (
            heading
          )}
        </h2>
        {description && (
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-white/80">
            {description}
          </p>
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href={primary.href}
            className="inline-flex h-12 items-center rounded-full bg-white px-8 text-base font-semibold text-[#123526] transition-all hover:scale-[1.03] hover:bg-primary/10 active:scale-95"
          >
            {primary.label}
          </Link>
          {secondary && (
            <Link
              href={secondary.href}
              className="inline-flex h-12 items-center rounded-full border border-white/25 px-8 text-base font-medium text-white transition-colors hover:border-white/60 hover:bg-white/10"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
