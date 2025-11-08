# 🚀 Perubahan Fitur Terbaru

## Tanggal: 07 November 2025

### 📋 Ringkasan Perubahan

Sistem telah diupdate dengan fitur-fitur baru yang signifikan untuk meningkatkan fleksibilitas dan kemudahan penggunaan.

---

## ✨ Fitur Baru

### 1. **Tipe Izin Baru: Lupa Rekam**

**Sebelumnya:**
- Hanya 2 jenis izin: Tidak Dapat Rekam dan Terlambat Rekam

**Sekarang:**
- ✅ **3 jenis izin:**
  1. **Tidak Dapat Rekam** - Untuk situasi tidak bisa rekam kehadiran
  2. **Terlambat Rekam** - Untuk rekam kehadiran yang terlambat
  3. **Lupa Rekam** (BARU) - Untuk lupa melakukan rekam kehadiran

**Keunggulan:**
- Form terpisah khusus untuk lupa rekam
- Pilihan subType: **Lupa Rekam Datang** atau **Lupa Rekam Pulang**
- Icon dan warna berbeda (Purple) untuk mudah dibedakan

---

### 2. **Kuota Gabungan 10x per Bulan**

**Sebelumnya:**
- Batasan 5x per bulan hanya untuk Terlambat Rekam
- Tidak ada batasan untuk jenis lain

**Sekarang:**
- ✅ **Kuota gabungan 10x per bulan** untuk Terlambat + Lupa Rekam
- Tidak ada batasan untuk Tidak Dapat Rekam
- Sistem menghitung akumulasi dari kedua jenis

**Contoh Skenario:**
```
Terlambat: 6x + Lupa Rekam: 4x = 10x (Kuota Penuh)
Terlambat: 3x + Lupa Rekam: 5x = 8x (Sisa 2x)
Terlambat: 10x + Lupa Rekam: 0x = 10x (Kuota Penuh)
```

**Validasi:**
- Backend otomatis menolak jika kuota sudah penuh
- Frontend menampilkan warning dan disable button submit
- Pesan error yang jelas dengan breakdown penggunaan

---

### 3. **Filter Riwayat per Bulan**

**Sebelumnya:**
- Riwayat menampilkan semua pengajuan tanpa filter

**Sekarang:**
- ✅ **Navigasi bulan** dengan tombol prev/next
- ✅ **Tampilan bulan aktif** yang jelas
- ✅ **Button "Bulan Ini"** untuk reset ke bulan sekarang
- ✅ Data otomatis reload saat ganti bulan

**UI Filter:**
```
[<] [November 2025] [>] [Bulan Ini]
```

---

## 🎨 Perubahan UI/UX

### Form Pengajuan

**Card Selection - 3 Pilihan:**
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  ❌ Tidak   │  │  ⏰ Terlambat│  │  ❓ Lupa    │
│  Dapat Rekam│  │  Rekam      │  │  Rekam      │
└─────────────┘  └─────────────┘  └─────────────┘
   (Blue)           (Orange)         (Purple)
```

**Lupa Rekam - SubType Selection:**
```
Jenis Lupa Rekam *
┌──────────────────┐  ┌──────────────────┐
│ Lupa Rekam Datang│  │ Lupa Rekam Pulang│
│ Lupa absen saat  │  │ Lupa absen saat  │
│ datang           │  │ pulang           │
└──────────────────┘  └──────────────────┘
```

### Statistik Card - 4 Kolom

**Layout Baru:**
```
┌────────────────────────────────────────────────────┐
│  Total  │  Tidak Rekam  │  Kuota Gabungan  │ Breakdown │
│    8    │      5        │     3/10         │ T: 2x    │
│         │               │  ▓▓▓░░░░░░░      │ L: 1x    │
└────────────────────────────────────────────────────┘
```

**Fitur:**
- Progress bar untuk kuota gabungan
- Breakdown Terlambat vs Lupa Rekam
- Visual indicator yang jelas

### Riwayat Pengajuan - Tabel

**Kolom Jenis Izin:**
- Icon berwarna untuk setiap tipe
- SubType ditampilkan untuk Lupa Rekam
- Format: "Lupa Rekam (Datang)" atau "Lupa Rekam (Pulang)"

---

## 🔧 Perubahan Teknis

### Backend (server/index.js)

**1. Helper Function Update:**
```javascript
getMonthlySubmissions(employeeId, type, month, year)
```
- Tambah parameter `month` dan `year` untuk filter spesifik
- Support current month atau bulan tertentu

**2. Validasi Kuota Gabungan:**
```javascript
if (type === 'terlambat-rekam' || type === 'lupa-rekam') {
  const totalQuotaUsed = monthlyLateSubmissions.length + monthlyForgetSubmissions.length;
  if (totalQuotaUsed >= 10) {
    return res.status(400).json({ ... });
  }
}
```

**3. Submission Schema Update:**
```javascript
{
  ...existing fields,
  type: 'tidak-rekam' | 'terlambat-rekam' | 'lupa-rekam',
  subType: 'datang' | 'pulang' | null,
  ...
}
```

**4. API Endpoints Update:**
- `GET /api/submissions?month=11&year=2025` - Filter by month/year
- `GET /api/monthly-stats/:employeeId?month=11&year=2025` - Stats for specific month

**5. Monthly Stats Response:**
```json
{
  "total": 8,
  "terlambat": 2,
  "lupaRekam": 1,
  "tidakRekam": 5,
  "quotaUsed": 3,
  "quotaLimit": 10,
  "quotaRemaining": 7,
  "canSubmitQuota": true
}
```

### Frontend (EmployeeDashboard.jsx)

**1. State Management:**
```javascript
const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
const [formData, setFormData] = useState({
  type: 'tidak-rekam',
  subType: '', // NEW
  date: format(new Date(), 'yyyy-MM-dd'),
  reason: '',
  description: ''
})
```

**2. useEffect Dependencies:**
```javascript
useEffect(() => {
  loadSubmissions()
}, [selectedMonth, selectedYear])
```

**3. Form Validation:**
```javascript
disabled={
  loading || 
  ((formData.type === 'terlambat-rekam' || formData.type === 'lupa-rekam') && 
    monthlyStats && !monthlyStats.canSubmitQuota) ||
  (formData.type === 'lupa-rekam' && !formData.subType)
}
```

### Frontend (AdminDashboard.jsx)

**1. Display Logic:**
```javascript
{submission.type === 'tidak-rekam' ? 'Tidak Dapat Rekam' 
  : submission.type === 'terlambat-rekam' ? 'Terlambat Rekam'
  : 'Lupa Rekam'}

