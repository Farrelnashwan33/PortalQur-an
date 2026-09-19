# 📖 Portal Qur'an v3.3 - Platform Digital Al-Qur'an Modern & Luxury Islamic

> *"Temukan ketenangan dalam setiap ayat."*

**Portal Qur'an v3.3** adalah platform digital Al-Qur'an modern, elegan, dan lengkap yang dibangun dengan arsitektur full-stack **SvelteKit + TypeScript + Tailwind CSS** dan didukung oleh **Supabase PostgreSQL & Supabase Auth**. Dilengkapi dengan desain Luxury Islamic palet coklat & emas, otentikasi split-screen animasi halus, pembaca Al-Qur'an 6 mode, audio murattal multi-qari dengan sinkronisasi sorotan ayat, statistik tilawah & tracker khatam 30 Juz, agenda kajian, topik tematik, hingga Dashboard Admin yang responsif untuk pengelolaan remote dari HP.

---

## ✨ Fitur Unggulan

### 1. 🎨 Desain Luxury Islamic & Otentikasi Split-Screen
- **Palet Warna Coklat & Emas**: `#6F4E37` (Primary Brown), `#3E2723` (Dark Brown), `#C9A66B` (Gold Accent), `#F8F3EC` (Cream Background).
- **Split-Screen Login & Register**: Transisi mulus tanpa reload halaman dengan karya seni 3D kitab Al-Qur'an bercahaya & ornamen geometris Islami.
- **Tipografi Arab Premium**: Menggunakan font *Scheherazade New* (Standar Kemenag) dan *Amiri* dengan kaligrafi indah.
- **Mobile-First & Responsif**: Nyaman digunakan di Laptop, Tablet, maupun Smartphone.

### 2. 📖 Pembaca Al-Qur'an Lengkap (6 Mode Membaca)
- **114 Surah Lengkap**: Filter Makkiyah/Madaniyah, filter Juz 1–30, dan pencarian instan (nama Latin, arti, nomor, atau Arab).
- **6 Pilihan Mode Membaca**:
  1. **Mode 1 — Mushaf**: Fokus teks Arab murni seperti lembaran mushaf Madinah.
  2. **Mode 2 — Terjemahan**: Teks Arab disertai terjemahan Bahasa Indonesia resmi Kemenag RI.
  3. **Mode 3 — Tafsir**: Teks Arab, terjemahan, dan uraian tafsir ringkas Kemenag per ayat.
  4. **Mode 4 — Per Kata (Mufradat)**: Arti tiap kata Arab tepat di bawah atau di samping lafazhnya.
  5. **Mode 5 — Audio Karaoke**: Sorotan otomatis ayat yang sedang dilantunkan secara real-time.
  6. **Mode 6 — Fokus Membaca**: Tampilan bersih bebas distraksi untuk tadabbur mendalam.
- **Aksi Tiap Ayat**: Putar audio, buka tafsir, buka arti per kata, simpan ke koleksi, bookmark, salin teks, dan bagikan ayat.
- **Kustomisasi Teks**: Pengaturan ukuran font Arab (20–48px), font terjemahan, jenis font, nuansa warna (Cream, Sand, Sepia, Dark), dan Auto-Scroll.
- **Info Surah Lengkap**: Tempat turun, jumlah ayat, urutan pewahyuan, ringkasan tema, dan keutamaan membaca.

### 3. 🎧 Audio Murattal Multi-Qari Global
- Pemutar audio melayang (*floating player*) yang tetap berputar saat pengguna berpindah antar halaman.
- Pilihan Qari ternama:
  - Syeikh Misyari Rasyid Al-Afasy
  - Syeikh Saad Al-Ghamidi
  - Syeikh Abdurrahman As-Sudais
  - Syeikh Mahmoud Khalil Al-Hussary
- Fitur pemutar: Repeat ayat, repeat surah, atur kecepatan (0.75x–2.0x), pengatur volume, dan seek progress bar.

### 4. 📊 Statistik Tilawah & Tracker Khatam 30 Juz
- **Peta 30 Juz (Khatam Heatmap)**: Matriks visual progres penyelesaian Juz 1 sampai 30.
- **Streak Tracker**: Penghitung hari membaca berturut-turut untuk menjaga istiqomah.
- **Metrik Tilawah**: Total ayat terbaca, total waktu membaca, grafik mingguan 7 hari, dan riwayat tilawah terakhir.
- **Debounced Batch Sync**: Menyimpan progres bacaan secara efisien ke Supabase tanpa membebani jaringan.

### 5. 🗂️ Koleksi Pribadi, Bookmark & Catatan Tadabbur
- Pengelompokan ayat ke dalam folder koleksi khusus (misal: "Doa Harian", "Ayat Penenang Jiwa").
- Penambahan catatan/tadabbur pribadi pada setiap ayat yang disimpan.
- Fitur *Lanjutkan Bacaan Terakhir* (Last Read).

### 6. 📅 Agenda Kajian & Topik Tematik Qur'an
- **Agenda & Event**: Informasi kajian tafsir, simaan 30 juz, webinar, dan pengingat tilawah.
- **11 Topik Tematik**: Akhlak, Ibadah, Keluarga, Pendidikan, Kesabaran, Rezeki, Taubat, Pemuda, Ilmu, Kehidupan, dan Dakwah.

