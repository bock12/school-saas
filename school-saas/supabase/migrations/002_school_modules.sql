-- ============================================================
-- SCHOOL MODULES MIGRATION: Tenant-Scoped Tables
-- Run this AFTER 001_foundation.sql
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE fee_status AS ENUM ('pending', 'paid', 'partial', 'overdue', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'card', 'mobile_money', 'cheque', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- ACADEMIC STRUCTURE
-- ============================================================

-- Academic Years (e.g., 2025-2026)
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(tenant_id, name)
);

-- Terms / Semesters
CREATE TABLE IF NOT EXISTS public.terms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(academic_year_id, name)
);

-- Departments
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    head_teacher_id UUID,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(tenant_id, name)
);

-- Classes / Grade Levels
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    short_name TEXT,
    sort_order INTEGER DEFAULT 0,
    capacity INTEGER DEFAULT 40,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(tenant_id, name)
);

-- Sections within a Class
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    capacity INTEGER DEFAULT 40,
    class_teacher_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(class_id, name)
);

-- Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    is_elective BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(tenant_id, name)
);

-- ============================================================
-- PEOPLE
-- ============================================================

-- Students
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admission_number TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    gender gender_type,
    email TEXT,
    phone TEXT,
    address TEXT,
    guardian_name TEXT,
    guardian_phone TEXT,
    guardian_email TEXT,
    guardian_relationship TEXT,
    blood_group TEXT,
    medical_notes TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    admitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(tenant_id, admission_number)
);

-- Teachers
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    employee_id TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    gender gender_type,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    qualification TEXT,
    specialization TEXT,
    date_of_joining DATE,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(tenant_id, employee_id)
);

-- Add FK for departments.head_teacher_id
ALTER TABLE public.departments
    DROP CONSTRAINT IF EXISTS departments_head_teacher_id_fkey;
ALTER TABLE public.departments
    ADD CONSTRAINT departments_head_teacher_id_fkey
    FOREIGN KEY (head_teacher_id) REFERENCES public.teachers(id) ON DELETE SET NULL;

-- Add FK for sections.class_teacher_id
ALTER TABLE public.sections
    DROP CONSTRAINT IF EXISTS sections_class_teacher_id_fkey;
ALTER TABLE public.sections
    ADD CONSTRAINT sections_class_teacher_id_fkey
    FOREIGN KEY (class_teacher_id) REFERENCES public.teachers(id) ON DELETE SET NULL;

-- ============================================================
-- ASSIGNMENTS & ENROLLMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.class_enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    roll_number INTEGER,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(student_id, section_id, academic_year_id)
);

CREATE TABLE IF NOT EXISTS public.teacher_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(teacher_id, section_id, subject_id, academic_year_id)
);

-- ============================================================
-- ATTENDANCE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status attendance_status NOT NULL DEFAULT 'present',
    remarks TEXT,
    marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(student_id, date)
);

-- ============================================================
-- GRADES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.grades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    score NUMERIC(5,2),
    max_score NUMERIC(5,2) DEFAULT 100,
    grade_letter TEXT,
    remarks TEXT,
    graded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(student_id, subject_id, term_id)
);

-- ============================================================
-- FEES & PAYMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.fee_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    description TEXT,
    is_recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(tenant_id, name)
);

