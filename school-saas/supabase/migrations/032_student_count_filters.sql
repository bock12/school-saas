-- Migration: 032_student_count_filters.sql
-- Add Category Type column & seed Level, Stream, and Gender student distribution filters

ALTER TABLE public.exam_grade_distributions 
ADD COLUMN IF NOT EXISTS category_type TEXT NOT NULL DEFAULT 'grade';

-- Seed Level, Stream, and Gender filter data
INSERT INTO public.exam_grade_distributions (grade_name, percentage, student_count, color, category_type)
VALUES
  -- Level breakdown
  ('Primary', 35.4, 1226, '#3b82f6', 'level'),
  ('Junior Secondary', 44.8, 1553, '#a855f7', 'level'),
  ('Senior Secondary', 19.8, 678, '#10b981', 'level'),

  -- Stream breakdown
  ('Science Stream', 42.1, 1455, '#06b6d4', 'stream'),
  ('Arts Stream', 33.6, 1161, '#ec4899', 'stream'),
  ('Commercial Stream', 24.3, 841, '#eab308', 'stream'),

  -- Gender breakdown
  ('Male', 52.4, 1811, '#3b82f6', 'gender'),
  ('Female', 47.6, 1646, '#ec4899', 'gender')
ON CONFLICT (grade_name) DO UPDATE 
SET percentage = EXCLUDED.percentage, 
    student_count = EXCLUDED.student_count, 
    category_type = EXCLUDED.category_type;
