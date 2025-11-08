const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { format, startOfMonth, endOfMonth } = require('date-fns');
const { supabase, testConnection } = require('./supabase');
const { formatSubmission, formatSubmissions } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  'https://kehadiran-2e5a5.web.app',
  'https://kehadiran-2e5a5.firebaseapp.com'
];

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(bodyParser.json());

// Test Supabase connection on startup
testConnection();

// ============================================
// AUTHENTICATION
// ============================================

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Try to find user by username OR email
    let query = supabase
      .from('users')
      .select('*');
    
    // Check if input looks like an email
    if (username.includes('@')) {
      query = query.eq('email', username);
    } else {
      query = query.eq('username', username);
    }
    
    const { data: user, error } = await query.single();
    
    // If user not found in users table, check registration_requests table
    if (error || !user) {
      let pendingQuery = supabase
        .from('registration_requests')
        .select('*')
        .order('created_at', { ascending: false }); // Get latest first
      
      if (username.includes('@')) {
        pendingQuery = pendingQuery.eq('email', username);
      } else {
        pendingQuery = pendingQuery.eq('username', username);
      }
      
      const { data: pendingUsers, error: pendingError } = await pendingQuery;
      
      // Get the most recent registration (first in array after ordering)
      const pendingUser = pendingUsers && pendingUsers.length > 0 ? pendingUsers[0] : null;
      
      // If found in registration_requests
      if (pendingUser && !pendingError) {
        console.log('Found in registration_requests:', {
          username: pendingUser.username,
          hasPasswordHash: !!pendingUser.password_hash,
          passwordHashPrefix: pendingUser.password_hash ? pendingUser.password_hash.substring(0, 4) : 'none',
          status: pendingUser.status
        });
        
        // Verify password
        let isPasswordValid = false;
        
        if (pendingUser.password_hash && pendingUser.password_hash.startsWith('$2b$')) {
          isPasswordValid = await bcrypt.compare(password, pendingUser.password_hash);
          console.log('Pending user bcrypt comparison:', isPasswordValid);
        }
        
        if (!isPasswordValid) {
          console.log('Password invalid for pending user');
          return res.status(401).json({
            success: false,
            message: 'Username/Email atau password salah'
          });
        }
        
        console.log('Password valid for pending user, checking status:', pendingUser.status);
        
        // Password correct, check status
        if (pendingUser.status === 'pending') {
          console.log('Returning pending status message');
          return res.status(403).json({
            success: false,
            message: 'Akun Anda masih menunggu persetujuan admin'
          });
        } else if (pendingUser.status === 'rejected') {
          console.log('Returning rejected status message');
          return res.status(403).json({
            success: false,
            message: 'Pendaftaran Anda ditolak. Silakan hubungi admin'
          });
        }
      } else {
        console.log('Not found in registration_requests:', { pendingError });
      }
      
      // Not found in both tables
      return res.status(401).json({ 
        success: false, 
        message: 'Username/Email atau password salah' 
      });
    }
    
    // Debug logging
    console.log('Login attempt:', {
      username: username,
      userFound: !!user,
      hasPassword: !!user.password,
      passwordPrefix: user.password ? user.password.substring(0, 4) : 'none',
      userStatus: user.status || 'no status field'
    });
    
    // Verify password FIRST (support both plain text for old users and bcrypt for new users)
    let isPasswordValid = false;
    
    if (user.password && user.password.startsWith('$2b$')) {
      // Bcrypt hashed password
      isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Bcrypt comparison result:', isPasswordValid);
    } else {
      // Plain text password (old users)
      isPasswordValid = password === user.password;
      console.log('Plain text comparison result:', isPasswordValid);
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Username/Email atau password salah'
      });
    }
    
    // THEN check user status (only if status field exists)
    if (user.status) {
      if (user.status === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Akun Anda masih menunggu persetujuan admin'
        });
      }
      
      if (user.status === 'rejected') {
        return res.status(403).json({
          success: false,
          message: 'Pendaftaran Anda ditolak. Silakan hubungi admin'
        });
      }
      
      if (user.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Akun Anda telah dinonaktifkan'
        });
      }
    }
    
    // Update last login (only if columns exist)
    try {
      await supabase
        .from('users')
        .update({
          last_login_at: new Date().toISOString(),
          login_count: (user.login_count || 0) + 1
        })
        .eq('id', user.id);
    } catch (updateErr) {
      // Ignore update errors (columns might not exist yet)
      console.log('Login count update skipped:', updateErr.message);
    }
    
    // Remove password from response
    delete user.password;
    delete user.status;
    
    res.json({ success: true, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
});

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, nip, email, username, password, position, department } = req.body;
    
    // Validation
    if (!name || !nip || !email || !username || !password || !position || !department) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid'
      });
    }
    
    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 8 karakter'
      });
    }
    
    // Check if NIP already exists
    const { data: existingNip } = await supabase
      .from('employees')
      .select('nip')
      .eq('nip', nip)
      .single();
    
    if (existingNip) {
      return res.status(400).json({
        success: false,
        message: 'NIP sudah terdaftar'
      });
    }
    
    // Check if NIP in pending requests
    const { data: pendingNip } = await supabase
      .from('registration_requests')
      .select('nip')
      .eq('nip', nip)
      .eq('status', 'pending')
      .single();
    
    if (pendingNip) {
      return res.status(400).json({
        success: false,
        message: 'NIP sudah diajukan dan sedang menunggu persetujuan'
      });
    }
    
    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();
    
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }
    
    // Check if email in pending requests
    const { data: pendingEmail } = await supabase
      .from('registration_requests')
      .select('email')
      .eq('email', email)
      .eq('status', 'pending')
      .single();
    
    if (pendingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah diajukan dan sedang menunggu persetujuan'
      });
    }
    
    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();
    
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan'
      });
    }
    
    // Check if username in pending requests
    const { data: pendingUsername } = await supabase
      .from('registration_requests')
      .select('username')
      .eq('username', username)
      .eq('status', 'pending')
      .single();
    
    if (pendingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah diajukan dan sedang menunggu persetujuan'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create registration request
    const { data: request, error } = await supabase
      .from('registration_requests')
      .insert([{
        nip: nip,
        name: name,
        email: email,
        username: username,
        password_hash: hashedPassword,
        position: position,
        department: department,
        status: 'pending'
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil! Silakan tunggu persetujuan admin',
      requestId: request.id
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal melakukan pendaftaran'
    });
  }
});

