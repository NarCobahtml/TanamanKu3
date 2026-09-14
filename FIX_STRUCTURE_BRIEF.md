# Konsistensi & perbaikan struktur tumbuhkita3 — STOP pengembangan fitur baru, fokus rapikan

Audit nemu struktur berantakan: data duplikat, route id gak konsisten, komponen hardcode. Perbaiki SEMUA di bawah. JANGAN tambah fitur baru. JANGAN sentuh visual design yang sudah jadi (desktop gen-5 round 2 + mobile figma) — ini perbaikan STRUKTUR, bukan redesign.

## Temuan yang harus dibetulkan:

### 1. Siram route: pakai SLUG nama tanaman, konsisten desktop + mobile
- FAKTA: desktop link `/siram/${t.id}` dengan id=slug ('monstera', 'tomat' dst) dari `tanamanList` di `src/components/TanamanPage.tsx:47`. Ini pola yang BENAR. Forum juga sudah pakai slug post ('bercak-kuning-monstera') di kedua device.
- MASALAH: `src/app/siram/[id]/page.tsx` mobile block hardcode "Tomat Cherry" — abaikan param id. Fix: ambil data dari `tanamanList` (import dari `TanamanPage.tsx` — sudah dipraktikkan di `HomePage.tsx:20` `import { tanamanList } from './TanamanPage'`), `const plant = tanamanList.find(t => t.id === id) ?? tanamanList[0]`. Ganti semua "Tomat Cherry" hardcoded jadi `plant.nama`. Nama latin/jadwal/status juga dari data kalau tampil.
- MASALAH: `src/app/siram/page.tsx` mobile block punya array `plants` sendiri (id numeric 1-5, isi beda). Fix: HAPUS array lokal, pakai `tanamanList` dari `TanamanPage.tsx` (map field: nama→name, nextWater→statusText, status→ PlantStatus: hari-ini→soon/done mapping sesuai visual, terlambat→overdue, terjadwal→soon; sesuaikan agar statusVisual tetap jalan atau sesuaikan statusVisual key ke kategori status tanamanList: 'hari-ini'|'terjadwal'|'terlambat').
- MASALAH: kartu tanaman mobile di `siram/page.tsx` bukan link. Fix: bungkus jadi `<Link href={`/siram/${t.id}`}>` (import Link dari next/link) supaya bisa ke detail mobile.

### 2. Hapus data duplikat — SATU sumber kebenaran
- `tanamanList` (TanamanPage.tsx) = sumber tunggal daftar tanaman. Dilarang ada array tanaman lain di page mobile.
- `forumPosts` (ForumPage.tsx) = sumber tunggal post. `src/app/forum/page.tsx` mobile block dan `ForumDetailPage.tsx` harus import dari situ, bukan array sendiri. Cek `src/app/forum/page.tsx` — kalau ada array posts lokal, ganti import.
- Komentar forum: kalau ada array komentar duplikat di mobile `forum/[id]` vs desktop, taruh array komentar di SATU tempat (export dari `ForumDetailPage.tsx` atau file data baru `src/lib/forumData.ts` — pilih yang paling sedikit diff).

### 3. Cek & rapikan sisa
- `src/app/dashboard/page.tsx` — lihat isinya. Kalau cuma render duplikat dari `/home`, konfirmasi strukturnya dipertahankan tapi pastikan gak ada import mati/komponen yatim. GAK BOLEH hapus route (mungkin dipakai).
- `src/components/Header.tsx` — prop `showBack`/`showProfile`/`title` dipakai konsisten di semua mobile page? Rapikan.
- Hapus import yang gak dipakai hasil refactor (jalankan lint, perbaiki error).
- Ganti semua `next/link` Link yang pakai query/anchor gak perlu ke path bersih.

### 4. Konvensi tertulis (TULIS FILE `src/STRUCTURE.md`)
Buat `src/STRUCTURE.md` berisi:
- Route map: `/` landing, `/home` dashboard, `/login` `/register` `/profil` `/riwayat`, `/scan` `/scan/result`, `/siram` `/siram/[slug]`, `/forum` `/forum/[slug]` `/forum/create`. Param detail = SLUG nama, bukan angka.
- Data sumber tunggal: tanamanList (TanamanPage.tsx), forumPosts (ForumPage.tsx) — komponen/page mobile & desktop wajib import dari situ, DILARANG bikin array sendiri.
- Pattern responsif: setiap page = dua block, `<div className="hidden lg:block">` (desktop, pakai SitePage/Navbar) + `<div className="lg:hidden">` (mobile app-shell, pakai Header/BottomNav). Sintaks block WAJIB konsisten.
- Warna: desktop pakai token (var(--primary) dsb via class Tailwind bg-primary), mobile pakai hex Figma (#1B5E20 dst). Ini memang beda ekosistem — tulis eksplisit.
- Aturan: penamaan file komponen = nama halaman + "Page" (TanamanPage, ForumPage); komponen mobile shell = Header, BottomNav; komponen desktop shell = Navbar, Footer, SitePage.

## Verification (WAJIB semua):
1. `npm run build` PASS.
2. `npm run lint` 0 error.
3. Grep bukti: `grep -rn "const plants" src/app/` → kosong; `grep -n "Tomat Cherry" 'src/app/siram/[id]/page.tsx'` → kosong (hardcode hilang).
4. Semua kartu siram mobile jadi Link (grep `siram/${` di siram/page.tsx ada).
5. `lg:hidden` count per page tetap >= 1 (mobile block gak hilang).
6. Tulis laporan per perubahan.
