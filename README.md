# Sistem Izin Kehadiran Pegawai

Aplikasi web modern untuk mengelola pengajuan izin kehadiran pegawai. Memudahkan pegawai mengajukan izin tidak dapat melakukan rekam kehadiran atau terlambat rekam kehadiran, serta memudahkan Kasubag Kepegawaian untuk menyetujui atau menolak pengajuan.

> **🔥 NEW:** Sekarang dengan **Supabase PostgreSQL** untuk persistent storage dan production-ready deployment!

## Fitur

### Untuk Pegawai:
- ✅ **3 Jenis Pengajuan Izin:**
  - **Tidak Dapat Rekam** - Tidak dapat melakukan rekam kehadiran (dengan pilihan alasan)
  - **Terlambat Rekam** - Terlambat melakukan rekam kehadiran (langsung ketik alasan)
  - **Lupa Rekam** - Lupa melakukan rekam kehadiran dengan pilihan Datang/Pulang
- ✅ **Statistik Pengajuan Bulanan** - Tracking berapa kali sudah mengajukan di bulan ini
- ✅ **Kuota Gabungan** - Maksimal 10x pengajuan per bulan untuk Terlambat + Lupa Rekam
- ✅ **Progress Bar Kuota** - Visual indicator sisa kuota yang tersedia
- ✅ **Breakdown Kuota** - Melihat detail penggunaan kuota (Terlambat vs Lupa)
- ✅ **Filter Riwayat per Bulan** - Navigasi riwayat pengajuan berdasarkan bulan
- ✅ Melihat status persetujuan (Menunggu/Disetujui/Ditolak)
- ✅ Melihat catatan review dari admin

### Untuk Admin (Kasubag Kepegawaian):
- ✅ Dashboard statistik pengajuan
- ✅ Melihat semua pengajuan pegawai (3 jenis izin)
- ✅ Filter pengajuan berdasarkan status
- ✅ Menyetujui atau menolak pengajuan
- ✅ Memberikan catatan review
- ✅ Melihat detail lengkap setiap pengajuan termasuk subType (Datang/Pulang)

## Teknologi

- **Frontend**: React 18, TailwindCSS, Lucide Icons, React Router
- **Backend**: Express.js, Node.js
- **Database**: Supabase PostgreSQL (with in-memory fallback)
- **Build Tool**: Vite
- **Date Handling**: date-fns
- **UI/UX**: Modern gradient design, card-based selection, smooth animations
- **Deployment**: Production-ready with Supabase

## Instalasi

### Prasyarat
- Node.js (versi 16 atau lebih baru)
- npm atau yarn

### Pilihan Instalasi

#### Option A: Dengan Supabase (Production-Ready) ⭐ Recommended

**Keuntungan:**
- ✅ Data persistent (tidak hilang saat restart)
- ✅ Production-ready
- ✅ Unlimited scalability
- ✅ Automatic backups

**Langkah:**
1. **Setup Supabase** (5 menit)
   - Buat account di [supabase.com](https://supabase.com)
   - Create new project
   - Run database schema (lihat `SUPABASE-SETUP.md`)

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Setup environment**
   ```bash
   # Buat file .env
   cp .env.example .env
   # Edit .env dengan Supabase credentials Anda
   ```

4. **Jalankan aplikasi**
   ```bash
   npm run dev
   ```

📚 **Panduan Lengkap:** Lihat `SUPABASE-SETUP.md` dan `MIGRATION-GUIDE.md`

---

#### Option B: In-Memory (Development Only)

**Catatan:**
- ⚠️ Data hilang saat server restart
- ⚠️ Tidak untuk production
- ✅ Setup cepat untuk testing

**Langkah:**
1. **Install dependencies**
   ```bash
   npm run install-all
   ```

2. **Gunakan in-memory server**
   ```bash
   # Pastikan menggunakan server/index.js (bukan index-supabase.js)
   npm run dev
   ```

3. **Buka browser**
   
   Akses aplikasi di `http://localhost:3000`

## Akun Demo

### Admin (Kasubag Kepegawaian)
- Username: `admin`
- Password: `admin123`

### Pegawai
- Username: `pegawai`
- Password: `pegawai123`

## Struktur Project

```
sistem-izin-kehadiran/
├── server/
│   └── index.js              # Backend API server
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Halaman login
│   │   │   ├── EmployeeDashboard.jsx  # Dashboard pegawai
│   │   │   └── AdminDashboard.jsx     # Dashboard admin
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/login` - Login user

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID

### Submissions
- `POST /api/submissions` - Create new submission
- `GET /api/submissions` - Get all submissions (with optional filters)
- `GET /api/submissions/:id` - Get submission by ID
- `PATCH /api/submissions/:id` - Update submission status (approve/reject)

### Statistics
- `GET /api/statistics` - Get submission statistics
- `GET /api/monthly-stats/:employeeId` - Get monthly statistics for employee (with optional month/year params)

## Pengembangan Lebih Lanjut

Untuk penggunaan production, pertimbangkan untuk:

1. **Database**: Ganti in-memory storage dengan database (PostgreSQL, MySQL, MongoDB)
2. **Authentication**: Implementasi JWT atau session-based authentication yang lebih aman
3. **File Upload**: Tambahkan fitur upload dokumen pendukung
4. **Email Notification**: Kirim notifikasi email saat pengajuan disetujui/ditolak
5. **Export Data**: Tambahkan fitur export laporan ke Excel/PDF
6. **Role Management**: Tambahkan role dan permission yang lebih kompleks
7. **Audit Log**: Catat semua aktivitas untuk audit trail

## Lisensi

MIT License

## Kontak

Untuk pertanyaan atau saran, silakan hubungi Kasubag Kepegawaian.
