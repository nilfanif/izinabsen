const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { format, startOfMonth, endOfMonth } = require('date-fns');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory database (untuk demo, bisa diganti dengan database real)
let submissions = [];
let employees = [
  { id: '1', nip: '198001012005011001', name: 'Ahmad Budiman', position: 'Staff Administrasi', department: 'Kepegawaian' },
  { id: '2', nip: '198505152010012002', name: 'Siti Nurhaliza', position: 'Staff Keuangan', department: 'Keuangan' },
  { id: '3', nip: '199002202015011003', name: 'Budi Santoso', position: 'Staff IT', department: 'IT' },
];

let users = [
  { username: 'admin', password: 'admin123', role: 'admin', name: 'Kasubag Kepegawaian' },
  { username: 'pegawai', password: 'pegawai123', role: 'employee', employeeId: '1' },
];

// Routes

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } else {
    res.status(401).json({ success: false, message: 'Username atau password salah' });
  }
});

// Get all employees
app.get('/api/employees', (req, res) => {
  res.json(employees);
});

// Get employee by ID
app.get('/api/employees/:id', (req, res) => {
  const employee = employees.find(e => e.id === req.params.id);
  if (employee) {
    res.json(employee);
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// Helper function to get monthly submissions count
const getMonthlySubmissions = (employeeId, type = null, month = null, year = null) => {
  let monthStart, monthEnd;
  
  if (month !== null && year !== null) {
    // Specific month and year
    monthStart = new Date(year, month - 1, 1);
    monthEnd = endOfMonth(monthStart);
  } else {
    // Current month
    const now = new Date();
    monthStart = startOfMonth(now);
    monthEnd = endOfMonth(now);
  }
  
  return submissions.filter(s => {
    const submittedDate = new Date(s.submittedAt);
    const isInCurrentMonth = submittedDate >= monthStart && submittedDate <= monthEnd;
    const isEmployee = s.employeeId === employeeId;
    const isType = type ? s.type === type : true;
    
    return isInCurrentMonth && isEmployee && isType;
  });
};

// Submit leave request
app.post('/api/submissions', (req, res) => {
  const { employeeId, type, date, reason, description, subType } = req.body;
  
  const employee = employees.find(e => e.id === employeeId);
  if (!employee) {
    return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
  
  // Validasi batasan kuota gabungan (maksimal 10x per bulan untuk terlambat + lupa rekam)
  if (type === 'terlambat-rekam' || type === 'lupa-rekam') {
    const monthlyLateSubmissions = getMonthlySubmissions(employeeId, 'terlambat-rekam');
    const monthlyForgetSubmissions = getMonthlySubmissions(employeeId, 'lupa-rekam');
    const totalQuotaUsed = monthlyLateSubmissions.length + monthlyForgetSubmissions.length;
    
    if (totalQuotaUsed >= 10) {
      return res.status(400).json({ 
        success: false,
        message: 'Anda telah mencapai batas maksimal 10 pengajuan (Terlambat + Lupa Rekam) untuk bulan ini',
        currentCount: totalQuotaUsed,
        maxLimit: 10,
        breakdown: {
          terlambat: monthlyLateSubmissions.length,
          lupaRekam: monthlyForgetSubmissions.length
        }
      });
    }
  }
  
  const submission = {
    id: uuidv4(),
    employeeId,
    employeeName: employee.name,
    employeeNip: employee.nip,
    department: employee.department,
    type,
    subType: subType || null, // 'datang' atau 'pulang' untuk lupa-rekam
    date,
    reason: reason || null,
    description,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
    reviewNote: null
  };
  
  submissions.push(submission);
  res.status(201).json({ success: true, submission });
});

// Get all submissions (for admin)
app.get('/api/submissions', (req, res) => {
  const { status, employeeId, month, year } = req.query;
  
  let filtered = [...submissions];
  
  if (status) {
    filtered = filtered.filter(s => s.status === status);
  }
  
  if (employeeId) {
    filtered = filtered.filter(s => s.employeeId === employeeId);
  }
  
  // Filter by month and year
  if (month && year) {
    const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthEnd = endOfMonth(monthStart);
    
    filtered = filtered.filter(s => {
      const submittedDate = new Date(s.submittedAt);
      return submittedDate >= monthStart && submittedDate <= monthEnd;
    });
  }
  
  // Sort by submitted date (newest first)
  filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  
  res.json(filtered);
});

// Get submission by ID
app.get('/api/submissions/:id', (req, res) => {
  const submission = submissions.find(s => s.id === req.params.id);
  if (submission) {
    res.json(submission);
  } else {
    res.status(404).json({ message: 'Pengajuan tidak ditemukan' });
  }
});

// Update submission status (approve/reject)
app.patch('/api/submissions/:id', (req, res) => {
  const { status, reviewNote, reviewedBy } = req.body;
  const submission = submissions.find(s => s.id === req.params.id);
  
  if (!submission) {
    return res.status(404).json({ message: 'Pengajuan tidak ditemukan' });
  }
  
  submission.status = status;
  submission.reviewNote = reviewNote;
  submission.reviewedBy = reviewedBy;
  submission.reviewedAt = new Date().toISOString();
  
  res.json({ success: true, submission });
});

// Get statistics
app.get('/api/statistics', (req, res) => {
  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };
  
  res.json(stats);
});

// Get monthly statistics for employee
app.get('/api/monthly-stats/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  const { month, year } = req.query;
  
  const monthlySubmissions = getMonthlySubmissions(employeeId, null, month, year);
  const monthlyLateSubmissions = getMonthlySubmissions(employeeId, 'terlambat-rekam', month, year);
  const monthlyForgetSubmissions = getMonthlySubmissions(employeeId, 'lupa-rekam', month, year);
  const monthlyNoRecordSubmissions = getMonthlySubmissions(employeeId, 'tidak-rekam', month, year);
  
  const quotaUsed = monthlyLateSubmissions.length + monthlyForgetSubmissions.length;
  const quotaLimit = 10;
  
  const stats = {
    total: monthlySubmissions.length,
    terlambat: monthlyLateSubmissions.length,
    lupaRekam: monthlyForgetSubmissions.length,
    tidakRekam: monthlyNoRecordSubmissions.length,
    quotaUsed: quotaUsed,
    quotaLimit: quotaLimit,
    quotaRemaining: Math.max(0, quotaLimit - quotaUsed),
    canSubmitQuota: quotaUsed < quotaLimit
  };
  
  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