// ============================================
// EMPLOYEES
// ============================================

// Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    res.json(employees);
  } catch (err) {
    console.error('Get employees error:', err);
    res.status(500).json({ message: 'Gagal mengambil data pegawai' });
  }
});

// Get employee by ID
app.get('/api/employees/:id', async (req, res) => {
  try {
    const { data: employee, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error || !employee) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }
    
    res.json(employee);
  } catch (err) {
    console.error('Get employee error:', err);
    res.status(500).json({ message: 'Gagal mengambil data pegawai' });
  }
});

// Delete employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, delete all submissions for this employee
    const { error: submissionsError } = await supabase
      .from('submissions')
      .delete()
      .eq('employee_id', id);
    
    if (submissionsError) {
      console.error('Error deleting submissions:', submissionsError);
      // Continue anyway to delete the employee
    }
    
    // Delete the user account associated with this employee
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('employee_id', id);
    
    if (userError) {
      console.error('Error deleting user:', userError);
      // Continue anyway to delete the employee
    }
    
    // Finally, delete the employee
    const { error: employeeError } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    
    if (employeeError) {
      throw employeeError;
    }
    
    res.json({ 
      success: true, 
      message: 'Pegawai berhasil dihapus' 
    });
  } catch (err) {
    console.error('Delete employee error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Gagal menghapus pegawai' 
    });
  }
});

// ============================================
// SUBMISSIONS
// ============================================

