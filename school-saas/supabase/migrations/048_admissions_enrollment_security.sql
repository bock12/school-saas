-- ============================================================
-- Migration 048: Admissions Enrollment RPC Security Remediation
-- Phase: 3C Cohort 4
-- Task: TASK-0007
-- Supervisory Authority: ChatGPT (Chief Software Architect) / Human Project Owner
-- Implementation Engineer: Gemini / Antigravity
-- ============================================================

-- 1. Add missing schema uniqueness constraint prerequisite on students table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'applicant_id'
    ) THEN
        ALTER TABLE public.students 
        ADD COLUMN applicant_id UUID UNIQUE REFERENCES public.applicants(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_students_applicant_id ON public.students(applicant_id);

-- 2. Drop existing function signatures to reset all grants and parameter bindings
DROP FUNCTION IF EXISTS public.enroll_applicant(UUID, UUID);
DROP FUNCTION IF EXISTS public.enroll_applicant(UUID, UUID, UUID);

-- 3. Create hardened, concurrency-safe, idempotent enroll_applicant function
CREATE OR REPLACE FUNCTION public.enroll_applicant(
  p_applicant_id UUID,
  p_actor_id UUID DEFAULT NULL,
  p_admin_id UUID DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_actor_uuid UUID;
  v_verified_actor RECORD;
  v_applicant RECORD;
  v_student_id UUID;
  v_parent_id UUID;
  v_parent_first TEXT;
  v_parent_last TEXT;
  v_admission_number TEXT;
  v_gender gender_type;
BEGIN
  -- 1. Invocation Boundary Check: Must be invoked by service_role or superuser/postgres
  IF current_user NOT IN ('service_role', 'postgres') AND COALESCE(auth.role(), '') != 'service_role' THEN
    RAISE EXCEPTION 'Access Denied: enroll_applicant may only be invoked by authorized service_role';
  END IF;

  -- 2. Actor Identity Verification: Enacting human actor must be an active profile
  v_actor_uuid := COALESCE(p_actor_id, p_admin_id);

  IF v_actor_uuid IS NULL THEN
    RAISE EXCEPTION 'Audit Failure: Enacting administrator ID (p_actor_id) is required';
  END IF;

  SELECT id, tenant_id, role INTO v_verified_actor
  FROM public.profiles
  WHERE id = v_actor_uuid AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Audit Failure: Enacting actor % is not a valid active profile', v_actor_uuid;
  END IF;

  -- 3. Concurrency Lock: Lock applicant row exclusively to prevent race conditions
  SELECT * INTO v_applicant 
  FROM public.applicants 
  WHERE id = p_applicant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Applicant not found: %', p_applicant_id;
  END IF;

  -- 4. Tenant Membership & Reach Enforcement:
  -- - super_admin: platform-wide reach
  -- - org_admin: actor tenant matches applicant tenant OR applicant tenant is a subtenant of the org
  -- - school_admin: actor tenant must match applicant tenant exactly
  -- - other roles: not authorized to enroll
  IF v_verified_actor.role = 'super_admin' THEN
    NULL;
  ELSIF v_verified_actor.role = 'org_admin' THEN
    IF v_verified_actor.tenant_id != v_applicant.tenant_id AND NOT EXISTS (
      SELECT 1 FROM public.tenants
      WHERE id = v_applicant.tenant_id AND parent_id = v_verified_actor.tenant_id
    ) THEN
      RAISE EXCEPTION 'Cross-Tenant Violation: Organization admin % does not have authority over tenant %', v_actor_uuid, v_applicant.tenant_id;
    END IF;
  ELSIF v_verified_actor.role = 'school_admin' THEN
    IF v_verified_actor.tenant_id != v_applicant.tenant_id THEN
      RAISE EXCEPTION 'Cross-Tenant Violation: School admin % does not belong to tenant %', v_actor_uuid, v_applicant.tenant_id;
    END IF;
  ELSE
    RAISE EXCEPTION 'Unauthorized: Actor % with role % is not authorized to enroll applicants', v_actor_uuid, v_verified_actor.role;
  END IF;

  -- 5. Idempotency Check: Return existing student ID deterministically if already enrolled
  IF v_applicant.stage = 'Allocation' THEN
    SELECT id INTO v_student_id 
    FROM public.students 
    WHERE applicant_id = p_applicant_id;

    IF v_student_id IS NOT NULL THEN
      RETURN v_student_id;
    END IF;
  END IF;

  -- 6. Lifecycle Validation: Must be in 'Offer' stage with status = 'active' and docs_verified = true
  IF v_applicant.stage != 'Offer' OR v_applicant.status != 'active' OR v_applicant.docs_verified IS NOT TRUE THEN
    RAISE EXCEPTION 'Lifecycle Violation: Applicant must be active in Offer stage with verified docs. Stage: %, Status: %, Verified: %',
      v_applicant.stage, v_applicant.status, v_applicant.docs_verified;
  END IF;

  -- 7. Generate Deterministic Admission Number (STU- + 6 random hex)
  v_admission_number := 'STU-' || upper(substr(md5(random()::text), 1, 6));

  -- Cast gender safely
  BEGIN
    v_gender := v_applicant.gender::gender_type;
  EXCEPTION WHEN OTHERS THEN
    v_gender := NULL;
  END;

  -- 8. Insert Student Record with applicant_id unique link
  INSERT INTO public.students (
    tenant_id,
    applicant_id,
    admission_number,
    first_name,
    last_name,
    date_of_birth,
    gender,
    email,
    phone,
    address,
    guardian_name,
    guardian_phone,
    guardian_email,
    guardian_relationship,
    blood_group,
    avatar_url,
    is_active
  ) VALUES (
    v_applicant.tenant_id,
    p_applicant_id,
    v_admission_number,
    v_applicant.first_name,
    v_applicant.last_name,
    v_applicant.dob,
    v_gender,
    v_applicant.email,
    v_applicant.phone,
    v_applicant.address,
    v_applicant.parent_name,
    v_applicant.parent_phone,
    v_applicant.parent_email,
    v_applicant.parent_relation,
    v_applicant.blood_group,
    v_applicant.avatar_url,
    true
  ) RETURNING id INTO v_student_id;

  -- 9. Insert or Link Parent Record
  SELECT id INTO v_parent_id 
  FROM public.parents 
  WHERE tenant_id = v_applicant.tenant_id AND phone = v_applicant.parent_phone
  LIMIT 1;

  IF v_parent_id IS NULL THEN
    v_parent_first := split_part(v_applicant.parent_name, ' ', 1);
    v_parent_last := trim(substring(v_applicant.parent_name from length(v_parent_first) + 1));
    
    IF v_parent_last = '' THEN
      v_parent_last := 'Unknown';
    END IF;

    INSERT INTO public.parents (
      tenant_id,
      first_name,
      last_name,
      email,
      phone,
      address
    ) VALUES (
      v_applicant.tenant_id,
      v_parent_first,
      v_parent_last,
      v_applicant.parent_email,
      v_applicant.parent_phone,
      v_applicant.address
    ) RETURNING id INTO v_parent_id;
  END IF;

  -- 10. Insert Student-Parent Junction
  INSERT INTO public.student_parents (
    tenant_id,
    student_id,
    parent_id,
    relationship,
    is_primary,
    is_emergency_contact
  ) VALUES (
    v_applicant.tenant_id,
    v_student_id,
    v_parent_id,
    v_applicant.parent_relation,
    true,
    true
  );

  -- 11. Advance Applicant State Machine
  UPDATE public.applicants 
  SET 
    stage = 'Allocation',
    status = 'enrolled',
    docs_verified = true,
    updated_at = NOW()
  WHERE id = p_applicant_id;

  -- 12. Record Immutable Audit History with Human Actor Attribution
  INSERT INTO public.admission_history (
    tenant_id,
    applicant_id,
    from_stage,
    to_stage,
    comment,
    created_by
  ) VALUES (
    v_applicant.tenant_id,
    p_applicant_id,
    v_applicant.stage,
    'Allocation',
    'Student successfully enrolled into institutional student registry via canonical authorization.',
    v_actor_uuid
  );

  RETURN v_student_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Strict Permission Revocation & Grant Model
REVOKE ALL ON FUNCTION public.enroll_applicant(UUID, UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enroll_applicant(UUID, UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.enroll_applicant(UUID, UUID, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.enroll_applicant(UUID, UUID, UUID) TO service_role;
