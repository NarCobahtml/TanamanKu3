# STRUCTURE — Konvensi tumbuhkita3

Dokumen ini = satu sumber kebenaran struktur repo. Sebelum menulis page/komponen baru, baca ini.

## Route map

| Route | Isi |
| --- | --- |
| `/` | Landing page publik (desktop-first, komponen `src/components/landing/*`) |
| `/home` | Dashboard pengguna (desktop + mobile) |
| `/dashboard` | Alias dashboard (struktur = Navbar + HomePage + Footer, dipertahankan untuk kompatibilitas) |
| `/login` `/register` | Auth (desktop: AuthForm editorial, mobile: form Figma) |
| `/profil` | Profil pengguna |
| `/riwayat` | Riwayat scan/diagnosis |
| `/scan` | Kamera scan |
| `/scan/result` | Hasil analisis AI |
| `/siram` | Daftar tanaman + jadwal siram |
| `/siram/[slug]` | Detail tanaman per individu (slug = id dari `tanamanList`, mis. `monstera`) |
| `/forum` | Forum komunitas |
| `/forum/[slug]` | Detail post (slug = id dari `forumPosts`, mis. `bercak-kuning-monstera`) |
| `/forum/create` | Buat post baru |

**Aturan:** param detail = SLUG nama (string), bukan angka. Link ke detail selalu `{`/siram/${t.id}`}` atau `{`/forum/${p.id}`}` — id di data sudah berupa slug.

## Data — SATU sumber kebenaran

| Data | Lokasi | Dilarang |
| --- | --- | --- |
| Daftar tanaman | `tanamanList` — `src/components/TanamanPage.tsx` | Array tanaman lokal di page mobile/desktop |
| Post forum | `forumPosts` — `src/components/ForumPage.tsx` | Array post lokal; komentar = field `comments` di post yang sama |
| Riwayat scan | `src/components/RiwayatPage.tsx` (desktop) — mobile `src/app/riwayat/page.tsx` memakai salinan data Figma yang sesuai visual mobile (data sama + dummy perhatian) | — |

Semua page (mobile & desktop) **wajib** import dari lokasi di atas:

```tsx
import { tanamanList } from '@/components/TanamanPage';
import { forumPosts } from '@/components/ForumPage';
```

Untuk detail by param: `const plant = tanamanList.find((t) => t.id === id) ?? tanamanList[0];`

Mapping status siram mobile (Figma): `'hari-ini' | 'terjadwal'` → visual `soon` (warn netral), `'terlambat'` → `overdue` (merah). Lihat `statusMap` di `src/app/siram/page.tsx`.

## Pattern responsif — dua block per page

Setiap page app = dua block berdampingan:

```tsx
<>
  {/* Desktop — t3 */}
  <div className="hidden lg:block">
    <SitePage>
      <SomePage />
   </SitePage>
  </div>

  {/* Mobile — mobile1 Figma */}
  <div className="app-shell pb-[86px] lg:hidden">
    <Header showProfile />
    <main className="app-container">…</main>
    <BottomNav />
  </div>
</>
```

- Desktop: shell = `SitePage` / `Navbar` + `Footer`; konten = komponen `*Page.tsx`.
- Mobile: shell = `Header` + `BottomNav`; konten inline di page.
- Sintaks block **WAJIB** konsisten: desktop `hidden lg:block`, mobile `lg:hidden`. Jangan varian lain.
- Semua kartu yang punya detail (tanaman, post) = `<Link>` ke `/siram/${slug}` / `/forum/${slug}`, bukan `<div>` mati.

## Warna — palet tunggal (gen-6, dipatenkan 14 Sep)

Tiga warna dasar + turunan opasitas, berlaku desktop DAN mobile:

- **Primary green**: `#1B5E20` (`bg-primary`, `text-primary`)
- **Background**: `#FDFFFB` (`bg-background`)
- **Ink (teks/identitas gelap)**: `#123526` (`text-ink`, panel `ink-panel`)
- Turunan: teks muted = `text-ink/70` / `text-ink/60`, border = `border-ink/15`, tint = `bg-primary/10`.
- Status (semantik, tetap): destructive `#B3261E`, warning `#935F00`, info `#1D5FBF` — selalu icon+label, jangan color-only.
- Eksepsi brand pihak ketiga: warna logo Google/Facebook di OAuth login/register tetap (`#4285F4` dll).
- Eksepsi artwork: `public/diseased-leaf.svg` (ilustrasi, 11 warna) tetap.

Aturan: jangan hardcode hex baru di TSX/CSS — pakai token (`bg-primary`, `text-ink/70`, `border-ink/15`) atau CSS var (`var(--primary)`). Hex literal hanya di globals.css `:root`.

## Penamaan

- Komponen konten desktop/page: nama halaman + `Page` — `TanamanPage`, `ForumPage`, `ForumDetailPage`, `HomePage`, `RiwayatPage`, `ScanResultPage`, `ProfilPage`, `TanamanDetailPage`, `CreatePostPage`.
- Shell mobile: `Header`, `BottomNav`.
- Shell desktop: `Navbar`, `Footer`, `SitePage`.
- Landing: `src/components/landing/*` lowercase (`nav`, `hero`, …).
- Page route file: `src/app/<route>/page.tsx`, dynamic segment = `[id]` tapi isi = slug string.