// Submit leave request
app.post('/api/submissions', async (req, res) => {
  try {
    const { employeeId, type, date, reason, description, subType } = req.body;
    
    // Get employee data
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();
    
    if (empError || !employee) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }
    
    // Validate quota for terlambat-rekam and lupa-rekam
    if (type === 'terlambat-rekam' || type === 'lupa-rekam') {
      // Use the incident date (date) instead of current date (now)
      const incidentDate = new Date(date);
      const monthStart = startOfMonth(incidentDate);
      const monthEnd = endOfMonth(incidentDate);
      
      // Get monthly submissions count based on incident date month
      const { data: submissions, error: subError } = await supabase
        .from('submissions')
        .select('type, date')
        .eq('employee_id', employeeId)
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'))
        .in('type', ['terlambat-rekam', 'lupa-rekam']);
      
      if (subError) throw subError;
      
      const totalQuotaUsed = submissions.length;
      
      if (totalQuotaUsed >= 10) {
        const lateCount = submissions.filter(s => s.type === 'terlambat-rekam').length;
        const forgetCount = submissions.filter(s => s.type === 'lupa-rekam').length;
        
        // Format month name for error message
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                           'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const monthName = monthNames[incidentDate.getMonth()];
        const year = incidentDate.getFullYear();
        
        return res.status(400).json({
          success: false,
          message: `Anda telah mencapai batas maksimal 10 pengajuan (Terlambat + Lupa Rekam) untuk bulan ${monthName} ${year}`,
          currentCount: totalQuotaUsed,
          maxLimit: 10,
          breakdown: {
            terlambat: lateCount,
            lupaRekam: forgetCount
          }
        });
      }
    }
    
    // Insert submission
    const { data: submission, error: insertError } = await supabase
      .from('submissions')
      .insert([{
        employee_id: employeeId,
        employee_name: employee.name,
        employee_nip: employee.nip,
        department: employee.department,
        type: type,
        sub_type: subType || null,
        date: date,
        reason: reason || null,
        description: description,
        status: 'pending'
      }])
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    res.status(201).json({ success: true, submission: formatSubmission(submission) });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengirim pengajuan' 
    });
  }
});

// Check quota for a specific date
app.get('/api/quota-check', async (req, res) => {
  try {
    const { employeeId, date } = req.query;
    
    if (!employeeId || !date) {
      return res.status(400).json({ message: 'employeeId dan date diperlukan' });
    }
    
    // Use the incident date to check quota
    const incidentDate = new Date(date);
    const monthStart = startOfMonth(incidentDate);
    const monthEnd = endOfMonth(incidentDate);
    
    // Get monthly submissions count based on incident date month
    const { data: submissions, error: subError } = await supabase
      .from('submissions')
      .select('type, date')
      .eq('employee_id', employeeId)
      .gte('date', format(monthStart, 'yyyy-MM-dd'))
      .lte('date', format(monthEnd, 'yyyy-MM-dd'))
      .in('type', ['terlambat-rekam', 'lupa-rekam']);
    
    if (subError) throw subError;
    
    const totalQuotaUsed = submissions.length;
    const lateCount = submissions.filter(s => s.type === 'terlambat-rekam').length;
    const forgetCount = submissions.filter(s => s.type === 'lupa-rekam').length;
    const remaining = Math.max(0, 10 - totalQuotaUsed);
    
    res.json({
      success: true,
      quota: {
        total: 10,
        used: totalQuotaUsed,
        remaining: remaining,
        breakdown: {
          terlambat: lateCount,
          lupaRekam: forgetCount
        },
        month: incidentDate.getMonth() + 1,
        year: incidentDate.getFullYear()
      }
    });
  } catch (err) {
    console.error('Quota check error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengecek kuota' 
    });
  }
});

// Get all submissions (with filters)
app.get('/api/submissions', async (req, res) => {
  try {
    const { status, employeeId, month, year } = req.query;
    
    let query = supabase
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }
    
    // Filter by employee
    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }
    
    // Filter by month and year based on incident date (not submitted_at)
    if (month && year) {
      const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthEnd = endOfMonth(monthStart);
      
      query = query
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'));
    }
    
    const { data: submissions, error } = await query;
    
    if (error) throw error;
    
    res.json(formatSubmissions(submissions));
  } catch (err) {
    console.error('Get submissions error:', err);
    res.status(500).json({ message: 'Gagal mengambil data pengajuan' });
  }
});

// Get submission by ID
app.get('/api/submissions/:id', async (req, res) => {
  try {
    const { data: submission, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error || !submission) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan' });
    }
    
    res.json(formatSubmission(submission));
  } catch (err) {
    console.error('Get submission error:', err);
    res.status(500).json({ message: 'Gagal mengambil data pengajuan' });
  }
});

// Update submission status (approve/reject)
app.patch('/api/submissions/:id', async (req, res) => {
  try {
    const { status, reviewNote, reviewedBy } = req.body;
    
    const { data: submission, error } = await supabase
      .from('submissions')
      .update({
        status: status,
        review_note: reviewNote,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, submission: formatSubmission(submission) });
  } catch (err) {
    console.error('Update submission error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengupdate pengajuan' 
    });
  }
});

// ============================================
// STATISTICS
// ============================================

// Get general statistics
app.get('/api/statistics', async (req, res) => {
  try {
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('status');
    
    if (error) throw error;
    
    const stats = {
      total: submissions.length,
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      rejected: submissions.filter(s => s.status === 'rejected').length
    };
    
    res.json(stats);
  } catch (err) {
    console.error('Get statistics error:', err);
    res.status(500).json({ message: 'Gagal mengambil statistik' });
  }
});

