-- ============================================
-- REGISTRATION SYSTEM UPDATE
-- Add registration and approval features
-- ============================================

-- Update users table to add status and registration fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active' 
    CHECK (status IN ('pending', 'active', 'rejected', 'suspended')),
ADD COLUMN IF NOT EXISTS registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Add email column if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email VARCHAR(100) UNIQUE;

-- Update existing users to have active status
UPDATE users SET status = 'active' WHERE status IS NULL;

-- Create registration_requests table
CREATE TABLE IF NOT EXISTS registration_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nip VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    department VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' 
           CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Review info
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    review_note TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for registration_requests
CREATE INDEX IF NOT EXISTS idx_registration_requests_status ON registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_registration_requests_nip ON registration_requests(nip);
CREATE INDEX IF NOT EXISTS idx_registration_requests_email ON registration_requests(email);
CREATE INDEX IF NOT EXISTS idx_registration_requests_created_at ON registration_requests(created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_registration_requests_updated_at
    BEFORE UPDATE ON registration_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;

-- Policy for service role
CREATE POLICY "Service role can do everything on registration_requests"
    ON registration_requests FOR ALL
    USING (true)
    WITH CHECK (true);

-- Function to check if NIP already exists
CREATE OR REPLACE FUNCTION check_nip_exists(p_nip VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM employees WHERE nip = p_nip
        UNION
        SELECT 1 FROM registration_requests WHERE nip = p_nip AND status = 'pending'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if email already exists
CREATE OR REPLACE FUNCTION check_email_exists(p_email VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users WHERE email = p_email
        UNION
        SELECT 1 FROM registration_requests WHERE email = p_email AND status = 'pending'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if username already exists
CREATE OR REPLACE FUNCTION check_username_exists(p_username VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users WHERE username = p_username
        UNION
        SELECT 1 FROM registration_requests WHERE username = p_username AND status = 'pending'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to approve registration
CREATE OR REPLACE FUNCTION approve_registration(
    p_request_id UUID,
    p_approved_by UUID,
    p_review_note TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_request registration_requests;
    v_employee_id UUID;
    v_user_id UUID;
BEGIN
    -- Get registration request
    SELECT * INTO v_request
    FROM registration_requests
    WHERE id = p_request_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Registration request not found or already processed'
        );
    END IF;
    
    -- Create employee record
    INSERT INTO employees (nip, name, position, department)
    VALUES (v_request.nip, v_request.name, v_request.position, v_request.department)
    RETURNING id INTO v_employee_id;
    
    -- Create user record
    INSERT INTO users (
        username, 
        email,
        password, 
        role, 
        name, 
        employee_id,
        status,
        approved_at,
        approved_by
    )
    VALUES (
        v_request.username,
        v_request.email,
        v_request.password_hash,
        'employee',
        v_request.name,
        v_employee_id,
        'active',
        NOW(),
        p_approved_by
    )
    RETURNING id INTO v_user_id;
    
    -- Update registration request
    UPDATE registration_requests
    SET 
        status = 'approved',
        reviewed_at = NOW(),
        reviewed_by = p_approved_by,
        review_note = p_review_note
    WHERE id = p_request_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Registration approved successfully',
        'user_id', v_user_id,
        'employee_id', v_employee_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to reject registration
CREATE OR REPLACE FUNCTION reject_registration(
    p_request_id UUID,
    p_rejected_by UUID,
    p_review_note TEXT
)
RETURNS JSON AS $$
BEGIN
    UPDATE registration_requests
    SET 
        status = 'rejected',
        reviewed_at = NOW(),
        reviewed_by = p_rejected_by,
        review_note = p_review_note
    WHERE id = p_request_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Registration request not found or already processed'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Registration rejected'
    );
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE registration_requests IS 'Tabel untuk menyimpan permintaan pendaftaran pegawai baru';
COMMENT ON COLUMN registration_requests.status IS 'Status: pending, approved, rejected';
COMMENT ON FUNCTION approve_registration IS 'Approve registration dan create employee + user';
COMMENT ON FUNCTION reject_registration IS 'Reject registration request';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Registration system schema updated successfully!';
END $$;
