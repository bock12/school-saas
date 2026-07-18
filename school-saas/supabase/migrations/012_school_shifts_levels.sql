-- supabase/migrations/004_school_shifts_levels.sql

-- Add arrays for school levels and shifts
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS school_levels text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS school_shifts text[] DEFAULT '{}'::text[];

-- Update RLS policies (none needed specifically for these columns, as they fall under existing tenants table policies)

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
