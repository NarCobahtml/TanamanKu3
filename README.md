# TanamanKu (TumbuhKita) — Platform Kesehatan Tanaman

Platform deteksi penyakit tanaman cerdas berbasis AI, pemantauan kesehatan tanaman, jadwal penyiraman otomatis, dan forum komunitas pertanian terintegrasi.

---

## Fitur Utama

- **Deteksi Penyakit AI (Vision Inference)**: Identifikasi penyakit tanaman secara instan melalui foto daun menggunakan model CNN terlatih (Roboflow) dengan fallback Vision LLM serta rekomendasi penanganan terkurasi dari Knowledge Base.
- **Jadwal Penyiraman Cerdas**: Rekomendasi waktu penyiraman otomatis berdasarkan baseline varietas tanaman, kondisi cuaca riil (Open-Meteo), dan riwayat kesehatan tanaman.
- **Forum Komunitas & Tanya Ahli**: Ruang diskusi petani dan penghobi tanaman untuk berbagi tips perawatan, bertanya langsung pada penyuluh terverifikasi, dan melampirkan hasil scan.
- **Sistem Billing & Kuota**: Manajemen paket gratis (10 scan/bulan) dan langganan premium dengan fitur kuota transparan.
- **Dukungan Multi-Bahasa**: Dukungan penuh dwibahasa (Bahasa Indonesia & English) menggunakan `next-intl`.
- **Desain Editorial Responsif (1-DOM)**: Antarmuka terpadu (Gen-5 design system) dengan navigasi pill di desktop dan bottom navigation bar + FAB thumb-friendly di mobile viewport (390px+).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) dengan Turbopack
- **UI Library**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), Radix UI Primitives, Lucide Icons
- **Database & ORM**: PostgreSQL ([Supabase](https://supabase.com/)), [Prisma 7](https://www.prisma.io/)
- **AI Engine**: Roboflow Inference API (`resnet34-t1`), Vision LLM fallback
- **Internasionalisasi**: `next-intl`
- **Weather API**: Open-Meteo API (kondisi cuaca lokal tanpa API key)

---

## Struktur Direktori

```text
├── prisma/               # Skema database Prisma (schema.prisma)
├── public/               # Asset statis, font self-hosted, dan logo SVG
├── src/
│   ├── app/              # Next.js App Router (pages & API handlers)
│   │   ├── api/          # API Route handlers (/api/scan, dll.)
│   │   ├── forum/        # Halaman forum komunitas & posting baru
│   │   ├── home/         # Dashboard utama pengguna
│   │   ├── profil/       # Pengaturan akun & preferensi
│   │   ├── riwayat/      # Riwayat diagnosis scan
│   │   ├── scan/         # Antarmuka kamera & hasil analisis
│   │   ├── siram/        # Pengelolaan tanaman & jadwal siram
│   │   ├── globals.css   # Token desain editorial Gen-5 & base styles
│   │   └── layout.tsx    # Root layout & konfigurasi viewport
│   ├── components/       # Komponen UI modular (AppShell, Navbar, Footer, dll.)
│   ├── lib/              # Utility helpers, data kurasi penyakit (scan-content.ts)
│   └── messages/         # Kamus terjemahan bilingual (id.json, en.json)
├── API_ROUTES.md         # Dokumentasi spesifikasi lengkap 32 endpoint API backend
└── README.md             # Dokumentasi proyek
```

---

## Memulai Pengembangan

### 1. Instalasi Dependencies

```bash
npm install
```

### 2. Konfigurasi Environment (`.env`)

Buat file `.env` di direktori root dengan konfigurasi berikut:

```env
DATABASE_URL="postgresql://<user>:<pass>@<host>:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://<user>:<pass>@<host>:5432/postgres"

# Roboflow Scan Engine
ROBOFLOW_API_KEY="<api-key-anda>"
ROBOFLOW_MODEL_ID="<model-id-anda>"
```

### 3. Menjalankan Server Pengembangan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

### 4. Build Produksi

```bash
npm run build
npm run start
```

---

## 📖 Dokumentasi API

Seluruh arsitektur, kontrak request/response, dan spesifikasi 32 endpoint backend didokumentasikan secara rinci pada [`API_ROUTES.md`](./API_ROUTES.md).
