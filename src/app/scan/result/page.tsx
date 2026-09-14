'use client';

import SitePage from '@/components/SitePage';
import ScanResult from '@/components/ScanResultPage';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, Check, Sparkles, ClipboardList, TriangleAlert, ShieldCheck } from 'lucide-react';
import { getContent } from '@/lib/scan-content';
import { useScanResult, useScanPhoto } from '@/lib/use-scan-result';

interface ScanData {
  class: string;
  confidence: number;
}

export default function ScanResultPage() {
  const data = useScanResult<ScanData>();
  const photo = useScanPhoto();

  const content = data ? getContent(data.class) : null;
  const accuracy = data ? Math.round(data.confidence * 100) : 0;

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block">
    <SitePage>
      <ScanResult />
    </SitePage>
      </div>

      {/* Mobile */}
      <div className="result-page app-shell pb-20 lg:hidden">
      <header className="result-header sticky top-0 z-20">
        <div className="app-container h-full px-4 flex items-center justify-between">
          <button className="result-back-button" aria-label="Kembali" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5 text-ink" />
          </button>
          <h1 className="text-[24px] font-semibold tracking-[-.035em]">Hasil Analisis</h1>
          <div aria-hidden="true" className="result-header-spacer" />
        </div>
      </header>

      {!data || !content ? (
        <main className="app-container scan-result-main">
          <div className="result-block">
            <p className="result-copy">
              {data ? 'Kelas tidak dikenali mesin scan.' : 'Belum ada hasil. Ambil foto dari halaman Scan.'}
            </p>
          </div>
        </main>
      ) : (
      <main className="app-container scan-result-main">
        <div className="result-photo relative">
          <img src={photo || '/figma-assets/scanned-leaf.png'} alt="Daun yang dianalisis" />
          <div className="result-accuracy absolute bg-white/90 text-ink/70"><Check className="w-3.5 h-3.5 text-[#1B5E20]" strokeWidth={3} /> {accuracy}% Akurat</div>
        </div>

        <section className="result-section">
          <h2 className="result-title font-bold">{content.label}</h2>
          <p className="result-scientific">{content.latin}</p>
          {content.healthy ? (
            <div className="result-warning">
              <ShieldCheck className="result-warning-icon mt-0.5 w-5 h-5 text-[#1B5E20] shrink-0" />
              <p>{content.headline}</p>
            </div>
          ) : (
            <div className="result-warning">
              <TriangleAlert className="result-warning-icon mt-0.5 w-5 h-5 text-warning shrink-0" />
              <p>{content.headline}</p>
            </div>
          )}
        </section>

        <div className="result-hero-divider" aria-hidden="true" />

        <section className="result-block ai-block">
          <h3 className="result-block-title text-ink"><Sparkles className="w-5 h-5 text-[#1B5E20]" /> Analisis AI</h3>
          <p className="result-copy">{content.aiAnalysis}</p>
          <div className="result-meta">
            <div><p className="result-meta-label">{content.healthy ? 'Ciri-ciri yang Terdeteksi' : 'Gejala Utama'}</p><p className="result-meta-value">{content.symptoms.join(', ')}</p></div>
            <div><p className="result-meta-label">{content.healthy ? 'Bagian Diperiksa' : 'Bagian Terdampak'}</p><p className="result-meta-value">{content.affectedParts}</p></div>
          </div>
        </section>

        <section className="result-block recommendation-block">
          <h3 className="result-block-title"><ClipboardList className="w-5 h-5 text-[#1B5E20]" /> {content.healthy ? 'Rekomendasi Perawatan' : 'Rekomendasi Penanganan'}</h3>
          <div className="treatment-list">
            {content.treatments.map((t, index) => (
              <article className="treatment-card" key={t.title}>
                <span className="treatment-number">{index + 1}.</span>
                <div><h4 className="treatment-title">{t.title}</h4><p className="treatment-copy">{t.description}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="result-block result-products">
          <h3 className="text-[18px] font-bold">Produk Rekomendasi</h3>
          {content.products.map((p) => (
            <div className="product-row" key={p.name}>
              <div><h4 className="product-name">{p.name}</h4><p className="product-copy">{p.note}</p></div>
            </div>
          ))}
        </section>
      </main>
      )}

      {data && content && (
      <div className="result-actions">
        <div className="app-container grid gap-2">
          <button className="bg-[#1B5E20] text-white">Simpan ke Riwayat</button>
          <button className="bg-primary/10 text-[#1B5E20] font-semibold">Tanya Ahli</button>
        </div>
      </div>
      )}
      <BottomNav />
      </div>
    </>
  );
}
