-- 038_sierra_leone_letters_and_cass_export.sql
-- Admission letter template configurations & MBSSE CASS export logs

-- 1. Admission Letter Templates Table
CREATE TABLE IF NOT EXISTS public.sl_admission_templates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  school_level        TEXT NOT NULL,               -- 'PRIMARY' | 'JSS' | 'SSS' | 'TVET'
  school_name         TEXT NOT NULL,
  mbsse_emis_code     TEXT,                        -- Official MBSSE School EMIS Registration Code
  school_motto        TEXT,
  school_address      TEXT,
  school_phone        TEXT,
  school_email        TEXT,
  principal_name      TEXT NOT NULL DEFAULT 'The Principal',
  academic_year       TEXT NOT NULL DEFAULT '2025/2026',
  reporting_date      DATE,
  acceptance_deadline DATE,
  fee_deposit_amount  NUMERIC(10,2) DEFAULT 0,
  required_docs       TEXT[] NOT NULL DEFAULT ARRAY[
                        'Original WAEC/MBSSE Result Slip',
                        'Certified Birth Certificate / Sworn Affidavit',
                        'Primary/JSS Leaving Testimonial',
                        'Medical Fitness Certificate',
                        '2 Passport Photographs'
                      ],
  digital_signature   TEXT,                        -- Base64 or URL to principal signature
  digital_stamp       TEXT,                        -- Base64 or URL to school stamp
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, school_level)
);

-- 2. MBSSE CASS Export Batches Audit Log
CREATE TABLE IF NOT EXISTS public.sl_cass_export_batches (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  school_level        TEXT NOT NULL,               -- 'PRIMARY' | 'JSS' | 'SSS'
  academic_year       TEXT NOT NULL,
  term                TEXT NOT NULL,               -- 'Term 1' | 'Term 2' | 'Term 3'
  exam_type           TEXT NOT NULL,               -- 'NPSE' | 'BECE' | 'WASSCE'
  candidate_count     INTEGER NOT NULL DEFAULT 0,
  verified_count      INTEGER NOT NULL DEFAULT 0,
  has_errors          BOOLEAN NOT NULL DEFAULT FALSE,
  exported_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  exported_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  export_filename     TEXT NOT NULL
);

-- RLS
ALTER TABLE public.sl_admission_templates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sl_cass_export_batches   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant read sl_admission_templates" ON public.sl_admission_templates;
CREATE POLICY "Tenant read sl_admission_templates" ON public.sl_admission_templates
  FOR SELECT USING (tenant_id IS NULL OR tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Tenant insert sl_admission_templates" ON public.sl_admission_templates;
CREATE POLICY "Tenant insert sl_admission_templates" ON public.sl_admission_templates
  FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Tenant update sl_admission_templates" ON public.sl_admission_templates;
CREATE POLICY "Tenant update sl_admission_templates" ON public.sl_admission_templates
  FOR UPDATE USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Tenant read sl_cass_export_batches" ON public.sl_cass_export_batches;
CREATE POLICY "Tenant read sl_cass_export_batches" ON public.sl_cass_export_batches
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Tenant insert sl_cass_export_batches" ON public.sl_cass_export_batches;
CREATE POLICY "Tenant insert sl_cass_export_batches" ON public.sl_cass_export_batches
  FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
