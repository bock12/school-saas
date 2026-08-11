-- Migration: 035_class_gender_matrix.sql
-- Class x Stream x Gender Cross-Tabulation Matrix for Detailed Student Count Drill-Down

CREATE TABLE IF NOT EXISTS public.exam_class_gender_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    class_arm TEXT NOT NULL UNIQUE,
    level TEXT NOT NULL,
    stream TEXT NOT NULL,
    total_students INT NOT NULL,
    male_count INT NOT NULL,
    female_count INT NOT NULL,
    male_percentage NUMERIC NOT NULL,
    female_percentage NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.exam_class_gender_counts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to exam_class_gender_counts" ON public.exam_class_gender_counts FOR ALL USING (true);

-- Seed Class x Gender Drill-Down Data
INSERT INTO public.exam_class_gender_counts (class_arm, level, stream, total_students, male_count, female_count, male_percentage, female_percentage)
VALUES
  ('SSS 1 Science', 'SSS 1', 'Science', 605, 316, 289, 52.2, 47.8),
  ('SSS 1 Arts', 'SSS 1', 'Arts', 484, 218, 266, 45.0, 55.0),
  ('SSS 1 Commercial', 'SSS 1', 'Commercial', 335, 161, 174, 48.1, 51.9),
  ('SSS 2 Science', 'SSS 2', 'Science', 525, 284, 241, 54.1, 45.9),
  ('SSS 2 Arts', 'SSS 2', 'Arts', 418, 192, 226, 45.9, 54.1),
  ('SSS 2 Commercial', 'SSS 2', 'Commercial', 294, 141, 153, 48.0, 52.0),
  ('SSS 3 Science', 'SSS 3', 'Science', 325, 179, 146, 55.1, 44.9),
  ('SSS 3 Arts', 'SSS 3', 'Arts', 259, 117, 142, 45.2, 54.8),
  ('SSS 3 Commercial', 'SSS 3', 'Commercial', 212, 104, 108, 49.1, 50.9)
ON CONFLICT (class_arm) DO UPDATE 
SET total_students = EXCLUDED.total_students,
    male_count = EXCLUDED.male_count,
    female_count = EXCLUDED.female_count,
    male_percentage = EXCLUDED.male_percentage,
    female_percentage = EXCLUDED.female_percentage;
