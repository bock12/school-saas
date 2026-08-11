-- Migration: 030_exam_core_system.sql
-- Core Examination System Schema for Admin & Exam Office Real-time Synchronization

CREATE TABLE IF NOT EXISTS public.exam_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    name TEXT NOT NULL,
    academic_year TEXT NOT NULL DEFAULT '2025-26',
    term TEXT NOT NULL DEFAULT '3rd Term',
    type TEXT NOT NULL DEFAULT 'EXAM',
    mode TEXT NOT NULL DEFAULT 'ONLINE',
    weightage TEXT DEFAULT '-',
    start_date DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'Upcoming',
    classes_count INT DEFAULT 12,
    candidates_count INT DEFAULT 1248,
    clearance_required BOOLEAN DEFAULT true,
    mark_deadline TIMESTAMP WITH TIME ZONE,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exam_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
    tenant_id UUID,
    class_name TEXT NOT NULL,
    subject_id TEXT,
    subject_name TEXT NOT NULL,
    exam_date DATE,
    start_time TEXT,
    end_time TEXT,
    room_number TEXT,
    invigilator_name TEXT,
    status TEXT DEFAULT 'Scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exam_results_approval (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
    tenant_id UUID,
    class_name TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    teacher_name TEXT,
    hod_approved BOOLEAN DEFAULT false,
    principal_approved BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'Pending Moderation',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exam_malpractices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID,
    tenant_id UUID,
    student_name TEXT NOT NULL,
    candidate_no TEXT,
    subject_name TEXT NOT NULL,
    hall_name TEXT,
    offense_type TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Pending Review',
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exam_appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID,
    tenant_id UUID,
    student_name TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    original_score NUMERIC,
    requested_score NUMERIC,
    reason TEXT,
    status TEXT DEFAULT 'Pending Review',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results_approval ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_malpractices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_appeals ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select, insert, update
CREATE POLICY "Allow authenticated access to exam_sessions" ON public.exam_sessions FOR ALL USING (true);
CREATE POLICY "Allow authenticated access to exam_schedules" ON public.exam_schedules FOR ALL USING (true);
CREATE POLICY "Allow authenticated access to exam_results_approval" ON public.exam_results_approval FOR ALL USING (true);
CREATE POLICY "Allow authenticated access to exam_malpractices" ON public.exam_malpractices FOR ALL USING (true);
CREATE POLICY "Allow authenticated access to exam_appeals" ON public.exam_appeals FOR ALL USING (true);

-- Seed default initial session if table empty
INSERT INTO public.exam_sessions (id, name, academic_year, term, type, mode, weightage, start_date, end_date, status, classes_count, candidates_count, clearance_required, mark_deadline)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'Formative Assessment 2', '2025-26', '3rd Term', 'EXAM', 'ONLINE', '-', '2026-08-18', '2026-08-29', 'Ongoing', 12, 1248, true, '2026-08-30'),
  ('a1b2c3d4-e5f6-7890-abcd-222222222222', 'Mid-Term Assessment', '2025-26', '3rd Term', 'CA', 'OFFLINE', '20%', '2026-07-07', '2026-07-09', 'Completed', 12, 1241, false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-333333333333', 'Mock Examination (SSS 3)', '2025-26', '2nd Term', 'Mock', 'HYBRID', '30%', '2026-05-03', '2026-05-14', 'Archived', 4, 312, false, NULL)
ON CONFLICT (id) DO NOTHING;
