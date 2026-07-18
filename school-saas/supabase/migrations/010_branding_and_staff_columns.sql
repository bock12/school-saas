-- ============================================================
-- Migration 010: Branding & Staff Columns
-- ============================================================

-- 0. Extend subscription_plans with staff and student limits
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS max_staff    INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS max_students INTEGER NOT NULL DEFAULT 100;

-- 1. Add branding / domain columns to tenants
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS favicon_url        TEXT,
  ADD COLUMN IF NOT EXISTS secondary_color    TEXT,
  ADD COLUMN IF NOT EXISTS custom_font        TEXT DEFAULT 'Inter',
  ADD COLUMN IF NOT EXISTS custom_domain      TEXT,
  ADD COLUMN IF NOT EXISTS domain_verified    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_sender_name  TEXT,
  ADD COLUMN IF NOT EXISTS email_reply_to     TEXT,
  ADD COLUMN IF NOT EXISTS hide_platform_branding BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS login_bg_url       TEXT;

-- 2. Add staff management columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS department           TEXT,
  ADD COLUMN IF NOT EXISTS office               TEXT,
  ADD COLUMN IF NOT EXISTS is_pending_approval  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone                TEXT,
  ADD COLUMN IF NOT EXISTS job_title            TEXT,
  ADD COLUMN IF NOT EXISTS staff_id             TEXT;

-- 3. Add org-level general settings table
CREATE TABLE IF NOT EXISTS public.org_settings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  -- General
  contact_email TEXT,
  contact_phone TEXT,
  address       TEXT,
  timezone      TEXT NOT NULL DEFAULT 'Africa/Lagos',
  language      TEXT NOT NULL DEFAULT 'en',
  -- Security
  min_password_length  INTEGER NOT NULL DEFAULT 8,
  password_expiry_days INTEGER NOT NULL DEFAULT 90,
  lockout_attempts     INTEGER NOT NULL DEFAULT 5,
  session_timeout_mins INTEGER NOT NULL DEFAULT 30,
  require_mfa          BOOLEAN NOT NULL DEFAULT false,
  staff_approval_required BOOLEAN NOT NULL DEFAULT false,
  -- Timestamps
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id)
);

-- RLS for org_settings
ALTER TABLE public.org_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_settings_read" ON public.org_settings;
CREATE POLICY "org_settings_read" ON public.org_settings
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE tenant_id = org_settings.tenant_id
        AND role IN ('org_admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "org_settings_write" ON public.org_settings;
CREATE POLICY "org_settings_write" ON public.org_settings
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE tenant_id = org_settings.tenant_id
        AND role IN ('org_admin', 'super_admin')
    )
  );

-- Notify postgrest to reload
NOTIFY pgrst, 'reload schema';
