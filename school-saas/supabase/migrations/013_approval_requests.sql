-- Migration 013: Approval Requests table
-- Tracks all approval workflow requests within a tenant/school

CREATE TABLE IF NOT EXISTS public.approval_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  type          TEXT NOT NULL, -- 'admission', 'leave', 'grade_change', 'purchase', 'fee_waiver', 'custom'
  priority      TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status        TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
  requester_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  requester_name TEXT, -- cached name for display even if profile is deleted
  assignee_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  current_stage TEXT,
  notes         TEXT,
  due_at        TIMESTAMPTZ,
  resolved_at   TIMESTAMPTZ,
  resolved_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

-- Org admins can see all requests in their org and its child schools
CREATE POLICY "org_admins_see_all_requests" ON public.approval_requests
  FOR ALL
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE id = tenant_id
      UNION
      SELECT t.id FROM public.tenants t WHERE t.parent_id = (
        SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- School admins/teachers can see requests in their own school
CREATE POLICY "school_members_see_own_requests" ON public.approval_requests
  FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_approval_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER approval_requests_updated_at
  BEFORE UPDATE ON public.approval_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_approval_updated_at();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_approval_requests_tenant_id ON public.approval_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON public.approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requester_id ON public.approval_requests(requester_id);
