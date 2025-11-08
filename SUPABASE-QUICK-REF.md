# 🚀 Supabase Quick Reference

Cheat sheet untuk integrasi Supabase dalam aplikasi.

---

## 📋 Setup Checklist

```bash
✅ 1. Buat Supabase project
✅ 2. Run supabase-schema.sql
✅ 3. Copy credentials ke .env
✅ 4. npm install
✅ 5. Switch to index-supabase.js
✅ 6. npm run dev
```

---

## 🔑 Environment Variables

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3001
NODE_ENV=development
```

**Get credentials:**
Supabase Dashboard → Settings → API

---

## 🗄️ Database Tables

### employees
```sql
id (UUID, PK)
nip (VARCHAR, UNIQUE)
name (VARCHAR)
position (VARCHAR)
department (VARCHAR)
```

### users
```sql
id (UUID, PK)
username (VARCHAR, UNIQUE)
password (VARCHAR)
role (VARCHAR) -- 'admin' or 'employee'
employee_id (UUID, FK)
```

### submissions
```sql
id (UUID, PK)
employee_id (UUID, FK)
type (VARCHAR) -- 'tidak-rekam', 'terlambat-rekam', 'lupa-rekam'
sub_type (VARCHAR) -- 'datang' or 'pulang'
date (DATE)
status (VARCHAR) -- 'pending', 'approved', 'rejected'
submitted_at (TIMESTAMP)
reviewed_at (TIMESTAMP)
```

---

## 🔍 Common Queries

### Get All Submissions
```javascript
const { data, error } = await supabase
  .from('submissions')
  .select('*')
  .order('submitted_at', { ascending: false });
```

### Get by Employee
```javascript
const { data, error } = await supabase
  .from('submissions')
  .select('*')
  .eq('employee_id', employeeId);
```

### Get by Status
```javascript
const { data, error } = await supabase
  .from('submissions')
  .select('*')
  .eq('status', 'pending');
```

### Get by Month
```javascript
const monthStart = new Date(2025, 10, 1); // Nov 2025
const monthEnd = new Date(2025, 10, 30);

const { data, error } = await supabase
  .from('submissions')
  .select('*')
  .gte('submitted_at', monthStart.toISOString())
  .lte('submitted_at', monthEnd.toISOString());
```

### Insert Submission
```javascript
const { data, error } = await supabase
  .from('submissions')
  .insert([{
    employee_id: '11111111-1111-1111-1111-111111111111',
    employee_name: 'Ahmad Budiman',
    type: 'lupa-rekam',
    sub_type: 'datang',
    date: '2025-11-07',
    description: 'Lupa absen karena...',
    status: 'pending'
  }])
  .select()
  .single();
```

### Update Submission
```javascript
const { data, error } = await supabase
  .from('submissions')
  .update({
    status: 'approved',
    reviewed_by: 'Admin',
    review_note: 'Disetujui',
    reviewed_at: new Date().toISOString()
  })
  .eq('id', submissionId)
  .select()
  .single();
```

### Count Records
```javascript
const { count, error } = await supabase
  .from('submissions')
  .select('*', { count: 'exact', head: true })
  .eq('employee_id', employeeId);
```

---

## 🛠️ Useful SQL Functions

### Get Monthly Stats
```sql
SELECT get_monthly_stats('employee-uuid-here');
```

### Get Submission Count
```sql
SELECT get_monthly_submission_count(
  'employee-uuid-here',
  'terlambat-rekam',
  11,  -- month
  2025 -- year
);
```

### Manual Query
```sql
-- Get submissions for current month
SELECT * FROM submissions
WHERE employee_id = 'uuid-here'
  AND submitted_at >= date_trunc('month', CURRENT_DATE)
  AND submitted_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
```

---

## 🐛 Debugging

### Check Connection
```javascript
const { data, error } = await supabase
  .from('employees')
  .select('count')
  .limit(1);