CREATE TABLE IF NOT EXISTS public.fee_invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
    invoice_number TEXT,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    status fee_status DEFAULT 'pending',
    due_date DATE,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(tenant_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS public.fee_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.fee_invoices(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    payment_method payment_method DEFAULT 'cash',
    reference TEXT,
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    received_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_academic_years_tenant ON public.academic_years(tenant_id);
CREATE INDEX IF NOT EXISTS idx_terms_tenant ON public.terms(tenant_id);
CREATE INDEX IF NOT EXISTS idx_terms_academic_year ON public.terms(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_departments_tenant ON public.departments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_classes_tenant ON public.classes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sections_tenant ON public.sections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sections_class ON public.sections(class_id);
CREATE INDEX IF NOT EXISTS idx_subjects_tenant ON public.subjects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_students_tenant ON public.students(tenant_id);
CREATE INDEX IF NOT EXISTS idx_students_active ON public.students(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_teachers_tenant ON public.teachers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_teachers_active ON public.teachers(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_tenant ON public.class_enrollments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student ON public.class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_section ON public.class_enrollments(section_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_tenant ON public.teacher_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_tenant ON public.attendance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_tenant ON public.grades(tenant_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_term ON public.grades(term_id);
CREATE INDEX IF NOT EXISTS idx_fee_invoices_tenant ON public.fee_invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fee_invoices_student ON public.fee_invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_invoice ON public.fee_payments(invoice_id);

-- ============================================================
-- TRIGGERS (updated_at)
-- ============================================================

DROP TRIGGER IF EXISTS set_updated_at_academic_years ON public.academic_years;
CREATE TRIGGER set_updated_at_academic_years BEFORE UPDATE ON public.academic_years FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_terms ON public.terms;
CREATE TRIGGER set_updated_at_terms BEFORE UPDATE ON public.terms FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_departments ON public.departments;
CREATE TRIGGER set_updated_at_departments BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_classes ON public.classes;
CREATE TRIGGER set_updated_at_classes BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_sections ON public.sections;
CREATE TRIGGER set_updated_at_sections BEFORE UPDATE ON public.sections FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_subjects ON public.subjects;
CREATE TRIGGER set_updated_at_subjects BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_students ON public.students;
CREATE TRIGGER set_updated_at_students BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_teachers ON public.teachers;
CREATE TRIGGER set_updated_at_teachers BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_attendance ON public.attendance;
CREATE TRIGGER set_updated_at_attendance BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_grades ON public.grades;
CREATE TRIGGER set_updated_at_grades BEFORE UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_fee_types ON public.fee_types;
CREATE TRIGGER set_updated_at_fee_types BEFORE UPDATE ON public.fee_types FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_fee_invoices ON public.fee_invoices;
CREATE TRIGGER set_updated_at_fee_invoices BEFORE UPDATE ON public.fee_invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- ACADEMIC YEARS
CREATE POLICY "Super admins manage academic_years" ON public.academic_years FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Tenant users view academic_years" ON public.academic_years FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "School admins manage academic_years" ON public.academic_years FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'school_admin')
);

-- TERMS
CREATE POLICY "Super admins manage terms" ON public.terms FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Tenant users view terms" ON public.terms FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "School admins manage terms" ON public.terms FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'school_admin')
);

-- DEPARTMENTS
CREATE POLICY "Super admins manage departments" ON public.departments FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Tenant users view departments" ON public.departments FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "School admins manage departments" ON public.departments FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'school_admin')
);

-- CLASSES
CREATE POLICY "Super admins manage classes" ON public.classes FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Tenant users view classes" ON public.classes FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "School admins manage classes" ON public.classes FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'school_admin')
);

-- SECTIONS
CREATE POLICY "Super admins manage sections" ON public.sections FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Tenant users view sections" ON public.sections FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "School admins manage sections" ON public.sections FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'school_admin')
);

-- SUBJECTS
CREATE POLICY "Super admins manage subjects" ON public.subjects FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Tenant users view subjects" ON public.subjects FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "School admins manage subjects" ON public.subjects FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'school_admin')
);

-- STUDENTS
CREATE POLICY "Super admins manage students" ON public.students FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Tenant users view students" ON public.students FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "School admins manage students" ON public.students FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('school_admin', 'teacher'))
);

-- TEACHERS
CREATE POLICY "Super admins manage teachers" ON public.teachers FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Tenant users view teachers" ON public.teachers FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "School admins manage teachers" ON public.teachers FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'school_admin')
);

-- CLASS ENROLLMENTS
CREATE POLICY "Super admins manage class_enrollments" ON public.class_enrollments FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Tenant users view class_enrollments" ON public.class_enrollments FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "School admins manage class_enrollments" ON public.class_enrollments FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('school_admin', 'teacher'))
);

-- TEACHER ASSIGNMENTS
CREATE POLICY "Super admins manage teacher_assignments" ON public.teacher_assignments FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Tenant users view teacher_assignments" ON public.teacher_assignments FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "School admins manage teacher_assignments" ON public.teacher_assignments FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'school_admin')
);

-- ATTENDANCE
CREATE POLICY "Super admins manage attendance" ON public.attendance FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Tenant users view attendance" ON public.attendance FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Teachers manage attendance" ON public.attendance FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('school_admin', 'teacher'))
);

-- GRADES
CREATE POLICY "Super admins manage grades" ON public.grades FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Tenant users view grades" ON public.grades FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Teachers manage grades" ON public.grades FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('school_admin', 'teacher'))
);

-- FEE TYPES
CREATE POLICY "Super admins manage fee_types" ON public.fee_types FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Tenant users view fee_types" ON public.fee_types FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "School admins manage fee_types" ON public.fee_types FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'school_admin')
);

-- FEE INVOICES
CREATE POLICY "Super admins manage fee_invoices" ON public.fee_invoices FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Tenant users view fee_invoices" ON public.fee_invoices FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "School admins manage fee_invoices" ON public.fee_invoices FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'school_admin')
);

-- FEE PAYMENTS
CREATE POLICY "Super admins manage fee_payments" ON public.fee_payments FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Tenant users view fee_payments" ON public.fee_payments FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "School admins manage fee_payments" ON public.fee_payments FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'school_admin')
);