{submission.subType && (
  <span>({submission.subType === 'datang' ? 'Datang' : 'Pulang'})</span>
)}
```

---

## 📊 Perbandingan Sebelum vs Sesudah

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| **Jenis Izin** | 2 (Tidak Rekam, Terlambat) | 3 (+ Lupa Rekam) |
| **Kuota** | 5x untuk Terlambat | 10x gabungan (Terlambat + Lupa) |
| **SubType** | Tidak ada | Datang/Pulang untuk Lupa Rekam |
| **Filter Riwayat** | Tidak ada | Filter per bulan |
| **Statistik** | 3 kolom | 4 kolom dengan breakdown |
| **Validasi** | Per tipe | Kuota gabungan |

---

## 🎯 Use Cases

### Use Case 1: Pegawai Lupa Absen Datang
1. Pilih "Lupa Rekam"
2. Pilih "Lupa Rekam Datang"
3. Isi tanggal dan alasan
4. Submit (jika kuota masih tersedia)

### Use Case 2: Pegawai Cek Kuota
1. Lihat statistik card
2. Cek "Kuota Gabungan": 3/10
3. Lihat breakdown: Terlambat 2x, Lupa 1x
4. Sisa kuota: 7x

### Use Case 3: Admin Review Lupa Rekam
1. Lihat pengajuan "Lupa Rekam Kehadiran (Pulang)"
2. Icon purple dengan FileQuestion
3. Review alasan
4. Approve/Reject dengan catatan

### Use Case 4: Lihat Riwayat Bulan Lalu
1. Klik tombol [<] untuk bulan sebelumnya
2. Data otomatis reload
3. Lihat pengajuan bulan Oktober
4. Klik "Bulan Ini" untuk kembali

---

## ⚠️ Breaking Changes

### 1. API Response Structure
**Monthly Stats:**
```javascript
// OLD
{
  terlambat: 3,
  terlambatLimit: 5,
  terlambatRemaining: 2,
  canSubmitLate: true
}

// NEW
{
  terlambat: 2,
  lupaRekam: 1,
  quotaUsed: 3,
  quotaLimit: 10,
  quotaRemaining: 7,
  canSubmitQuota: true
}
```

### 2. Submission Object
```javascript
// NEW FIELD
{
  ...existing,
  subType: 'datang' | 'pulang' | null
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Kuota Limit
1. Submit 6x Terlambat
2. Submit 4x Lupa Rekam
3. Coba submit lagi → Harus ditolak dengan pesan error

### Scenario 2: SubType Required
1. Pilih "Lupa Rekam"
2. Jangan pilih Datang/Pulang
3. Button submit harus disabled

### Scenario 3: Filter Bulan
1. Submit pengajuan di bulan November
2. Ganti filter ke Oktober
3. Pengajuan November tidak muncul
4. Kembali ke November → Pengajuan muncul lagi

### Scenario 4: Reset Bulanan
1. Bulan November: 10x pengajuan (kuota penuh)
2. Ganti ke bulan Desember
3. Kuota reset ke 0/10

---

## 📝 Migration Notes

### Untuk Data Existing
- Submission lama tanpa `subType` akan memiliki `subType: null`
- Tidak perlu migrasi data, backward compatible
- Frontend handle null subType dengan baik

### Untuk Developer
1. Update backend terlebih dahulu
2. Update frontend
3. Test semua scenarios
4. Deploy backend dulu, baru frontend

---

## 🔮 Future Enhancements

### Potensial Improvements:
1. **Kuota per Tipe** - Batasan terpisah untuk Terlambat dan Lupa
2. **Custom Kuota** - Admin bisa set kuota per pegawai
3. **Notifikasi Kuota** - Email saat kuota hampir habis
4. **Export per Bulan** - Download riwayat per bulan ke Excel
5. **Chart Statistik** - Grafik penggunaan kuota per bulan
6. **Reminder** - Notifikasi jika lupa absen

---

## 📚 Dokumentasi Terkait

- `README.md` - Overview dan instalasi
- `CHANGELOG.md` - Version history
- `UI-IMPROVEMENTS.md` - Detail perubahan UI
- `QUICK-START.md` - Panduan cepat

---

**Version**: 2.0.0  
**Last Updated**: 07 November 2025  
**Status**: ✅ Production Ready