console.log('Connected:', !error);
```

### Test Query
```bash
# Health check endpoint
curl http://localhost:3001/api/health
```

### View Logs
Supabase Dashboard → Logs → API Logs

### Common Errors

**"relation does not exist"**
→ Schema not created, run `supabase-schema.sql`

**"Missing SUPABASE_URL"**
→ Check `.env` file exists and has correct values

**"row level security policy"**
→ Disable RLS for development:
```sql
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
```

---

## 🔐 Security Tips

### 1. Never Commit .env
```bash
# Already in .gitignore
.env
.env.local
```

### 2. Use Service Role Key for Admin
```javascript
// For admin operations only
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

### 3. Enable RLS in Production
```sql
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions"
  ON submissions FOR SELECT
  USING (auth.uid() = employee_id);
```

### 4. Hash Passwords
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 10);
```

---

## 📊 Performance Tips

### 1. Select Only Needed Fields
```javascript
// Good
.select('id, name, status')

// Avoid
.select('*')
```

### 2. Use Indexes
```sql
-- Already created in schema
CREATE INDEX idx_submissions_employee_id ON submissions(employee_id);
```

### 3. Limit Results
```javascript
.select('*')
.limit(50)
```

### 4. Pagination
```javascript
.select('*')
.range(0, 9) // First 10 items
```

---

## 🔄 Field Name Mapping

| Database (snake_case) | API (camelCase) |
|-----------------------|-----------------|
| employee_id | employeeId |
| employee_name | employeeName |
| employee_nip | employeeNip |
| sub_type | subType |
| submitted_at | submittedAt |
| reviewed_at | reviewedAt |
| reviewed_by | reviewedBy |
| review_note | reviewNote |

**Note:** Backend automatically converts using `formatSubmission()` helper.

---

## 🧪 Testing Queries

### Test in Supabase SQL Editor

```sql
-- 1. Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. Count records
SELECT 
  'employees' as table_name, COUNT(*) FROM employees
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'submissions', COUNT(*) FROM submissions;

-- 3. Test monthly stats
SELECT get_monthly_stats('11111111-1111-1111-1111-111111111111');

-- 4. View recent submissions
SELECT 
  employee_name,
  type,
  sub_type,
  status,
  submitted_at
FROM submissions
ORDER BY submitted_at DESC
LIMIT 10;
```

---

## 📱 API Endpoints

### Authentication
```bash
POST /api/login
Body: { username, password }
```

### Employees
```bash
GET /api/employees
GET /api/employees/:id
```

### Submissions
```bash
POST /api/submissions
Body: { employeeId, type, subType, date, reason, description }

GET /api/submissions
Query: ?status=pending&employeeId=xxx&month=11&year=2025

GET /api/submissions/:id

PATCH /api/submissions/:id
Body: { status, reviewNote, reviewedBy }
```

### Statistics
```bash
GET /api/statistics
GET /api/monthly-stats/:employeeId?month=11&year=2025
```

### Health Check
```bash
GET /api/health
```

---

## 🔗 Quick Links

- **Supabase Dashboard:** https://app.supabase.com
- **SQL Editor:** Dashboard → SQL Editor
- **Table Editor:** Dashboard → Table Editor
- **API Logs:** Dashboard → Logs
- **Documentation:** https://supabase.com/docs

---

## 💡 Pro Tips

1. **Use Table Editor for quick data checks**
   - Dashboard → Table Editor → submissions
   - View, edit, delete records visually

2. **Monitor API usage**
   - Dashboard → Settings → Usage
   - Check request count, bandwidth

3. **Backup data regularly**
   - Dashboard → Database → Backups
   - Free tier: 7 days retention

4. **Use SQL Editor for complex queries**
   - Dashboard → SQL Editor
   - Save frequently used queries

5. **Test locally before production**
   - Use separate Supabase projects
   - Dev, Staging, Production

---

**Quick Start:**
```bash
# 1. Setup
cp .env.example .env
# Edit .env with your credentials

# 2. Install
npm install

# 3. Run
npm run dev

# 4. Test
curl http://localhost:3001/api/health
```

**Done! 🎉**
