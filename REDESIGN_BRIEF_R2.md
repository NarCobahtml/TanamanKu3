# Round 2 — transformasi berani: halaman desktop tumbuhkita3 pakai DNA desain landing page

Round 1 (sudah ada) cuma polish tipis: pill nav, overline, aksen Playfair. User bilang hasilnya KURANG KELIHATAN. Sekarang ubah RADIKAL supaya setiap halaman terasa seperti landing page: editorial, smooth, ciamik.

## Referensi gaya (baca dulu, jangan diubah)
- `src/app/page.tsx` + `src/components/landing/*.tsx` — landing gen-5. Ini DNA-nya:
  - `hero.tsx`: heading raksasa tracking-tight, tag italic Playfair, animasi reveal (heroReveal/heroFadeUp/heroZoom di globals.css)
  - `statement.tsx`: statement tipografis besar
  - `features.tsx`/`how-it-works.tsx`: nomor besar, overline, grid lega, key line `.rule`
  - `cta-band.tsx`: band hijau `.ink-panel` CTA besar
  - `community.tsx`: sage-wash section
  - `tk-reveal-client.tsx`: scroll-reveal — GUNAKAN di section halaman desktop
- `src/app/globals.css`: tokens + utilities (.ink-panel, .sage-wash, .overline, .rule, .tnum, .font-playfair, .scanline, .hero-anim/.hero-reveal/.hero-fade, .btn-cta)

## Target — desktop block (`hidden lg:block`) halaman:
home, login, register, profil, riwayat, siram, siram/[id], scan, scan/result, forum, forum/[id], forum/create, dashboard.

## Ubahan WAJIB per halaman (jangan asal tempel — sesuaikan konteks):
1. **Hero band editorial** tiap halaman: PageBand/PageHeader diganti jadi hero band gaya landing — overline kecil, judul BESAR (text-4xl/5xl tracking-tight), 1-2 kata accent Playfair italic, deskripsi muted, background sage-wash ATAU ink-panel (halaman berat konten → sage-wash; scan/result → ink-panel kontras). Judul halaman muncul dengan animasi hero-anim hero-fade.
2. **Scroll-reveal**: wrap section-section utama (tabel, grid kartu, list) dengan `TkReveal` dari `src/components/landing/tk-reveal-client.tsx` (export-nya lihat di file) supaya konten fade-up saat scroll, smooth seperti landing.
3. **Section rhythm**: container max-w-7xl, gap antar section lega (space-y-16/20), key line `.rule` antar section, angka statistik `.tnum`.
4. **ink-panel band CTA** di akhir halaman panjang (home, riwayat, forum): band hijau dengan heading Playfair accent + tombol rounded-full — pola `cta-band.tsx`.
5. **Kartu & tabel**: card putih border hairline (border-border) rounded-xl, hover subtle (hover:border-primary/40 hover:bg-accent/30 transition) — no shadow berat. Tabel: header uppercase overline-style, row hover bg-secondary.
6. **Scan page (desktop)**: viewfinder + `.scanline` animation udah ada di CSS — pastikan dipakai di desktop block scan page biar hidup.
7. **Siram/[id] & forum/[id] detail**: hero band kecil dengan breadcrumb overline, konten dua kolom editorial (konten kiri lebar, aside kanan sticky info-card hairline).

## LARANGAN:
- JANGAN sentuh: block mobile (`lg:hidden`), landing components, route names, data placeholder, `src/app/page.tsx`, fonts (fonts.css, public/fonts — baru saja di-setup, jangan ganggu).
- JANGAN tambah dependency. Tailwind + lucide + existing only.
- JANGAN ubah prisma/api.
- Jangan hapus fitur/konten — visual transform saja.
- Konsisten: komponen shared (Navbar, Footer, SitePage) boleh disentuh untuk polish, tapi strukturnya tetap.

## Definisi selesai:
- `npm run build` PASS.
- Tiap halaman desktop: hero band editorial + scroll-reveal + ink-panel/sage-wash + Playfair accent + hairline cards.
- Mobile block jumlah `lg:hidden` per page tidak berkurang (cek: harus tetap 1 per page).
- Laporan ringkas per file.
