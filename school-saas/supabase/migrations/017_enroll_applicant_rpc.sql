-- ============================================================
-- Migration 017: Enroll Applicant RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.enroll_applicant(
  p_applicant_id UUID,
  p_admin_id UUID
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_applicant RECORD;
  v_student_id UUID;
  v_parent_id UUID;
  v_parent_first TEXT;
  v_parent_last TEXT;
  v_admission_number TEXT;
  v_gender gender_type;
BEGIN
  -- 1. Fetch Applicant
  SELECT * INTO v_applicant 
  FROM public.applicants 
  WHERE id = p_applicant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Applicant not found';
  END IF;

  IF v_applicant.stage = 'Allocation' THEN
    RAISE EXCEPTION 'Applicant is already allocated';
  END IF;

  -- 2. Generate Admission Number (STU- + 6 random hex chars)
  v_admission_number := 'STU-' || upper(substr(md5(random()::text), 1, 6));

  -- Cast gender safely
  BEGIN
    v_gender := v_applicant.gender::gender_type;
  EXCEPTION WHEN OTHERS THEN
    v_gender := NULL;
  END;

  -- 3. Insert Student
  INSERT INTO public.students (
    tenant_id,
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

  -- 4. Check if parent exists by phone
  SELECT id INTO v_parent_id 
  FROM public.parents 
  WHERE tenant_id = v_applicant.tenant_id AND phone = v_applicant.parent_phone
  LIMIT 1;

  -- If not found, insert new parent
  IF v_parent_id IS NULL THEN
    -- Split parent name into first and last
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

  -- 5. Link Parent to Student
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

  -- 6. Update Applicant State
  UPDATE public.applicants 
  SET 
    stage = 'Allocation',
    docs_verified = true,
    updated_at = NOW()
  WHERE id = p_applicant_id;

  -- 7. Insert Audit Log
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
    'Student automatically enrolled and allocated to registry.',
    p_admin_id
  );

  RETURN v_student_id;
END;
$$ LANGUAGE plpgsql;
