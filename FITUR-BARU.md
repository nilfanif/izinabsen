# Fitur Baru - Sistem Izin Kehadiran

## 🎯 Ringkasan Perubahan

Sistem telah diupdate dengan fitur tracking pengajuan bulanan dan batasan untuk izin terlambat sesuai permintaan.

## ✨ Fitur yang Ditambahkan

### 1. **Statistik Pengajuan Bulanan**

Setiap pegawai sekarang dapat melihat statistik pengajuan mereka di bulan berjalan:

- **Total Pengajuan** - Total semua pengajuan bulan ini
- **Tidak Rekam** - Jumlah pengajuan tidak dapat rekam kehadiran
- **Terlambat** - Jumlah pengajuan terlambat (dengan indikator kuota)

Statistik ini ditampilkan di bagian atas form pengajuan dalam bentuk card yang menarik.

### 2. **Batasan Pengajuan Terlambat**

- ✅ Maksimal **5x pengajuan terlambat per bulan**
- ✅ Sistem otomatis menghitung dan memvalidasi
- ✅ Notifikasi real-time sisa kuota
- ✅ Tombol submit otomatis disabled jika sudah mencapai batas
- ✅ Pesan error jelas jika mencoba submit melebihi batas

### 3. **Form yang Berbeda untuk Setiap Tipe Izin**

#### Izin Tidak Dapat Rekam Kehadiran:
- Pilih dari dropdown alasan (Sakit, Dinas Luar, Lupa Rekam, Kendala Teknis, Lainnya)
- Field keterangan detail

#### Izin Terlambat Rekam Kehadiran:
- **TIDAK ADA pilihan dropdown alasan**
- Langsung ketik alasan di field textarea
- Label berubah menjadi "Alasan Terlambat"
- Placeholder yang sesuai

### 4. **Tracking dan Validasi**

Backend sekarang:
- Menghitung pengajuan per bulan secara otomatis
- Validasi sebelum menerima pengajuan terlambat
- Return error message yang informatif jika melebihi batas
- Endpoint baru: `GET /api/monthly-stats/:employeeId`

## 🔧 Perubahan Teknis

### Backend (`server/index.js`)

1. **Helper Function Baru:**
```javascript
getMonthlySubmissions(employeeId, type = null)
```
Menghitung pengajuan dalam bulan berjalan berdasarkan employeeId dan tipe (opsional).

2. **Validasi di Submit:**
```javascript
// Validasi batasan terlambat (maksimal 5x per bulan)
if (type === 'terlambat-rekam') {
  const monthlyLateSubmissions = getMonthlySubmissions(employeeId, 'terlambat-rekam');
  if (monthlyLateSubmissions.length >= 5) {
    return res.status(400).json({ 
      success: false,
      message: 'Anda telah mencapai batas maksimal 5 pengajuan terlambat untuk bulan ini',
      currentCount: monthlyLateSubmissions.length,
      maxLimit: 5
    });
  }
}
```

3. **Endpoint Baru:**
```javascript
GET /api/monthly-stats/:employeeId
```
Response:
```json
{
  "total": 8,
  "terlambat": 3,
  "tidakRekam": 5,
  "terlambatLimit": 5,
  "terlambatRemaining": 2,
  "canSubmitLate": true
}
```

### Frontend (`client/src/pages/EmployeeDashboard.jsx`)

1. **State Baru:**
```javascript
const [monthlyStats, setMonthlyStats] = useState(null)
```

2. **Load Monthly Stats:**
```javascript
const loadMonthlyStats = async () => {
  const response = await fetch(`/api/monthly-stats/${user.employeeId}`)
  const data = await response.json()
  setMonthlyStats(data)
}
```

3. **Statistik Card:**
Menampilkan 3 metrik dalam grid layout yang menarik dengan warna berbeda.

4. **Conditional Form Fields:**
- Field "Alasan" hanya muncul untuk tipe "tidak-rekam"
- Label dan placeholder berubah sesuai tipe izin
- Validasi dan disabled state untuk tombol submit

5. **Warning Notification:**
Menampilkan notifikasi berwarna:
- **Biru** - Masih ada kuota (info)
- **Merah** - Sudah mencapai batas (warning)

## 🎨 UI/UX Improvements

