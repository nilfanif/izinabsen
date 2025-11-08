# 🚀 Setup Supabase Integration

Panduan lengkap untuk mengintegrasikan aplikasi dengan Supabase PostgreSQL database.

---

## 📋 Prerequisites

- Akun Supabase (gratis di [supabase.com](https://supabase.com))
- Node.js versi 16 atau lebih baru
- npm atau yarn

---

## 🔧 Step 1: Setup Supabase Project

### 1.1 Buat Project Baru

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Klik **"New Project"**
3. Isi detail project:
   - **Name**: `sistem-izin-kehadiran`
   - **Database Password**: Buat password yang kuat (simpan dengan aman!)
   - **Region**: Pilih yang terdekat (contoh: Southeast Asia - Singapore)
4. Klik **"Create new project"**
5. Tunggu beberapa menit hingga project siap

### 1.2 Dapatkan API Credentials

1. Di Supabase Dashboard, buka **Settings** → **API**
2. Copy credentials berikut:
   - **Project URL** (contoh: `https://xxxxx.supabase.co`)
   - **anon/public key** (key yang panjang)

---

## 💾 Step 2: Setup Database Schema

### 2.1 Buka SQL Editor

1. Di Supabase Dashboard, klik **SQL Editor** di sidebar
2. Klik **"New query"**

### 2.2 Run Schema Script

1. Buka file `supabase-schema.sql` di project ini
2. Copy seluruh isi file
3. Paste ke SQL Editor di Supabase
4. Klik **"Run"** atau tekan `Ctrl+Enter`
5. Tunggu hingga selesai (akan muncul "Success. No rows returned")

### 2.3 Verifikasi Tables

1. Klik **Table Editor** di sidebar
2. Anda harus melihat 3 tables:
   - ✅ `employees` (3 rows)
   - ✅ `users` (2 rows)
   - ✅ `submissions` (0 rows)

---

## ⚙️ Step 3: Setup Environment Variables

### 3.1 Buat File .env

Di root folder project, buat file `.env`:

```bash
# Di terminal/command prompt
cd /Users/danielyovanda/CascadeProjects/sistem-izin-kehadiran
touch .env
```

### 3.2 Isi Credentials

Buka file `.env` dan isi dengan credentials Supabase Anda:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server Configuration
PORT=3001
NODE_ENV=development
```

**⚠️ PENTING:**
- Ganti `https://xxxxx.supabase.co` dengan Project URL Anda
- Ganti `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` dengan anon key Anda
- File `.env` sudah di-gitignore, jangan commit ke Git!

---

## 📦 Step 4: Install Dependencies

```bash
# Install Supabase client dan dotenv
npm install

# Atau jika belum install semua dependencies
npm run install-all
```

---

## 🔄 Step 5: Switch ke Supabase Backend

### Option A: Rename Files (Recommended)

```bash
# Backup old server
mv server/index.js server/index-old.js

# Use Supabase version
mv server/index-supabase.js server/index.js
```

### Option B: Update package.json

Edit `package.json`:

```json
{
  "scripts": {
    "server": "nodemon server/index-supabase.js"
  }
}
```

---

## 🚀 Step 6: Run Application

```bash
# Start both backend and frontend
npm run dev
```

**Expected output:**
```
🚀 Server berjalan di http://localhost:3001
✅ Supabase connected successfully
📊 Health check: http://localhost:3001/api/health
```

---

## ✅ Step 7: Test Integration

### 7.1 Health Check

Buka browser: `http://localhost:3001/api/health`

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-11-07T..."
}
```

### 7.2 Login Test

1. Buka aplikasi: `http://localhost:3000`
2. Login dengan akun demo:
   - Username: `pegawai`
   - Password: `pegawai123`
3. Jika berhasil, Anda akan masuk ke dashboard

### 7.3 Submit Test

1. Klik **"Ajukan Izin"**
2. Pilih jenis izin (contoh: Lupa Rekam)
3. Isi form dan submit
4. Cek di Supabase Dashboard → **Table Editor** → `submissions`
5. Data harus muncul di table

---

## 🔍 Troubleshooting

### Error: "Missing SUPABASE_URL environment variable"

**Solusi:**
- Pastikan file `.env` ada di root folder
- Pastikan isi `.env` benar (tidak ada typo)
- Restart server: `Ctrl+C` lalu `npm run dev`

### Error: "Supabase connection test failed"

**Solusi:**
1. Cek Project URL dan anon key di `.env`
2. Pastikan Supabase project sudah aktif (tidak paused)
3. Cek koneksi internet
4. Coba akses Supabase Dashboard

### Error: "relation does not exist"

**Solusi:**
- Schema belum di-run atau gagal
- Buka SQL Editor di Supabase
- Run ulang `supabase-schema.sql`
- Cek error message di SQL Editor

### Error: "row level security policy"

**Solusi:**
- RLS policies sudah di-setup di schema
- Pastikan menggunakan anon key (bukan service_role key)
- Jika masih error, disable RLS sementara:
  ```sql
  ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
  ALTER TABLE users DISABLE ROW LEVEL SECURITY;
  ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
  ```

### Data Tidak Muncul di Frontend

**Solusi:**
1. Cek browser console (F12) untuk error
2. Cek network tab untuk API calls
3. Cek response dari API
4. Pastikan field names match (snake_case di DB vs camelCase di frontend)

---

## 🔐 Security Best Practices

### 1. Password Hashing

**Current:** Plain text passwords (DEMO ONLY)  
**Production:** Use bcrypt

```javascript
const bcrypt = require('bcrypt');

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 2. Environment Variables

- ✅ Never commit `.env` to Git
- ✅ Use different credentials for dev/staging/production
- ✅ Rotate keys regularly
- ✅ Use service_role key only for admin operations

### 3. Row Level Security (RLS)

Schema sudah include RLS policies. Untuk production:
- Enable RLS on all tables
- Create specific policies per role
- Test policies thoroughly

---

## 📊 Database Schema Overview

### Tables

**employees**
- `id` (UUID, PK)
- `nip` (VARCHAR, UNIQUE)
- `name` (VARCHAR)
- `position` (VARCHAR)
- `department` (VARCHAR)
- `created_at`, `updated_at` (TIMESTAMP)

**users**
- `id` (UUID, PK)
- `username` (VARCHAR, UNIQUE)
- `password` (VARCHAR) - ⚠️ Plain text for demo
- `role` (VARCHAR) - 'admin' or 'employee'
- `name` (VARCHAR)
- `employee_id` (UUID, FK)
- `created_at`, `updated_at` (TIMESTAMP)

**submissions**
- `id` (UUID, PK)
- `employee_id` (UUID, FK)
- `employee_name`, `employee_nip`, `department` (VARCHAR)
- `type` (VARCHAR) - 'tidak-rekam', 'terlambat-rekam', 'lupa-rekam'
- `sub_type` (VARCHAR) - 'datang' or 'pulang' (nullable)
- `date` (DATE)
- `reason` (VARCHAR, nullable)
- `description` (TEXT)
- `status` (VARCHAR) - 'pending', 'approved', 'rejected'
- `submitted_at` (TIMESTAMP)
- `reviewed_at`, `reviewed_by`, `review_note` (nullable)
- `created_at`, `updated_at` (TIMESTAMP)

### Indexes

- `idx_submissions_employee_id`
- `idx_submissions_status`
- `idx_submissions_type`
- `idx_submissions_submitted_at`
- `idx_submissions_date`
- `idx_users_username`
- `idx_employees_nip`

### Functions

- `get_monthly_submission_count()` - Count submissions per month
- `get_monthly_stats()` - Get detailed monthly statistics

---

## 🔄 Migration from In-Memory

### Data Mapping

**In-Memory → Supabase:**
- `submittedAt` → `submitted_at`
- `reviewedAt` → `reviewed_at`
- `reviewedBy` → `reviewed_by`
- `reviewNote` → `review_note`
- `subType` → `sub_type`
- `employeeId` → `employee_id`

### Frontend Changes Needed

**⚠️ IMPORTANT:** Field names di response API berubah dari camelCase ke snake_case.

**Option 1:** Update frontend untuk handle snake_case  
**Option 2:** Transform response di backend ke camelCase

Contoh transform function:
```javascript
const toCamelCase = (obj) => {
  const newObj = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    newObj[camelKey] = obj[key];
  }
  return newObj;
};
```

---

## 📈 Performance Tips

### 1. Indexes
Schema sudah include indexes untuk query yang sering digunakan.

### 2. Connection Pooling
Supabase client sudah handle connection pooling otomatis.

### 3. Query Optimization
```javascript
// Good: Select only needed fields
.select('id, name, status')

