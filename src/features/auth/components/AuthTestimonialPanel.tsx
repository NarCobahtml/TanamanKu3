import { ArrowUpRight, Quote } from "lucide-react";

export function AuthTestimonialPanel() {
  return (
    <div className="relative hidden overflow-hidden lg:block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/figma-assets/hero-plant.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

      <div className="absolute left-8 top-8 grid size-10 place-items-center rounded-lg bg-white/90">
        <Quote className="size-5 text-ink" aria-hidden="true" />
      </div>

      <div className="absolute inset-x-8 bottom-8">
        <p className="max-w-md text-lg leading-relaxed text-white">
          &ldquo;Sekali foto daun, langsung ketahuan penyakitnya dan cara
          menanganinya. Tanaman cabai saya tertolong jauh lebih cepat.&rdquo;
        </p>
        <p className="mt-3 text-sm text-white/85">
          Alex Saputra, Petani cabai, Kediri
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
          tanamanku.id
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
