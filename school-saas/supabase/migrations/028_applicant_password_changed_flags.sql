-- Add password changed tracking flags to public.applicants table
ALTER TABLE public.applicants ADD COLUMN IF NOT EXISTS student_password_changed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.applicants ADD COLUMN IF NOT EXISTS parent_password_changed BOOLEAN DEFAULT FALSE;
