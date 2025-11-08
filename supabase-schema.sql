-- ============================================
-- SUPABASE DATABASE SCHEMA
-- Sistem Izin Kehadiran Pegawai
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: employees
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nip VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(100),
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'employee')),
    name VARCHAR(100) NOT NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: submissions
-- ============================================
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(100) NOT NULL,
    employee_nip VARCHAR(20) NOT NULL,
    department VARCHAR(100),
    type VARCHAR(20) NOT NULL CHECK (type IN ('tidak-rekam', 'terlambat-rekam', 'lupa-rekam')),
    sub_type VARCHAR(20) CHECK (sub_type IN ('datang', 'pulang') OR sub_type IS NULL),
    date DATE NOT NULL,
    reason VARCHAR(50),
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(100),
    review_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_submissions_employee_id ON submissions(employee_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_type ON submissions(type);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_submissions_date ON submissions(date);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_employees_nip ON employees(nip);

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS: Auto-update updated_at
-- ============================================
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA: Initial employees
-- ============================================
INSERT INTO employees (id, nip, name, position, department) VALUES
    ('11111111-1111-1111-1111-111111111111', '198001012005011001', 'Ahmad Budiman', 'Staff Administrasi', 'Kepegawaian'),
    ('22222222-2222-2222-2222-222222222222', '198505152010012002', 'Siti Nurhaliza', 'Staff Keuangan', 'Keuangan'),
    ('33333333-3333-3333-3333-333333333333', '199002202015011003', 'Budi Santoso', 'Staff IT', 'IT')
ON CONFLICT (nip) DO NOTHING;

-- ============================================
-- SEED DATA: Initial users
-- Note: In production, use proper password hashing (bcrypt)
-- For demo purposes, we're using plain text (NOT RECOMMENDED)
-- ============================================
INSERT INTO users (username, password, role, name, employee_id) VALUES
    ('admin', 'admin123', 'admin', 'Kasubag Kepegawaian', NULL),
    ('pegawai', 'pegawai123', 'employee', 'Ahmad Budiman', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to do everything (for backend)
CREATE POLICY "Service role can do everything on employees"
    ON employees FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can do everything on users"
    ON users FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can do everything on submissions"
    ON submissions FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- VIEWS: Useful queries
-- ============================================

-- View: Submissions with employee details
CREATE OR REPLACE VIEW submissions_with_details AS
SELECT 
    s.*,
    e.name as employee_full_name,
    e.position,
    e.department as employee_department
FROM submissions s
LEFT JOIN employees e ON s.employee_id = e.id;

-- ============================================
-- FUNCTIONS: Business logic
-- ============================================

-- Function: Get monthly submission count
CREATE OR REPLACE FUNCTION get_monthly_submission_count(
    p_employee_id UUID,
    p_type VARCHAR DEFAULT NULL,
    p_month INTEGER DEFAULT NULL,
    p_year INTEGER DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    -- Determine date range
    IF p_month IS NOT NULL AND p_year IS NOT NULL THEN
        v_start_date := make_date(p_year, p_month, 1);
        v_end_date := (v_start_date + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    ELSE
        v_start_date := date_trunc('month', CURRENT_DATE)::DATE;
        v_end_date := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    END IF;

    -- Count submissions
    SELECT COUNT(*)
    INTO v_count
    FROM submissions
    WHERE employee_id = p_employee_id
        AND submitted_at >= v_start_date
        AND submitted_at <= v_end_date + INTERVAL '1 day'
        AND (p_type IS NULL OR type = p_type);

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Get monthly statistics for employee
CREATE OR REPLACE FUNCTION get_monthly_stats(
    p_employee_id UUID,
    p_month INTEGER DEFAULT NULL,
    p_year INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_total INTEGER;
    v_terlambat INTEGER;
    v_lupa_rekam INTEGER;
    v_tidak_rekam INTEGER;
    v_quota_used INTEGER;
    v_quota_limit INTEGER := 10;
BEGIN
    v_total := get_monthly_submission_count(p_employee_id, NULL, p_month, p_year);
    v_terlambat := get_monthly_submission_count(p_employee_id, 'terlambat-rekam', p_month, p_year);
    v_lupa_rekam := get_monthly_submission_count(p_employee_id, 'lupa-rekam', p_month, p_year);
    v_tidak_rekam := get_monthly_submission_count(p_employee_id, 'tidak-rekam', p_month, p_year);
    v_quota_used := v_terlambat + v_lupa_rekam;

    RETURN json_build_object(
        'total', v_total,
        'terlambat', v_terlambat,
        'lupaRekam', v_lupa_rekam,
        'tidakRekam', v_tidak_rekam,
        'quotaUsed', v_quota_used,
        'quotaLimit', v_quota_limit,
        'quotaRemaining', GREATEST(0, v_quota_limit - v_quota_used),
        'canSubmitQuota', v_quota_used < v_quota_limit
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS: Documentation
-- ============================================
COMMENT ON TABLE employees IS 'Tabel data pegawai';
COMMENT ON TABLE users IS 'Tabel user untuk authentication';
COMMENT ON TABLE submissions IS 'Tabel pengajuan izin kehadiran';
COMMENT ON COLUMN submissions.type IS 'Jenis izin: tidak-rekam, terlambat-rekam, lupa-rekam';
COMMENT ON COLUMN submissions.sub_type IS 'Sub jenis untuk lupa-rekam: datang atau pulang';
COMMENT ON COLUMN submissions.status IS 'Status pengajuan: pending, approved, rejected';

-- ============================================
-- COMPLETE
-- ============================================
-- Schema created successfully!
-- Next steps:
-- 1. Copy this SQL to Supabase SQL Editor
-- 2. Run the script
-- 3. Update .env with your Supabase credentials
-- 4. Run: npm install
-- 5. Run: npm run dev