### Statistik Card
- Gradient background (primary-50 to primary-100)
- Grid 3 kolom responsive
- Warna berbeda untuk setiap metrik:
  - Total: Primary (biru)
  - Tidak Rekam: Blue
  - Terlambat: Orange (dengan indikator x/5)

### Form Dinamis
- Form berubah sesuai tipe izin yang dipilih
- Smooth transitions
- Clear visual feedback
- Disabled state yang jelas

### Notifikasi
- Color-coded berdasarkan status
- Icon yang sesuai (ℹ️ atau ⚠️)
- Informasi yang jelas dan actionable

## 📊 Contoh Penggunaan

### Skenario 1: Pegawai Baru (Belum Ada Pengajuan)
```
Statistik Bulan Ini:
- Total: 0
- Tidak Rekam: 0
- Terlambat: 0/5 (Sisa: 5x)
```

### Skenario 2: Pegawai dengan Beberapa Pengajuan
```
Statistik Bulan Ini:
- Total: 7
- Tidak Rekam: 4
- Terlambat: 3/5 (Sisa: 2x)

Notifikasi: "ℹ️ Anda sudah mengajukan 3x terlambat bulan ini. Sisa kuota: 2x"
```

### Skenario 3: Pegawai Mencapai Batas
```
Statistik Bulan Ini:
- Total: 12
- Tidak Rekam: 7
- Terlambat: 5/5 (Sisa: 0x)

Notifikasi: "⚠️ Anda telah mencapai batas maksimal 5x pengajuan terlambat untuk bulan ini."
Tombol Submit: DISABLED
```

## 🔄 Reset Bulanan

Sistem otomatis mereset hitungan setiap bulan baru karena menggunakan `startOfMonth()` dan `endOfMonth()` dari date-fns. Tidak perlu manual reset.

## 🚀 Cara Menjalankan

```bash
cd /Users/danielyovanda/CascadeProjects/sistem-izin-kehadiran
npm run dev
```

Aplikasi akan berjalan di:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 🧪 Testing

### Test Case 1: Submit Izin Tidak Rekam
1. Login sebagai pegawai
2. Pilih "Tidak Dapat Rekam Kehadiran"
3. Pilih alasan dari dropdown
4. Isi keterangan detail
5. Submit → Statistik bertambah di "Tidak Rekam"

### Test Case 2: Submit Izin Terlambat (Dalam Batas)
1. Login sebagai pegawai
2. Pilih "Terlambat Rekam Kehadiran"
3. Lihat notifikasi sisa kuota
4. Ketik alasan langsung (tanpa dropdown)
5. Submit → Statistik bertambah di "Terlambat"

### Test Case 3: Submit Izin Terlambat (Melebihi Batas)
1. Submit 5x izin terlambat
2. Coba submit yang ke-6
3. Tombol submit disabled
4. Notifikasi merah muncul
5. Jika dipaksa submit → Error dari backend

## 📝 Catatan Penting

1. **Data Persistence**: Saat ini menggunakan in-memory storage, data akan hilang saat server restart. Untuk production, gunakan database.

2. **Reset Bulanan**: Otomatis berdasarkan tanggal sistem. Pastikan server timezone sudah benar.

3. **Batasan**: Hanya untuk tipe "terlambat-rekam". Tipe "tidak-rekam" tidak ada batasan.

4. **Validasi**: Dilakukan di backend dan frontend untuk keamanan dan UX yang baik.

## 🎯 Keuntungan Sistem Baru

✅ **Transparansi** - Pegawai tahu persis berapa kali sudah mengajukan
✅ **Kontrol** - Admin punya kontrol otomatis melalui sistem
✅ **Efisiensi** - Tidak perlu manual tracking di Excel
✅ **User-Friendly** - Interface yang jelas dan informatif
✅ **Preventif** - Mencegah abuse dengan batasan yang jelas
✅ **Real-time** - Update langsung setiap pengajuan

## 🔮 Pengembangan Selanjutnya

Saran untuk improvement:
1. Export laporan statistik bulanan
2. Notifikasi email saat mendekati batas
3. Dashboard statistik untuk admin (per pegawai)
4. History tracking per bulan
5. Customizable limit per pegawai/jabatan
