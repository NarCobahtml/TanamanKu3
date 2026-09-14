import { Bug, Droplets, History, MessagesSquare, ScanLine } from 'lucide-react';
import TkRevealClient from './tk-reveal-client';

const FEATURES = [
  {
    icon: Droplets,
    title: 'Jadwal Penyiraman',
    desc: 'Pengingat pintar yang menyesuaikan jenis tanaman. Tidak ada lagi tanaman kekeringan atau terlalu basah.',
  },
  {
    icon: MessagesSquare,
    title: 'Forum Komunitas',
    desc: 'Tanya pemilik tanaman lain dan ahli terverifikasi. Bagikan pengalaman, dapatkan jawaban.',
  },
  {
    icon: History,
    title: 'Riwayat Diagnosis',
    desc: 'Setiap scan tersimpan rapi. Pantau pemulihan tanaman dari minggu ke minggu.',
  },
  {
    icon: Bug,
    title: 'Identifikasi Hama',
    desc: 'Bukan hanya penyakit: kutu daun, tungau, dan hama umum lain ikut terdeteksi dari foto yang sama.',
  },
] as const;

export default function Features() {
  return (
    <section id="fitur" className="bg-background py-24 sm:py-32 px-6">
      <div className="max-w-[1200px] mx-auto">
        <TkRevealClient>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-[-0.03em] text-ink max-w-2xl">
            Apa yang TanamanKu lakukan untuk tanamanmu
          </h2>
        </TkRevealClient>

        <TkRevealClient className="mt-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <div className="md:col-span-2 relative rounded-md overflow-hidden min-h-[320px] md:min-h-[420px]">
              <div
                className="absolute inset-0 bg-center bg-cover"
                style={{ backgroundImage: "url('/figma-assets/scanned-leaf.png')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col items-start gap-3">
                <span className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center backdrop-blur-sm">
                  <ScanLine className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-semibold text-white">Scan Penyakit AI</h3>
                <p className="text-sm text-white/70 leading-relaxed max-w-md">
                  Deteksi 30+ jenis penyakit daun dalam hitungan detik, lengkap dengan tingkat
                  keyakinan hasil.
                </p>
              </div>
            </div>

            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-md border border-background bg-white p-6 sm:p-8 hover:border-primary/30 transition-colors"
              >
                <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <f.icon className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-semibold text-ink mt-5">{f.title}</h3>
                <p className="text-sm text-ink/70 leading-relaxed mt-2">{f.desc}</p>
              </div>
            ))}
          </div>
        </TkRevealClient>
      </div>
    </section>
  );
}
