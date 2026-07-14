-- Migration: Add hierarchy support to the tenants table
-- Run this in the Supabase SQL Editor or via supabase db push

-- 1. Add hierarchy columns to tenants
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'school'
    CHECK (type IN ('organization','group','district','school','campus')),
  ADD COLUMN IF NOT EXISTS is_standalone_school BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'US East (N. Virginia)',
  ADD COLUMN IF NOT EXISTS school_type TEXT,
  ADD COLUMN IF NOT EXISTS users_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS students_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS storage_used NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- 2. Index for fast tree queries
CREATE INDEX IF NOT EXISTS idx_tenants_parent_id ON public.tenants(parent_id);
CREATE INDEX IF NOT EXISTS idx_tenants_type ON public.tenants(type);

-- 3. Update RLS: super admins can insert/update/delete any tenant node
-- (existing policy already covers this via is_super_admin check)

-- 4. Relax slug uniqueness for non-school/org nodes (groups, districts, campuses don't need a slug)
-- Strategy: make slug nullable, enforce NOT NULL only for schools and orgs at the app layer
ALTER TABLE public.tenants ALTER COLUMN slug DROP NOT NULL;

-- Add a partial unique index: slug must be unique only when it is not null
DROP INDEX IF EXISTS tenants_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_slug_unique ON public.tenants(slug) WHERE slug IS NOT NULL;
