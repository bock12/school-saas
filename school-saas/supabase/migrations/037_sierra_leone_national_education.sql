-- 037_sierra_leone_national_education.sql
-- Adds full Sierra Leone National Education System (MBSSE / MHERST / WAEC / NCTVA) support

-- 1. WAEC 9-Point Grade Scale (Official)
CREATE TABLE IF NOT EXISTS public.sl_waec_grade_scale (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade           TEXT NOT NULL UNIQUE,
  min_score       NUMERIC(5,2) NOT NULL,
  max_score       NUMERIC(5,2) NOT NULL,
  grade_points    NUMERIC(3,1) NOT NULL,
  credit_value    INTEGER NOT NULL DEFAULT 0,
  remark          TEXT NOT NULL,
  sort_order      INTEGER NOT NULL
);

INSERT INTO public.sl_waec_grade_scale
  (grade, min_score, max_score, grade_points, credit_value, remark, sort_order)
VALUES
  ('A1', 75, 100, 4.0, 1, 'Excellent',  1),
  ('B2', 70,  74, 3.5, 1, 'Very Good',  2),
  ('B3', 65,  69, 3.0, 1, 'Good',       3),
  ('C4', 60,  64, 2.5, 1, 'Credit',     4),
  ('C5', 55,  59, 2.0, 1, 'Credit',     5),
  ('C6', 50,  54, 1.5, 1, 'Credit',     6),
  ('D7', 45,  49, 1.0, 0, 'Pass',       7),
  ('E8', 40,  44, 0.5, 0, 'Pass',       8),
  ('F9',  0,  39, 0.0, 0, 'Fail',       9)
ON CONFLICT (grade) DO NOTHING;

-- 2. Sierra Leone School Level Configuration
CREATE TABLE IF NOT EXISTS public.sl_school_levels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,
  label           TEXT NOT NULL,
  short_label     TEXT NOT NULL,
  entry_age_min   INTEGER,
  entry_age_max   INTEGER,
  classes         TEXT[] NOT NULL DEFAULT '{}',
  streams         TEXT[] NOT NULL DEFAULT '{}',
  terminal_exam   TEXT,
  governing_body  TEXT NOT NULL DEFAULT 'MBSSE',
  sort_order      INTEGER NOT NULL
);

INSERT INTO public.sl_school_levels
  (code, label, short_label, entry_age_min, entry_age_max, classes, streams, terminal_exam, governing_body, sort_order)
VALUES
  ('KG','Kindergarten / Nursery','KG',3,5,
   ARRAY['KG 1','KG 2','KG 3'],ARRAY[]::TEXT[],NULL,'MBSSE',1),
  ('PRIMARY','Primary School','Primary',6,11,
   ARRAY['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6'],
   ARRAY[]::TEXT[],'NPSE','MBSSE',2),
  ('JSS','Junior Secondary School','JSS',12,14,
   ARRAY['JSS 1','JSS 2','JSS 3'],ARRAY[]::TEXT[],'BECE','MBSSE',3),
  ('SSS','Senior Secondary School','SSS',15,17,
   ARRAY['SSS 1','SSS 2','SSS 3'],
   ARRAY['Science','Arts','Commercial','Technical'],'WASSCE','MBSSE',4),
  ('TVET','Technical and Vocational','TVET',14,25,
   ARRAY['Level 1','Level 2','Level 3','National Diploma','HND'],
   ARRAY['Electrical','Automotive','Plumbing','IT','Catering','Fashion'],'NCTVA','NCTVA',5),
  ('TERTIARY','University / Higher Ed','Uni',17,99,
   ARRAY['Year 1','Year 2','Year 3','Year 4'],
   ARRAY['Sciences','Engineering','Arts','Business','Law','Medicine'],
   NULL,'MHERST',6)
ON CONFLICT (code) DO NOTHING;

-- 3. National Exam Registry
CREATE TABLE IF NOT EXISTS public.sl_national_exams (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,
  full_name       TEXT NOT NULL,
  school_level    TEXT NOT NULL REFERENCES public.sl_school_levels(code) ON DELETE CASCADE,
  administered_by TEXT NOT NULL DEFAULT 'WAEC',
  sitting_class   TEXT NOT NULL,
  core_subjects   TEXT[] NOT NULL DEFAULT '{}',
  min_credits_required INTEGER DEFAULT 5,
  description     TEXT
);

INSERT INTO public.sl_national_exams
  (code,full_name,school_level,administered_by,sitting_class,core_subjects,min_credits_required,description)
