import Link from 'next/link';
import TkRevealClient from './tk-reveal-client';

export default function CtaBand() {
  return (
    <section className="bg-background py-28 sm:py-36 px-6">
      <TkRevealClient>
        <div className="max-w-[1200px] mx-auto flex flex-col items-center">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-[-0.03em] leading-[1.05] text-ink max-w-3xl mx-auto text-center">
            Siap tahu apa yang terjadi pada tanamanmu?
          </h2>
          <p className="mt-6 text-ink/70 text-center max-w-md mx-auto">
            Daftar gratis dan dapatkan 5 scan pertama tanpa biaya.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link
              href="/register"
              className="bg-primary hover:bg-[#123526] text-white text-base font-semibold px-8 py-4 rounded-full transition-all hover:scale-[1.03] active:scale-95"
            >
              Mulai Sekarang
            </Link>
            <Link
              href="/login"
              className="border border-background hover:border-primary text-ink text-base font-medium px-8 py-4 rounded-full transition-colors"
            >
              Sudah punya akun? Masuk
            </Link>
          </div>
        </div>
      </TkRevealClient>
    </section>
  );
}
