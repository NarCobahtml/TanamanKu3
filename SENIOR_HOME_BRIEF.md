# Refactor Home Desktop — Senior-Friendly (Petani/Pekebun/Hobi Tanaman)

## Konteks
Target user TumbuhKita: petani kecil-menengah, pekebun, penyuluh, hobi tanaman — banyak usia tidak muda. Halaman home desktop harus ramah mata tua: teks lebih besar, kontras lebih tinggi, hierarki jelas, sedikit jargon.

File yang diubah: `src/components/HomePage.tsx` (desktop shell view, dipakai `/home` dan `/dashboard`).
DESAIN TIDAK BOLEH BERUBAH TOTAL — tetap light editorial deep-green. Ini penyesuaian aksesibilitas, bukan redesign.

## Prinsip senior-friendly (WAJIB semua)
1. **Teks body naik**: `text-xs` (12px) → `text-sm` (14px) minimum di area konten. `text-[11px]`/`text-[10px]` → `text-sm` atau `text-xs` tergantung konteks label tabel (label kolom boleh text-xs TAPI uppercase tracking lebar tetap terbaca).
2. **Heading lebih besar dan lebih tegas**: heading section minimal `text-2xl`–`text-3xl` desktop.
3. **Kontras**: teks body pakai `text-foreground`, hindari `text-muted-foreground` untuk informasi penting (tanggal scan, status kesehatan, jadwal siram). Muted hanya untuk deskripsi sekunder.
4. **Icon + label**: shortcut (Scan Baru, Diagnosis, Penyiraman) icon `h-5 w-5` → `h-7 w-7`, label `text-xs` → `text-sm font-semibold`.
5. **Hit ringkas**: angka statistik (`text-4xl md:text-5xl`) → minimal `text-5xl md:text-6xl`? JANGAN — biarkan angka statistik apa adanya (sudah besar). Fokus teks kecil lain.
6. **Touch/click target**: link & tombol padding lebih longgar, `py-3` minimum di item list interaktif.
7. **Bahasa**: istilah teknis Inggris ("Early Blight (Alternaria solani)") TIDAK diganti — itu nama penyakit ilmiah. Tapi label UI bahasa Indonesia harus jelas: "Lihat semua", "Kelola tanaman" dst. sudah oke.
8. **Tabel Diagnosis Terakhir**: `text-sm` → `text-[15px]` untuk sel; kolom "KEYAKINAN" angka jangan `tnum text-muted` — pakai foreground. Row height lebih lega (`py-3.5` → `py-4`).
9. **Kartu Tanaman Saya**: nama `font-semibold` → `font-bold text-lg`, species italic boleh `text-sm` (bukan text-xs), status chip & jadwal siram `text-sm`.
10. **Line-height** body `leading-relaxed` di paragraf deskripsi.
11. **CTA bawah** ("Ada daun yang mencurigakan..."): pastikan `text-2xl md:text-3xl` heading + tombol besar `py-4 px-8 text-base`.
12. **Jangan sampai ada perubahan yang merusak** layout: hanya ubah kelas ukuran teks/icon/padding, JANGAN ubah struktur JSX, grid, warna, atau hapus elemen. Mobile (`lg:hidden` block di `src/app/home/page.tsx`) JANGAN disentuh sama sekali.
13. `HealthStatus` chip: jika `text-xs` → `text-sm`.
14. Scan terakhir strip di feature card: `text-xs` → `text-sm`.

## Token design (dari STRUCTURE.md, jangan diubah)
- Deep green primary `#1E4635` / token `text-primary`. Light background `#F5F5F0`. Tidak ada gradient/shadow baru.

## Definition of Done
- `npx tsc --noEmit` exit 0
- `npm run lint` 0 error baru (warning no-img-element pre-existing diabaikan)
- `npm run build` sukses
- Tidak ada `text-[11px]`/`text-[10px]` tersisa di HomePage.tsx
- `text-xs` hanya untuk label kolom tabel uppercase & eyebrow "KOLEKSI" (boleh ditinggikan ke text-sm bila masih kecil)
- Semua info penting (status, tanggal, jadwal) pakai `text-foreground` atau warna status, bukan muted

## Verifikasi Hermes (setelah OpenCode selesai)
- grep sisa `text-xs`/`text-[1[01]px]` di src/components/HomePage.tsx
- diff desktop vs mobile block: mobile tidak berubah (git diff hanya di HomePage.tsx)
- build & lint pass
