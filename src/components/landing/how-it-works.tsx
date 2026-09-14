import { Camera, ClipboardCheck, ScanLine, ScanSearch } from 'lucide-react';
import TkRevealClient from './tk-reveal-client';

const STEPS = [
  {
    icon: Camera,
    title: 'Ambil foto',
    desc: 'Arahkan kamera ke daun yang mencurigakan. Satu jepretan saja.',
  },
  {
    icon: ScanSearch,
    title: 'AI menganalisis',
    desc: 'Model visi komputer membandingkan foto dengan ribuan pola penyakit yang telah dipelajari.',
  },
  {
    icon: ClipboardCheck,
    title: 'Terima solusi',
    desc: 'Diagnosis, tingkat akurasi, dan langkah perawatan yang bisa langsung dijalankan.',
  },
] as const;

export default function HowItWorks() {
  return (
    <section id="cara-kerja" className="bg-background py-24 sm:py-32 px-6">
      <div className="max-w-[1200px] mx-auto">
        <TkRevealClient>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-[-0.03em] text-ink max-w-2xl">
            Dari foto ke solusi dalam tiga langkah
          </h2>
          <p className="mt-5 text-sm sm:text-base text-ink/70 leading-relaxed max-w-xl">
            Tidak perlu alat khusus, tidak perlu keahlian botani. Semua berjalan dari kamera ponselmu.
          </p>
        </TkRevealClient>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mt-14 items-center">
          <div className="flex flex-col gap-10">
            {STEPS.map((step, i) => (
              <TkRevealClient key={step.title} className={i > 0 ? 'delay-75' : ''}>
                <div className="flex items-start gap-4">
                  <span className="w-12 h-12 rounded-full border border-primary/40 text-primary flex items-center justify-center shrink-0">
                    <step.icon className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-ink">{step.title}</h3>
                    <p className="text-sm text-ink/70 leading-relaxed mt-2 max-w-md">{step.desc}</p>
                  </div>
                </div>
              </TkRevealClient>
            ))}
          </div>

          <TkRevealClient>
            <div className="rounded-md border border-background bg-white overflow-hidden max-w-md mx-auto lg:ml-auto">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-background">
                <ScanLine className="w-4 h-4 text-primary" />
                <span className="text-sm text-ink/70">Hasil Scan</span>
              </div>
              <img
                src="/figma-assets/scanned-leaf.png"
                alt="Hasil scan daun oleh AI"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-semibold text-ink">Embun Tepung</h3>
                  <span className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1">
                    Akurasi 94.7%
                  </span>
                </div>
                <p className="text-sm text-ink/70 leading-relaxed mt-3">
                  Oidium neolycopersici. Semprotkan fungisida berbahan aktif sulfur dan kurangi
                  kelembapan di sekitar tanaman.
                </p>
              </div>
            </div>
          </TkRevealClient>
        </div>
      </div>
    </section>
  );
}
