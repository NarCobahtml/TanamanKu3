# Redesign mobile viewport tumbuhkita3 — sesuaikan block `lg:hidden` semua halaman dengan referensi Figma mobile1

Referensi desain: PNG di `/mnt/d/belajar/pjbl/ApjblTumbuhKita/file figma/all pages mobile/mobile1/` (baca via tool gambar kalau perlu). Target: block mobile (`lg:hidden`) tiap halaman di `src/app/*/page.tsx` dibangun ulang mengikuti referensi ini. Desktop block (`hidden lg:block`) dan landing TIDAK BOLEH disentuh sama sekali.

## Design tokens mobile (dari Figma)
- Background app: #F5F5F0 (cream off-white)
- Kartu: putih, rounded-xl (12-16px), border 1px #E8E8E8, shadow sangat subtle
- Primary green: #1B5E20 (tombol utama, chip aktif, teks aksen)
- Light green: #C8E6C9 (tombol sekunder bg, ikon bg)
- Text: #1A1A1A heading, #666666 secondary, #757575 muted, #999999 inactive nav
- Error/overdue: #D32F2F
- Font: sudah Plus Jakarta Sans (self-host). Heading bold besar, body 14-16px.
- App shell: container max-w-[390px] center, bg #F5F5F0 (pola .app-shell/.app-container sudah ada di globals.css — pertahankan/extend)

## BottomNav (komponen `src/components/BottomNav.tsx` — update)
4 item: Beranda (/home, icon rumah), Scan (/scan, icon viewfinder/QR), Forum (/forum, icon chat), Siram (/siram, icon daun). Fixed bottom, bg putih, border-top #E8E8E8, height ~70px, icon 24px + label 11px. Aktif: #1B5E20; inactive #999999. Referensi: `nav.png` + `BottomNavBar (From JSON, modified layout for fixed bottom).png`.

## Header mobile (komponen `src/components/Header.tsx` — update)
Icon daun hijau kiri (~24px), avatar bulat kanan (~40px). Bg transparan. Di halaman forum tambah icon search.

