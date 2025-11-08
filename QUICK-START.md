# 🚀 Quick Start Guide

## Langkah Cepat Menjalankan Aplikasi

### 1️⃣ Pastikan Node.js Sudah Terinstall

```bash
node --version
npm --version
```

Jika belum terinstall, lihat `INSTALASI.md`.

### 2️⃣ Jalankan Aplikasi

```bash
# Masuk ke folder project
cd /Users/danielyovanda/CascadeProjects/sistem-izin-kehadiran

# Jalankan aplikasi (backend + frontend)
npm run dev
```

### 3️⃣ Buka Browser

Akses: **http://localhost:3000**

### 4️⃣ Login

**Sebagai Admin (Kasubag Kepegawaian):**
- Username: `admin`
- Password: `admin123`

**Sebagai Pegawai:**
- Username: `pegawai`
- Password: `pegawai123`

---

## 📋 Panduan Penggunaan Cepat

### Untuk Pegawai:

1. **Login** dengan akun pegawai
2. **Lihat Statistik Bulan Ini** di bagian atas
   - Total pengajuan
   - Jumlah tidak rekam
   - Jumlah terlambat (max 5x/bulan)
3. **Ajukan Izin:**
   
   **Tidak Dapat Rekam Kehadiran:**
   - Pilih jenis: "Tidak Dapat Rekam Kehadiran"
   - Pilih tanggal
   - Pilih alasan dari dropdown
   - Isi keterangan detail
   - Klik "Kirim Pengajuan"
   
   **Terlambat Rekam Kehadiran:**
   - Pilih jenis: "Terlambat Rekam Kehadiran"
   - Lihat notifikasi sisa kuota
   - Pilih tanggal
   - Ketik alasan langsung (tanpa dropdown)
   - Klik "Kirim Pengajuan"
   
4. **Lihat Riwayat** di tab "Riwayat Pengajuan"
   - Status: Menunggu/Disetujui/Ditolak
   - Catatan dari admin (jika sudah direview)

### Untuk Admin:

1. **Login** dengan akun admin
2. **Lihat Dashboard Statistik:**
   - Total pengajuan
   - Menunggu approval
   - Disetujui
   - Ditolak
3. **Filter Pengajuan:**
   - Tab "Menunggu" - Pengajuan yang perlu direview
   - Tab "Disetujui" - Pengajuan yang sudah disetujui
   - Tab "Ditolak" - Pengajuan yang ditolak
   - Tab "Semua" - Semua pengajuan
4. **Review Pengajuan:**
   - Klik "Review Pengajuan"
   - Isi catatan review
   - Klik "Setujui" atau "Tolak"

---

## ⚡ Fitur Utama

### ✅ Tracking Otomatis
- Sistem otomatis menghitung berapa kali pegawai sudah mengajukan di bulan ini
- Statistik ditampilkan real-time dengan progress bar

### ✅ Batasan Terlambat
- Maksimal 5x pengajuan terlambat per bulan
- Notifikasi sisa kuota dengan visual yang jelas
- Tombol submit otomatis disabled jika sudah mencapai batas

### ✅ Form Modern & Intuitif
- **Card-based selection** untuk memilih jenis izin
- Form "Tidak Rekam" → Dropdown alasan dengan emoji
- Form "Terlambat" → Langsung ketik alasan (tanpa dropdown)
- Gradient design yang menarik
- Helper text untuk setiap field

### ✅ Approval Workflow
- Admin dapat approve/reject dengan catatan
- Pegawai dapat melihat status dan catatan review

### ✅ UI/UX Premium
- Design modern dengan gradient dan shadow
- Smooth animations dan transitions
- Responsive untuk semua device
- Color-coded untuk setiap status

---

## 🎯 Tips Penggunaan

### Untuk Pegawai:
- ✅ Cek statistik bulanan sebelum mengajukan
- ✅ Perhatikan sisa kuota terlambat
- ✅ Isi keterangan sejelas mungkin
- ✅ Cek riwayat untuk melihat status

### Untuk Admin:
- ✅ Review pengajuan di tab "Menunggu"
- ✅ Berikan catatan yang jelas saat approve/reject
- ✅ Gunakan filter untuk melihat pengajuan tertentu
- ✅ Pantau statistik untuk monitoring

---

## 🔄 Reset Data

Karena menggunakan in-memory storage, data akan reset saat:
- Server di-restart
- Aplikasi ditutup

Untuk production, gunakan database (PostgreSQL/MySQL/MongoDB).

---

## 🛑 Menghentikan Aplikasi

Tekan `Ctrl + C` di terminal.

---

## ❓ Troubleshooting

### Port sudah digunakan?
```bash
# Cek process di port 3000
lsof -ti:3000 | xargs kill -9

# Cek process di port 3001
lsof -ti:3001 | xargs kill -9
```

### Dependencies error?
```bash
# Install ulang dependencies
rm -rf node_modules client/node_modules
npm install
cd client && npm install
```

### Aplikasi tidak jalan?
1. Pastikan Node.js sudah terinstall
2. Pastikan semua dependencies sudah terinstall
3. Cek console untuk error message
4. Restart terminal dan coba lagi

---

## 📚 Dokumentasi Lengkap

- `README.md` - Dokumentasi utama
- `INSTALASI.md` - Panduan instalasi Node.js
- `FITUR-BARU.md` - Penjelasan fitur tracking dan batasan
- `QUICK-START.md` - Panduan ini

---

## 🎉 Selamat Menggunakan!

Sistem Izin Kehadiran Pegawai siap digunakan untuk mempermudah proses pengajuan dan approval izin kehadiran.
