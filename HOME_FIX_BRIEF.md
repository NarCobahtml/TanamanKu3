# Home mobile pixel-match fix — HANYA halaman /home, block `lg:hidden`

Target: home mobile block 99,999% persis mockup Figma. Referensi: `.design-refs/mobile1/home.png`. HANYA boleh edit:
- `src/app/home/page.tsx` (block mobile saja — JANGAN sentuh block `hidden lg:block` / HomePage / Navbar / Footer)
- `src/components/Header.tsx` dan `src/components/BottomNav.tsx` BOLEH disentuh HANYA jika perlu untuk home (hati-hati: dipakai page mobile lain — jangan rusak; perubahan harus backward-compatible)

## Spesifikasi presisi dari mockup (sudah diverifikasi 2x vision):

1. **Header** (sdh ok, jangan ubah): daun 24px #1B5E20 kiri, avatar 40px kanan, bg #F5F5F0.
2. **Greeting**: "Selamat pagi," 14px #757575 regular; "Halo, Alex!" 32px bold #1A1A1A. (sekarang 34px → ubah ke 32px, hapus tracking-[-.03em], pakai tracking normal)
3. **Kartu paket hijau**: bg #1B5E20 rounded-2xl p-5 flex items-center justify-between. Kiri: "Paket Gratis" 12px font-medium text-white opacity-80 mb-1; "3 / 5 Scan Tersisa" 20px bold white tnum. Kanan: tombol "Upgrade Paket" bg-white/20 (semi-transparan) rounded-[10px] px-5 py-3 text 14px font-semibold white, height 40px, align center. (perbaiki: sekarang rounded-lg px-4 py-2 — ubah jadi px-5 py-3 rounded-[10px])
4. **Kartu status putih**: bg-white rounded-2xl border #E8E8E8 p-5 (SEKARANG rounded-xl — mockup 16px → rounded-2xl), shadow lembut `shadow-[0_2px_8px_rgba(0,0,0,0.04)]`. Struktur:
   - Label "STATUS TANAMAN" 11px font-semibold tracking-[0.5px] #757575 (sekarang #888888 → ubah #757575)
   - Baris utama flex justify-between items-center: kiri = ikon lingkaran 24px bg #C8E6C9 dengan Check 16px #1B5E20 strokeWidth 3 + teks "Semua Sehat" 18px font-semibold #212121; kanan = angka "12" 36px bold tnum #1A1A1A + "Tanaman" 12px #757575 text-center. (SEKARANG: Semua Sehat pakai font-bold tanpa size → tambah text-[18px] font-semibold; angka 40px → ubah 36px)
   - Divider 1px #E0E0E0 (sekarang #E8E8E8 → #E0E0E0)
   - Baris penyiraman flex justify-between items-center: ikon lingkaran 40px bg #C8E6C9 Droplets 20px #1B5E20; teks "Penyiraman Hari Ini" 14px font-semibold #212121 mb-1 + "3 tanaman perlu air" 12px #757575; kanan link "Lihat" 14px font-semibold #4CAF50. (SEKARANG Lihat #1B5E20 → mockup hijau sedang #4CAF50; teks 15px→14px, 13px→12px)
5. **Grid 2 tombol aksi**: grid-cols-2 gap-3 (SEKARANG gap-4 → mockup 12px), tiap tombol h-[112px] rounded-2xl (SEKARANG rounded-xl → mockup 16px), p-5 (SEKARANG p-4), flex-col justify-between items-start (SEKARANG justify-end gap-2 → UBAH: ikon KIRI ATAS, teks KIRI BAWAH, ada jarak vertikal di antaranya — justify-between bukan justify-end):
   - Scan Tanaman: bg #1B5E20, ikon ScanSearch 32px putih DI ATAS, teks "Scan Tanaman" 16px font-semibold white DI BAWAH
   - Tambah Tanaman: bg #C8E6C9, ikon Plus 32px #1B5E20 di atas, teks "Tambah Tanaman" 16px font-semibold #1B5E20 di bawah
6. **Section Jadwal Hari Ini**: heading "Jadwal Hari Ini" 20px bold #212121 mb-4. Kartu item: bg-white rounded-2xl (SEKARANG rounded-xl → ubah), border #E8E8E8, p-4, flex items-center gap-3, shadow lembut sama dengan kartu status:
   - Foto 56px rounded-lg object-cover (SEKARANG 60px → 56px)
   - Nama 16px font-semibold #212121 (SEKARANG font-bold → font-semibold); task 13px #757575 (SEKARANG #666666 → #757575)
   - KANAN: lingkaran 28px border 2px #D0D0D0 rounded-full KOSONG di dalam — HAPUS span border-double di dalamnya (SEKARANG ada span nested gak perlu → jadi lingkaran polos kosong, sesuai mockup: lingkaran abu kosong dengan checkmark ABU #9E9E9E... PENTING: lihat lagi di bawah)
   
   CATATAN CHECKBOX (verifikasi ulang): lingkaran BERISI checkmark abu-abu (✓) warna #9E9E9E di dalam lingkaran border #D0D0D0, background transparan. Jadi: `<span className="w-7 h-7 rounded-full border-2 border-[#D0D0D0] flex items-center justify-center"><Check className="w-4 h-4 text-[#9E9E9E]" /></span>`. Bukan lingkaran kosong polos, bukan hijau — checkmark ABU.
7. **Bottom nav** (sudah ok — height 70px putih border-top, 4 item, aktif #1B5E20, inactive #999999, ikon 24px label 11px). JANGAN ubah kecuali ada salah.
8. **Spacing antar section** (space-y-6 sekarang): mockup: greeting→kartu hijau 24px, kartu hijau→kartu status 16px, kartu status→grid 16px, grid→heading jadwal 24px, antar kartu jadwal 12px. Ganti space-y-6 → space-y-4 untuk main, lalu beri mt-6 pada section Jadwal Hari Ini wrapper dan space-y-3 antar kartu jadwal (12px).

## Aturan:
- HANYA home mobile block + 2 komponen shell tsb. JANGAN sentuh desktop block, page lain, landing, data.
- Jangan ubah data todaySchedule (isi sama).
- lucide-react saja, hex arbitrary Tailwind.
- `npm run build` PASS.
- Laporan diff singkat.
