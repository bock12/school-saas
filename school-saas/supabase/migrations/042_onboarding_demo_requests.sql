-- Migration 042: Institutional Onboarding & Demonstration Requests
CREATE TABLE IF NOT EXISTS demo_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    institution_type VARCHAR(100) NOT NULL DEFAULT 'school',
    phone VARCHAR(100),
    region VARCHAR(100),
    estimated_students INTEGER,
    requirements TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'contacted', 'scheduled', 'provisioned', 'archived'
    scheduled_at TIMESTAMPTZ,
    notes TEXT,
    provisioned_tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests(status);
CREATE INDEX IF NOT EXISTS idx_demo_requests_email ON demo_requests(email);
CREATE INDEX IF NOT EXISTS idx_demo_requests_created_at ON demo_requests(created_at DESC);

-- Enable RLS
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can submit demo requests" ON demo_requests;
DROP POLICY IF EXISTS "Super admins can manage demo requests" ON demo_requests;

-- Allow public insertion (for the landing page form)
CREATE POLICY "Public can submit demo requests" 
ON demo_requests 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow super admins full access
CREATE POLICY "Super admins can manage demo requests" 
ON demo_requests 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'super_admin'
    )
);