### 7. 🛡️ Admin Dashboard (Remote Dari HP & Laptop)
- Akses khusus role `admin` di `/admin`.
- **User Management**: Pantau seluruh customer, keaktifan tilawah, status akun (aktif/nonaktif), dan kelola role.
- **Quran Management**: Editor metadata surah, ringkasan tema, dan keutamaan.
- **Audio Management**: Tambah qari baru, atur URL CDN audio, dan uji suara instan.
- **Tafsir & Translation Management**: Kelola teks terjemahan dan uraian tafsir.
- **Agenda & Topik Management**: Tambah/edit kegiatan dan kategori topik.
- **Platform Analytics**: Grafik pertumbuhan aktivitas membaca bulanan dan peringkat surah paling sering dibaca.
- **Remote Health Center**: Pemantauan latensi database Supabase, audio CDN, dan status uptime.

---

## 🛠️ Teknologi & Arsitektur

- **Framework**: SvelteKit 2 + Svelte 5 + TypeScript
- **Styling**: Tailwind CSS (Luxury Islamic Theme)
- **Icons**: `@lucide/svelte`
- **Database & Auth**: Supabase PostgreSQL (dengan Row Level Security / RLS)
- **Audio Engine**: HTML5 Web Audio API + CDN EveryAyah / MP3Quran
- **Quran Data**: Standard Kemenag RI Digital Quran Dataset & EQuran API with LocalStorage fallback

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### 1. Clone Repositori & Masuk Direktori
```bash
git clone https://github.com/username/portal-quran.git
cd "portal-quran"
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi variabel dengan kredensial proyek Supabase Anda:
```env
PUBLIC_SUPABASE_URL=https://proyek-anda.supabase.co
PUBLIC_SUPABASE_ANON_KEY=anon-key-dari-supabase-dashboard
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka peramban di `http://localhost:5173`.

---

## 🗄️ Setup Database Supabase & SQL Editor

1. Buka [Dashboard Supabase](https://supabase.com/dashboard) dan buat proyek baru (*New Project*).
2. Masuk ke menu **SQL Editor** pada sidebar kiri.
3. Buka berkas `supabase/schema.sql` dari repositori ini, salin seluruh kodenya, dan tempelkan ke SQL Editor Supabase.
4. Klik tombol **Run** (Jalankan).
5. Skrip akan otomatis membuat:
   - Enum `user_role`, `revelation_type`, `publish_status`
   - Tabel: `profiles`, `surahs`, `ayahs`, `ayah_words`, `qaris`, `audio_tracks`, `agendas`, `topics`, `topic_ayahs`, `collections`, `collection_items`, `bookmarks`, `reading_progress`, `reading_sessions`, `reading_history`, `app_settings`
   - Trigger otomatis `handle_new_user()` saat user mendaftar
   - Row Level Security (RLS) policies untuk keamanan role admin & customer
   - Seed data Qari, Topik Quran, dan Agenda awal.

---

## 👑 Cara Membuat Akun Admin

1. Buka aplikasi Portal Qur'an dan lakukan pendaftaran akun biasa (atau login via email).
2. Buka Supabase **SQL Editor**, jalankan perintah SQL berikut untuk menaikkan akun tersebut menjadi `admin`:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'email_admin_anda@domain.com';
   ```
3. Login kembali menggunakan email tersebut. Sistem akan otomatis mengarahkan Anda ke `/admin`.

---

## 🌐 Panduan Deploy ke Vercel

1. Push kode ke GitHub:
   ```bash
   git add .
   git commit -m "feat: Portal Quran v3.3 Luxury Islamic Release"
   git push origin main
   ```
2. Buka [Vercel Dashboard](https://vercel.com) dan pilih **Add New... -> Project**.
3. Hubungkan repositori GitHub Anda.
4. Pada bagian **Environment Variables**, tambahkan:
   - `PUBLIC_SUPABASE_URL` = URL Supabase proyek Anda
   - `PUBLIC_SUPABASE_ANON_KEY` = Anon public key Supabase Anda
5. Klik **Deploy**. Website Anda siap diakses di domain `https://nama-proyek.vercel.app`.

---

## 📱 Akses Remote Admin Dari Smartphone

Dashboard admin dirancang responsif dengan *drawer sidebar* dan *touch controls*:
1. Buka tautan `https://nama-proyek.vercel.app/login` di browser HP Anda.
2. Masuk dengan akun admin.
3. Anda akan langsung diarahkan ke `https://nama-proyek.vercel.app/admin`.
4. Anda dapat memantau statistik, memoderasi pengguna, mengatur agenda, dan mengecek status server secara real-time langsung dari genggaman.

---

## 🛡️ Keamanan & Lisensi

- Dilindungi dengan Supabase Row Level Security (RLS) sehingga pengguna tidak dapat membaca/mengubah data pengguna lain.
- Role admin divalidasi di level database dan server, mencegah eksploitasi kenaikan hak akses secara sepihak.
- Hak Cipta © 2026 Portal Qur'an v3.3. Seluruh terjemahan dan tafsir bersumber dari referensi resmi Kemenag RI.