VALUES
  ('NPSE','National Primary School Examination','PRIMARY','WAEC','Class 6',
   ARRAY['Mathematics','English Language','Quantitative Aptitude','Verbal Aptitude','General Paper'],
   NULL,'Terminal exam for primary leavers. Aggregate determines JSS placement.'),
  ('BECE','Basic Education Certificate Examination','JSS','WAEC','JSS 3',
   ARRAY['Mathematics','English Language','Integrated Science','Social Studies'],
   NULL,'Determines SSS stream placement.'),
  ('WASSCE','West African Senior School Certificate Examination','SSS','WAEC','SSS 3',
   ARRAY['English Language','Mathematics'],5,
   'Minimum 5 credits (A1-C6) in no more than 2 sittings for university entry.'),
  ('NCTVA','National Council for Technical Vocational and Other Academic Awards','TVET','NCTVA','Level 3',
   ARRAY['Core Trade Theory','Core Trade Practical','Communication Skills','Mathematics'],
   NULL,'Vocational certification across Levels 1-3, National Diploma, and HND.')
ON CONFLICT (code) DO NOTHING;

-- 4. MBSSE CASS Configuration (30/70 system)
CREATE TABLE IF NOT EXISTS public.sl_cass_config (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  school_level          TEXT NOT NULL,
  ca_weight_percent     INTEGER NOT NULL DEFAULT 30,
  exam_weight_percent   INTEGER NOT NULL DEFAULT 70,
  ca_components         JSONB NOT NULL DEFAULT '[{"name":"CA 1","weight":10},{"name":"CA 2","weight":10},{"name":"CA 3","weight":10}]',
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, school_level)
);

INSERT INTO public.sl_cass_config (tenant_id,school_level,ca_weight_percent,exam_weight_percent,ca_components)
VALUES
  (NULL,'PRIMARY',30,70,'[{"name":"CA 1","weight":10},{"name":"CA 2","weight":10},{"name":"CA 3","weight":10}]'),
  (NULL,'JSS',30,70,'[{"name":"CA 1","weight":10},{"name":"CA 2","weight":10},{"name":"CA 3","weight":10}]'),
  (NULL,'SSS',30,70,'[{"name":"CA 1","weight":10},{"name":"CA 2","weight":10},{"name":"CA 3","weight":10}]')
ON CONFLICT (tenant_id, school_level) DO NOTHING;

-- 5. Enhance applicants table with SL-specific fields
ALTER TABLE public.applicants
  ADD COLUMN IF NOT EXISTS school_level          TEXT,
  ADD COLUMN IF NOT EXISTS target_stream         TEXT,
  ADD COLUMN IF NOT EXISTS national_index_no     TEXT,
  ADD COLUMN IF NOT EXISTS npse_aggregate        NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS bece_aggregate        NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS bece_subjects         JSONB,
  ADD COLUMN IF NOT EXISTS wassce_credits        INTEGER,
  ADD COLUMN IF NOT EXISTS wassce_subjects       JSONB,
  ADD COLUMN IF NOT EXISTS stream_auto_placed    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS stream_placed_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stream_placed_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS admission_letter_sent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS admission_letter_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_applicants_stream ON public.applicants(tenant_id, school_level, target_stream);
CREATE INDEX IF NOT EXISTS idx_applicants_national_index ON public.applicants(national_index_no) WHERE national_index_no IS NOT NULL;

-- 6. SSS Stream Allocation Rules
CREATE TABLE IF NOT EXISTS public.sl_stream_rules (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream                TEXT NOT NULL UNIQUE,
  required_subjects     TEXT[] NOT NULL DEFAULT '{}',
  min_bece_aggregate    NUMERIC(6,2),
  description           TEXT
);

INSERT INTO public.sl_stream_rules (stream,required_subjects,description)
VALUES
  ('Science',ARRAY['Mathematics','Integrated Science'],
   'Credit (A1-C6) in BECE Mathematics and Integrated Science required for Science Stream.'),
  ('Arts',ARRAY['English Language','Social Studies'],
   'Credit (A1-C6) in BECE English Language and Social Studies required for Arts Stream.'),
  ('Commercial',ARRAY['Mathematics','English Language'],
   'Credit (A1-C6) in BECE Mathematics and English Language required for Commercial Stream.'),
  ('Technical',ARRAY['Mathematics'],
   'Minimum pass (D7+) in BECE Mathematics required for Technical/Vocational Stream.')
ON CONFLICT (stream) DO NOTHING;

-- RLS
ALTER TABLE public.sl_waec_grade_scale ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sl_school_levels    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sl_national_exams   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sl_cass_config      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sl_stream_rules     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read sl_waec_grade_scale" ON public.sl_waec_grade_scale FOR SELECT USING (TRUE);
CREATE POLICY "Public read sl_school_levels"    ON public.sl_school_levels    FOR SELECT USING (TRUE);
CREATE POLICY "Public read sl_national_exams"   ON public.sl_national_exams   FOR SELECT USING (TRUE);
CREATE POLICY "Public read sl_stream_rules"     ON public.sl_stream_rules     FOR SELECT USING (TRUE);

CREATE POLICY "Tenant read sl_cass_config" ON public.sl_cass_config
  FOR SELECT USING (tenant_id IS NULL OR tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant insert sl_cass_config" ON public.sl_cass_config
  FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant update sl_cass_config" ON public.sl_cass_config
  FOR UPDATE USING (tenant_id = public.get_user_tenant_id());
