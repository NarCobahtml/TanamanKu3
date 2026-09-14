# TANAMANKU — TOTAL UI REDESIGN (gen 3)

## Direction
Professional Agricultural Technology × Modern Healthcare UI × Contemporary Web Product.
Struktur: flat but layered — hairline borders, dividers, color blocks. Radius 6px max.
Rebrand penuh TumbuhKita → TanamanKu.

## Design tokens
- Primary `#1B5E3F`, accent tint `#E7EFE9`, muted `#F2F5F2`, border `#E5E8E4`, ink `#171B17`.
- Status: success `#1B7A43`, warning `#935F00`, destructive `#B3261E`, info `#1D5FBF` — selalu icon + label (`HealthStatus`).
- Inter, radius `0.375rem`, shadow sangat subtle.

## Per-page
- **Dashboard (/)**: greeting + CTA scan; health overview section (bar 3-warna + counts + quick stats); scan terakhir = TABLE; jadwal penyiraman hari ini (time list, status Selesai/Akan datang/Terlewat); grid tanaman 4-kolom.
- **Scan (/scan)**: kamera viewfinder card-less, corner brackets rounded-none, scanline animasi, kuota panel, step guide satu grid divide-x (bukan 3 kartu). Logika getUserMedia verbatim.
- **Hasil (/scan/result)**: medical report — panel divide-x foto|diagnosis (keyakinan 94%, risiko), gejala terdeteksi, rekomendasi penanganan (numbered), pencegahan.
- **Tanaman (/siram)**: management system — search + filter kategori, TABS Kartu/Tabel (Table view: thumb, kategori, status siram, jadwal, aksi), dialog tambah.
- **Detail tanaman (/siram/[id])**: health record — breadcrumb, header foto+actions, grid info|jadwal-7-hari + rekomendasi AI, dialog edit/hapus.
- **Riwayat (/riwayat)**: table scan (Tanaman/Diagnosis/Tanggal/Keyakinan/Status), tabs filter, skeleton, empty state.
- **Forum (/forum)**: feed border divide-y (bukan kartu terpisah), filter kategori, sidebar topik populer + panduan.
- **Forum detail**: artikel + komentar + form, sticky sidebar terkait + CTA gelap.
- **Profil (/profil)**: settings layout — nav kiri (Akun/Langganan/Preferensi/Keluar), switch manual a11y, segmented Terang/Gelap, destructive zone logout.
- **Auth (login/register)**: split layout — brand panel hijau kiri (tagline + bullets), form kanan.

## Shared components
`HealthStatus`, `EmptyState`, `PageHeader`, `SectionHeader` (+overline), `Navbar` (notif dropdown custom), `Footer`, `SitePage`.
shadcn ui/* dengan radius disesuaikan: badge `rounded-sm`, card `rounded-lg`.

## Verifikasi
- `npx tsc --noEmit`: 0 error.
- `npm run build` (Windows Node): PASS, 13/13 route.
- `npx eslint src`: 0 error (40 warning `<img>` — repo pattern, accepted).
- Visual QA semua route: professional, radius kecil, hierarchy jelas, a11y (aria-label, switch role, progressbar, table semantic).