## Per halaman (ganti ISI block mobile, bukan desktop):
1. **home** (`home.png`): greeting "Selamat pagi," muted 14px + "Halo, Alex!" bold 34px; card paket scan bg #1B5E20 rounded-2xl ("Paket Gratis" opacity-90, "3 / 5 Scan Tersisa" bold 20px, tombol "Upgrade Paket" bg-white/20 rounded-lg); card status tanaman putih (label "STATUS TANAMAN" uppercase 11px #888, ikon lingkaran + "Semua Sehat" bold + angka besar 12 tnum + "Tanaman", divider, baris penyiraman: ikon droplet bg #C8E6C9 + "Penyiraman Hari Ini" + "3 tanaman perlu air" + link "Lihat" #1B5E20); grid 2 tombol aksi: "Scan Tanaman" bg #1B5E20 putih & "Tambah Tanaman" bg #C8E6C9 teks #1B5E20, masing ikon 32px + label bold; section "Jadwal Hari Ini" heading bold 20px + kartu tanaman putih flex (foto 60px rounded-lg, nama bold 16, instruksi 13 #666, checklist circle kanan 28px border #E8E8E8).
2. **login** (`login.png`): heading "Selamat Datang Kembali" bold 28 + sub "Masuk untuk rawat tanaman Anda" muted; field email (ikon envelope kiri, placeholder your@mail.com) & password (ikon lock + eye toggle kanan) putih rounded-lg border #E8E8E8; link "Lupa Password?" kanan #1B5E20; tombol "Masuk" full-width bg #1B5E20 putih rounded-lg; divider "atau masuk dengan"; 2 tombol sosial putih border (Google + Facebook); footer "Belum punya akun? Daftar Sekarang". Struktur logika field tetap pakai state yang ada (showPassword dst).
3. **register** (`register.png`): heading "Bergabung dengan TumbuhKita" + sub "Mulai perjalanan merawat tanaman Anda"; 4 field: Nama Lengkap (ikon user), Email, Password (lock + eye), Konfirmasi Password (lock); checkbox setuju S&K; tombol "Daftar Sekarang" #1B5E20; divider "atau daftar dengan"; Google + Apple/Facebook; footer "Sudah punya akun? Masuk".
4. **siram** (`siram.png`): header + filter chips horizontal scroll ("Semua" aktif bg #1B5E20 putih rounded-full, lainnya putih border); kartu tanaman per item: putih rounded-2xl p-5, nama bold 20, "Jadwal Berikutnya" 12 #757575, status text (merah #D32F2F kalau overdue), ikon status lingkaran 40px kanan atas (abu E0E0E0+ikon #616161 / hijau C8E6C9+check #66BB6A / merah FFCDD2+X #E53935). Data tanaman list yang ada dipertahankan isinya.
5. **siram/[id] detail** (`detail siram.png`): back + judul nama tanaman bold; section cuaca: "Kedungkandang, Hari Ini" muted, suhu besar 60px bold tnum "27°C" + range kecil, sunset + kelembaban 53% dengan ikon; section "AI Summary": header ikon sparkle + teks hijau bold, paragraf dengan kalimat penting bold hijau, toggle notifikasi; section "Waktu Siram & Semprot" + subtitle "Berdasarkan kondisi cuaca saat ini" + ikon info: 4 time slot card (Now/4PM/5PM/6PM, bg pink muda #FFEBEE utk unfavorable + X merah, cream utk moderate + ⚠️), legend (✓ Optimal hijau, ⚠ Moderate, ✗ Unfavourable merah); prediksi 7 hari scroll horizontal (hari, ikon cuaca, 27°C, kartu putih border); CTA bawah sticky: pill besar bg #1B5E20 "Sudah Menyiram?" + sub kecil "Tandai jadwal hari ini sebagai selesai".
6. **scan kamera** (`kamera.png`): full-screen kamera (logika getUserMedia yang ada dipertahankan), header overlay bg-black/45: back kiri, "Scan Tanaman" judul, ikon reload/bantuan kanan; viewfinder bracket 4 sudut putih (sudah ada — pertahankan); pill instruksi tengah bawah "Posisikan daun di dalam bingkai" bg-black/60; bottom bar bg-black/50 backdrop-blur: tombol Galeri (thumbnail putih rounded-lg) + shutter besar (lingkaran border-4 putih, dalam hijau #1B5E20 lingkaran) + flash. Kira-kira sudah ada, cukup rapikan warna (shutter hijau #1B5E20 bukan #1B5E20-nya lama, cek konsistensi).
7. **scan/result (hasil scan)** (`hasil scan.png`): header "Hasil Analisis" bold + back; foto full-width + badge "94% Akurat" pill putih/90 kiri atas dengan ikon check; judul penyakit bold 24 ("Bercak Daun Bakteri") + nama latin italic muted; info box warning bg cream/beige rounded-lg ikon jam + teks peringatan penyebaran; section "Analisis AI" (header ikon sparkle + bold) bg cream: paragraf AI + "Gejala Utama" bold + "Bercak berair, Halo kuning" + "Bagian Terdampak" bold + "Daun bawah & tengah"; section "Rekomendasi Penanganan": numbered list 1-2-3 (judul bold + desc muted) — konten treatments yang ada dipertahankan; tombol: "Simpan ke Riwayat" pill full-width bg #1B5E20 + "Tanya Ahli" pill bg #C8E6C9 teks #1B5E20. BottomNav tampil.
8. **forum** (`forum.png`): header + search icon; chips kategori horizontal ("Semua" aktif #1B5E20, Hama & Penyakit, Perawatan, Nutrisi); kartu post putih rounded-xl p-4: avatar 48px + nama bold 16 + waktu muted 12, judul bold 18, preview 2 baris #424242, gambar full rounded-lg, action bar: like (thumbs + count) comment (bubble + count) share, abu #616161; FAB hijau #1B5E20 lingkaran 56px ikon + putih, fixed kanan bawah di atas bottom nav, link ke /forum/create. Data posts yang ada dipertahankan.
9. **forum/[id] detail** (`deail forum.png`): back; kartu post detail: avatar 44 + nama bold + "2 jam yang lalu • Tanaman Hias" muted, judul bold 20, body paragraf, gambar rounded-xl, action bar like 24/comment 12/share; section komentar: item avatar 36 + nama bold 14 + timestamp kanan muted 12 + text 14 + like count + tombol "Balas" hijau; nested reply pakai garis vertikal hijau 3px kiri (border-l-2 #1B5E20 pl-4); input komentar fixed bottom: field putih rounded-full + ikon kamera dalam + tombol send lingkaran hijau ikon panah putih. Data komentar yang ada dipertahankan / tambah dummy konsisten.
10. **forum/create (post)** (`post.png`): header back + "Postingan Baru" bold; avatar user; field judul "Judul Postingan..." placeholder + "Apa yang ingin Anda bagikan hari ini?" muted kecil; textarea besar; 2 tombol sejajar: "Pilih Kategori" (putih border abu + chevron down) + tombol kamera (kotak putih border ikon kamera); tombol "Posting" pill hijau #1B5E20 ikon send + teks putih, kanan bawah. Logika form/state yang ada dipertahankan.
11. **profil** (`profil.png`): header daun; kartu profil bg #E8F5E9 rounded-2xl py-8: avatar lingkaran 120px border-4 putih + badge verify hijau kecil kanan bawah, nama "Alex Graham" bold 22 center, email muted 14 center, pill badge "Petani Pemula" putih border hijau ikon pin; kartu menu putih rounded-xl: list item icon+label dividers ("Pengaturan Notifikasi" bell, "Riwayat Scan" bell-dot, "Langganan" kartu kredit, "Keluar" merah #D32F2F dengan separator); footer "TanamanKu Versi 1.2.0" muted 12 center. Fungsi Keluar tetap logika logout yang ada (kalau ada).

## Aturan:
- JANGAN sentuh desktop block, landing, fonts, api, prisma, route names.
- JANGAN hapus state/hook/logika yang ada (kamera, form, showPassword) — hanya presentasi.
- Data placeholder tetap, tambah dummy sesuai Figma bila perlu (komentar, cuaca).
- lucide-react icon saja, tidak ada dependency baru, tidak ada emoji di UI.
- Semua warna via arbitrary value Tailwind (bg-[#1B5E20] dst) atau token CSS yang sudah ada.
- BottomNav muncul di: home, forum, siram, scan/result, profil. Tidak di: kamera scan, login, register, create post, detail (back button saja).
-globals.css: boleh extend bagian /* Mobile app UI */ tapi jangan ubah rule desktop/landing.

## Selesai bila:
- `npm run build` PASS.
- Setiap page masih punya `hidden lg:block` + `lg:hidden` (count lg:hidden >= 1 per page, isi asli bukan placeholder).
- Laporan ringkas per halaman.
