import TkRevealClient from './tk-reveal-client';

export default function Statement() {
  return (
    <section className="bg-background py-32 sm:py-40 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <TkRevealClient>
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.2em] mb-6">
            Kenapa TanamanKu
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-[-0.03em] leading-[1.05] text-ink">
            Tanaman tidak pernah sakit tiba-tiba.
          </h2>
          <p className="mt-8 text-base sm:text-lg text-ink/70 leading-relaxed max-w-2xl mx-auto">
            Penyakit berkembang berhari-hari sebelum gejala terlihat jelas. Ketika daun mulai rontok,
            sering sudah terlambat. TanamanKu bekerja di fase paling awal: saat mata manusia belum
            curiga.
          </p>
        </TkRevealClient>
      </div>
    </section>
  );
}
