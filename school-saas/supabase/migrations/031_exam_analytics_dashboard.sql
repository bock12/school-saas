-- Migration: 031_exam_analytics_dashboard.sql
-- Core Examination Analytics & Control Center Dashboard Tables

-- 1. Student Spotlight Recognition Cards
CREATE TABLE IF NOT EXISTS public.exam_student_spotlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    category TEXT NOT NULL UNIQUE,
    score TEXT NOT NULL,
    name TEXT NOT NULL,
    grade INT DEFAULT 1,
    gpa NUMERIC DEFAULT 4.0,
    secondary_metric_label TEXT DEFAULT 'Attend',
    secondary_metric_value TEXT DEFAULT '77.3%',
    avatar_emoji TEXT DEFAULT '👦',
    avatar_bg TEXT DEFAULT 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    badge_color TEXT DEFAULT 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Grade Distribution Breakdown
CREATE TABLE IF NOT EXISTS public.exam_grade_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    grade_name TEXT NOT NULL UNIQUE,
    percentage NUMERIC NOT NULL DEFAULT 20.0,
    student_count INT NOT NULL DEFAULT 500,
    color TEXT NOT NULL DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Student Details Cards
CREATE TABLE IF NOT EXISTS public.exam_student_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    name TEXT NOT NULL,
    gender TEXT NOT NULL DEFAULT 'Male',
    avatar_emoji TEXT DEFAULT '👨‍🎓',
    marks TEXT NOT NULL DEFAULT '75.0%',
    gpa NUMERIC DEFAULT 4.0,
    attendance TEXT NOT NULL DEFAULT '80.0%',
    grade TEXT NOT NULL DEFAULT 'Grade 1',
    avatar_bg TEXT DEFAULT 'bg-red-500/15 border-red-500/30',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Examination Results (Pass / Average / Fail per subject)
CREATE TABLE IF NOT EXISTS public.exam_subject_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    subject TEXT NOT NULL UNIQUE,
    pass_count INT NOT NULL DEFAULT 500,
    average_count INT NOT NULL DEFAULT 300,
    fail_count INT NOT NULL DEFAULT 100,
    highlight_badge TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Subject Performance Averages
CREATE TABLE IF NOT EXISTS public.exam_subject_averages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    subject TEXT NOT NULL UNIQUE,
    score NUMERIC NOT NULL DEFAULT 75.0,
    color TEXT NOT NULL DEFAULT '#7c3aed',
    gradient_from TEXT DEFAULT '#7c3aed',
    gradient_to TEXT DEFAULT '#a855f7',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS & Policies
ALTER TABLE public.exam_student_spotlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_grade_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_student_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_subject_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_subject_averages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated access to exam_student_spotlights" ON public.exam_student_spotlights FOR ALL USING (true);
CREATE POLICY "Allow authenticated access to exam_grade_distributions" ON public.exam_grade_distributions FOR ALL USING (true);
CREATE POLICY "Allow authenticated access to exam_student_details" ON public.exam_student_details FOR ALL USING (true);
CREATE POLICY "Allow authenticated access to exam_subject_results" ON public.exam_subject_results FOR ALL USING (true);
CREATE POLICY "Allow authenticated access to exam_subject_averages" ON public.exam_subject_averages FOR ALL USING (true);

-- Seed Initial Real Data

INSERT INTO public.exam_student_spotlights (category, score, name, grade, gpa, secondary_metric_label, secondary_metric_value, avatar_emoji, avatar_bg, badge_color)
VALUES 
  ('Best In Marks', '87.9%', 'Kinara Zuri', 3, 5, 'Attend', '77.3%', '👦', 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'),
  ('Best In Attendance', '89.3%', 'Lea Jabulani', 4, 4, 'Marks', '75.3%', '👧', 'bg-amber-500/20 text-amber-400 border-amber-500/30', 'text-amber-400 bg-amber-500/10 border-amber-500/20'),
  ('Most Improved In Marks', '79.3%', 'Corny Niang', 5, 3, 'Attend', '80.2%', '👧‍💼', 'bg-violet-500/20 text-violet-400 border-violet-500/30', 'text-violet-400 bg-violet-500/10 border-violet-500/20'),
  ('Most Improved In Attendance', '82.5%', 'Yao Ming', 1, 5, 'Marks', '86.8%', '👦‍💼', 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20')
ON CONFLICT (category) DO UPDATE SET score = EXCLUDED.score, name = EXCLUDED.name, grade = EXCLUDED.grade, gpa = EXCLUDED.gpa;

INSERT INTO public.exam_grade_distributions (grade_name, percentage, student_count, color)
VALUES
  ('Grade 1', 13.2, 457, '#3b82f6'),
  ('Grade 2', 22.2, 769, '#06b6d4'),
  ('Grade 3', 28.9, 1000, '#a855f7'),
  ('Grade 4', 15.9, 553, '#10b981'),
  ('Grade 5', 19.6, 678, '#eab308')
ON CONFLICT (grade_name) DO UPDATE SET percentage = EXCLUDED.percentage, student_count = EXCLUDED.student_count;

INSERT INTO public.exam_student_details (name, gender, avatar_emoji, marks, gpa, attendance, grade, avatar_bg)
VALUES
  ('Luka Magic', 'Male', '👨‍🎓', '73.7%', 5, '77.3%', 'Grade 1', 'bg-red-500/15 border-red-500/30'),
  ('Bianca Shangwe', 'Female', '👩‍🎓', '63.7%', 2, '67.7%', 'Grade 1', 'bg-purple-500/15 border-purple-500/30'),
  ('Alpha Kenya', 'Male', '🧑‍🎓', '83.1%', 5, '79.9%', 'Grade 1', 'bg-emerald-500/15 border-emerald-500/30'),
  ('Sarah Connor', 'Female', '👩‍🔬', '88.4%', 4, '91.2%', 'Grade 2', 'bg-blue-500/15 border-blue-500/30')
ON CONFLICT DO NOTHING;

INSERT INTO public.exam_subject_results (subject, pass_count, average_count, fail_count, highlight_badge)
VALUES
  ('Maths', 1600, 600, 450, NULL),
  ('English', 700, 1000, 420, '59.9%'),
  ('Mandarin', 750, 520, 760, NULL),
  ('Science', 720, 980, 440, NULL),
  ('Arts', 1650, 600, 460, NULL),
  ('Exercise', 710, 530, 120, NULL)
ON CONFLICT (subject) DO UPDATE SET pass_count = EXCLUDED.pass_count, average_count = EXCLUDED.average_count, fail_count = EXCLUDED.fail_count;

INSERT INTO public.exam_subject_averages (subject, score, color, gradient_from, gradient_to)
VALUES
  ('English', 94.5, '#7c3aed', '#7c3aed', '#a855f7'),
  ('Maths', 81.9, '#6366f1', '#6366f1', '#4f46e5'),
  ('Science', 69.4, '#06b6d4', '#06b6d4', '#3b82f6'),
  ('Physics', 78.2, '#f59e0b', '#f59e0b', '#fbbf24'),
  ('Chemistry', 73.6, '#ec4899', '#ec4899', '#f472b6'),
  ('Biology', 85.1, '#10b981', '#10b981', '#34d399'),
  ('History', 88.7, '#8b5cf6', '#8b5cf6', '#c084fc'),
  ('Geography', 76.4, '#14b8a6', '#14b8a6', '#2dd4bf'),
  ('ICT', 91.2, '#3b82f6', '#3b82f6', '#60a5fa')
ON CONFLICT (subject) DO UPDATE SET score = EXCLUDED.score;
