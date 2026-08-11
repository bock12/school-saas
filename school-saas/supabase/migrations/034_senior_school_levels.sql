-- Migration: 034_senior_school_levels.sql
-- Update Student Count Distribution Data specifically for Senior Secondary School (SSS 1, SSS 2, SSS 3)

TRUNCATE TABLE public.exam_grade_distributions;

-- 1. Level Filter: SSS 1, SSS 2, SSS 3
INSERT INTO public.exam_grade_distributions (grade_name, percentage, student_count, color, category_type)
VALUES
  ('SSS 1', 41.2, 1424, '#3b82f6', 'level'),
  ('SSS 2', 35.8, 1237, '#06b6d4', 'level'),
  ('SSS 3', 23.0, 796, '#a855f7', 'level');

-- 2. Stream Filter: Science, Arts, Commercial
INSERT INTO public.exam_grade_distributions (grade_name, percentage, student_count, color, category_type)
VALUES
  ('Science Stream', 42.1, 1455, '#06b6d4', 'stream'),
  ('Arts Stream', 33.6, 1161, '#ec4899', 'stream'),
  ('Commercial Stream', 24.3, 841, '#eab308', 'stream');

-- 3. Class/Arm Filter: SSS 1-3 Streams & Arms
INSERT INTO public.exam_grade_distributions (grade_name, percentage, student_count, color, category_type)
VALUES
  ('SSS 1 Science', 17.5, 605, '#3b82f6', 'grade'),
  ('SSS 1 Arts', 14.0, 484, '#06b6d4', 'grade'),
  ('SSS 1 Commercial', 9.7, 335, '#0284c7', 'grade'),
  ('SSS 2 Science', 15.2, 525, '#a855f7', 'grade'),
  ('SSS 2 Arts', 12.1, 418, '#9333ea', 'grade'),
  ('SSS 2 Commercial', 8.5, 294, '#7e22ce', 'grade'),
  ('SSS 3 Science', 9.4, 325, '#10b981', 'grade'),
  ('SSS 3 Arts', 7.5, 259, '#059669', 'grade'),
  ('SSS 3 Commercial', 6.1, 212, '#047857', 'grade');

-- 4. Gender Filter
INSERT INTO public.exam_grade_distributions (grade_name, percentage, student_count, color, category_type)
VALUES
  ('Male', 52.4, 1811, '#3b82f6', 'gender'),
  ('Female', 47.6, 1646, '#ec4899', 'gender');
