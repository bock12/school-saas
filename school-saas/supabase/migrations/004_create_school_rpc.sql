CREATE OR REPLACE FUNCTION public.create_school_with_admin(
  school_name TEXT,
  school_slug TEXT,
  school_contact_email TEXT,
  school_country TEXT,
  school_region TEXT,
  plan_uuid UUID,
  admin_name TEXT,
  admin_email TEXT,
  admin_password TEXT
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  new_school_id UUID;
  new_user_id UUID;
BEGIN
  -- 1. Insert school tenant
  INSERT INTO public.tenants (
    name,
    slug,
    type,
    status,
    plan_id,
    contact_email,
    country,
    region,
    is_standalone_school
  ) VALUES (
    school_name,
    school_slug,
    'school',
    'trial',
    plan_uuid,
    school_contact_email,
    school_country,
    school_region,
    true
  )
  RETURNING id INTO new_school_id;

  -- 2. Insert admin auth user
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at,
    is_anonymous
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', admin_name),
    'authenticated',
    'authenticated',
    NOW(),
    NOW(),
    false
  )
  RETURNING id INTO new_user_id;

  -- 3. Insert admin profile
  INSERT INTO public.profiles (
    id,
    tenant_id,
    full_name,
    email,
    role,
    is_active
  ) VALUES (
    new_user_id,
    new_school_id,
    admin_name,
    admin_email,
    'school_admin',
    true
  );

  RETURN new_school_id;
END;
$$ LANGUAGE plpgsql;
