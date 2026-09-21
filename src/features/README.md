# Panduan Arsitektur Fitur (Feature-Driven Architecture)

Dokumen ini menjelaskan struktur arsitektur modular pada `tumbuhkita3` setelah refaktorisasi `refactor/structure`.

---

## 1. Hirarki & Aturan Arah Import (Import Direction)

Arah ketergantungan modul harus selalu mengikuti alur satu arah berikut:

```
src/app/ (Next.js App Router: thin pages, routing, metadata)
   ↓
src/features/<fitur>/ (Logika domain bisnis, state, subkomponen, views)
   ↓
src/components/ (Komponen UI generik & shared layouts: ui/, layout/, shared/)
   ↓
src/lib/ (Utilitas murni, client helpers, konfigurasi)
```

### Aturan Utama:
1. **Dilarang Import Siklik (Circular Dependency):** `components/` atau `lib/` tidak boleh mengimpor dari `features/` atau `app/`.
2. **Ketergantungan Antar Fitur (Cross-Feature):**
   - Setiap fitur dirancang bersifat mandiri (*self-contained*).
   - Dilarang mengimpor file internal/privat secara acak dari fitur lain.
   - Jika sebuah entitas (komponen, hook, utilitas, tipe) digunakan oleh ≥ 2 fitur dan bukan merupakan domain eksklusif fitur tersebut, letakkan di `src/components/shared/` (seperti `tk-reveal-client.tsx`) atau `src/lib/` (seperti `use-auth.ts`).
   - Modul domain yang sengaja diekspos untuk fitur lain (misalnya store dan tipe tanaman dari `plants`) harus diakses melalui antarmuka publik (`src/features/plants/index.ts`).

---

## 2. Aturan Penempatan Kode (Placement Rules)

| Lokasi | Kapan Digunakan? | Contoh |
| :--- | :--- | :--- |
| `src/app/` | Hanya untuk routing Next.js (App Router), layout root, error boundary, metadata, serta delegasi tipis ke view fitur. Dilarang menaruh logika UI kompleks atau state besar langsung di file `page.tsx`. | `src/app/siram/[id]/page.tsx`, `src/app/scan/page.tsx`, `src/app/login/page.tsx` |
| `src/features/<fitur>/` | Segala sesuatu yang spesifik untuk domain bisnis tertentu (views, subkomponen, dialog, state store, hooks spesifik, mock data domain, tipe domain). | `src/features/plants/`, `src/features/scan/`, `src/features/watering/` |
| `src/components/ui/` | Primitif UI atomik dan rekayasa shadcn/radix tanpa domain bisnis. | `Button`, `Input`, `Dialog`, `Badge`, `Table` |
| `src/components/layout/` | Shell aplikasi global, header navigasi, footer, dan provider tema/bahasa. | `AppShell`, `Navbar`, `Footer`, `ThemeProvider` |
| `src/components/shared/` | Komponen presentasional yang dipakai lintas berbagai fitur namun bukan atomik UI murni. | `PageHeader`, `EmptyState`, `HealthStatus`, `PageCtaBand`, `tk-reveal-client` |
| `src/lib/` | Fungsi utilitas murni, konfigurasi sistem, helper generik bebas JSX atau auth state global. | `utils.ts`, `use-mounted.ts`, `use-auth.ts` |

---

## 3. Struktur Modul di dalam Setiap Fitur

Setiap folder fitur memiliki struktur dekomposisi yang terstandarisasi:

```
src/features/<nama-fitur>/
├── components/         # Subkomponen UI modular terisolasi (maks ~150-200 baris)
│   ├── SubKomponenA.tsx
│   ├── SubKomponenB.tsx
│   └── index.ts        # Barrel export internal fitur
├── types.ts            # Definisi tipe & interface domain fitur
├── constants.ts        # Nilai statis, konfigurasi, opsi select/filter
├── mock.ts             # Data mock / placeholder domain
├── index.ts            # Public barrel export untuk konsumsi fitur lain (jika ada)
└── <NamaFitur>Page.tsx # View orchestrator tipis yang mengomposisikan subkomponen
```

