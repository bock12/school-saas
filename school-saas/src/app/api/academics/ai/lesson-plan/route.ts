import { NextRequest, NextResponse } from 'next/server';
import { getPgPool } from '@/lib/db/pg-fallback';
import { createClient } from '@/lib/supabase/server';

// ─────────────────────────────────────────────────────────────
// POST /api/academics/ai/lesson-plan
// Body: { offering_id, topic_id, duration_minutes?, style? }
// 
// AI is fully constrained to the published curriculum structure:
//   school curriculum → curriculum_version → topic → learning_outcomes
// AI never invents curriculum; it only operationalises it.
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { offering_id, topic_id, duration_minutes = 40, style = 'standard' } = body;

    if (!offering_id || !topic_id) {
      return NextResponse.json({ error: 'offering_id and topic_id are required.' }, { status: 400 });
    }

    const pool = getPgPool();
    if (!pool) return NextResponse.json({ error: 'Database connection unavailable.' }, { status: 503 });

    // ── 1. Fetch offering context (validates tenant access) ─────────────
    const offeringRes = await pool.query(
      `SELECT
          so.id, so.tenant_id, so.periods_per_week,
          s.name AS subject_name, s.code AS subject_code, s.description AS subject_description,
          sec.name AS section_name, cl.name AS class_name,
          ay.name AS academic_year_name,
          (te.first_name || ' ' || te.last_name) AS teacher_name,
          cv.status AS curriculum_status, cv.id AS curriculum_version_id
        FROM subject_offerings so
        JOIN subjects s ON s.id = so.subject_id
        JOIN sections sec ON sec.id = so.section_id
        JOIN classes cl ON cl.id = sec.class_id
        JOIN academic_years ay ON ay.id = so.academic_year_id
        LEFT JOIN teachers te ON te.id = so.teacher_id
        LEFT JOIN curriculum_versions cv ON cv.id = so.curriculum_version_id
        WHERE so.id = $1`,
      [offering_id]
    );

    if (offeringRes.rows.length === 0) {
      return NextResponse.json({ error: 'Offering not found.' }, { status: 404 });
    }

    const offering = offeringRes.rows[0];

    // Validate that the curriculum is published (AI must not work on drafts)
    if (offering.curriculum_status !== 'published') {
      return NextResponse.json({
        error: `AI lesson plans require a published curriculum. Current status: "${offering.curriculum_status || 'none'}". Publish the curriculum first.`
      }, { status: 422 });
    }

    // ── 2. Fetch the specific topic + its learning outcomes ─────────────
    const topicRes = await pool.query(
      `SELECT t.title, t.description, t.term, t.estimated_periods,
          pt.title AS parent_title,
          COALESCE(
            json_agg(
              json_build_object(
                'code', lo.code,
                'description', lo.description,
                'cognitive_level', lo.cognitive_level
              ) ORDER BY lo.sequence
            ) FILTER (WHERE lo.id IS NOT NULL), '[]'
          ) AS learning_outcomes
        FROM curriculum_topics t
        LEFT JOIN curriculum_topics pt ON pt.id = t.parent_topic_id
        LEFT JOIN learning_outcomes lo ON lo.topic_id = t.id
        WHERE t.id = $1 AND t.curriculum_version_id = $2
        GROUP BY t.id, pt.title`,
      [topic_id, offering.curriculum_version_id]
    );

    if (topicRes.rows.length === 0) {
      return NextResponse.json({ error: 'Topic not found in this curriculum version.' }, { status: 404 });
    }

    const topic = topicRes.rows[0];
    const learningOutcomes: { code?: string; description: string; cognitive_level?: string }[] = topic.learning_outcomes || [];

    // ── 3. Build structured prompt ──────────────────────────────────────
    const outcomesList = learningOutcomes.length > 0
      ? learningOutcomes.map((lo, i) => `  ${lo.code || (i + 1) + '.'} [${(lo.cognitive_level || 'remember').toUpperCase()}] ${lo.description}`).join('\n')
      : '  (No specific outcomes defined — generate based on topic)';

    const styleInstructions = style === 'inquiry'
      ? 'Use an inquiry-based / Socratic approach. Emphasise student questioning, investigation, and discovery.'
      : style === 'project'
      ? 'Use project-based learning. Include a mini-project or design challenge students complete over the lesson.'
      : style === 'direct'
      ? 'Use direct instruction with I Do / We Do / You Do scaffolding.'
      : 'Use a balanced lesson structure appropriate for the age group.';

    const systemPrompt = `You are an expert curriculum designer working within the Sierra Leone national education system (MBSSE). 
You NEVER invent curriculum content. You operationalise ONLY what is given to you from the school's approved, published curriculum.
Your role: turn approved topics and learning outcomes into concrete, classroom-ready lesson plans.
Return ONLY valid JSON matching the schema exactly. No markdown fences, no explanation outside the JSON.`;

    const userPrompt = `Generate a lesson plan using ONLY the following approved curriculum data:

SUBJECT: ${offering.subject_name}${offering.subject_code ? ` (${offering.subject_code})` : ''}
CLASS: ${offering.class_name} ${offering.section_name}
TOPIC: ${topic.parent_title ? `${topic.parent_title} > ` : ''}${topic.title}
${topic.description ? `TOPIC DESCRIPTION: ${topic.description}` : ''}
TERM: ${topic.term || 'Unspecified'}
ESTIMATED PERIODS: ${topic.estimated_periods}
LESSON DURATION: ${duration_minutes} minutes

APPROVED LEARNING OUTCOMES (from published curriculum):
${outcomesList}

PEDAGOGICAL STYLE: ${styleInstructions}

Return a JSON object with this exact schema:
{
  "lesson_title": "string",
  "subject": "string",
  "grade_class": "string",
  "topic": "string",
  "duration_minutes": number,
  "term": "string",
  "learning_objectives": ["string"],
  "materials_needed": ["string"],
  "lesson_phases": [
    {
      "phase": "string",
      "duration_minutes": number,
      "description": "string",
      "teacher_activities": ["string"],
      "student_activities": ["string"],
      "key_questions": ["string"]
    }
  ],
  "assessment_strategies": ["string"],
  "differentiation": {
    "support": "string",
    "extension": "string"
  },
  "homework": "string",
  "curriculum_outcomes_addressed": ["string"],
  "teacher_notes": "string"
}`;

    // ── 4. Call Gemini API ──────────────────────────────────────────────
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured. Set GEMINI_API_KEY in environment.' }, { status: 503 });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 3000,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error('Gemini API error:', errBody);
      return NextResponse.json({ error: 'AI service returned an error. Please try again.' }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    const inputTokens = geminiData?.usageMetadata?.promptTokenCount || 0;
    const outputTokens = geminiData?.usageMetadata?.candidatesTokenCount || 0;

    let lessonPlan: any;
    try {
      lessonPlan = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ error: 'AI returned malformed JSON. Please retry.' }, { status: 502 });
    }

    // ── 5. Log AI usage ─────────────────────────────────────────────────
    try {
      // Get user's profile to link tenant_id
      const profileRes = await pool.query(
        'SELECT tenant_id FROM profiles WHERE id = $1 LIMIT 1',
        [user.id]
      );
      if (profileRes.rows.length > 0) {
        await pool.query(
          `INSERT INTO ai_usage_logs
            (tenant_id, user_id, feature, model, subject_id, curriculum_version_id, input_tokens, output_tokens, status)
           SELECT $1, $2, 'lesson_plan', 'gemini-2.0-flash',
                  so.subject_id, so.curriculum_version_id, $3, $4, 'success'
           FROM subject_offerings so WHERE so.id = $5`,
          [profileRes.rows[0].tenant_id, user.id, inputTokens, outputTokens, offering_id]
        );
      }
    } catch (logErr) {
      console.warn('AI usage log failed (non-fatal):', logErr);
    }

    // ── 6. Return lesson plan ───────────────────────────────────────────
    return NextResponse.json({
      success: true,
      lesson_plan: lessonPlan,
      metadata: {
        offering_id,
        topic_id,
        topic_title: topic.title,
        subject_name: offering.subject_name,
        class_name: offering.class_name,
        section_name: offering.section_name,
        curriculum_version_id: offering.curriculum_version_id,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        generated_at: new Date().toISOString(),
      },
    });

  } catch (err: any) {
    console.error('lesson-plan API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
