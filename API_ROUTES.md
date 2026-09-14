# TumbuhKita API Routes Documentation

Dokumentasi lengkap API TumbuhKita — mencakup autentikasi, sistem AI scan penyakit (engine ganda: model terlatih Roboflow + fallback vision LLM), knowledge base penyakit, manajemen tanaman, jadwal siram otomatis berbasis cuaca, estimasi panen, forum komunitas, notifikasi, dan panel admin.

Referensi: PRD TumbuhKita v1.0, Use Case Diagram, Prisma schema (`prisma/schema.prisma`).

---

## Daftar Isi

1. [Konvensi Umum](#1-konvensi-umum)
2. [Autentikasi & Authorisasi](#2-autentikasi--authorisasi)
3. [Sistem AI Scan Penyakit](#3-sistem-ai-scan-penyakit)
4. [Knowledge Base Penyakit](#4-knowledge-base-penyakit)
5. [Riwayat Scan & Quota](#5-riwayat-scan--quota)
6. [Manajemen Tanaman](#6-manajemen-tanaman)
7. [Jadwal Siram Otomatis](#7-jadwal-siram-otomatis)
8. [Estimasi Panen](#8-estimasi-panen)
9. [Forum Komunitas](#9-forum-komunitas)
10. [Notifikasi](#10-notifikasi)
11. [Admin](#11-admin)
12. [Format Error & Kode](#12-format-error--kode)
13. [Konstanta Sistem](#13-konstanta-sistem)
14. [Diagram Alur Sistem AI](#14-diagram-alur-sistem-ai)
15. [Arsitektur & Catatan Implementasi](#15-arsitektur--catatan-implementasi)

---

## 1. Konvensi Umum

### Base URL

```
/api/v1
```

Production: `https://<domain-tumbuhkita>/api/v1`

### Envelope Respons

Semua respons mengikuti satu bentuk:

```json
{
  "success": true,
  "data": { },
  "error": null,
  "meta": { }
}
```

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input tidak valid",
    "details": { }
  },
  "meta": { }
}
```

### Autentikasi

Bearer token JWT di header:

```
Authorization: Bearer <token>
Content-Type: application/json
```

Token berisi klaim: `sub` (user id), `role` (`PETANI` | `PENYULUH` | `ADMIN`), `exp`.

### Konvensi Lain

| Item | Konvensi |
|---|---|
| Timestamp | ISO 8601, UTC di server; frontend menyesuaikan zona WIB (+07:00) |
| Pagination | `?page=1&limit=20` — respons selalu menyertakan objek `pagination` |
| Upload gambar | `multipart/form-data`, max 5MB, jpg/png/webp |
| Rate limit | 100 req/menit (authenticated), 20 req/menit (public) |
| ID | `cuid()` untuk entitas aplikasi; UUID untuk user (sinkron `auth.users.id`) |
| Bahasa konten | Indonesia; nama latin penyakit tetap Latin scientific |

---

## 2. Autentikasi & Authorisasi

### 2.1 Register

**POST `/auth/register`**
**Access:** Public

**Request:**

```json
{
  "email": "petani@example.com",
  "password": "passwordMin8",
  "name": "Budi Santoso",
  "bio": "Petani cabai, Malang"
}
```

**Validasi:**

| Field | Aturan |
|---|---|
| `email` | format email, unik |
| `password` | min 8 karakter, kombinasi huruf + angka |
| `name` | 2–60 karakter, wajib |

**Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "9c1b...",
      "email": "petani@example.com",
      "name": "Budi Santoso",
      "role": "PETANI",
      "bio": "Petani cabai, Malang",
      "createdAt": "2026-09-08T02:00:00.000Z"
    },
    "token": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

**Error:** `409 EMAIL_ALREADY_EXISTS`

---

### 2.2 Login

**POST `/auth/login`**
**Access:** Public

**Request:**

```json
{
  "email": "petani@example.com",
  "password": "passwordMin8"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "9c1b...",
      "email": "petani@example.com",
      "name": "Budi Santoso",
      "role": "PETANI",
      "photoUrl": "https://storage.tumbuhkita.id/avatar/budi.jpg"
    },
    "token": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

**Error:** `401 INVALID_CREDENTIALS` — pesan generik, tidak membocokan mana field yang salah (anti user-enumeration).

---

### 2.3 Refresh Token

**POST `/auth/refresh`**
**Access:** Public (dengan refreshToken)

**Request:**

```json
{ "refreshToken": "<jwt>" }
```

**Response (200):** pasangan `token` + `refreshToken` baru.

**Error:** `401 TOKEN_EXPIRED` — client harus redirect ke login.

---

### 2.4 Logout

**POST `/auth/logout`**
**Access:** Authenticated

Memasukkan token ke blacklist sampai `exp`. **Response (200):** `{ "success": true }`.

---

### 2.5 Peran & Matrix Hak Akses

| Fitur | Guest | PETANI | PENYULUH | ADMIN |
|---|---|---|---|---|
| Lihat forum publik | ✔ | ✔ | ✔ | ✔ |
| Scan tanaman | ✖ | ✔ | ✔ | ✔ |
| Jadwal siram | ✖ | ✔ | ✔ | ✔ |
| Estimasi panen | ✖ | ✔ | ✔ | ✔ |
| Posting forum | ✖ | ✔ | ✔ | ✔ |
| Jawab diskusi + lencana verified | ✖ | ✖ | ✔ | ✔ |
| Kelola knowledge base penyakit | ✖ | ✖ | ✖ | ✔ |
| Moderasi forum / kelola user / statistik | ✖ | ✖ | ✖ | ✔ |

---

## 3. Sistem AI Scan Penyakit

Inti produk. Arsitektur dua engine dengan fallback otomatis:

```
[Foto user]
   ↓ (kompresi client: canvas → max 1024px, JPEG q=0.75)
[POST /scans]
   ↓
[Engine A: Model CNN terlatih (Roboflow) — akurasi & latensi terbaik]
   ↓ jika confidence < 0.70 ATAU kelas "unknown"
[Engine B: Vision LLM fallback (Gemini / GLM / Qwen-VL)]
   ↓
[Lookup Knowledge Base — id penyakit → konten edukasi terkurasi]
   ↓
[Respons JSON terstruktur]
   ↓
[Halaman /scan/result render + riwayat]
```

**Prinsip:** model = SENSOR (menjawab "ini penyakit apa"), knowledge base = OTAK (menjawab "lalu bagaimana"). Konten edukasi TIDAK digenerate LLM per-request — diambil dari basis pengetahuan terkurasi agar konsisten, akurat, dan bisa dipertanggungjawabkan.

### 3.1 Upload & Analisis Scan

**POST `/scans`**
**Access:** Authenticated (quota: 10×/bulan guest-terdaftar, 100×/bulan premium — lihat §5.3)
**Content-Type:** `multipart/form-data`

**Request:**

```
image: <file>         // wajib; jpg/png/webp; max 5MB
plantId: "plant_x1"   // opsional; menautkan scan ke profil tanaman
notes: "Daun menguning sejak 3 hari"  // opsional; konteks tambahan utk LLM
```

**Proses server-side:**

1. Validasi file (magic byte, ukuran, content-type) — jangan percaya extension
2. Simpan image → storage, generate `imageUrl`
3. Kompresi internal ke resolusi inference (max 1024px)
4. Panggil Engine A → jika confidence ≥ 0.70 dan kelas dikenal → lanjut
5. Jika tidak → panggil Engine B dengan prompt klasifikasi terstruktur (lihat §14)
6. Lookup knowledge base via `classMap` (nama kelas model → `diseaseId`)
7. Hitung `urgency` berdasarkan `severityLevel` + `contagious`
8. Simpan `ScanRecord` + thumbnail (max 400px) untuk riwayat
9. Kurangi quota; push notifikasi "hasil scan siap" (jika async)

**Response (201) — Kasus A: penyakit terdeteksi (Engine A):**

```json
{
  "success": true,
  "data": {
    "id": "scan_cuid_abc",
    "status": "BERHASIL",
    "imageUrl": "https://storage.tumbuhkita.id/scan/abc.jpg",
    "detection": {
      "engine": "MODEL_TRAINED",
      "modelVersion": "plant-disease-v3",
      "className": "Tomato___Late_blight",
      "confidence": 0.91,
      "inferenceMs": 1400
    },
    "result": {
      "type": "DISEASE",
      "disease": {
        "id": "late-blight",
        "name": "Busuk Daun (Late Blight)",
        "scientificName": "Phytophthora infestans",
        "severityLevel": "TINGGI",
        "contagious": true,
        "symptoms": ["Bercak coklat gelap tepi kekuningan", "Kapang putih abu di bawah daun", "Layu cepat 3-5 hari"],
        "causes": ["Kelembapan >85% berhari-hari", "Suhu 15-22°C + hujan deras"],
        "treatments": [
          { "step": 1, "title": "Isolasi & buang daun sakit", "detail": "Petik daun terinfeksi, kantong tertutup, jangan dikomposkan", "urgent": true },
          { "step": 2, "title": "Aplikasi fungisida", "detail": "Metalaksil/mancozeb sesuai dosis label, ulang 5-7 hari" },
          { "step": 3, "title": "Atur kelembapan", "detail": "Perlebar jarak tanam, siram pagi, perciki sirkulasi" }
        ],
        "products": [
          { "name": "Fungisida Mancozeb 80 WP", "type": "KIMIA", "note": "Kontak, ulang 5-7 hari" },
          { "name": "Trichoderma sp.", "type": "ORGANIK", "note": "Antagonis alami" }
        ],
        "prevention": ["Rotasi non-solanaceae", "Mulsa cegah percikan", "Siaga saat musim hujan"],
        "similarTo": [
          { "diseaseId": "early-blight", "differNote": "Early blight: bercak konsentris seperti papan target" }
        ]
      },
      "confidence": 0.91,
      "urgency": "SEGERA — potensi penyebaran ke tanaman lain dalam beberapa hari",
      "summary": "Terdeteksi busuk daun pada tanaman Anda dengan keyakinan 91%. Penyakit menyebar sangat cepat pada kondisi lembap."
    },
    "meta": {
      "analyzedAt": "2026-09-08T07:30:00.000Z",
      "totalLatencyMs": 2100,
      "fallbackUsed": false
    }
  }
}
```

**Response (201) — Kasus B: sehat:**

```json
{
  "success": true,
  "data": {
    "id": "scan_cuid_def",
    "status": "BERHASIL",
    "imageUrl": "https://storage.tumbuhkita.id/scan/def.jpg",
    "detection": {
      "engine": "MODEL_TRAINED",
      "className": "Tomato___healthy",
      "confidence": 0.96,
      "inferenceMs": 1100
    },
    "result": {
      "type": "HEALTHY",
      "plantType": "tomat",
      "careTips": ["Jaga jadwal siram teratur", "Pupuk NPK seimbang tiap 2 minggu"],
      "summary": "Daun terdeteksi sehat. Pertahankan pola perawatan Anda."
    }
  }
}
```

**Response (201) — Kasus C: confidence rendah → fallback LLM dipakai:**

```json
{
  "success": true,
  "data": {
    "id": "scan_cuid_ghi",
    "status": "BERHASIL",
    "detection": {
      "engine": "VISION_LLM_FALLBACK",
      "provider": "gemini-2.0-flash",
      "modelClass": null,
      "confidence": null,
      "inferenceMs": 4200
    },
    "result": {
      "type": "DISEASE",
      "disease": { "id": "leaf-spot-bakteri", "name": "Bercak Daun Bakteri", "severalField": "..." },
      "confidenceNote": "Identifikasi oleh AI vision generik (bukan model terlatih). Hasil bersifat indikatif — konfirmasi ke penyuluh dianjurkan.",
      "summary": "Gejala konsisten dengan bercak daun bakteri. Konsultasikan ke forum atau penyuluh untuk konfirmasi."
    },
    "meta": { "fallbackUsed": true }
  }
}
```

**Response (201) — Kasus D: tidak dikenal:**

```json
{
  "success": true,
  "data": {
    "id": "scan_cuid_jkl",
    "status": "GAGAL_ANALISIS",
    "imageUrl": "https://storage.tumbuhkita.id/scan/jkl.jpg",
    "detection": {
      "engine": "VISION_LLM_FALLBACK",
      "confidence": null
    },
    "result": {
      "type": "UNKNOWN",
      "reason": "Gambar tidak menampilkan daun/bagian tanaman dengan jelas, atau pencahayaan terlalu buruk",
      "suggestion": "Ambil foto lebih dekat (15-30cm), pastikan daun terlihat tajam dan pencahayaan cukup",
      "ctaForum": "Atau tanyakan langsung di forum komunitas — ada penyuluh terverifikasi",
      "summary": "Maaf, gambar tidak dapat dianalisis. Silakan coba lagi."
    }
  }
}
```

**Error spesifik endpoint ini:**

| Kode | Kondisi |
|---|---|
| `413 FILE_TOO_LARGE` | > 5MB |
| `415 UNSUPPORTED_MEDIA_TYPE` | bukan jpg/png/webp (dicek dari magic byte) |
| `429 QUOTA_EXCEEDED` | quota scan bulanan habis — lihat §5.3 |
| `503 ENGINE_UNAVAILABLE` | kedua engine gagal (network/API down) — client tampilkan retry |
| `504 ENGINE_TIMEOUT` | inference > 30 detik |

**Catatan khusus kamera:** `getUserMedia` butuh secure context (HTTPS/localhost). Untuk demo via tunnel gunakan HTTPS tunnel.

---

### 3.2 Ambil Hasil Scan (by id)

**GET `/scans/:id`**
**Access:** Authenticated (Owner atau ADMIN)

**Response (200):** bentuk sama dengan respons POST `/scans` (Kasus A–D), plus:

```json
"plant": { "id": "plant_x1", "name": "Tomat Hidroponik" }
```

**Error:** `404 SCAN_NOT_FOUND`, `403 FORBIDDEN` (bukan owner).

---

### 3.3 Kongsi Hasil Scan ke Forum

**POST `/scans/:id/share`**
**Access:** Authenticated (Owner)

Membuat draft post di forum dengan hasil scan terlampir (gambar + ringkasan penyakit), status `PENDING_MODERATION`.

**Request:**

```json
{
  "title": "Daun tomat saya kena apa ya?",
  "content": "Mohon suan dari penyuluh, hasil scan bilang late blight."
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "postId": "post_cuid_mno",
    "scanId": "scan_cuid_abc",
    "isApproved": false
  }
}
```

---

## 4. Knowledge Base Penyakit

Basis pengetahuan terkurasi — sumber konten edukasi untuk hasil scan. Dikelola ADMIN. Untuk v1: file statis `diseases.json` + peta `classMap`; siap dimigrasi ke table Prisma `Disease` tanpa mengubah kontrak respons.

### 4.1 Struktur Knowledge Entry

Setiap kelas model punya satu entri (contoh sudah ada di §3.1 Kasus A). Field wajib:

```
id, name, scientificName, aliases[], plantHosts[], commodityGroup,
pathogenType (JAMUR|BAKTERI|VIRUS|DEFISIENSI|HAMA|FISIOLOGIS),
severityLevel (RENDAH|SEDANG|TINGGI|KRITIS), contagious (bool),
symptoms[], causes[], treatments[{step,title,detail,urgent?}],
products[{name,type,note}], prevention[], similarTo[{diseaseId,differNote}],
sources[]
```

`aliases` menjembatani nama kelas dataset yang buruk (`Tomato___Late_blight`) ke id bersih. `pathogenType` menentukan jenis obat — mencegah rekomendasi salah kategori (mis. fungisida untuk penyakit bakteri).

### 4.2 Ambil Daftar Penyakit

**GET `/diseases`**
**Access:** Public

**Query:** `?search=busuk&plantType=tomat&severity=TINGGI&page=1&limit=20`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "diseases": [
      { "id": "late-blight", "name": "Busuk Daun (Late Blight)", "scientificName": "Phytophthora infestans", "severityLevel": "TINGGI", "plantHosts": ["tomat", "kentang", "cabai"] }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 15 }
  }
}
```

### 4.3 Ambil Detail Penyakit

**GET `/diseases/:id`**
**Access:** Public

**Response (200):** satu entri knowledge penuh (bentuk §3.1 Kasus A `.result.disease`).

### 4.4 CRUD Admin (lihat §11)

---

## 5. Riwayat Scan & Quota

### 5.1 Riwayat Scan User

**GET `/users/me/scans`**
**Access:** Authenticated

**Query:** `?page=1&limit=10&type=DISEASE&from=2026-08-01&to=2026-09-08`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "scans": [
      {
        "id": "scan_cuid_abc",
        "thumbnailUrl": "https://storage.tumbuhkita.id/thumbs/abc_400.jpg",
        "status": "BERHASIL",
        "resultType": "DISEASE",
        "diseaseName": "Busuk Daun (Late Blight)",
        "confidence": 0.91,
        "engine": "MODEL_TRAINED",
        "plant": { "id": "plant_x1", "name": "Tomat Hidroponik" },
        "createdAt": "2026-09-08T07:30:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 12 },
    "quota": { "used": 5, "limit": 10, "resetAt": "2026-10-01T00:00:00.000Z" }
  }
}
```

**Catatan frontend v1:** sebelum backend penuh jalan, riwayat dapat dibaca dari `localStorage['tumbuhkita-scan-history']` dengan struktur field yang sama (id, thumbnail, diseaseId, diseaseName, confidence, type, scannedAt, plantId, engine) — migrasi ke endpoint ini tanpa refactor UI.

### 5.2 Hapus Scan

**DELETE `/scans/:id`**
**Access:** Authenticated (Owner)

**Response (200):** `{ "success": true }`. Thumbnail & image ikut dihapus dari storage.

### 5.3 Quota Scan

Quota dihitung per kalender bulan (reset tanggal 1).

| Tier | Limit | resetAt |
|---|---|---|
| Guest (tidak login) | 0 — tidak bisa scan | — |
| Terdaftar | 10 scan/bulan | tanggal 1 bulan berikutnya |
| Premium | 100 scan/bulan | tanggal 1 bulan berikutnya |

**GET `/scans/quota`** — **Access:** Authenticated

```json
{
  "success": true,
  "data": { "used": 5, "limit": 10, "resetAt": "2026-10-01T00:00:00.000Z" }
}
```

---

## 6. Manajemen Tanaman

Profil tanaman = fondasi siram otomatis (§7), estimasi panen (§8), dan pengaitan riwayat scan.

### 6.1 Buat Tanaman

**POST `/plants`**
**Access:** Authenticated
**Content-Type:** `multipart/form-data`

**Request:**

```
name: "Tomat Cherry"          // wajib
type: "Solanum lycopersicum"  // wajib; nama jenis/spesies
category: "SAYUR"             // SAYUR|BUAH|HIAS|OBAT|PERKEBUNAN
plantingDate: "2026-07-15"    // wajib; acuan estimasi panen
notes: "Ditanam di pot 30cm"
photo: <file>
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "plant_cuid_p1",
    "name": "Tomat Cherry",
    "type": "Solanum lycopersicum",
    "category": "SAYUR",
    "plantingDate": "2026-07-15T00:00:00.000Z",
    "photoUrl": "https://storage.tumbuhkita.id/plants/p1.jpg",
    "notes": "Ditanam di pot 30cm",
    "healthStatus": "SEHAT",
    "createdAt": "2026-09-08T03:00:00.000Z"
  }
}
```

`healthStatus` diturunkan otomatis: `SEHAT` | `WASPADA` (scan terakhir RENDAH/SEDANG) | `SAKIT` (scan terakhir TINGGI/KRITIS). Dihitung dari riwayat scan terkait tanaman.

### 6.2 Daftar Tanaman

**GET `/plants`**
**Access:** Authenticated

**Query:** `?page=1&limit=20&category=SAYUR&sort=nextWatering`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "plants": [
      {
        "id": "plant_cuid_p1",
        "name": "Tomat Cherry",
        "type": "Solanum lycopersicum",
        "category": "SAYUR",
        "photoUrl": "https://storage.tumbuhkita.id/plants/p1.jpg",
        "healthStatus": "SAKIT",
        "wateringSchedule": {
          "nextWateringAt": "2026-09-09T01:00:00.000Z",
          "isAuto": true,
          "source": "CUACA"
        },
        "scanCount": 3
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 4 }
  }
}
```

### 6.3 Detail Tanaman

**GET `/plants/:id`**
**Access:** Authenticated (Owner)

Gabungan profil + jadwal siram aktif + riwayat scan terkait (3 terakhir) + estimasi panen jika ada.

### 6.4 Update Tanaman

**PATCH `/plants/:id`** — **Access:** Authenticated (Owner)

Field sama seperti pembuatan, semua opsional. Multipart jika ada foto baru.

### 6.5 Hapus Tanaman

**DELETE `/plants/:id`** — **Access:** Authenticated (Owner)

Cascade: hapus jadwal siram, lepas kaitan scan (scan tetap tersimpan di riwayat umum).

---

## 7. Jadwal Siram Otomatis

Fitur unggulan PRD: jadwal siram berbasis jenis tanaman + cuaca lokal — bukan kebiasaan.

### 7.1 Logika Perhitungan Otomatis

```
nextWateringAt = f(baselineJenisTanaman, faktorCuaca, faktorKesehatan)
```

1. **Baseline per jenis tanaman** (tabel kurasi, contoh):

   | Kategori/Jenis | Baseline interval |
   |---|---|
   | Tomat (sayur daun/buah muda) | 24 jam |
   | Cabai | 36 jam |
   | Lidah mertua/Sansevieria | 7 hari |
   | Monstera (hias daun besar) | 3 hari |
   | Succulent/kaktus | 10 hari |

2. **Faktor cuaca** (API cuaca eksternal — Open-Meteo gratis, tanpa key):
   - Hujan hari ini / kemarin (>5mm) → tunda +24-48 jam, `source: "CUACA"`
   - Suhu >32°C + kelembapan <50% → majukan −25% interval
   - Cerah berawan normal → baseline

3. **Faktor kesehatan** (dari riwayat scan):
   - `SAKIT` (penyakit jamur/bakteri daun) → jangan siram malam, anjurkan pagi + kurangi volume
   - `SEHAT` → normal

4. **Recalc trigger:** tiap fetch jadwal, setelah "sudah disiram", saat cuaca berubah signifikan (cron per jam server-side, atau lazy compute saat client hit endpoint).

### 7.2 Set Jadwal (Manual Override)

**PUT `/plants/:plantId/watering`**
**Access:** Authenticated (Owner)

**Request:**

```json
{
  "nextWateringAt": "2026-09-09T01:00:00.000Z",
  "isAuto": false,
  "reminderEnabled": true,
  "reminderMinutes": 30
}
```

`isAuto: true` → server abaikan `nextWateringAt` yang dikirim dan hitung sendiri (§7.1). `isAuto: false` → jadwal manual user yang dipakai.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "ws_cuid_w1",
    "plantId": "plant_cuid_p1",
    "nextWateringAt": "2026-09-09T01:00:00.000Z",
    "isAuto": false,
    "source": "MANUAL",
    "reminderEnabled": true,
    "reminderMinutes": 30,
    "lastWateredAt": "2026-09-08T00:30:00.000Z"
  }
}
```

### 7.3 Tandai Sudah Disiram

**POST `/plants/:plantId/watering/mark`**
**Access:** Authenticated (Owner)

**Request (opsional):**

```json
{ "wateredAt": "2026-09-08T01:00:00.000Z", "volumeMl": 500 }
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "lastWateredAt": "2026-09-08T01:00:00.000Z",
    "nextWateringAt": "2026-09-09T01:00:00.000Z",
    "source": "CUACA",
    "streak": 5
  }
}
```

Server menghitung ulang `nextWateringAt` — baseline + faktor cuaca 3 hari ke depan.

### 7.4 Ambil Jadwal Hari Ini (Agenda)

**GET `/watering/today`**
**Access:** Authenticated

Semua tanaman user yang perlu disiram hari ini + rekomendasi waktu terbaik dari cuaca.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "date": "2026-09-08",
    "bestWindow": { "from": "05:30", "to": "08:00", "reason": "Suhu belum tinggi, evaporasi rendah; hujan diprediksi sore" },
    "items": [
      {
        "plantId": "plant_cuid_p1",
        "name": "Tomat Cherry",
        "photoUrl": "https://storage.tumbuhkita.id/plants/p1.jpg",
        "dueAt": "2026-09-08T01:00:00.000Z",
        "overdue": false,
        "recommendation": "Siram pagi, volume sedang. Tanaman sedang sakit — hindari membasahi daun."
      }
    ]
  }
}
```

### 7.5 Ringkahan Cuaca untuk Siram

**GET `/watering/weather?lat=-7.98&lon=112.63`**
**Access:** Authenticated

**Response (200):**

```json
{
  "success": true,
  "data": {
    "location": "Kedungkandang, Hari Ini",
    "current": { "temp": 27, "humidity": 53, "rainChance": 20, "sunset": "17:30" },
    "forecast3d": [
      { "date": "2026-09-08", "rainMm": 0, "temp": "27/26" },
      { "date": "2026-09-09", "rainMm": 4.2, "temp": "26/24" },
      { "date": "2026-09-10", "rainMm": 0, "temp": "28/25" }
    ],
    "wateringAdvice": "Besok prediksi hujan ringan — tunda penyiraman besok jika tanaman di luar ruangan."
  }
}
```

Sumber: Open-Meteo (gratis, tanpa API key) — proxy lewat server TumbuhKita untuk caching + normalisasi format.

---

## 8. Estimasi Panen

PRD: estimasi waktu + hasil panen berdasarkan jenis tanaman, tanggal tanam, dan riwayat kesehatan.

### 8.1 Logika Estimasi

```
estPanenDate = tanamDate + durasiVaritas ± healthAdjust
estYield     = baselineYieldVaritas × healthFactor × careFactor
```

- `durasiVaritas`: tabel kurasi per jenis (mis. tomat cherry 60-75 HST)
- `healthAdjust`: terakhir scan `SAKIT` → +7-14 hari & −30% yield; `WASPADA` → +0-5 hari & −10%
- `careFactor`: konsistensi siram (streak tanpa overdue >80% → +10%)

### 8.2 Ambil Estimasi

**GET `/plants/:plantId/harvest-estimate`**
**Access:** Authenticated (Owner)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "plantId": "plant_cuid_p1",
    "plantName": "Tomat Cherry",
    "estimate": {
      "harvestWindowStart": "2026-09-14",
      "harvestWindowEnd": "2026-09-29",
      "daysFromNow": 6,
      "estimatedYield": "1.2 - 1.8 kg",
      "confidence": "SEDANG",
      "healthImpact": "Scan terakhir mendeteksi late blight — estimasi ditunda 7 hari dan hasil dipotong 30%."
    },
    "factors": {
      "plantingDate": "2026-07-15",
      "varietyBaseline": "60-75 HST",
      "healthStatus": "SAKIT",
      "wateringStreak": 5
    }
  }
}
```

---

## 9. Forum Komunitas

### 9.1 Daftar Post

**GET `/forum/posts`**
**Access:** Public

**Query:** `?page=1&limit=20&search=kutu&category=HAMA&sort= newest|top&authorId=&scanId=`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post_cuid_f1",
        "title": "Daun cabai berkerut, ini hama apa?",
        "content": "Sudah seminggu daun muda menggulung...",
        "imageUrl": "https://storage.tumbuhkita.id/forum/f1.jpg",
        "category": "HAMA",
        "author": {
          "id": "user_uuid_1",
          "name": "Budi Santoso",
          "photoUrl": "https://storage.tumbuhkita.id/avatar/budi.jpg",
          "role": "PETANI",
          "isVerified": false
        },
        "attachedScan": {
          "id": "scan_cuid_abc",
          "diseaseName": "Busuk Daun (Late Blight)",
          "confidence": 0.91
        },
        "commentsCount": 5,
        "topAnswer": {
          "id": "comment_cuid_c9",
          "author": { "name": "Pak Sri, S.Pt", "isVerified": true, "role": "PENYULUH" },
          "excerpt": "Itu kutu daun (Aphis gossypii). Semprot...")
        },
        "createdAt": "2026-09-08T04:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 120 }
  }
}
```

### 9.2 Buat Post

**POST `/forum/posts`**
**Access:** Authenticated
**Content-Type:** `multipart/form-data`

**Request:**

```
title: "Daun cabai berkerut"          // wajib, 5-120 char
content: "..."                          // wajib, min 20 char
category: HAMA                          // HAMA|PENYAKIT|PERAWATAN|NUTRISI|LAIN
scanId: "scan_cuid_abc"                 // opsional — lampirkan hasil scan
image: <file>                           // opsional
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "post_cuid_f2",
    "title": "Daun cabai berkerut",
    "category": "HAMA",
    "isApproved": true,
    "attachedScanId": "scan_cuid_abc"
  }
}
```

### 9.3 Detail Post + Komentar

**GET `/forum/posts/:postId`**
**Access:** Public

**Response (200):** post penuh + `comments[]` (urut: verified penyuluh dulu, lalu terbaru) + `commentsCount`.

Komentar:

```json
{
  "id": "comment_cuid_c1",
  "content": "Coba minyak nimba 5ml/liter...",
  "author": { "id": "user_uuid_2", "name": "Sari", "role": "PETANI", "isVerified": false },
  "isAcceptedAnswer": false,
  "upvotes": 3,
  "createdAt": "2026-09-08T05:00:00.000Z"
}
```

### 9.4 Buat Komentar

**POST `/forum/posts/:postId/comments`**
**Access:** Authenticated

**Request:**

```json
{ "content": "Terima kasih, saya coba dulu" }
```

**Response (201):** objek komentar (bentuk §9.3).

### 9.5 Upvote Komentar

**POST `/forum/comments/:commentId/upvote`** — **Access:** Authenticated. Toggle (upvote lagi = batal).

**Response (200):** `{ "upvotes": 4, "upvotedByMe": true }`

### 9.6 Tandai Jawaban Tersimpan (Penyuluh)

**POST `/forum/posts/:postId/answers/:commentId/accept`**
**Access:** Penyuluh terverifikasi atau ADMIN (atau owner post untuk pertanyaan sendiri)

Menandai komentar sebagai jawaban tersimpan. **Response (200):** `{ "isAcceptedAnswer": true }`

---

## 10. Notifikasi

### 10.1 Daftar Notifikasi

**GET `/notifications`**
**Access:** Authenticated

**Response (200):**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_cuid_n1",
        "type": "WATERING_REMINDER",
        "title": "Waktunya menyiram!",
        "body": "Tomat Cherry perlu disiram dalam 30 menit",
        "relatedId": "plant_cuid_p1",
        "relatedType": "PLANT",
        "isRead": false,
        "createdAt": "2026-09-08T00:30:00.000Z"
      }
    ],
    "unreadCount": 3
  }
}
```

Tipe notifikasi: `WATERING_REMINDER` | `SCAN_RESULT_READY` | `FORUM_REPLY` | `DISEASE_ALERT` (cuaca rawan penyakit di area user — mis. musim hujan → siaga late blight) | `SYSTEM`.

### 10.2 Tandai Dibaca

**PATCH `/notifications/:id/read`** — **Access:** Authenticated (Owner). **Response (200):** `{ "isRead": true }`

**PATCH `/notifications/read-all`** — tandai semua. **Response (200):** `{ "unreadCount": 0 }`

---

## 11. Admin

### 11.1 Statistik Platform

**GET `/admin/statistics`** — **Access:** ADMIN

```json
{
  "success": true,
  "data": {
    "users": { "total": 1250, "newThisMonth": 85, "byRole": { "PETANI": 1180, "PENYULUH": 45, "ADMIN": 5 } },
    "scans": { "total": 5420, "thisMonth": 680, "byResult": { "DISEASE": 2900, "HEALTHY": 2200, "UNKNOWN": 320 }, "topDiseases": [ { "id": "late-blight", "count": 412 } ] },
    "forum": { "totalPosts": 342, "pendingModeration": 5 },
    "engine": { "modelTrained": 4510, "llmFallback": 910, "fallbackRate": 0.168 }
  }
}
```

### 11.2 Kelola User

**GET `/admin/users`** — daftar + statistik per user (scanCount, postCount, status).
**PATCH `/admin/users/:id/role`** — ubah peran (verifikasi penyuluh, promote admin).
**PATCH `/admin/users/:id/status`** — suspend/aktifkan akun.

### 11.3 CRUD Knowledge Base

- **GET `/admin/diseases`** — daftar penuh termasuk draft
- **POST `/admin/diseases`** — tambah entri (schema §4.1)
- **PATCH `/admin/diseases/:id`** — update
- **DELETE `/admin/diseases/:id`** — hapus (ditolak jika masih dirujuk scan — pakai soft-delete/arsip)

**POST `/admin/diseases`** request contoh:

```json
{
  "id": "leaf-spot-bakteri",
  "name": "Bercak Daun Bakteri",
  "scientificName": "Xanthomonas campestris pv. vesicatoria",
  "aliases": ["Tomato___Bacterial_spot", "pepper___bacterial_spot"],
  "plantHosts": ["tomat", "cabai"],
  "commodityGroup": "hortikultura",
  "pathogenType": "BAKTERI",
  "severityLevel": "TINGGI",
  "contagious": true,
  "symptoms": ["Bercak berair transparan awal", "Halo kuning mengelilingi bercak", "Daun gugur dini"],
  "causes": ["Kelembapan tinggi", "Siram menyebarkan percikan bakteri", "Benih terinfeksi"],
  "treatments": [
    { "step": 1, "title": "Isolasi tanaman", "detail": "Jauhkan dari tanaman sehat", "urgent": true },
    { "step": 2, "title": "Bakterisida tembaga", "detail": "Semprot copper oxychloride pagi hari" },
    { "step": 3, "title": "Perbaiki pola siram", "detail": "Siram pagi, jangan membasahi daun" }
  ],
  "products": [
    { "name": "Bakterisida Tembaga Oksida", "type": "KIMIA", "note": "Sesuai dosis label" },
    { "name": "Minyak Nimba", "type": "ORGANIK", "note": "Pencegahan organik" }
  ],
  "prevention": ["Benih sehat bersertifikat", "Mulsa", "Jarak tanam cukup"],
  "similarTo": [{ "diseaseId": "late-blight", "differNote": "Late blight menyebar jauh lebih cepat" }],
  "sources": ["plantvillage.org/late-blight", "Litbang Pertanian"]
}
```

### 11.4 Moderasi Forum

**GET `/admin/moderation?status=PENDING`** — antrean post/komentar.
**PATCH `/admin/moderation/:id`** — `{ "action": "APPROVE" | "REJECT" | "DELETE", "reason": "..." }`.

### 11.5 Manajemen Model & Engine

- **GET `/admin/engines`** — status kesehatan engine (latensi, error rate, quota Roboflow, fallback rate)
- **PATCH `/admin/engines`** — `{ "primaryEngine": "MODEL_TRAINED", "fallbackEnabled": true, "confidenceThreshold": 0.70, "activeModelVersion": "plant-disease-v3" }`

`confidenceThreshold` = ambang penentu kapan fallback LLM diaktifkan.

---

## 12. Format Error & Kode

Semua error mengikuti envelope (§1). Kode lengkap:

### Error Umum

| Kode | HTTP | Kondisi |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Input tidak valid — `details` berisi field error |
| `UNAUTHORIZED` | 401 | Token tidak ada/invalid/kedaluwarsa |
| `FORBIDDEN` | 403 | Ter-autentikasi tapi tidak berhak |
| `NOT_FOUND` | 404 | Resource tidak ada |
| `CONFLICT` | 409 | Duplikat (email, dsb.) |
| `FILE_TOO_LARGE` | 413 | > 5MB |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Format file ditolak |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit umum |
| `INTERNAL_ERROR` | 500 | Server error — jangan bocorkan stack |

### Error Spesifik Domain

| Kode | HTTP | Kondisi |
|---|---|---|
| `QUOTA_EXCEEDED` | 429 | Quota scan bulanan habis |
| `EMAIL_ALREADY_EXISTS` | 409 | Register dengan email terpakai |
| `INVALID_CREDENTIALS` | 401 | Login gagal |
| `TOKEN_EXPIRED` | 401 | Refresh token kedaluwarsa |
| `SCAN_NOT_FOUND` | 404 | Scan id tidak ada |
| `PLANT_NOT_FOUND` | 404 | Tanaman tidak ada |
| `DISEASE_NOT_FOUND` | 404 | id penyakit tidak ada di knowledge base |
| `ENGINE_UNAVAILABLE` | 503 | Semua engine AI gagal |
| `ENGINE_TIMEOUT` | 504 | Inference > 30s |
| `WEATHER_SERVICE_ERROR` | 502 | API cuaca eksternal gagal (siram jatuh ke baseline manual) |

---

## 13. Konstanta Sistem

```ts
// Validasi & limit
MAX_UPLOAD_MB: 5
MAX_IMAGE_DIMENSION: 4096           // tolak lebih besar
INFERENCE_INPUT_MAX_PX: 1024       // resize sebelum kirim engine
THUMBNAIL_PX: 400                  // untuk riwayat
JPEG_QUALITY: 0.75

// AI engine
PRIMARY_ENGINE: "MODEL_TRAINED"     // Roboflow hosted inference
FALLBACK_ENGINE: "VISION_LLM"      // Gemini / GLM-4V / Qwen-VL
CONFIDENCE_THRESHOLD: 0.70         // < threshold → fallback LLM
ENGINE_TIMEOUT_MS: 30000

// Siram otomatis
WEATHER_PROVIDER: "open-meteo"
WEATHER_CACHE_MINUTES: 30
RAIN_DELAY_THRESHOLD_MM: 5          // hujan > 5mm → tunda siram
HOT_TEMP_THRESHOLD: 32              // °C → majukan siram
LOW_HUMIDITY_THRESHOLD: 50          // % → majukan siram

// Quota
SCAN_QUOTA_REGISTERED: 10
SCAN_QUOTA_PREMIUM: 100
QUOTA_RESET_DAY: 1

// Rate limit
RATE_AUTH: 20
RATE_AUTHED: 100
RATE_PUBLIC: 20                     // req/menit

// Pagination
DEFAULT_PAGE: 1
DEFAULT_LIMIT: 20
MAX_LIMIT: 100
```

---

## 14. Diagram Alur Sistem AI

```
                       ┌────────────────────────────────────────────┐
                       │            POST /scans (§3.1)             │
                       └──────────────────┬─────────────────────────┘
                                          │ validasi file + quota
                    ┌─────────────────────┴──────────────────────┐
                    │                                            │
              valid ✔                                    invalid → 400/413/415/429
                    │
                    ▼
        ┌───────────────────────┐
        │  ENGINE A: CNN MODEL  │  Roboflow hosted inference
        │  (plant-disease-v3)   │  input: foto 1024px
        └───────────┬───────────┘  output: className + confidence
                    │
        ┌───────────┴───────────────┐
        │                           │
   confidence ≥ 0.70        confidence < 0.70 / unknown
        │                           │
        │                           ▼
        │               ┌────────────────────────┐
        │               │ ENGINE B: VISION LLM   │  prompt terstruktur (JSON schema):
        │               │ (Gemini fallback)      │  "identifikasi penyakit tanaman,
        │               └───────────┬────────────┘   beri keyakinan rendah=tolak,
        │                           │                fokus daun, abaikan latar"
        │                    jawaban valid?
        │                    │           │
        │                   ✔           ✖ → result UNKNOWN (Kasus D)
        │                    │
        ▼                    ▼
   ┌──────────────────────────────────┐
   │  LOOKUP KNOWLEDGE BASE           │  classMap: "Tomato___Late_blight"
   │  diseases.json / Prisma Disease  │          → "late-blight"
   └───────────────┬──────────────────┘
                   │ merge detection + konten kurasi
                   ▼
   ┌──────────────────────────────────┐
   │  RAKIT RESPON JSON               │  type: DISEASE|HEALTHY|UNKNOWN
   │  + urgency + summary             │  (Kasus A/B/C/D §3.1)
   └───────────────┬──────────────────┘
                   │
                   ▼
   ┌──────────────────────────────────┐
   │  SIMPAN ScanRecord + thumbnail   │
   │  kurangi quota + notifikasi       │
   └───────────────┬──────────────────┘
                   ▼
        /scan/result render + riwayat (/users/me/scans)
```

**Prompt fallback LLM (template — disimpan server-side, bukan dikirim client):**

```
Kamu adalah asisten diagnosis kesehatan tanaman untuk petani Indonesia.
Tugas: identifikasi penyakit/masalah dari gambar daun/tanaman ini.

ATURAN:
1. Fokus HANYA pada daun/bagian tanaman; abaikan latar, pot, tangan.
2. Kalau gambar tidak jelas / bukan tanaman / kamu tidak yakin, jawab
   {"type": "UNKNOWN", "reason": "..."} — JANGAN menebak.
3. Kalau daun tampak sehat, jawab {"type": "HEALTHY", ...}.
4. Output WAJIB JSON valid sesuai schema berikut — tanpa teks lain:
   { "type": "DISEASE"|"HEALTHY"|"UNKNOWN",
     "diseaseId": "slug-kecil-tanpa-spasi"|null,
     "name": "...", "scientificName": "...",
     "confidence": 0..1|null, "reasoning": "gejala yang terlihat" }

Catatan konteks user (opsional): {notes}
```

`diseaseId` dari LLM dicocokkan ke knowledge base dengan fuzzy matching (alias + nama) — kalau tidak cocok, tampilkan konten generik + arahkan ke forum.

---

## 15. Arsitektur & Catatan Implementasi

### 15.1 Peta Route Handler Next.js (App Router)

```
src/app/api/
├── auth/
│   ├── register/route.ts
│   ├── login/route.ts
│   ├── refresh/route.ts
│   └── logout/route.ts
├── scans/route.ts                  # POST /scans
├── scans/[id]/route.ts              # GET, DELETE
├── scans/[id]/share/route.ts        # POST
├── scans/quota/route.ts             # GET
├── diseases/route.ts                # GET (public)
├── diseases/[id]/route.ts           # GET
├── users/me/scans/route.ts          # GET riwayat
├── plants/route.ts                  # GET, POST
├── plants/[id]/route.ts             # GET, PATCH, DELETE
├── plants/[id]/watering/route.ts    # PUT
├── plants/[id]/watering/mark/route.ts
├── plants/[id]/harvest-estimate/route.ts
├── watering/today/route.ts
├── watering/weather/route.ts
├── forum/posts/route.ts             # GET, POST
├── forum/posts/[postId]/route.ts    # GET
├── forum/posts/[postId]/comments/route.ts
├── forum/comments/[commentId]/upvote/route.ts
├── forum/posts/[postId]/answers/[commentId]/accept/route.ts
├── notifications/route.ts
├── notifications/[id]/read/route.ts
├── notifications/read-all/route.ts
├── admin/...
└── health/route.ts                  # GET uptime/status (publik, utk monitoring)
```

### 15.2 Urutan Implementasi Bertahap (rekomendasi 12 hari)

| Fase | Fokus | Endpoint | Estimasi |
|---|---|---|---|
| 1 | Fondasi: auth + users | §2 | 1 hari |
| 2 | **Scan pipeline penuh** (kompres client → engine A → fallback B → knowledge lookup → respons) | §3, §4 | 3 hari |
| 3 | Riwayat + quota + share ke forum | §5, §3.3 | 1 hari |
| 4 | Tanaman + siram otomatis + cuaca | §6, §7 | 2 hari |
| 5 | Estimasi panen + notifikasi | §8, §10 | 1 hari |
| 6 | Forum penuh + role penyuluh | §9 | 1.5 hari |
| 7 | Admin + statistik + moderasi | §11 | 1 hari |
| 8 | Polish: error handling, loading state, demo | — | 1.5 hari |

### 15.3 Keamanan

- API key engine AI (Roboflow/Gemini) HANYA di server — env var `ROBOFLOW_API_KEY`, `GEMINI_API_KEY`; tidak pernah sampai ke client
- Validasi upload dari magic byte, bukan extension/MIME client
- Rate limit per-IP + per-user
- Semua endpoint owner-checked (scan, plant, watering) — IDOR protection
- Thumbnail disimpan server-side; dataURL besar tidak masuk DB (bloat) — hanya URL
- Prompt LLM tidak boleh diekspos via request yang bisa dikontrol user (injection) — `notes` user ditempel dengan sanitasi + pembatasan panjang
- Kamera butuh HTTPS — production/tunnel wajib TLS

### 15.4 Catatan Status Frontend v1

Frontend tumbuhkita3 saat ini murni placeholder (data statis, tanpa backend). Endpoint di dokumen ini adalah TARGET kontrak. Urutan integrasi frontend:
1. `POST /scans` menggantikan `sessionStorage['scan-capture']` mock
2. Riwayat halaman `/riwayat` beralih dari `localStorage` → `GET /users/me/scans`
3. Siram page memakai `GET /watering/today` + `GET /watering/weather`
4. Forum memakai `GET /forum/posts` + comment
5. Struktur respons localStorage dirancang identik dengan API agar migrasi UI minim refactor

---

*Dokumen versi 2.0 — disusun untuk TumbuhKita v1.0 (PJBL RPL, SMKN 4 Malang).*