---

## 4. Rincian Modul Fitur & Dekomposisinya

- **`auth`**: Autentikasi pengguna
  - `AuthForm.tsx`: Orchestrator tampilan login/register
  - `components/LoginForm.tsx`: Form input login (email, password, toggle visibility, submit)
  - `components/RegisterForm.tsx`: Form registrasi (nama, email, password, confirm, terms checkbox)
  - `components/AuthSocialButtons.tsx`: Tombol OAuth pihak ketiga (Google & Facebook)
  - `components/AuthTestimonialPanel.tsx`: Panel testimonial dan kutipan petani
  - `components/AuthCallbackView.tsx`: Penanganan callback redirect auth
- **`dashboard`**: Halaman beranda pekebun
  - `HomePage.tsx`: View orchestrator beranda
  - `components/HomeHeroBand.tsx`: Hero pembuka dengan ringkasan status tanaman
  - `components/HomeFeaturedPlant.tsx`: Kartu sorotan tanaman utama & quick actions
  - `components/HomeRecentScans.tsx`: Tabel & kartu diagnosis hasil pemindaian terbaru
  - `components/HomeWateringSchedule.tsx`: Daftar tugas penyiraman hari ini
  - `components/HomePlantCollection.tsx`: Grid foto koleksi tanaman
- **`watering`**: Jadwal & panduan penyiraman
  - `SiramDetailView.tsx`: Controller & orchestrator detail penyiraman
  - `components/SiramDesktopView.tsx`: Layout desktop dengan grid dua kolom, foto, & timeline mingguan
  - `components/SiramMobileView.tsx`: Layout mobile khusus dengan FAB dan header ringkas
- **`scan`**: Diagnosa penyakit tanaman berbasis kamera/AI
  - `ScanView.tsx`: Orchestrator pemindaian
  - `components/ScanDesktopView.tsx`: Tampilan desktop dengan dropzone interaktif
  - `components/ScanMobileView.tsx`: Tampilan mobile dengan viewfinder kamera responsif
  - `ScanResultPage.tsx`: Halaman hasil analisis diagnosa penyakit
  - `RiwayatPage.tsx`: Daftar riwayat pemindaian sebelumnya
- **`profile`**: Pengaturan profil & preferensi pengguna
  - `ProfilPage.tsx`: Orchestrator profil
  - `components/ProfileAccountSection.tsx`: Bagian informasi akun pengguna
  - `components/ProfilePreferencesSection.tsx`: Pengaturan preferensi bahasa & tema
  - `components/ProfileNavRail.tsx`: Navigasi tab/sidebar pengaturan
  - `components/EditProfileDialog.tsx`: Modal dialog ubah data diri
  - `components/LogoutDialog.tsx`: Modal dialog konfirmasi keluar
- **`plants`**: Manajemen koleksi tanaman
  - `TanamanPage.tsx`: Daftar tanaman dengan filter, tab kartu, dan tabel
  - `TanamanDetailPage.tsx`: Halaman detail spesifik tanaman
  - `PlantCard.tsx`: Komponen kartu dan thumbnail tanaman
  - `StatusSiramBadge.tsx`: Badge status jadwal penyiraman
  - `TambahTanamanDialog.tsx`, `EditTanamanDialog.tsx`, `HapusTanamanDialog.tsx`: Modal CRUD tanaman
  - `tanaman-store.ts`: State management in-memory koleksi tanaman
  - `index.ts`: Barrel export publik untuk fitur lain
- **`forum`**: Diskusi komunitas pekebun
  - `ForumPage.tsx`: Feed forum utama
  - `ForumDetailPage.tsx`: Detail thread diskusi dan komentar
  - `CreatePostPage.tsx`: Pembuatan thread baru
- **`subscription`**: Paket langganan & pembayaran Midtrans
  - `LanggananPage.tsx`: Paket harga, integrasi Snap script & dialog langganan
- **`landing`**: Halaman promosi publik
  - `LandingHero.tsx`, `LandingFeatures.tsx`, `LandingCommunity.tsx`, dll.
