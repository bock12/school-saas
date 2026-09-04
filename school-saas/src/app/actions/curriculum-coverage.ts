'use server';

import { revalidatePath } from 'next/cache';
import { getPgPool } from '@/lib/db/pg-fallback';
import { createClient } from '@/lib/supabase/server';
import {
  OfferingCoverageSummary,
  TopicWithCoverage,
  LogTopicProgressPayload,
  TopicProgressStatus
} from '@/lib/types/curriculum';

async function resolveTenantId(slugOrId: string): Promise<string | null> {
  const pool = getPgPool();
  if (!pool) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  if (isUuid) return slugOrId;
  const res = await pool.query('SELECT id FROM tenants WHERE slug = $1 LIMIT 1', [slugOrId.toLowerCase().trim()]);
  return res.rows[0]?.id || null;
}

async function resolveUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: getCohortCoverageSummaries
// ─────────────────────────────────────────────────────────────

export async function getCohortCoverageSummaries(
  tenantSlug: string,
  filters: {
    academic_year_id?: string;
    class_id?: string;
    section_id?: string;
    teacher_id?: string;
    search?: string;
  } = {}
): Promise<{
  success: boolean;
  data: OfferingCoverageSummary[];
  totalOfferings: number;
  averageCoverage: number;
  onTrackCount: number;
  behindCount: number;
  completedTopicsTotal: number;
  error?: string;
}> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) {
      return { success: false, data: [], totalOfferings: 0, averageCoverage: 0, onTrackCount: 0, behindCount: 0, completedTopicsTotal: 0, error: 'Tenant not found.' };
    }

    const pool = getPgPool();
    if (!pool) {
      return { success: false, data: [], totalOfferings: 0, averageCoverage: 0, onTrackCount: 0, behindCount: 0, completedTopicsTotal: 0, error: 'Database unavailable.' };
    }

    let yearId = filters.academic_year_id;
    if (!yearId) {
      const curYear = await pool.query(
        `SELECT id FROM academic_years WHERE tenant_id = $1 AND is_current = true LIMIT 1`,
        [tenantId]
      );
      yearId = curYear.rows[0]?.id;
    }

    if (!yearId) {
      return { success: true, data: [], totalOfferings: 0, averageCoverage: 0, onTrackCount: 0, behindCount: 0, completedTopicsTotal: 0 };
    }

    const conditions = ['so.tenant_id = $1', 'so.academic_year_id = $2', "so.status = 'active'"];
    const params: unknown[] = [tenantId, yearId];
    let p = 3;

    if (filters.class_id) {
      conditions.push(`sec.class_id = $${p++}`);
      params.push(filters.class_id);
    }
    if (filters.section_id) {
      conditions.push(`so.section_id = $${p++}`);
      params.push(filters.section_id);
    }
    if (filters.teacher_id) {
      conditions.push(`so.teacher_id = $${p++}`);
      params.push(filters.teacher_id);
    }
    if (filters.search) {
      conditions.push(`(s.name ILIKE $${p} OR s.code ILIKE $${p} OR sec.name ILIKE $${p})`);
      params.push(`%${filters.search}%`);
      p++;
    }

    const query = `
      SELECT
        so.id AS offering_id,
        s.id AS subject_id,
        s.name AS subject_name,
        s.code AS subject_code,
        cl.name AS class_name,
        sec.name AS section_name,
        (t.first_name || ' ' || t.last_name) AS teacher_name,
        COALESCE(so.periods_per_week, 4) AS periods_per_week,
        cv.version_label AS curriculum_version_label,
        -- Total topics in curriculum version (or fallback if no version linked directly)
        COALESCE(
          (SELECT COUNT(*) FROM curriculum_topics ct
           WHERE ct.curriculum_version_id = COALESCE(so.curriculum_version_id, cv.id)),
          0
        )::int AS total_topics,
        -- Completed topics logged for this offering
        COALESCE(
          (SELECT COUNT(*) FROM curriculum_coverage_log ccl
           WHERE ccl.offering_id = so.id AND ccl.status = 'completed'),
          0
        )::int AS completed_topics,
        -- Started topics
        COALESCE(
          (SELECT COUNT(*) FROM curriculum_coverage_log ccl
           WHERE ccl.offering_id = so.id AND ccl.status = 'started'),
          0
        )::int AS started_topics,
        -- Deferred topics
        COALESCE(
          (SELECT COUNT(*) FROM curriculum_coverage_log ccl
           WHERE ccl.offering_id = so.id AND ccl.status = 'deferred'),
          0
        )::int AS deferred_topics,
        -- Last log timestamp
        (SELECT MAX(ccl.logged_at) FROM curriculum_coverage_log ccl WHERE ccl.offering_id = so.id) AS last_logged_at
      FROM subject_offerings so
      JOIN subjects s ON s.id = so.subject_id
      LEFT JOIN sections sec ON sec.id = so.section_id
      LEFT JOIN classes cl ON cl.id = sec.class_id
      LEFT JOIN teachers t ON t.id = so.teacher_id
      LEFT JOIN curriculum_versions cv ON cv.id = so.curriculum_version_id
        OR (cv.subject_id = s.id AND cv.academic_year_id = so.academic_year_id AND cv.status = 'published')
      WHERE ${conditions.join(' AND ')}
      ORDER BY cl.sort_order NULLS LAST, sec.name, s.name
    `;

    const res = await pool.query(query, params);

    let totalCompleted = 0;
    let sumPercentage = 0;
    let onTrack = 0;
    let behind = 0;

    const rows: OfferingCoverageSummary[] = res.rows.map(r => {
      const total = r.total_topics > 0 ? r.total_topics : 10; // realistic baseline if topics unpopulated
      const completed = r.completed_topics;
      totalCompleted += completed;

      const pct = Math.min(100, Math.round((completed / total) * 100));
      sumPercentage += pct;

      // Pacing calculation: e.g. midpoint of term expected ~40-60%
      let pacing: 'on_track' | 'behind' | 'ahead' = 'on_track';
      if (pct >= 75) {
        pacing = 'ahead';
        onTrack++;
      } else if (pct < 30 && completed === 0) {
        pacing = 'behind';
        behind++;
      } else {
        pacing = 'on_track';
        onTrack++;
      }

      return {
        offering_id: r.offering_id,
        subject_id: r.subject_id,
        subject_name: r.subject_name,
        subject_code: r.subject_code,
        class_name: r.class_name || 'General Secondary',
        section_name: r.section_name,
        teacher_name: r.teacher_name || 'Unassigned',
        periods_per_week: r.periods_per_week,
        curriculum_version_label: r.curriculum_version_label || 'Standard WASSCE',
        total_topics: total,
        completed_topics: completed,
        started_topics: r.started_topics,
        deferred_topics: r.deferred_topics,
        coverage_percentage: pct,
        pacing_status: pacing,
        last_logged_at: r.last_logged_at
      };
    });

    const count = rows.length;
    const avgPct = count > 0 ? Math.round(sumPercentage / count) : 0;

    return {
      success: true,
      data: rows,
      totalOfferings: count,
      averageCoverage: avgPct,
      onTrackCount: onTrack,
      behindCount: behind,
      completedTopicsTotal: totalCompleted
    };
  } catch (err: any) {
    return {
      success: false,
      data: [],
      totalOfferings: 0,
      averageCoverage: 0,
      onTrackCount: 0,
      behindCount: 0,
      completedTopicsTotal: 0,
      error: err.message
    };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: getOfferingCoverageTree
// ─────────────────────────────────────────────────────────────

export async function getOfferingCoverageTree(
  tenantSlug: string,
  offeringId: string,
  termNumber?: number
): Promise<{
  success: boolean;
  offeringInfo?: {
    offering_id: string;
    subject_name: string;
    subject_code: string;
    class_name: string;
    section_name?: string;
    teacher_name?: string;
    curriculum_version_label: string;
    periods_per_week: number;
  };
  topics: TopicWithCoverage[];
  error?: string;
}> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, topics: [], error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, topics: [], error: 'Database unavailable.' };

    // 1. Fetch offering metadata
    const offRes = await pool.query(
      `SELECT
         so.id AS offering_id,
         so.curriculum_version_id,
         s.id AS subject_id,
         s.name AS subject_name,
         s.code AS subject_code,
         cl.name AS class_name,
         sec.name AS section_name,
         (t.first_name || ' ' || t.last_name) AS teacher_name,
         COALESCE(so.periods_per_week, 4) AS periods_per_week,
         cv.id AS resolved_cv_id,
         COALESCE(cv.version_label, 'Standard v2026.1') AS version_label
       FROM subject_offerings so
       JOIN subjects s ON s.id = so.subject_id
       LEFT JOIN sections sec ON sec.id = so.section_id
       LEFT JOIN classes cl ON cl.id = sec.class_id
       LEFT JOIN teachers t ON t.id = so.teacher_id
       LEFT JOIN curriculum_versions cv ON cv.id = so.curriculum_version_id
         OR (cv.subject_id = s.id AND cv.academic_year_id = so.academic_year_id AND cv.status = 'published')
       WHERE so.id = $1 AND so.tenant_id = $2
       LIMIT 1`,
      [offeringId, tenantId]
    );

    if (offRes.rows.length === 0) {
      return { success: false, topics: [], error: 'Subject offering not found.' };
    }

    const offInfo = offRes.rows[0];
    const curriculumVersionId = offInfo.curriculum_version_id || offInfo.resolved_cv_id;

    // 2. Fetch Topics & Outlines joined with coverage log
    const termFilter = termNumber ? 'AND ct.term = $3' : '';
    const queryParams: unknown[] = [curriculumVersionId, offeringId];
    if (termNumber) queryParams.push(termNumber);

    const topicsQuery = `
      SELECT
        ct.id,
        ct.curriculum_version_id,
        ct.title,
        ct.description,
        ct.sequence,
        ct.term,
        COALESCE(ct.estimated_periods, 2) AS estimated_periods,
        ct.parent_topic_id,
        ccl.id AS coverage_id,
        COALESCE(ccl.status, 'planned'::topic_progress) AS status,
        ccl.logged_at,
        ccl.notes,
        (p.first_name || ' ' || p.last_name) AS logged_by_name,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', lo.id,
                'code', lo.code,
                'description', lo.description,
                'cognitive_level', lo.cognitive_level
              )
            )
            FROM learning_outcomes lo
            WHERE lo.topic_id = ct.id
          ),
          '[]'::json
        ) AS outcomes
      FROM curriculum_topics ct
      LEFT JOIN curriculum_coverage_log ccl ON ccl.topic_id = ct.id AND ccl.offering_id = $2
      LEFT JOIN profiles p ON p.id = ccl.logged_by
      WHERE ct.curriculum_version_id = $1
      ${termFilter}
      ORDER BY ct.term NULLS FIRST, ct.sequence, ct.title
    `;

    const topicsRes = await pool.query(topicsQuery, queryParams);

    return {
      success: true,
      offeringInfo: {
        offering_id: offInfo.offering_id,
        subject_name: offInfo.subject_name,
        subject_code: offInfo.subject_code,
        class_name: offInfo.class_name || 'Secondary',
        section_name: offInfo.section_name,
        teacher_name: offInfo.teacher_name,
        curriculum_version_label: offInfo.version_label,
        periods_per_week: offInfo.periods_per_week
      },
      topics: topicsRes.rows
    };
  } catch (err: any) {
    return { success: false, topics: [], error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: logTopicProgress
// ─────────────────────────────────────────────────────────────

export async function logTopicProgress(
  tenantSlug: string,
  payload: LogTopicProgressPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    const userId = await resolveUserId();
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    // 1. Upsert curriculum_coverage_log
    await pool.query(
      `INSERT INTO curriculum_coverage_log (
         offering_id, topic_id, outcome_id, status, notes, logged_by, logged_at
       ) VALUES (
         $1, $2, $3, $4::topic_progress, $5, $6, NOW()
       )
       ON CONFLICT (offering_id, topic_id) DO UPDATE SET
         status = EXCLUDED.status,
         notes = COALESCE(EXCLUDED.notes, curriculum_coverage_log.notes),
         outcome_id = COALESCE(EXCLUDED.outcome_id, curriculum_coverage_log.outcome_id),
         logged_by = EXCLUDED.logged_by,
         logged_at = NOW()`,
      [
        payload.offering_id,
        payload.topic_id,
        payload.outcome_id || null,
        payload.status,
        payload.notes || null,
        userId
      ]
    );

    // 2. Update term_offerings lesson count aggregate if applicable
    await pool.query(
      `UPDATE term_offerings
       SET lesson_count = (
         SELECT COUNT(*) FROM curriculum_coverage_log
         WHERE offering_id = $1 AND status = 'completed'
       ),
       updated_at = NOW()
       WHERE offering_id = $1`,
      [payload.offering_id]
    );

    // 3. Audit log
    await pool.query(
      `INSERT INTO academic_audit_logs (tenant_id, actor_id, action, entity, entity_id, new_values)
       VALUES ($1, $2, 'curriculum.topic_logged', 'curriculum_coverage_log', $3, $4)`,
      [
        tenantId,
        userId,
        payload.topic_id,
        JSON.stringify({ offering_id: payload.offering_id, status: payload.status, notes: payload.notes })
      ]
    );

    revalidatePath(`/${tenantSlug}/admin/academics/coverage`);
    revalidatePath(`/${tenantSlug}/teacher/coverage`);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: batchUpdateTopicProgress
// ─────────────────────────────────────────────────────────────

export async function batchUpdateTopicProgress(
  tenantSlug: string,
  offeringId: string,
  updates: Array<{ topic_id: string; status: TopicProgressStatus; notes?: string }>
): Promise<{ success: boolean; updatedCount: number; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    const userId = await resolveUserId();
    if (!tenantId) return { success: false, updatedCount: 0, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, updatedCount: 0, error: 'Database unavailable.' };

    for (const item of updates) {
      await pool.query(
        `INSERT INTO curriculum_coverage_log (
           offering_id, topic_id, status, notes, logged_by, logged_at
         ) VALUES (
           $1, $2, $3::topic_progress, $4, $5, NOW()
         )
         ON CONFLICT (offering_id, topic_id) DO UPDATE SET
           status = EXCLUDED.status,
           notes = COALESCE(EXCLUDED.notes, curriculum_coverage_log.notes),
           logged_by = EXCLUDED.logged_by,
           logged_at = NOW()`,
        [offeringId, item.topic_id, item.status, item.notes || null, userId]
      );
    }

    revalidatePath(`/${tenantSlug}/admin/academics/coverage`);
    revalidatePath(`/${tenantSlug}/teacher/coverage`);

    return { success: true, updatedCount: updates.length };
  } catch (err: any) {
    return { success: false, updatedCount: 0, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: seedSampleCurriculumCoverage
// ─────────────────────────────────────────────────────────────

export async function seedSampleCurriculumCoverage(
  tenantSlug: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, message: '', error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, message: '', error: 'Database unavailable.' };

    const yrRes = await pool.query(
      `SELECT id FROM academic_years WHERE tenant_id = $1 AND is_current = true LIMIT 1`,
      [tenantId]
    );
    if (yrRes.rows.length === 0) return { success: false, message: '', error: 'No active academic year found.' };
    const yearId = yrRes.rows[0].id;

    // Subjects and syllabi topic templates
    const syllabusTemplates = [
      {
        subjectCode: 'MTH-01',
        topics: [
          { title: 'Number Base Systems & Conversion', term: 1, sequence: 1, periods: 4, outcomes: ['Convert numbers between base 10 and other bases', 'Perform basic operations in binary and octal'] },
          { title: 'Modular Arithmetic & Applications', term: 1, sequence: 2, periods: 4, outcomes: ['Understand cyclic patterns and congruence', 'Solve real-world scheduling problems with clock arithmetic'] },
          { title: 'Indices, Logarithms & Surds', term: 1, sequence: 3, periods: 6, outcomes: ['Apply product and quotient laws of indices', 'Simplify compound surds with rationalized denominators'] },
          { title: 'Quadratic & Simultaneous Equations', term: 1, sequence: 4, periods: 6, outcomes: ['Solve quadratics via factorisation and formula', 'Solve simultaneous linear and non-linear systems'] },
          { title: 'Trigonometric Ratios & Angles of Elevation', term: 2, sequence: 5, periods: 5, outcomes: ['Compute sine, cosine, tangent for acute and obtuse angles', 'Calculate heights and distances using trigonometry'] },
          { title: 'Plane & Circle Geometry Theorems', term: 2, sequence: 6, periods: 6, outcomes: ['Prove angle at center is twice angle at circumference', 'Apply cyclic quadrilateral theorems'] },
          { title: 'Statistics: Measures of Dispersion', term: 3, sequence: 7, periods: 5, outcomes: ['Calculate variance and standard deviation from grouped data', 'Interpret ogives and cumulative frequency percentiles'] },
          { title: 'Theoretical & Experimental Probability', term: 3, sequence: 8, periods: 4, outcomes: ['Calculate compound event probabilities using tree diagrams', 'Understand mutually exclusive and independent events'] },
        ]
      },
      {
        subjectCode: 'BIO-01',
        topics: [
          { title: 'Cell Structure, Organelles & Microscopy', term: 1, sequence: 1, periods: 4, outcomes: ['Identify plant vs animal cell structures', 'Prepare temporary wet-mount slides of onion epidermis'] },
          { title: 'Cell Division: Mitosis & Meiosis', term: 1, sequence: 2, periods: 4, outcomes: ['Distinguish stages of mitosis under light microscope', 'Explain the significance of meiosis in gamete formation'] },
          { title: 'Nutrition in Autotrophs & Photosynthesis', term: 1, sequence: 3, periods: 5, outcomes: ['Describe light and dark stages of photosynthesis', 'Conduct starch test on variegated leaves'] },
          { title: 'Digestive Systems & Enzyme Catalysis', term: 1, sequence: 4, periods: 5, outcomes: ['Investigate effect of pH and temperature on salivary amylase', 'Trace digestion pathways in ruminants and humans'] },
          { title: 'Gaseous Exchange & Respiratory Mechanisms', term: 2, sequence: 5, periods: 4, outcomes: ['Compare respiratory surfaces in fish, insects, and mammals', 'Calculate vital capacity from spirometer traces'] },
          { title: 'Circulatory Systems & Blood Composition', term: 2, sequence: 6, periods: 5, outcomes: ['Identify cellular components of mammalian blood', 'Trace systemic and pulmonary double circulation routes'] },
          { title: 'Ecological Concepts & Biomes', term: 3, sequence: 7, periods: 4, outcomes: ['Construct food webs and trophic energy pyramids', 'Sample local habitats using line transects and quadrats'] },
        ]
      },
      {
        subjectCode: 'PHY-01',
        topics: [
          { title: 'Fundamental Units & Dimensional Analysis', term: 1, sequence: 1, periods: 3, outcomes: ['Derive dimensions of force, energy, and power', 'Use vernier calipers and micrometer screw gauge'] },
          { title: 'Kinematics: Linear Motion & Graphs', term: 1, sequence: 2, periods: 5, outcomes: ['Plot and interpret displacement-time and velocity-time graphs', 'Solve kinematic equations for free-falling bodies'] },
          { title: 'Newtonian Dynamics & Momentum', term: 1, sequence: 3, periods: 5, outcomes: ['State and apply Newton’s three laws of motion', 'Calculate impulse and conservation of linear momentum in collisions'] },
          { title: 'Work, Mechanical Energy & Power', term: 1, sequence: 4, periods: 4, outcomes: ['Apply work-energy theorem to inclined planes', 'Compute mechanical efficiency of pulley systems'] },
          { title: 'Heat Transfer, Expansion & Calorimetry', term: 2, sequence: 5, periods: 5, outcomes: ['Measure specific heat capacity of copper by electrical method', 'Explain latent heat of vaporisation in steam engines'] },
          { title: 'Geometric Optics: Reflection & Lenses', term: 2, sequence: 6, periods: 6, outcomes: ['Construct ray diagrams for concave and convex spherical mirrors', 'Determine focal length using illuminated cross-wire methods'] },
        ]
      },
      {
        subjectCode: 'ENG-01',
        topics: [
          { title: 'Expository & Argumentative Essays', term: 1, sequence: 1, periods: 5, outcomes: ['Structure balanced multi-paragraph arguments', 'Use transitional cohesive markers effectively'] },
          { title: 'Grammar: Complex Clauses & Synthesis', term: 1, sequence: 2, periods: 5, outcomes: ['Identify relative, noun, and adverbial clauses', 'Synthesize compound-complex sentences with varied voice'] },
          { title: 'Reading Comprehension & Summary Skills', term: 1, sequence: 3, periods: 5, outcomes: ['Extract main ideas and eliminate extraneous illustrations', 'Paraphrase dense analytical passages under word limits'] },
          { title: 'Phonetics: Vowel & Consonant Contrasts', term: 2, sequence: 4, periods: 4, outcomes: ['Transcribe minimal vowel pairs in standard West African English', 'Master syllable stress placement in multisyllabic words'] },
        ]
      }
    ];

    let createdTopicsCount = 0;
    let createdLogsCount = 0;

    for (const tmpl of syllabusTemplates) {
      // Find subject
      const subRes = await pool.query(
        `SELECT id FROM subjects WHERE tenant_id = $1 AND code = $2 LIMIT 1`,
        [tenantId, tmpl.subjectCode]
      );
      if (subRes.rows.length === 0) continue;
      const subjectId = subRes.rows[0].id;

      // Ensure curriculum version
      let cvId = (await pool.query(
        `SELECT id FROM curriculum_versions WHERE tenant_id = $1 AND subject_id = $2 AND academic_year_id = $3 LIMIT 1`,
        [tenantId, subjectId, yearId]
      )).rows[0]?.id;

      if (!cvId) {
        const cvIns = await pool.query(
          `INSERT INTO curriculum_versions (tenant_id, subject_id, academic_year_id, grade_level, version, version_label, status)
           VALUES ($1, $2, $3, 'SSS 1', 1, 'v2026.1', 'published')
           RETURNING id`,
          [tenantId, subjectId, yearId]
        );
        cvId = cvIns.rows[0].id;
      }

      // Find offerings for this subject
      const offerings = await pool.query(
        `SELECT id FROM subject_offerings WHERE tenant_id = $1 AND subject_id = $2 AND academic_year_id = $3`,
        [tenantId, subjectId, yearId]
      );

      // Link curriculum version to offering
      for (const off of offerings.rows) {
        await pool.query(
          `UPDATE subject_offerings SET curriculum_version_id = $1 WHERE id = $2`,
          [cvId, off.id]
        );
      }

      // Seed topics & outcomes
      for (const t of tmpl.topics) {
        let topicId = (await pool.query(
          `SELECT id FROM curriculum_topics WHERE curriculum_version_id = $1 AND title = $2 LIMIT 1`,
          [cvId, t.title]
        )).rows[0]?.id;

        if (!topicId) {
          const topIns = await pool.query(
            `INSERT INTO curriculum_topics (curriculum_version_id, title, sequence, term, estimated_periods)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [cvId, t.title, t.sequence, t.term, t.periods]
          );
          topicId = topIns.rows[0].id;
          createdTopicsCount++;

          // Insert learning outcomes
          for (let i = 0; i < t.outcomes.length; i++) {
            await pool.query(
              `INSERT INTO learning_outcomes (curriculum_version_id, topic_id, code, description, sequence)
               VALUES ($1, $2, $3, $4, $5)`,
              [cvId, topicId, `LO-${t.sequence}.${i + 1}`, t.outcomes[i], i + 1]
            );
          }
        }

        // Seed realistic coverage progress for the first offering
        if (offerings.rows.length > 0) {
          const targetOffId = offerings.rows[0].id;
          // E.g. Topic 1 and 2 completed, Topic 3 started
          let status: TopicProgressStatus = 'planned';
          let note = '';
          if (t.sequence === 1) {
            status = 'completed';
            note = 'Delivered foundational theory and lab exploration. Mastery demonstrated in quiz.';
          } else if (t.sequence === 2) {
            status = 'completed';
            note = 'Worked through textbook exercises and formative assessment.';
          } else if (t.sequence === 3) {
            status = 'started';
            note = 'Unit introduced this week; 2 periods remaining for practical sessions.';
          }

          if (status !== 'planned') {
            await pool.query(
              `INSERT INTO curriculum_coverage_log (offering_id, topic_id, status, notes, logged_at)
               VALUES ($1, $2, $3::topic_progress, $4, NOW() - INTERVAL '2 days')
               ON CONFLICT (offering_id, topic_id) DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes`,
              [targetOffId, topicId, status, note]
            );
            createdLogsCount++;
          }
        }
      }
    }

    revalidatePath(`/${tenantSlug}/admin/academics/coverage`);
    revalidatePath(`/${tenantSlug}/teacher/coverage`);

    return {
      success: true,
      message: `Curriculum topics seeded (${createdTopicsCount} new topics) with ${createdLogsCount} initial progress logs!`
    };
  } catch (err: any) {
    return { success: false, message: '', error: err.message };
  }
}
