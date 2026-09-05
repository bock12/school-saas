-- ============================================================
-- Migration 044: Server-Authoritative User Invitations System
-- Implements explicit, secure invitation tracking for staff/admin
-- onboarding, eliminating unverified metadata and email-based trust.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  full_name TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID,
  token TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked'))
);

-- Index for fast lookup by normalized email and active status
CREATE INDEX IF NOT EXISTS idx_user_invitations_email_status 
  ON public.user_invitations(lower(email), status);

-- Index for tenant-scoped querying
CREATE INDEX IF NOT EXISTS idx_user_invitations_tenant 
  ON public.user_invitations(tenant_id);

-- Enforce at most one pending invitation per email per tenant
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_invitations_pending 
  ON public.user_invitations(lower(email), tenant_id) 
  WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role full access on user_invitations"
  ON public.user_invitations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Tenant admins can view invitations belonging to their tenant
CREATE POLICY "Admins can view tenant invitations"
  ON public.user_invitations
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'org_admin', 'school_admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
