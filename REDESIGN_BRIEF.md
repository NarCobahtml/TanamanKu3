# Redesign brief: sesuaikan UI seluruh halaman desktop tumbuhkita3 dengan gaya landing page (gen-5 editorial)

## Referensi gaya (JANGAN diubah)
- `src/app/page.tsx` + `src/components/landing/*` — landing gen-5 editorial. Ini acuan.
- `src/app/globals.css` — tokens gen-5 (var(--primary) #1b5e3f, --ink #123526, --secondary #f2f5f2, --accent #e7efe9, hairline --border). Utilities: .ink-panel, .sage-wash, .overline, .rule, .font-playfair, .tnum, .btn-cta.

## Yang harus DISESUAIKAN (desktop block `hidden lg:block` saja; JANGAN sentuh block mobile `lg:hidden`)
Semua page di `src/app/`: home, login, register, profil, riwayat, siram, siram/[id], scan, scan/result, forum, forum/[id], forum/create, dashboard.

Catatan: page root (`page.tsx` + landing/*) SUDAH gen-5 — jangan disentuh sama sekali.

## Karakteristik gaya landing yang harus diikuti
1. Nav pill melayang (lihat `src/components/landing/nav.tsx`): pill putih/80 backdrop-blur border hairline rounded-full, link pill hover bg-accent, underline indicator di Navbar dashboard boleh diubah jadi pill style konsisten.
2. Tipografi editorial: heading besar tracking-tight, overline label kecil uppercase tracking-widest (class .overline), aksen Playfair italic via .font-playfair untuk 1-2 kata kunci.
3. Warna: white canvas, blok hijau identitas (.ink-panel) untuk section penting (band CTA / aside), aksen sage (.sage-wash) untuk kontras section, NO gradient/shadow berat, hairline border (border-border).
4. Section rhythm: max-w-7xl container, key line antar section (.rule), spacing lega, angka statistik pakai .tnum.
5. Komponen: PageHeader/SectionHeader sudah ada di `src/components/PageHeader.tsx` — pertahankan pola overline+judul.
6. Mobile (lg:hidden) = app-shell dari tumbuhkita #1 — JANGAN disentuh, jangan dibuang, jangan diubah class-nya.
7. Jangan ubah nama component/route/data. Refactor visual saja. Data placeholder dipertahankan.
8. Jangan tambah dependency baru. lucide-react + Tailwind v4 + existing components only.

## Definisi selesai
- `npm run build` pass.
- Semua halaman konsisten: pill nav, overline, ink-panel band, hairline, .font-playfair accent.
- diff hanya menyentuh desktop block + components desktop (Navbar/Footer/HomePage/ForumPage/ScanResultPage/ProfilPage/RiwayatPage/TanamanPage/dll).
