import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-background py-14 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div>
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="font-playfair text-xl text-ink">TanamanKu</span>
            </div>
            <p className="text-sm text-ink/70 max-w-xs mt-4">
              Perawatan tanaman berbantuan AI. Deteksi penyakit lebih awal, rawat lebih tepat.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <h3 className="text-xs uppercase tracking-[0.15em] text-ink/70 font-semibold">
                Produk
              </h3>
              <Link
                href="#fitur"
                className="block py-2 text-sm text-ink/70 hover:text-primary transition-colors"
              >
                Fitur
              </Link>
              <Link
                href="#cara-kerja"
                className="block py-2 text-sm text-ink/70 hover:text-primary transition-colors"
              >
                Cara Kerja
              </Link>
              <Link
                href="#komunitas"
                className="block py-2 text-sm text-ink/70 hover:text-primary transition-colors"
              >
                Komunitas
              </Link>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-[0.15em] text-ink/70 font-semibold">
                Akun
              </h3>
              <Link
                href="/login"
                className="block py-2 text-sm text-ink/70 hover:text-primary transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="block py-2 text-sm text-ink/70 hover:text-primary transition-colors"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-background flex flex-col sm:flex-row justify-between gap-4 text-xs text-ink/70">
          <p>© 2026 TanamanKu</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Syarat Layanan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