// Bad: Select all fields
.select('*')
```

### 4. Pagination
Untuk data banyak, gunakan pagination:
```javascript
const { data } = await supabase
  .from('submissions')
  .select('*')
  .range(0, 9) // First 10 items
  .order('submitted_at', { ascending: false });
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Login sebagai admin
- [ ] Login sebagai pegawai
- [ ] Submit izin Tidak Rekam
- [ ] Submit izin Terlambat
- [ ] Submit izin Lupa Rekam (Datang)
- [ ] Submit izin Lupa Rekam (Pulang)
- [ ] Test kuota limit (10x)
- [ ] Filter riwayat per bulan
- [ ] Admin approve pengajuan
- [ ] Admin reject pengajuan
- [ ] Cek data di Supabase Dashboard

### SQL Testing Queries

```sql
-- Check all submissions
SELECT * FROM submissions ORDER BY submitted_at DESC;

-- Check monthly stats
SELECT get_monthly_stats('11111111-1111-1111-1111-111111111111');

-- Check quota usage
SELECT 
  employee_name,
  type,
  COUNT(*) as count
FROM submissions
WHERE 
  employee_id = '11111111-1111-1111-1111-111111111111'
  AND submitted_at >= date_trunc('month', CURRENT_DATE)
GROUP BY employee_name, type;
```

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🆘 Support

Jika mengalami masalah:

1. **Check Logs:**
   - Browser console (F12)
   - Server terminal
   - Supabase Dashboard → Logs

2. **Common Issues:**
   - Environment variables tidak terbaca → Restart server
   - Connection timeout → Check internet/firewall
   - Query error → Check field names (snake_case)

3. **Supabase Community:**
   - [Discord](https://discord.supabase.com)
   - [GitHub Discussions](https://github.com/supabase/supabase/discussions)

---

**Version**: 2.0.0  
**Last Updated**: 07 November 2025  
**Status**: ✅ Ready for Production (with security improvements)
