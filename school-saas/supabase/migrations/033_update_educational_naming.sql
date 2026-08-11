-- Migration: 033_update_educational_naming.sql
-- Update Student Count Distribution Data for Primary (Class 1-6), Junior (JSS 1-3), and Senior (SSS 1-3)

-- Clear old grade distributions to prevent naming duplicates
TRUNCATE TABLE public.exam_grade_distributions;

-- Seed Level distributions
INSERT INTO public.exam_grade_distributions (grade_name, percentage, student_count, color, category_type)
VALUES
  ('Primary (Class 1–6)', 35.4, 1226, '#3b82f6', 'level'),
  ('Junior School (JSS 1–3)', 44.8, 1553, '#a855f7', 'level'),
  ('Senior School (SSS 1–3)', 19.8, 678, '#10b981', 'level');

-- Seed Grade/Class distributions
INSERT INTO public.exam_grade_distributions (grade_name, percentage, student_count, color, category_type)
VALUES
  ('Class 1', 5.5, 190, '#3b82f6', 'grade'),
  ('Class 2', 6.0, 208, '#06b6d4', 'grade'),
  ('Class 3', 6.5, 225, '#0284c7', 'grade'),
  ('Class 4', 7.2, 249, '#2563eb', 'grade'),
  ('Class 5', 5.8, 201, '#4f46e5', 'grade'),
  ('Class 6', 4.4, 153, '#6366f1', 'grade'),
  ('JSS 1', 14.2, 490, '#a855f7', 'grade'),
  ('JSS 2', 15.1, 522, '#9333ea', 'grade'),
  ('JSS 3', 15.5, 535, '#7e22ce', 'grade'),
  ('SSS 1', 7.3, 252, '#10b981', 'grade'),
  ('SSS 2', 7.5, 260, '#059669', 'grade'),
  ('SSS 3', 5.0, 172, '#047857', 'grade');

-- Seed Stream distributions
INSERT INTO public.exam_grade_distributions (grade_name, percentage, student_count, color, category_type)
VALUES
  ('Science Stream (SSS)', 42.1, 1455, '#06b6d4', 'stream'),
  ('Arts Stream (SSS)', 33.6, 1161, '#ec4899', 'stream'),
  ('Commercial Stream (SSS)', 24.3, 841, '#eab308', 'stream');

-- Seed Gender distributions
INSERT INTO public.exam_grade_distributions (grade_name, percentage, student_count, color, category_type)
VALUES
  ('Male', 52.4, 1811, '#3b82f6', 'gender'),
  ('Female', 47.6, 1646, '#ec4899', 'gender');
