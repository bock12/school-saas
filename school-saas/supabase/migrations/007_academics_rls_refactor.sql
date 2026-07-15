-- ============================================================
-- Migration 007: Refactor Academics RLS & Fix Profiles
-- ============================================================

-- ============================================================
-- 1. Create is_teacher helper
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'teacher'
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. Add INSERT / UPDATE capabilities for Profiles for School Admins
-- ============================================================

-- Allow school admins to INSERT profiles into their own tenant
CREATE POLICY "School admins can insert tenant profiles"
    ON public.profiles FOR INSERT TO authenticated
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND public.is_school_admin()
    );

-- Allow school admins to UPDATE profiles in their own tenant
CREATE POLICY "School admins can update tenant profiles"
    ON public.profiles FOR UPDATE TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND public.is_school_admin()
    );

-- ============================================================
-- 3. Refactor Academics Module Policies
-- ============================================================

-- ACADEMIC YEARS
DROP POLICY IF EXISTS "School admins manage academic_years" ON public.academic_years;
CREATE POLICY "School admins manage academic_years" ON public.academic_years FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND public.is_school_admin()
);

-- TERMS
DROP POLICY IF EXISTS "School admins manage terms" ON public.terms;
CREATE POLICY "School admins manage terms" ON public.terms FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND public.is_school_admin()
);

-- DEPARTMENTS
DROP POLICY IF EXISTS "School admins manage departments" ON public.departments;
CREATE POLICY "School admins manage departments" ON public.departments FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND public.is_school_admin()
);

-- CLASSES
DROP POLICY IF EXISTS "School admins manage classes" ON public.classes;
CREATE POLICY "School admins manage classes" ON public.classes FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND public.is_school_admin()
);

-- SECTIONS
DROP POLICY IF EXISTS "School admins manage sections" ON public.sections;
CREATE POLICY "School admins manage sections" ON public.sections FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND public.is_school_admin()
);

-- SUBJECTS
DROP POLICY IF EXISTS "School admins manage subjects" ON public.subjects;
CREATE POLICY "School admins manage subjects" ON public.subjects FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND public.is_school_admin()
);

-- STUDENTS
DROP POLICY IF EXISTS "School admins manage students" ON public.students;
CREATE POLICY "School admins manage students" ON public.students FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND (public.is_school_admin() OR public.is_teacher())
);

-- TEACHERS
DROP POLICY IF EXISTS "School admins manage teachers" ON public.teachers;
CREATE POLICY "School admins manage teachers" ON public.teachers FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND public.is_school_admin()
);

-- CLASS ENROLLMENTS
DROP POLICY IF EXISTS "School admins manage class_enrollments" ON public.class_enrollments;
CREATE POLICY "School admins manage class_enrollments" ON public.class_enrollments FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND (public.is_school_admin() OR public.is_teacher())
);

-- TEACHER ASSIGNMENTS
DROP POLICY IF EXISTS "School admins manage teacher_assignments" ON public.teacher_assignments;
CREATE POLICY "School admins manage teacher_assignments" ON public.teacher_assignments FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND public.is_school_admin()
);

-- ATTENDANCE
DROP POLICY IF EXISTS "Teachers manage attendance" ON public.attendance;
CREATE POLICY "Teachers manage attendance" ON public.attendance FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND (public.is_school_admin() OR public.is_teacher())
);

-- GRADES
DROP POLICY IF EXISTS "Teachers manage grades" ON public.grades;
CREATE POLICY "Teachers manage grades" ON public.grades FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND (public.is_school_admin() OR public.is_teacher())
);

-- FEE TYPES
DROP POLICY IF EXISTS "School admins manage fee_types" ON public.fee_types;
CREATE POLICY "School admins manage fee_types" ON public.fee_types FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND public.is_school_admin()
);

-- FEE INVOICES
DROP POLICY IF EXISTS "School admins manage fee_invoices" ON public.fee_invoices;
CREATE POLICY "School admins manage fee_invoices" ON public.fee_invoices FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND public.is_school_admin()
);

-- FEE PAYMENTS
DROP POLICY IF EXISTS "School admins manage fee_payments" ON public.fee_payments;
CREATE POLICY "School admins manage fee_payments" ON public.fee_payments FOR ALL TO authenticated USING (
    tenant_id = public.get_user_tenant_id() AND public.is_school_admin()
);
