import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest, apiError } from '@/lib/auth/api-guard';

// ─────────────────────────────────────────────────────────────
// POST /api/academics/ai/lesson-plan
// Body: { offering_id, topic_id, duration_minutes?, style?, tenantSlug? }
// 
// Canonical Authorization: curriculum.lesson_plan.generate
// Scope: tenant (with offering-level resource resolution)
// Invariant: Zero Gemini AI invocations if any auth or validation check fails.
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      offering_id,
      topic_id,
      duration_minutes = 40,
      style = 'standard',
      tenantSlug,
    } = body;

    if (!offering_id || typeof offering_id !== 'string') {
      return apiError('offering_id is required and must be a valid identifier.', 'INVALID_REQUEST', 400);
    }
    if (!topic_id || typeof topic_id !== 'string') {
      return apiError('topic_id is required and must be a valid identifier.', 'INVALID_REQUEST', 400);
    }

    const { searchParams } = new URL(req.url);
    const requestedTenantSlug =
      searchParams.get('tenantSlug') || searchParams.get('tenant') || tenantSlug || undefined;

    // ── 1. Authenticate, Resolve Offering Target & Authorize Canonical Permission ──
    const auth = await authorizeApiRequest(req, {
      permission: 'curriculum.lesson_plan.generate',
      scope: 'tenant',
      requestedTenantSlug,
      resolveResource: {
        type: 'subject_offering',
        id: offering_id,
      },
    });

    if (!auth.ok) {
      return auth.response;
    }

    const adminClient = auth.adminClient();
    const tenantId = auth.tenantId!;

    // ── 2. Fetch offering details strictly scoped to authorized tenant ──
    const { data: offering, error: offeringErr } = await adminClient
      .from('subject_offerings')
      .select(`
        id, tenant_id, periods_per_week, curriculum_version_id, subject_id, section_id, academic_year_id, teacher_id,
        subjects (name, code, description),
        sections (name, classes (name)),
        academic_years (name),
        teachers (first_name, last_name),
        curriculum_versions (id, status)
      `)
      .eq('id', offering_id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (offeringErr || !offering) {
      return apiError('Offering not found.', 'NOT_FOUND', 404);
    }

    const cv = (offering as any).curriculum_versions;
    const curriculumStatus = cv?.status;
    const curriculumVersionId = cv?.id || (offering as any).curriculum_version_id;

    // Validate that curriculum is published (AI must not work on drafts)
    if (curriculumStatus !== 'published') {
      return apiError(
        `AI lesson plans require a published curriculum. Current status: "${curriculumStatus || 'none'}". Publish the curriculum first.`,
        'UNPROCESSABLE_ENTITY',
        422
      );
    }

    if (!curriculumVersionId) {
      return apiError('No published curriculum version linked to this offering.', 'NOT_FOUND', 404);
    }

    // ── 3. Fetch topic + learning outcomes ──
    let topicData: any = null;
    let outcomes: any[] = [];

    const { data: singleTopic, error: singleTopicErr } = await adminClient
      .from('curriculum_topics')
      .select('id, title, description, term, estimated_periods, parent_topic_id')
      .eq('id', topic_id)
      .eq('curriculum_version_id', curriculumVersionId)
      .maybeSingle();

    if (singleTopicErr || !singleTopic) {
      return apiError('Topic not found in this curriculum version.', 'NOT_FOUND', 404);
    }
    topicData = singleTopic;

    const { data: outcomesData } = await adminClient
      .from('learning_outcomes')
      .select('code, description, cognitive_level, sequence')
      .eq('topic_id', topic_id)
      .order('sequence', { ascending: true });

    outcomes = outcomesData || [];

    const subjectName = (offering as any).subjects?.name || 'Subject';
    const subjectCode = (offering as any).subjects?.code || '';
    const sectionName = (offering as any).sections?.name || '';
    const className = (offering as any).sections?.classes?.name || '';

    // ── 4. Build Prompt ──
    const outcomesList = outcomes.length > 0
      ? outcomes.map((lo: any, i: number) => `  ${lo.code || (i + 1) + '.'} [${(lo.cognitive_level || 'remember').toUpperCase()}] ${lo.description}`).join('\n')
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

SUBJECT: ${subjectName}${subjectCode ? ` (${subjectCode})` : ''}
CLASS: ${className} ${sectionName}
TOPIC: ${topicData.title}
${topicData.description ? `TOPIC DESCRIPTION: ${topicData.description}` : ''}
TERM: ${topicData.term || 'Unspecified'}
ESTIMATED PERIODS: ${topicData.estimated_periods || 1}
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

    // ── 5. Call External Gemini API (ONLY after all authorization & validations pass) ──
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!GEMINI_API_KEY) {
      return apiError('AI service not configured. Set GEMINI_API_KEY in environment.', 'SERVICE_UNAVAILABLE', 503);
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
      return apiError('AI service returned an error. Please try again.', 'GATEWAY_ERROR', 502);
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    const inputTokens = geminiData?.usageMetadata?.promptTokenCount || 0;
    const outputTokens = geminiData?.usageMetadata?.candidatesTokenCount || 0;

    let lessonPlan: any;
    try {
      lessonPlan = JSON.parse(rawText);
    } catch {
      return apiError('AI returned malformed JSON. Please retry.', 'GATEWAY_ERROR', 502);
    }

    // ── 6. Log AI usage strictly bound to tenant and user ──
    try {
      await adminClient.from('ai_usage_logs').insert({
        tenant_id: tenantId,
        user_id: auth.user.id,
        feature: 'lesson_plan',
        model: 'gemini-2.0-flash',
        subject_id: (offering as any).subject_id,
        curriculum_version_id: curriculumVersionId,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        status: 'success',
      });
    } catch (logErr) {
      console.warn('AI usage log failed (non-fatal):', logErr);
    }

    // ── 7. Return lesson plan ──
    return NextResponse.json({
      success: true,
      lesson_plan: lessonPlan,
      metadata: {
        offering_id,
        topic_id,
        topic_title: topicData.title,
        subject_name: subjectName,
        class_name: className,
        section_name: sectionName,
        curriculum_version_id: curriculumVersionId,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('lesson-plan API error:', err);
    return apiError(err.message || 'Internal server error.', 'INTERNAL_ERROR', 500);
  }
}