// Get monthly statistics for employee
app.get('/api/monthly-stats/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;
    
    // Determine date range
    let monthStart, monthEnd;
    if (month && year) {
      monthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
      monthEnd = endOfMonth(monthStart);
    } else {
      const now = new Date();
      monthStart = startOfMonth(now);
      monthEnd = endOfMonth(now);
    }
    
    // Get submissions for the month based on incident date
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('type, date')
      .eq('employee_id', employeeId)
      .gte('date', format(monthStart, 'yyyy-MM-dd'))
      .lte('date', format(monthEnd, 'yyyy-MM-dd'));
    
    if (error) throw error;
    
    const terlambat = submissions.filter(s => s.type === 'terlambat-rekam').length;
    const lupaRekam = submissions.filter(s => s.type === 'lupa-rekam').length;
    const tidakRekam = submissions.filter(s => s.type === 'tidak-rekam').length;
    const quotaUsed = terlambat + lupaRekam;
    const quotaLimit = 10;
    
    const stats = {
      total: submissions.length,
      terlambat: terlambat,
      lupaRekam: lupaRekam,
      tidakRekam: tidakRekam,
      quotaUsed: quotaUsed,
      quotaLimit: quotaLimit,
      quotaRemaining: Math.max(0, quotaLimit - quotaUsed),
      canSubmitQuota: quotaUsed < quotaLimit
    };
    
    res.json(stats);
  } catch (err) {
    console.error('Get monthly stats error:', err);
    res.status(500).json({ message: 'Gagal mengambil statistik bulanan' });
  }
});

// ============================================
// REGISTRATION MANAGEMENT (Admin Only)
// ============================================

// Get all registration requests
app.get('/api/registration-requests', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = supabase
      .from('registration_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data: requests, error } = await query;
    
    if (error) throw error;
    
    res.json(requests);
  } catch (err) {
    console.error('Get registration requests error:', err);
    res.status(500).json({ message: 'Gagal mengambil data pendaftaran' });
  }
});

// Approve registration
app.post('/api/registration-requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy, reviewNote } = req.body;
    
    // Get registration request
    const { data: request, error: fetchError } = await supabase
      .from('registration_requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !request) {
      return res.status(404).json({
        success: false,
        message: 'Permintaan pendaftaran tidak ditemukan'
      });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Permintaan sudah diproses sebelumnya'
      });
    }
    
    // Create employee
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .insert([{
        nip: request.nip,
        name: request.name,
        position: request.position,
        department: request.department
      }])
      .select()
      .single();
    
    if (empError) throw empError;
    
    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{
        username: request.username,
        email: request.email,
        password: request.password_hash,
        role: 'employee',
        name: request.name,
        employee_id: employee.id,
        status: 'active',
        approved_at: new Date().toISOString(),
        approved_by: approvedBy
      }])
      .select()
      .single();
    
    if (userError) throw userError;
    
    // Update registration request
    const { error: updateError } = await supabase
      .from('registration_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: approvedBy,
        review_note: reviewNote || 'Disetujui'
      })
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    res.json({
      success: true,
      message: 'Pendaftaran berhasil disetujui',
      user: user,
      employee: employee
    });
  } catch (err) {
    console.error('Approve registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal menyetujui pendaftaran'
    });
  }
});

// Reject registration
app.post('/api/registration-requests/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectedBy, reviewNote } = req.body;
    
    if (!reviewNote) {
      return res.status(400).json({
        success: false,
        message: 'Alasan penolakan wajib diisi'
      });
    }
    
    // Get registration request
    const { data: request, error: fetchError } = await supabase
      .from('registration_requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !request) {
      return res.status(404).json({
        success: false,
        message: 'Permintaan pendaftaran tidak ditemukan'
      });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Permintaan sudah diproses sebelumnya'
      });
    }
    
    // Update registration request
    const { error: updateError } = await supabase
      .from('registration_requests')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: rejectedBy,
        review_note: reviewNote
      })
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    res.json({
      success: true,
      message: 'Pendaftaran ditolak'
    });
  } catch (err) {
    console.error('Reject registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal menolak pendaftaran'
    });
  }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', async (req, res) => {
  const isConnected = await testConnection();
  res.json({ 
    status: isConnected ? 'healthy' : 'unhealthy',
    database: isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
