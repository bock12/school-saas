-- 025_tenant_bursary_settings.sql
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS bursary_settings JSONB;
