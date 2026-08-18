-- 039_staff_attendance_system.sql
-- Dedicated Staff Attendance, Biometric, RFID, QR Scanner and Check-In / Check-Out System

CREATE TABLE IF NOT EXISTS public.staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    staff_id TEXT NOT NULL,
    staff_name TEXT NOT NULL,
    department TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'on_leave', 'half_day')),
    punctuality TEXT NOT NULL DEFAULT 'on_time' CHECK (punctuality IN ('early', 'on_time', 'late', 'excused')),
    late_minutes INTEGER DEFAULT 0,
    method TEXT NOT NULL DEFAULT 'manual' CHECK (method IN ('biometric', 'rfid', 'qr_scan', 'geofence', 'manual')),
    device_node TEXT DEFAULT 'Web Kiosk',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT staff_attendance_tenant_staff_date_unique UNIQUE (tenant_id, staff_id, date)
);

CREATE INDEX IF NOT EXISTS idx_staff_attendance_tenant_date ON public.staff_attendance(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_staff ON public.staff_attendance(tenant_id, staff_id);

ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage staff attendance" ON public.staff_attendance
    FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "Tenant users manage staff attendance" ON public.staff_attendance
    FOR ALL TO authenticated USING (tenant_id = public.get_user_tenant_id());
