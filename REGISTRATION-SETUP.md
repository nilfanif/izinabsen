# 🔐 Setup Registration System

Panduan untuk mengaktifkan fitur registrasi pegawai dengan admin approval.

---

## ⚠️ PENTING: Run SQL Update Dulu!

Sebelum menggunakan fitur registrasi, Anda **HARUS** menjalankan SQL update di Supabase.

### Step 1: Buka Supabase SQL Editor

1. Buka: https://app.supabase.com/project/eewgrlxgxalfnfwonmwa
2. Klik **SQL Editor** di sidebar kiri
3. Klik **"New query"**

### Step 2: Run SQL Update

1. Buka file `supabase-registration-update.sql` di project ini
2. Copy **SELURUH ISI** file tersebut
3. Paste ke SQL Editor di Supabase
4. Klik **"Run"** atau tekan `Ctrl+Enter`
5. Tunggu hingga selesai (akan muncul "Success")

### Step 3: Verifikasi

Setelah SQL berhasil dijalankan, cek di **Table Editor**:

✅ Table `users` sekarang punya kolom baru:
- `status` (pending/active/rejected/suspended)
- `email`
- `registered_at`
- `approved_at`
- `approved_by`
- `rejection_reason`
- `last_login_at`
- `login_count`

✅ Table baru `registration_requests` dibuat dengan kolom:
- `id`, `nip`, `name`, `email`, `username`, `password_hash`
- `position`, `department`, `status`
- `reviewed_at`, `reviewed_by`, `review_note`

---

## 🚀 Cara Menggunakan

### Untuk Pegawai (Self-Registration)

1. **Buka aplikasi:** http://localhost:3000
2. **Klik "Daftar Sekarang"** di halaman login
3. **Isi form pendaftaran:**
   - Nama Lengkap
   - NIP (unik)
   - Email
   - Username
   - Password (min 8 karakter)
   - Konfirmasi Password
   - Jabatan
   - Bagian/Bidang
4. **Submit**
5. **Tunggu approval dari admin**

Status: **Pending** (tidak bisa login dulu)

### Untuk Admin (Review Pendaftaran)

1. **Login sebagai admin**
2. **Klik tab "Pendaftaran"** (tab baru di Admin Dashboard)
3. **Lihat daftar pendaftaran pending**
4. **Review data pegawai:**
   - Cek NIP valid atau tidak
   - Cek data lengkap
5. **Approve atau Reject:**
   - **Approve:** Pegawai bisa langsung login
   - **Reject:** Berikan alasan penolakan

---

## 📋 Fitur Registration System

### ✅ Validasi Otomatis

**Backend akan otomatis cek:**
- ✅ Semua field wajib diisi
- ✅ Format email valid
- ✅ Password minimal 8 karakter
- ✅ NIP belum terdaftar
- ✅ Email belum terdaftar
- ✅ Username belum digunakan
- ✅ NIP tidak ada di pending requests

### 🔐 Password Security

- ✅ Password di-hash dengan **bcrypt** (tidak plain text)
- ✅ Salt rounds: 10
- ✅ Backward compatible (user lama dengan plain text masih bisa login)

### 📊 Status User

| Status | Deskripsi | Bisa Login? |
|--------|-----------|-------------|
| **pending** | Menunggu approval admin | ❌ Tidak |
| **active** | Sudah disetujui admin | ✅ Ya |
| **rejected** | Ditolak admin | ❌ Tidak |
| **suspended** | Dinonaktifkan admin | ❌ Tidak |

### 🔄 Approval Flow

```
Pegawai Daftar
      ↓
Status: pending
      ↓
Admin Review
      ↓
   ┌──────┴──────┐
   ↓             ↓
Approve       Reject
   ↓             ↓
Active      Rejected
   ↓             ↓
Bisa Login  Tidak Bisa
```

---

## 🎯 API Endpoints Baru

### Registration

```bash
POST /api/register
Content-Type: application/json

{
  "name": "Ahmad Budiman",
  "nip": "198001012005011001",
  "email": "ahmad@example.com",
  "username": "ahmad",
  "password": "password123",
  "position": "Staff Administrasi",
  "department": "Kepegawaian"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Pendaftaran berhasil! Silakan tunggu persetujuan admin",
  "requestId": "uuid-here"
}
```

**Response Error:**
```json
{
  "success": false,
  "message": "NIP sudah terdaftar"
}
```

### Get Registration Requests (Admin)

```bash
GET /api/registration-requests
GET /api/registration-requests?status=pending
```

**Response:**
```json
[
  {
    "id": "uuid",
    "nip": "198001012005011001",
    "name": "Ahmad Budiman",
    "email": "ahmad@example.com",
    "username": "ahmad",
    "position": "Staff Administrasi",
    "department": "Kepegawaian",
    "status": "pending",
    "created_at": "2025-11-07T..."
  }
]
```

### Approve Registration (Admin)

```bash
POST /api/registration-requests/:id/approve
Content-Type: application/json

{
  "approvedBy": "admin-user-id",
  "reviewNote": "Data valid, disetujui"
}
```

### Reject Registration (Admin)

```bash
POST /api/registration-requests/:id/reject
Content-Type: application/json

{
  "rejectedBy": "admin-user-id",
  "reviewNote": "NIP tidak valid"
}
```

---

## 🧪 Testing Scenario

### Test 1: Registrasi Sukses

