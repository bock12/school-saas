-- Migration: 036_top_student_details.sql
-- Add Level, Stream, and Rank columns to exam_student_details for Top 3 Performers filtering

ALTER TABLE public.exam_student_details
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'SSS 1',
ADD COLUMN IF NOT EXISTS stream TEXT DEFAULT 'Science',
ADD COLUMN IF NOT EXISTS class_arm TEXT DEFAULT 'SSS 1 Science',
ADD COLUMN IF NOT EXISTS rank INT DEFAULT 1;

TRUNCATE TABLE public.exam_student_details;

-- Seed Top 3 Performers per Level & Stream
INSERT INTO public.exam_student_details (name, gender, avatar_emoji, marks, gpa, attendance, grade, level, stream, class_arm, rank, avatar_bg)
VALUES
  -- SSS 1 Science
  ('Amina Bello', 'Female', '👩‍🎓', '98.4%', 5.0, '99.5%', 'SSS 1', 'SSS 1', 'Science', 'SSS 1 Science', 1, 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'),
  ('Luka Magic', 'Male', '👨‍🎓', '96.5%', 5.0, '98.2%', 'SSS 1', 'SSS 1', 'Science', 'SSS 1 Science', 2, 'bg-blue-500/15 border-blue-500/30 text-blue-400'),
  ('Bianca Shangwe', 'Female', '👩‍🔬', '94.8%', 4.9, '96.5%', 'SSS 1', 'SSS 1', 'Science', 'SSS 1 Science', 3, 'bg-purple-500/15 border-purple-500/30 text-purple-400'),

  -- SSS 1 Arts
  ('Sarah Connor', 'Female', '👩‍🎨', '95.6%', 5.0, '99.1%', 'SSS 1', 'SSS 1', 'Arts', 'SSS 1 Arts', 1, 'bg-rose-500/15 border-rose-500/30 text-rose-400'),
  ('Alpha Kenya', 'Male', '🧑‍🎓', '92.4%', 4.8, '95.0%', 'SSS 1', 'SSS 1', 'Arts', 'SSS 1 Arts', 2, 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'),
  ('Tunde Folami', 'Male', '👦', '90.1%', 4.6, '93.5%', 'SSS 1', 'SSS 1', 'Arts', 'SSS 1 Arts', 3, 'bg-amber-500/15 border-amber-500/30 text-amber-400'),

  -- SSS 1 Commercial
  ('David Beckham', 'Male', '💼', '93.2%', 4.7, '94.8%', 'SSS 1', 'SSS 1', 'Commercial', 'SSS 1 Commercial', 1, 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'),
  ('Fatima Zahra', 'Female', '👩‍💼', '91.8%', 4.6, '95.2%', 'SSS 1', 'SSS 1', 'Commercial', 'SSS 1 Commercial', 2, 'bg-teal-500/15 border-teal-500/30 text-teal-400'),
  ('Kofi Annan', 'Male', '👨‍💼', '89.5%', 4.5, '92.0%', 'SSS 1', 'SSS 1', 'Commercial', 'SSS 1 Commercial', 3, 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'),

  -- SSS 2
  ('Corny Niang', 'Female', '👩‍🎓', '97.1%', 5.0, '98.6%', 'SSS 2', 'SSS 2', 'Science', 'SSS 2 Science', 1, 'bg-violet-500/15 border-violet-500/30 text-violet-400'),
  ('Yao Ming', 'Male', '👨‍🎓', '95.0%', 4.9, '97.2%', 'SSS 2', 'SSS 2', 'Arts', 'SSS 2 Arts', 1, 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'),

  -- SSS 3
  ('Kwame Mensah', 'Male', '👨‍🎓', '96.0%', 4.9, '96.8%', 'SSS 3', 'SSS 3', 'Commercial', 'SSS 3 Commercial', 1, 'bg-amber-500/15 border-amber-500/30 text-amber-400'),
  ('Elena Rostova', 'Female', '👩‍🎓', '95.2%', 4.8, '97.0%', 'SSS 3', 'SSS 3', 'Arts', 'SSS 3 Arts', 1, 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400');
