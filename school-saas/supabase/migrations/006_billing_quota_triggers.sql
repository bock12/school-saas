-- Migration: Billing Control & Quota Triggers
-- Enforces limits on students and teachers, and maintains current counts on tenants table.

-- 1. Maintain Student Count
CREATE OR REPLACE FUNCTION public.maintain_student_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.tenants
        SET students_count = COALESCE(students_count, 0) + 1
        WHERE id = NEW.tenant_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.tenants
        SET students_count = GREATEST(COALESCE(students_count, 0) - 1, 0)
        WHERE id = OLD.tenant_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.tenant_id != NEW.tenant_id THEN
            UPDATE public.tenants SET students_count = GREATEST(COALESCE(students_count, 0) - 1, 0) WHERE id = OLD.tenant_id;
            UPDATE public.tenants SET students_count = COALESCE(students_count, 0) + 1 WHERE id = NEW.tenant_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_maintain_student_count ON public.students;
CREATE TRIGGER trigger_maintain_student_count
AFTER INSERT OR UPDATE OR DELETE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.maintain_student_count();


-- 2. Maintain Teacher Count
CREATE OR REPLACE FUNCTION public.maintain_teacher_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.tenants
        SET teacher_count = COALESCE(teacher_count, 0) + 1
        WHERE id = NEW.tenant_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.tenants
        SET teacher_count = GREATEST(COALESCE(teacher_count, 0) - 1, 0)
        WHERE id = OLD.tenant_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.tenant_id != NEW.tenant_id THEN
            UPDATE public.tenants SET teacher_count = GREATEST(COALESCE(teacher_count, 0) - 1, 0) WHERE id = OLD.tenant_id;
            UPDATE public.tenants SET teacher_count = COALESCE(teacher_count, 0) + 1 WHERE id = NEW.tenant_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_maintain_teacher_count ON public.teachers;
CREATE TRIGGER trigger_maintain_teacher_count
AFTER INSERT OR UPDATE OR DELETE ON public.teachers
FOR EACH ROW EXECUTE FUNCTION public.maintain_teacher_count();


-- 3. Enforce Student Quota
CREATE OR REPLACE FUNCTION public.enforce_student_quota()
RETURNS TRIGGER AS $$
DECLARE
    v_current_count INTEGER;
    v_override_max INTEGER;
    v_plan_max INTEGER;
    v_effective_max INTEGER;
BEGIN
    -- Get current counts and limits
    SELECT 
        COALESCE(t.students_count, 0), 
        t.max_students, 
        p.max_students
    INTO 
        v_current_count, 
        v_override_max, 
        v_plan_max
    FROM public.tenants t
    LEFT JOIN public.subscription_plans p ON t.plan_id = p.id
    WHERE t.id = NEW.tenant_id;

    -- Calculate effective maximum (Override takes precedence, then plan, fallback to 100)
    v_effective_max := COALESCE(v_override_max, v_plan_max, 100);

    IF v_current_count >= v_effective_max THEN
        RAISE EXCEPTION 'Quota exceeded: Max students limit reached for this tenant.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_enforce_student_quota ON public.students;
CREATE TRIGGER trigger_enforce_student_quota
BEFORE INSERT ON public.students
FOR EACH ROW EXECUTE FUNCTION public.enforce_student_quota();


-- 4. Enforce Teacher Quota
CREATE OR REPLACE FUNCTION public.enforce_teacher_quota()
RETURNS TRIGGER AS $$
DECLARE
    v_current_count INTEGER;
    v_override_max INTEGER;
    v_plan_max INTEGER;
    v_effective_max INTEGER;
BEGIN
    -- Get current counts and limits
    SELECT 
        COALESCE(t.teacher_count, 0), 
        t.max_teachers, 
        p.max_teachers
    INTO 
        v_current_count, 
        v_override_max, 
        v_plan_max
    FROM public.tenants t
    LEFT JOIN public.subscription_plans p ON t.plan_id = p.id
    WHERE t.id = NEW.tenant_id;

    -- Calculate effective maximum (Override takes precedence, then plan, fallback to 20)
    v_effective_max := COALESCE(v_override_max, v_plan_max, 20);

    IF v_current_count >= v_effective_max THEN
        RAISE EXCEPTION 'Quota exceeded: Max teachers limit reached for this tenant.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_enforce_teacher_quota ON public.teachers;
CREATE TRIGGER trigger_enforce_teacher_quota
BEFORE INSERT ON public.teachers
FOR EACH ROW EXECUTE FUNCTION public.enforce_teacher_quota();