1. Buka http://localhost:3000/register
2. Isi form dengan data valid
3. Submit
4. Harus muncul "Pendaftaran Berhasil!"
5. Cek di Supabase → `registration_requests` → ada data baru dengan status `pending`

### Test 2: Validasi NIP Duplicate

1. Daftar dengan NIP yang sudah ada
2. Harus muncul error: "NIP sudah terdaftar"

### Test 3: Validasi Email

1. Daftar dengan email invalid (tanpa @)
2. Harus muncul error: "Format email tidak valid"

### Test 4: Validasi Password

1. Daftar dengan password < 8 karakter
2. Harus muncul error: "Password minimal 8 karakter"

### Test 5: Password Tidak Cocok

1. Isi password dan confirm password berbeda
2. Harus muncul error: "Password dan konfirmasi password tidak cocok"

### Test 6: Login Pending User

1. Daftar user baru (status pending)
2. Coba login dengan username/password tersebut
3. Harus muncul error: "Akun Anda masih menunggu persetujuan admin"

### Test 7: Admin Approve

1. Login sebagai admin
2. Buka tab "Pendaftaran"
3. Klik "Setujui" pada pendaftaran
4. User sekarang bisa login

### Test 8: Admin Reject

1. Login sebagai admin
2. Buka tab "Pendaftaran"
3. Klik "Tolak" dengan alasan
4. User tidak bisa login
5. Coba login → error: "Pendaftaran Anda ditolak"

---

## 🔍 Troubleshooting

### Error: "relation registration_requests does not exist"

**Cause:** SQL update belum dijalankan

**Solution:**
1. Buka Supabase SQL Editor
2. Run `supabase-registration-update.sql`
3. Restart server: `npm run dev`

### Error: "column status does not exist"

**Cause:** SQL update gagal atau tidak lengkap

**Solution:**
1. Check Supabase SQL Editor logs
2. Run SQL update lagi
3. Pastikan tidak ada error

### Pendaftaran berhasil tapi tidak muncul di admin

**Solution:**
1. Refresh halaman admin
2. Check filter status (pastikan "Pending")
3. Check di Supabase Table Editor

### User lama tidak bisa login

**Cause:** User lama tidak punya kolom `status`

**Solution:**
SQL update sudah handle ini dengan:
```sql
UPDATE users SET status = 'active' WHERE status IS NULL;
```

Jika masih error, run manual:
```sql
UPDATE users SET status = 'active';
```

---

## 📚 Database Schema Changes

### Table: users (Updated)

**Kolom Baru:**
```sql
status VARCHAR(20) DEFAULT 'active'
email VARCHAR(100) UNIQUE
registered_at TIMESTAMP
approved_at TIMESTAMP
approved_by UUID
rejection_reason TEXT
last_login_at TIMESTAMP
login_count INTEGER DEFAULT 0
```

### Table: registration_requests (New)

```sql
CREATE TABLE registration_requests (
    id UUID PRIMARY KEY,
    nip VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    department VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_at TIMESTAMP,
    reviewed_by UUID,
    review_note TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## 🎨 UI Components

### Registration Page
- **Path:** `/register`
- **File:** `client/src/pages/RegistrationPage.jsx`
- **Features:**
  - Form validation
  - Password visibility toggle
  - Real-time error messages
  - Success page after submit

### Login Page (Updated)
- **Added:** Link "Daftar Sekarang"
- **Location:** Below login button

### Admin Dashboard (Will be updated next)
- **New Tab:** "Pendaftaran"
- **Features:**
  - List pending registrations
  - Approve/Reject buttons
  - Review notes

---

## 🔐 Security Features

### Password Hashing
```javascript
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);
```

### Backward Compatibility
```javascript
// Support old plain text passwords
if (user.password.startsWith('$2b$')) {
  // Bcrypt hash
  isValid = await bcrypt.compare(password, user.password);
} else {
  // Plain text (old users)
  isValid = password === user.password;
}
```

### Login Tracking
```javascript
// Update on every login
last_login_at: new Date().toISOString()
login_count: user.login_count + 1
```

---

## 📊 Statistics

Setelah SQL update, Anda bisa query statistik:

```sql
-- Total registrations
SELECT COUNT(*) FROM registration_requests;

-- Pending registrations
SELECT COUNT(*) FROM registration_requests WHERE status = 'pending';

-- Approved today
SELECT COUNT(*) FROM registration_requests 
WHERE status = 'approved' 
AND DATE(reviewed_at) = CURRENT_DATE;

-- Rejection rate
SELECT 
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) * 100.0 / COUNT(*) as rejection_rate
FROM registration_requests;
```

---

## ✅ Checklist Implementation

- [x] Install bcrypt
- [x] Create SQL update script
- [x] Update backend login with bcrypt
- [x] Create register endpoint
- [x] Create registration management endpoints
- [x] Create RegistrationPage component
- [x] Update Login page with register link
- [x] Update App.jsx with register route
- [ ] **RUN SQL UPDATE IN SUPABASE** ⚠️ **REQUIRED!**
- [ ] Update AdminDashboard with registration tab
- [ ] Test all scenarios
- [ ] Update documentation

---

## 🚀 Next Steps

1. **Run SQL Update** (WAJIB!)
2. **Restart server** jika sudah running
3. **Test registration flow**
4. **Update AdminDashboard** (next task)
5. **Test admin approval flow**

---

**Ready to go! Jalankan SQL update dulu, lalu test fitur registrasi!** 🎉
