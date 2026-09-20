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
   - Idealnya fitur bersifat mandiri (*self-contained*).
   - Dilarang mengimpor file internal/privat secara acak dari fitur lain.
   - Jika sebuah entitas (komponen, hook, utilitas, tipe) digunakan oleh ≥ 2 fitur dan bukan merupakan domain eksklusif fitur tersebut, letakkan di `src/components/shared/` atau `src/lib/`.
   - Modul domain yang sengaja diekspos untuk fitur lain (misalnya `useAuth` dari `auth` atau store tanaman dari `plants`) harus diakses melalui antarmuka publik modul fitur terkait.

---

## 2. Aturan Penempatan Kode (Placement Rules)

| Lokasi | Kapan Digunakan? | Contoh |
| :--- | :--- | :--- |
| `src/app/` | Hanya untuk routing Next.js (App Router), layout root, error boundary, metadata, serta delegasi tipis ke view fitur. Dilarang menaruh logika UI kompleks atau state besar langsung di file `page.tsx`. | `src/app/siram/[id]/page.tsx`, `src/app/scan/page.tsx` |
| `src/features/<fitur>/` | Segala sesuatu yang spesifik untuk domain bisnis tertentu (views, subkomponen, dialog, state store, hooks spesifik, mock data domain, tipe domain). | `src/features/plants/`, `src/features/scan/`, `src/features/forum/` |
| `src/components/ui/` | Primitif UI atomik dan rekayasa shadcn/radix tanpa domain bisnis. | `Button`, `Input`, `Dialog`, `Badge` |
| `src/components/layout/` | Shell aplikasi global, header navigasi, footer, dan provider tema/bahasa. | `AppShell`, `Navbar`, `Footer`, `ThemeProvider` |
| `src/components/shared/` | Komponen presentasional yang dipakai lintas berbagai fitur namun bukan atomik UI murni. | `PageHeader`, `EmptyState`, `HealthStatus`, `PageCtaBand` |
| `src/lib/` | Fungsi utilitas murni, konfigurasi sistem, helper generik bebas JSX. | `utils.ts`, `use-mounted.ts` |

---

## 3. Struktur Modul di dalam Setiap Fitur

Setiap folder fitur dianjurkan memiliki struktur konsisten:

```
src/features/<nama-fitur>/
├── components/         # Subkomponen UI spesifik fitur (views, card, dialog)
├── hooks/              # Custom hook yang eksklusif digunakan pada fitur ini
├── types.ts            # Definisi tipe & interface domain fitur
├── constants.ts        # Nilai statis, konfigurasi, opsi select/filter
├── mock.ts             # Data mock / placeholder (jika backend belum terhubung)
└── <NamaFitur>Page.tsx # Komponen view utama yang di-mount oleh src/app/.../page.tsx
```

---

## 4. Daftar Modul Fitur

- `auth`: Autentikasi (`AuthForm`, `useAuth`, `AuthCallbackView`).
- `dashboard`: Halaman beranda pekebun (`HomePage`, mock scan & status).
- `forum`: Diskusi komunitas (`ForumPage`, `ForumDetailPage`, `CreatePostPage`, `ForumPostCard`).
- `landing`: Halaman muka publik (`hero`, `features`, `community`, `tk-reveal-client`).
- `plants`: Manajemen koleksi tanaman (`TanamanPage`, `TanamanDetailPage`, dialog tambah/edit/hapus, store).
- `profile`: Pengaturan profil & preferensi pengguna (`ProfilPage`, dialog, pengaturan switch).
- `scan`: Diagnosa penyakit tanaman berbasis kamera/upload (`ScanView`, `ScanResultPage`, `RiwayatPage`).
- `subscription`: Halaman langganan & paket (`LanggananPage`).
- `watering`: Detail jadwal & cuaca penyiraman (`SiramDetailView`, slot cuaca, jadwal harian).
