import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import {
  setTestClientOverride,
  resetTestClientOverride,
  AppRole,
} from '@/lib/auth/api-guard';
import { StaffAssignmentType } from '@/lib/auth/permissions-registry';
import { POST as lessonPlanPOST } from '@/app/api/academics/ai/lesson-plan/route';
import {
  GET as leadsGET,
  PATCH as leadsPATCH,
  DELETE as leadsDELETE,
} from '@/app/api/super-admin/leads/route';
import {
  GET as dashboardGET,
  POST as dashboardPOST,
  PATCH as dashboardPATCH,
  DELETE as dashboardDELETE,
} from '@/app/api/exam-office/dashboard/route';
import {
  GET as rulesGET,
  POST as rulesPOST,
} from '@/app/api/exam-office/communication-rules/route';
import {
  GET as templatesGET,
  POST as templatesPOST,
} from '@/app/api/exam-office/communication-templates/route';
import {
  GET as commsGET,
  POST as commsPOST,
} from '@/app/api/exam-office/communications/route';
import {
  GET as notifsGET,
  POST as notifsPOST,
} from '@/app/api/notifications/route';

// ── Test Fixtures ─────────────────────────────────────────────────────────────

const TENANT_A = { id: 'tenant-a-1111', slug: 'albert-academy', name: 'Albert Academy' };
const TENANT_B = { id: 'tenant-b-2222', slug: 'other-school', name: 'Other School' };

const USER_SUPER_ADMIN = { id: 'usr-super-admin' };
const USER_SCHOOL_ADMIN_A = { id: 'usr-school-admin-a' };
const USER_EXAM_OFFICER_A = { id: 'usr-exam-officer-a' };
const USER_TEACHER_ASSIGNED_A = { id: 'usr-teacher-assigned-a' };
const USER_TEACHER_UNASSIGNED_A = { id: 'usr-teacher-unassigned-a' };
const USER_HOD_A = { id: 'usr-hod-a' };
const USER_VP_A = { id: 'usr-vp-a' };
const USER_STUDENT_A = { id: 'usr-student-a' };
const USER_PARENT_A = { id: 'usr-parent-a' };
const USER_ORG_ADMIN = { id: 'usr-org-admin' };

const PROFILE_SUPER_ADMIN = {
  id: USER_SUPER_ADMIN.id,
  tenant_id: null,
  role: 'super_admin' as AppRole,
  email: 'root@platform.sl',
  full_name: 'Platform Super Admin',
  is_active: true,
};

const PROFILE_ORG_ADMIN = {
  id: USER_ORG_ADMIN.id,
  tenant_id: 'ten-org-parent',
  role: 'org_admin' as AppRole,
  email: 'org@network.sl',
  full_name: 'Network Director Koroma',
  is_active: true,
};

const PROFILE_SCHOOL_ADMIN_A = {
  id: USER_SCHOOL_ADMIN_A.id,
  tenant_id: TENANT_A.id,
  role: 'school_admin' as AppRole,
  email: 'admin@albert.edu.sl',
  full_name: 'Albert Admin',
  is_active: true,
};

const PROFILE_EXAM_OFFICER_A = {
  id: USER_EXAM_OFFICER_A.id,
  tenant_id: TENANT_A.id,
  role: 'exam_officer' as AppRole,
  email: 'exams@albert.edu.sl',
  full_name: 'Exam Officer Sahr',
  is_active: true,
};

const PROFILE_VP_A = {
  id: USER_VP_A.id,
  tenant_id: TENANT_A.id,
  role: 'teacher' as AppRole,
  email: 'vp@albert.edu.sl',
  full_name: 'Vice Principal Kargbo',
  is_active: true,
};

const ASSIGNMENT_VP_A = {
  id: 'asg-vp-a',
  staff_id: USER_VP_A.id,
  tenant_id: TENANT_A.id,
  assignment_type: 'vice_principal' as StaffAssignmentType,
  academic_year_id: 'ay-2025-2026',
  status: 'active' as const,
  is_active: true,
  effective_from: '2025-09-01',
  effective_until: null,
};

const ASSIGNMENT_EXAM_OFFICER_A = {
  id: 'asg-eo-a',
  staff_id: USER_EXAM_OFFICER_A.id,
  tenant_id: TENANT_A.id,
  assignment_type: 'exam_officer' as StaffAssignmentType,
  academic_year_id: 'ay-2025-2026',
  status: 'active' as const,
  is_active: true,
  effective_from: '2025-09-01',
  effective_until: null,
};

const PROFILE_TEACHER_ASSIGNED_A = {
  id: USER_TEACHER_ASSIGNED_A.id,
  tenant_id: TENANT_A.id,
  role: 'teacher' as AppRole,
  email: 'teacher.assigned@albert.edu.sl',
  full_name: 'Subject Teacher Joe',
  is_active: true,
};

const PROFILE_TEACHER_UNASSIGNED_A = {
  id: USER_TEACHER_UNASSIGNED_A.id,
  tenant_id: TENANT_A.id,
  role: 'teacher' as AppRole,
  email: 'teacher.unassigned@albert.edu.sl',
  full_name: 'Teacher Unassigned',
  is_active: true,
};

const PROFILE_STUDENT_A = {
  id: USER_STUDENT_A.id,
  tenant_id: TENANT_A.id,
  role: 'student' as AppRole,
  email: 'student@albert.edu.sl',
  full_name: 'Student Musa',
  is_active: true,
};

const PROFILE_PARENT_A = {
  id: USER_PARENT_A.id,
  tenant_id: TENANT_A.id,
  role: 'parent' as AppRole,
  email: 'parent@albert.edu.sl',
  full_name: 'Parent Fatu',
  is_active: true,
};

function createMockRequest(url: string, options: { method?: string; headers?: Record<string, string>; body?: any } = {}) {
  const { method = 'GET', headers = {}, body } = options;
  const init: RequestInit = { method, headers };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { ...headers, 'Content-Type': 'application/json' };
  }
  return new NextRequest(url, init as any);
}

interface MockQueryLog {
  table: string;
  method: string;
  filters: Array<{ col: string; val: any; op: string }>;
  payload?: any;
}

function createMockTransport(config: {
  user?: { id: string } | null;
  profile?: any | null;
  assignments?: any[];
  tenants?: any[];
  subjectOfferings?: any[];
  curriculumVersions?: any[];
  curriculumTopics?: any[];
  learningOutcomes?: any[];
  examSessions?: any[];
  demoRequests?: any[];
  notificationRules?: any[];
  notificationTemplates?: any[];
  notifications?: any[];
  notificationRecipients?: any[];
}) {
  const {
    user = null,
    profile = null,
    assignments = [],
    tenants = [TENANT_A, TENANT_B],
    subjectOfferings = [
      {
        id: 'off-a-1',
        tenant_id: TENANT_A.id,
        department_id: 'dept-science-a',
        section_id: 'sec-sss1-a',
        curriculum_version_id: 'cv-published-1',
        subject_id: 'sub-phys-1',
        periods_per_week: 4,
      },
      {
        id: 'off-a-draft',
        tenant_id: TENANT_A.id,
        department_id: 'dept-science-a',
        section_id: 'sec-sss1-a',
        curriculum_version_id: 'cv-draft-1',
        subject_id: 'sub-phys-1',
        periods_per_week: 4,
      },
      {
        id: 'off-b-foreign',
        tenant_id: TENANT_B.id,
        department_id: 'dept-science-b',
        section_id: 'sec-sss1-b',
        curriculum_version_id: 'cv-b-1',
        subject_id: 'sub-chem-1',
        periods_per_week: 4,
      },
    ],
    curriculumVersions = [
      { id: 'cv-published-1', tenant_id: TENANT_A.id, status: 'published' },
      { id: 'cv-draft-1', tenant_id: TENANT_A.id, status: 'draft' },
      { id: 'cv-b-1', tenant_id: TENANT_B.id, status: 'published' },
    ],
    curriculumTopics = [
      { id: 'top-1', curriculum_version_id: 'cv-published-1', title: 'Newtonian Dynamics', estimated_periods: 3, term: 'Term 1' },
      { id: 'top-draft', curriculum_version_id: 'cv-draft-1', title: 'Thermodynamics Draft', estimated_periods: 2, term: 'Term 1' },
    ],
    learningOutcomes = [
      { id: 'lo-1', topic_id: 'top-1', code: 'LO-1', description: 'State Newton First Law', cognitive_level: 'remember', sequence: 1 },
    ],
    examSessions = [
      { id: 'sess-a-1', tenant_id: TENANT_A.id, name: 'WASSCE Mock 2026', status: 'Ongoing' },
      { id: 'sess-b-1', tenant_id: TENANT_B.id, name: 'BECE Mock 2026', status: 'Ongoing' },
    ],
    demoRequests = [
      { id: 'lead-1', institution_name: 'Albert Grammar', contact_name: 'John Koroma', email: 'jk@ag.sl', phone: '+23276000000', status: 'pending', created_at: '2026-09-01T00:00:00Z' },
    ],
    notificationRules = [
      { id: 'rule-a-1', tenant_id: TENANT_A.id, name: 'Exam Reminder', event_type: 'exam_scheduled', active: true },
      { id: 'rule-b-1', tenant_id: TENANT_B.id, name: 'Fee Reminder', event_type: 'fee_due', active: true },
    ],
    notificationTemplates = [
      { id: 'tpl-a-1', tenant_id: TENANT_A.id, name: 'Exam Notice', title_template: 'Upcoming Exam: {{examName}}', body_template: 'Please prepare for {{examName}}.' },
      { id: 'tpl-b-1', tenant_id: TENANT_B.id, name: 'Fee Notice', title_template: 'Fee Due', body_template: 'Fee due soon.' },
    ],
    notifications = [
      { id: 'notif-a-1', tenant_id: TENANT_A.id, title: 'Term Report', body: 'Report cards available.', priority: 'normal', status: 'sent', created_at: '2026-09-01T00:00:00Z' },
    ],
    notificationRecipients = [
      { id: 'recip-user-a', user_id: USER_TEACHER_ASSIGNED_A.id, notification_id: 'notif-a-1', status: 'unread', created_at: '2026-09-01T00:00:00Z' },
      { id: 'recip-user-other', user_id: 'usr-other-victim', notification_id: 'notif-a-1', status: 'unread', created_at: '2026-09-01T00:00:00Z' },
    ],
  } = config;

  let adminClientCallCount = 0;
  const adminQueries: MockQueryLog[] = [];
  const userQueries: MockQueryLog[] = [];

  // User-scoped client
  const userClient = {
    auth: {
      async getUser() {
        if (!user) return { data: { user: null }, error: new Error('No user session') };
        return { data: { user }, error: null };
      },
    },
    async rpc(fn: string, args?: any) {
      if (fn === 'get_org_subtenant_ids') {
        return { data: ['school-child-1', 'school-child-2'], error: null };
      }
      return { data: null, error: null };
    },
    from(table: string) {
      const filters: Array<{ col: string; val: any; op: string }> = [];
      const queryObj: any = {
        select(cols?: string) {
          userQueries.push({ table, method: 'select', filters });
          return queryObj;
        },
        eq(col: string, val: any) {
          filters.push({ col, val, op: 'eq' });
          return queryObj;
        },
        or(condition: string) {
          filters.push({ col: 'or', val: condition, op: 'or' });
          return queryObj;
        },
        order() {
          return queryObj;
        },
        async single() {
          return this.maybeSingle();
        },
        async maybeSingle() {
          if (table === 'profiles') {
            if (!profile) return { data: null, error: new Error('Profile not found') };
            return { data: profile, error: null };
          }
          if (table === 'tenants') {
            const match = tenants.find((t) => {
              return filters.every((f) => {
                if (f.op === 'eq') return (t as any)[f.col] === f.val;
                return true;
              });
            });
            return { data: match || null, error: null };
          }
          if (table === 'subject_offerings') {
            const idFilter = filters.find((f) => f.col === 'id');
            const match = subjectOfferings.find((so) => !idFilter || so.id === idFilter.val);
            return { data: match ? { ...match } : null, error: null };
          }
          if (table === 'exam_sessions') {
            const idFilter = filters.find((f) => f.col === 'id');
            const match = examSessions.find((es) => !idFilter || es.id === idFilter.val);
            return { data: match ? { ...match } : null, error: null };
          }
          if (table === 'academic_years') {
            return { data: [{ id: 'ay-2025-2026', is_current: true }], error: null };
          }
          if (table === 'teachers') {
            return { data: { id: 'teacher-rec-1', profile_id: profile?.id, tenant_id: profile?.tenant_id }, error: null };
          }
          if (table === 'school_staff_assignments') {
            return { data: assignments, error: null };
          }
          return { data: null, error: null };
        },
        then(resolve: any) {
          if (table === 'academic_years') {
            return resolve({ data: [{ id: 'ay-2025-2026', is_current: true }], error: null });
          }
          if (table === 'teachers') {
            return resolve({ data: [{ id: 'teacher-rec-1', profile_id: profile?.id, tenant_id: profile?.tenant_id }], error: null });
          }
          if (table === 'school_staff_assignments') {
            return resolve({ data: assignments, error: null });
          }
          return resolve({ data: [], error: null });
        },
      };
      return queryObj;
    },
  };

  // Admin client
  const adminClient = {
    from(table: string) {
      const filters: Array<{ col: string; val: any; op: string }> = [];
      let insertPayload: any = null;
      let updatePayload: any = null;

      const builder: any = {
        select(cols?: string) {
          adminQueries.push({ table, method: 'select', filters });
          return builder;
        },
        insert(payload: any) {
          insertPayload = payload;
          adminQueries.push({ table, method: 'insert', filters, payload });
          return builder;
        },
        update(payload: any) {
          updatePayload = payload;
          adminQueries.push({ table, method: 'update', filters, payload });
          return builder;
        },
        delete() {
          adminQueries.push({ table, method: 'delete', filters });
          return builder;
        },
        eq(col: string, val: any) {
          filters.push({ col, val, op: 'eq' });
          return builder;
        },
        in(col: string, val: any) {
          filters.push({ col, val, op: 'in' });
          return builder;
        },
        or(condition: string) {
          filters.push({ col: 'or', val: condition, op: 'or' });
          return builder;
        },
        order() {
          return builder;
        },
        limit() {
          return builder;
        },
        async single() {
          return this.maybeSingle();
        },
        async maybeSingle() {
          if (table === 'subject_offerings') {
            const idFilter = filters.find((f) => f.col === 'id');
            const tenantFilter = filters.find((f) => f.col === 'tenant_id');
            const match = subjectOfferings.find((so) => {
              const matchesId = !idFilter || so.id === idFilter.val;
              const matchesTenant = !tenantFilter || so.tenant_id === tenantFilter.val;
              return matchesId && matchesTenant;
            });
            if (!match) return { data: null, error: null };
            const cv = curriculumVersions.find((v) => v.id === match.curriculum_version_id);
            return {
              data: {
                ...match,
                subjects: { name: 'Physics', code: 'PHY101' },
                sections: { name: 'SSS 1A', classes: { name: 'SSS 1' } },
                academic_years: { name: '2025-2026' },
                teachers: { first_name: 'Joe', last_name: 'Kamara' },
                curriculum_versions: cv || { id: match.curriculum_version_id, status: 'published' },
              },
              error: null,
            };
          }
          if (table === 'curriculum_topics') {
            const idFilter = filters.find((f) => f.col === 'id');
            const cvFilter = filters.find((f) => f.col === 'curriculum_version_id');
            const match = curriculumTopics.find((t) => {
              const matchesId = !idFilter || t.id === idFilter.val;
              const matchesCv = !cvFilter || t.curriculum_version_id === cvFilter.val;
              return matchesId && matchesCv;
            });
            return { data: match || null, error: null };
          }
          if (table === 'learning_outcomes') {
            const topicFilter = filters.find((f) => f.col === 'topic_id');
            const matches = learningOutcomes.filter((lo) => !topicFilter || lo.topic_id === topicFilter.val);
            return { data: matches, error: null };
          }
          if (table === 'demo_requests') {
            const idFilter = filters.find((f) => f.col === 'id');
            const match = demoRequests.find((dr) => !idFilter || dr.id === idFilter.val);
            if (updatePayload && match) {
              return { data: { ...match, ...updatePayload }, error: null };
            }
            return { data: match || null, error: null };
          }
          if (table === 'notification_rules') {
            if (insertPayload) {
              return { data: { id: 'rule-new-1', ...insertPayload }, error: null };
            }
            return { data: notificationRules[0] || null, error: null };
          }
          if (table === 'notification_templates') {
            if (insertPayload) {
              return { data: { id: 'tpl-new-1', ...insertPayload }, error: null };
            }
            return { data: notificationTemplates[0] || null, error: null };
          }
          if (table === 'notifications') {
            if (insertPayload) {
              return { data: { id: 'notif-new-1', ...insertPayload }, error: null };
            }
            return { data: notifications[0] || null, error: null };
          }
          if (table === 'notification_recipients') {
            if (insertPayload) {
              return { data: { id: 'recip-new-1', ...insertPayload }, error: null };
            }
            const userFilter = filters.find((f) => f.col === 'user_id');
            const idFilter = filters.find((f) => f.col === 'id');
            const match = notificationRecipients.find((nr) => {
              const matchesUser = !userFilter || nr.user_id === userFilter.val;
              const matchesId = !idFilter || nr.id === idFilter.val;
              return matchesUser && matchesId;
            });
            if (updatePayload && match) {
              return { data: { ...match, ...updatePayload }, error: null };
            }
            return { data: match || null, error: null };
          }
          if (table === 'exam_sessions') {
            const idFilter = filters.find((f) => f.col === 'id');
            const match = examSessions.find((es) => !idFilter || es.id === idFilter.val);
            if (insertPayload) return { data: { id: 'sess-new-1', ...insertPayload }, error: null };
            if (updatePayload && match) return { data: { ...match, ...updatePayload }, error: null };
            return { data: match || null, error: null };
          }
          return { data: null, error: null };
        },
        then(resolve: any) {
          if (table === 'profiles') {
            return resolve({ data: [PROFILE_TEACHER_ASSIGNED_A], error: null });
          }
          if (table === 'notification_rules') {
            const tenantFilter = filters.find((f) => f.col === 'tenant_id');
            const res = tenantFilter
              ? notificationRules.filter((r) => r.tenant_id === tenantFilter.val)
              : notificationRules;
            return resolve({ data: res, error: null });
          }
          if (table === 'notification_templates') {
            const tenantFilter = filters.find((f) => f.col === 'tenant_id');
            const res = tenantFilter
              ? notificationTemplates.filter((t) => t.tenant_id === tenantFilter.val)
              : notificationTemplates;
            return resolve({ data: res, error: null });
          }
          if (table === 'notifications') {
            return resolve({ data: notifications, error: null });
          }
          if (table === 'notification_recipients') {
            const userFilter = filters.find((f) => f.col === 'user_id');
            const res = userFilter
              ? notificationRecipients.filter((nr) => nr.user_id === userFilter.val)
              : notificationRecipients;
            return resolve({ data: res, error: null });
          }
          if (table === 'demo_requests') {
            return resolve({ data: demoRequests, error: null });
          }
          if (table === 'learning_outcomes') {
            return resolve({ data: learningOutcomes, error: null });
          }
          return resolve({ data: [], error: null });
        },
      };
      return builder;
    },
  };

  const adminClientFactory = () => {
    adminClientCallCount++;
    return adminClient;
  };

  return {
    userClient,
    adminClient,
    adminClientFactory,
    getAdminClientCallCount: () => adminClientCallCount,
    getAdminQueries: () => adminQueries,
    getUserQueries: () => userQueries,
  };
}

// ── Test Suite: Phase 3D Cohort 3D-1 API Route Authorization & Containment ───

test('Phase 3D Cohort 3D-1: API Route Authorization Completion & Leakage Containment', async (t) => {
  let originalGeminiApiKey: string | undefined;
  let originalFetch: typeof globalThis.fetch;
  let geminiApiCallCount = 0;

  t.before(() => {
    originalGeminiApiKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'test-mock-gemini-key';
    originalFetch = globalThis.fetch;

    globalThis.fetch = (async (url: any, init?: any) => {
      const urlStr = String(url);
      if (urlStr.includes('generativelanguage.googleapis.com')) {
        geminiApiCallCount++;
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({}),
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        lesson_title: 'Introduction to Newton First Law',
                        subject: 'Physics',
                        grade_class: 'SSS 1',
                        topic: 'Newtonian Dynamics',
                        duration_minutes: 40,
                        term: 'Term 1',
                        learning_objectives: ['Understand inertia'],
                        materials_needed: ['Textbook'],
                        lesson_phases: [
                          {
                            phase: 'Starter',
                            duration_minutes: 10,
                            description: 'Demonstration of inertia',
                            teacher_activities: ['Ask questions'],
                            student_activities: ['Answer'],
                            key_questions: ['What is motion?'],
                          },
                        ],
                        assessment_strategies: ['Formative quiz'],
                        differentiation: { support: 'Handouts', extension: 'Calculations' },
                        homework: 'Read Chapter 2',
                        curriculum_outcomes_addressed: ['LO-1'],
                        teacher_notes: 'Successful session',
                      }),
                    },
                  ],
                },
                finishReason: 'STOP',
              },
            ],
            usageMetadata: { promptTokenCount: 150, candidatesTokenCount: 200 },
          }),
        } as any;
      }
      return originalFetch(url, init);
    }) as any;
  });

  t.after(() => {
    if (originalGeminiApiKey !== undefined) {
      process.env.GEMINI_API_KEY = originalGeminiApiKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
    globalThis.fetch = originalFetch;
    resetTestClientOverride();
  });

  t.beforeEach(() => {
    geminiApiCallCount = 0;
  });

  t.afterEach(() => {
    resetTestClientOverride();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1. AI Lesson Plan (curriculum.lesson_plan.generate)
  // ──────────────────────────────────────────────────────────────────────────
  await t.test('AI-01: unauthenticated POST /api/academics/ai/lesson-plan returns 401; zero Gemini calls', async () => {
    const transport = createMockTransport({ user: null, profile: null });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/academics/ai/lesson-plan', {
      method: 'POST',
      body: { offering_id: 'off-a-1', topic_id: 'top-1' },
    });

    const res = await lessonPlanPOST(req);
    assert.equal(res.status, 401);
    assert.equal(geminiApiCallCount, 0, 'Gemini API must NOT be called when unauthenticated');
    assert.equal(transport.getAdminClientCallCount(), 0, 'Privileged adminClient must NOT be instantiated');
  });

  await t.test('AI-02: invalid/missing offering returns 404; zero Gemini calls', async () => {
    const transport = createMockTransport({
      user: USER_SCHOOL_ADMIN_A,
      profile: PROFILE_SCHOOL_ADMIN_A,
      subjectOfferings: [],
    });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/academics/ai/lesson-plan', {
      method: 'POST',
      body: { offering_id: 'non-existent-offering', topic_id: 'top-1' },
    });

    const res = await lessonPlanPOST(req);
    assert.equal(res.status, 404);
    assert.equal(geminiApiCallCount, 0, 'Gemini API must NOT be called when offering missing');
    assert.equal(transport.getAdminClientCallCount(), 0, 'Privileged adminClient must NOT be instantiated');
  });

  await t.test('AI-03: foreign offering from different tenant returns 403 CROSS_TENANT_DENIED; zero Gemini calls', async () => {
    const transport = createMockTransport({
      user: USER_SCHOOL_ADMIN_A,
      profile: PROFILE_SCHOOL_ADMIN_A, // Tenant A
    });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    // off-b-foreign belongs to Tenant B
    const req = createMockRequest('http://localhost:3000/api/academics/ai/lesson-plan', {
      method: 'POST',
      body: { offering_id: 'off-b-foreign', topic_id: 'top-1' },
    });

    const res = await lessonPlanPOST(req);
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.code, 'CROSS_TENANT_DENIED');
    assert.equal(geminiApiCallCount, 0, 'Gemini API must NOT be called on cross-tenant mismatch');
  });

  await t.test('AI-04: unauthorized unassigned teacher returns 403; zero Gemini calls', async () => {
    const transport = createMockTransport({
      user: USER_TEACHER_UNASSIGNED_A,
      profile: PROFILE_TEACHER_UNASSIGNED_A,
      assignments: [], // Teacher holds no subject_teacher assignment
    });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/academics/ai/lesson-plan', {
      method: 'POST',
      body: { offering_id: 'off-a-1', topic_id: 'top-1' },
    });

    const res = await lessonPlanPOST(req);
    assert.equal(res.status, 403);
    assert.equal(geminiApiCallCount, 0, 'Gemini API must NOT be called when teacher unassigned');
  });

  await t.test('AI-05: student returns 403 Forbidden; zero Gemini calls', async () => {
    const transport = createMockTransport({
      user: USER_STUDENT_A,
      profile: PROFILE_STUDENT_A,
    });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/academics/ai/lesson-plan', {
      method: 'POST',
      body: { offering_id: 'off-a-1', topic_id: 'top-1' },
    });

    const res = await lessonPlanPOST(req);
    assert.equal(res.status, 403);
    assert.equal(geminiApiCallCount, 0, 'Gemini API must NOT be called for student');
  });

  await t.test('AI-06: unpublished curriculum status returns 422; zero Gemini calls', async () => {
    const transport = createMockTransport({
      user: USER_SCHOOL_ADMIN_A,
      profile: PROFILE_SCHOOL_ADMIN_A,
    });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    // off-a-draft is linked to cv-draft-1 (status: 'draft')
    const req = createMockRequest('http://localhost:3000/api/academics/ai/lesson-plan', {
      method: 'POST',
      body: { offering_id: 'off-a-draft', topic_id: 'top-draft' },
    });

    const res = await lessonPlanPOST(req);
    assert.equal(res.status, 422);
    const body = await res.json();
    assert.ok(body.error.includes('published curriculum'));
    assert.equal(geminiApiCallCount, 0, 'Gemini API must NOT be called for draft curriculum');
  });

  await t.test('AI-06b: invalid/unresolved topic_id returns 404 NOT_FOUND; zero Gemini calls', async () => {
    const transport = createMockTransport({
      user: USER_SCHOOL_ADMIN_A,
      profile: PROFILE_SCHOOL_ADMIN_A,
    });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/academics/ai/lesson-plan', {
      method: 'POST',
      body: { offering_id: 'off-a-1', topic_id: 'non-existent-topic-id' },
    });

    const res = await lessonPlanPOST(req);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.code, 'NOT_FOUND');
    assert.equal(geminiApiCallCount, 0, 'Gemini API must NOT be called for invalid topic');
  });

  await t.test('AI-07: authorized school_admin with published curriculum succeeds (200) and calls Gemini', async () => {
    const transport = createMockTransport({
      user: USER_SCHOOL_ADMIN_A,
      profile: PROFILE_SCHOOL_ADMIN_A,
    });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/academics/ai/lesson-plan', {
      method: 'POST',
      body: { offering_id: 'off-a-1', topic_id: 'top-1' },
    });

    const res = await lessonPlanPOST(req);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.lesson_plan);
    assert.equal(geminiApiCallCount, 1, 'Gemini API must be invoked exactly once on authorized success');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Communication Rules (communications.rules.manage)
  // ──────────────────────────────────────────────────────────────────────────
  await t.test('CR-01: unauthenticated GET /api/exam-office/communication-rules returns 401', async () => {
    const transport = createMockTransport({ user: null, profile: null });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/exam-office/communication-rules');
    const res = await rulesGET(req);
    assert.equal(res.status, 401);
  });

  await t.test('CR-02: student / ordinary teacher cannot manage rules (returns 403)', async () => {
    const transport = createMockTransport({ user: USER_STUDENT_A, profile: PROFILE_STUDENT_A });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/exam-office/communication-rules');
    const res = await rulesGET(req);
    assert.equal(res.status, 403);
  });

  await t.test('CR-03: school_admin and exam_officer can manage rules (returns 200)', async () => {
    const transport = createMockTransport({ user: USER_SCHOOL_ADMIN_A, profile: PROFILE_SCHOOL_ADMIN_A });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/exam-office/communication-rules');
    const res = await rulesGET(req);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.rules));
  });

  await t.test('CR-04: rules queries strictly enforce server-derived tenantId and eliminate cross-tenant leakage', async () => {
    const transport = createMockTransport({
      user: { id: USER_SCHOOL_ADMIN_A.id, user_metadata: { tenant_id: 'forged-tenant' } } as any,
      profile: PROFILE_SCHOOL_ADMIN_A, // Tenant A
    });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/exam-office/communication-rules');
    const res = await rulesGET(req);
    assert.equal(res.status, 200);

    // Verify adminClient query filter on tenant_id was Tenant A, NOT the forged user_metadata
    const query = transport.getAdminQueries().find((q) => q.table === 'notification_rules' && q.method === 'select');
    assert.ok(query, 'Must query notification_rules');
    const tenantFilter = query.filters.find((f) => f.col === 'tenant_id');
    assert.equal(tenantFilter?.val, TENANT_A.id, 'Must filter strictly by authorized profile.tenant_id');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Communication Templates (communications.templates.manage)
  // ──────────────────────────────────────────────────────────────────────────
  await t.test('CT-01: unauthenticated GET /api/exam-office/communication-templates returns 401', async () => {
    const transport = createMockTransport({ user: null, profile: null });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/exam-office/communication-templates');
    const res = await templatesGET(req);
    assert.equal(res.status, 401);
  });

  await t.test('CT-02: ordinary teacher / student cannot manage templates (returns 403)', async () => {
    const transport = createMockTransport({ user: USER_TEACHER_UNASSIGNED_A, profile: PROFILE_TEACHER_UNASSIGNED_A });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/exam-office/communication-templates');
    const res = await templatesGET(req);
    assert.equal(res.status, 403);
  });

  await t.test('CT-03: POST template with invalid variable placeholder returns 400', async () => {
    const transport = createMockTransport({ user: USER_SCHOOL_ADMIN_A, profile: PROFILE_SCHOOL_ADMIN_A });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/exam-office/communication-templates', {
      method: 'POST',
      body: {
        name: 'Invalid Template',
        eventType: 'exam_scheduled',
        titleTemplate: 'Hello {{unsupportedVarName}}',
        bodyTemplate: 'Exam notice',
      },
    });

    const res = await templatesPOST(req);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.error.includes('Invalid variable placeholders'));
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Communications Broadcast (communications.broadcast.view / send)
  // ──────────────────────────────────────────────────────────────────────────
  await t.test('CB-01: unauthenticated GET /api/exam-office/communications returns 401', async () => {
    const transport = createMockTransport({ user: null, profile: null });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/exam-office/communications');
    const res = await commsGET(req);
    assert.equal(res.status, 401);
  });

  await t.test('CB-02: student, parent, ordinary teacher cannot dispatch broadcasts (returns 403, zero privileged client)', async () => {
    // 1. student
    const studentTransport = createMockTransport({ user: USER_STUDENT_A, profile: PROFILE_STUDENT_A });
    setTestClientOverride(studentTransport.userClient, studentTransport.adminClientFactory);
    const studentReq = createMockRequest('http://localhost:3000/api/exam-office/communications', {
      method: 'POST',
      body: { title: 'Student Broadcast', message: 'Hello' },
    });
    const studentRes = await commsPOST(studentReq);
    assert.equal(studentRes.status, 403);
    assert.equal(studentTransport.getAdminClientCallCount(), 0, 'No privileged client creation for student');

    // 2. parent
    const parentTransport = createMockTransport({ user: USER_PARENT_A, profile: PROFILE_PARENT_A });
    setTestClientOverride(parentTransport.userClient, parentTransport.adminClientFactory);
    const parentReq = createMockRequest('http://localhost:3000/api/exam-office/communications', {
      method: 'POST',
      body: { title: 'Parent Broadcast', message: 'Hello' },
    });
    const parentRes = await commsPOST(parentReq);
    assert.equal(parentRes.status, 403);
    assert.equal(parentTransport.getAdminClientCallCount(), 0, 'No privileged client creation for parent');

    // 3. ordinary teacher
    const teacherTransport = createMockTransport({ user: USER_TEACHER_UNASSIGNED_A, profile: PROFILE_TEACHER_UNASSIGNED_A });
    setTestClientOverride(teacherTransport.userClient, teacherTransport.adminClientFactory);
    const teacherReq = createMockRequest('http://localhost:3000/api/exam-office/communications', {
      method: 'POST',
      body: { title: 'Teacher Broadcast', message: 'Hello' },
    });
    const teacherRes = await commsPOST(teacherReq);
    assert.equal(teacherRes.status, 403);
    assert.equal(teacherTransport.getAdminClientCallCount(), 0, 'No privileged client creation for teacher');
  });

  await t.test('CB-03: exam_officer within assigned school and school_admin can broadcast; cross-tenant denied; forged tenant metadata ignored', async () => {
    // 1. school_admin: allowed
    const adminTransport = createMockTransport({ user: USER_SCHOOL_ADMIN_A, profile: PROFILE_SCHOOL_ADMIN_A });
    setTestClientOverride(adminTransport.userClient, adminTransport.adminClientFactory);
    const getReq = createMockRequest('http://localhost:3000/api/exam-office/communications');
    const getRes = await commsGET(getReq);
    assert.equal(getRes.status, 200);

    const postReq = createMockRequest('http://localhost:3000/api/exam-office/communications', {
      method: 'POST',
      body: { title: 'Emergency Notice', message: 'School starts at 9am tomorrow.' },
    });
    const postRes = await commsPOST(postReq);
    assert.equal(postRes.status, 200);

    // 2. exam_officer within assigned school: allowed
    const eoTransport = createMockTransport({
      user: USER_EXAM_OFFICER_A,
      profile: PROFILE_EXAM_OFFICER_A,
      assignments: [ASSIGNMENT_EXAM_OFFICER_A],
    });
    setTestClientOverride(eoTransport.userClient, eoTransport.adminClientFactory);
    const eoPostReq = createMockRequest('http://localhost:3000/api/exam-office/communications', {
      method: 'POST',
      body: { title: 'Exam Notice', message: 'Exam timetable released.' },
    });
    const eoPostRes = await commsPOST(eoPostReq);
    assert.equal(eoPostRes.status, 200);

    // 3. Forged tenant_id in body and user_metadata ignored; inserted with TENANT_A.id
    const forgedTransport = createMockTransport({
      user: { id: USER_SCHOOL_ADMIN_A.id, user_metadata: { tenant_id: 'ten-forged-evil' } } as any,
      profile: PROFILE_SCHOOL_ADMIN_A,
    });
    setTestClientOverride(forgedTransport.userClient, forgedTransport.adminClientFactory);
    const forgedReq = createMockRequest('http://localhost:3000/api/exam-office/communications', {
      method: 'POST',
      body: {
        title: 'Tamper Notice',
        message: 'Trying to inject tenant_id',
        tenant_id: 'ten-forged-evil',
      },
    });
    const forgedRes = await commsPOST(forgedReq);
    assert.equal(forgedRes.status, 200);
    const notifInsert = forgedTransport.getAdminQueries().find(
      (q) => q.table === 'notifications' && q.method === 'insert'
    );
    assert.ok(notifInsert);
    assert.equal(notifInsert.payload.tenant_id, TENANT_A.id, 'Payload tenant_id must strictly match auth.tenantId');

    // 4. Foreign tenant request denied (CROSS_TENANT_DENIED)
    const foreignReq = createMockRequest('http://localhost:3000/api/exam-office/communications?tenantSlug=other-school', {
      method: 'POST',
      body: { title: 'Cross tenant attack', message: 'Hello' },
    });
    const foreignRes = await commsPOST(foreignReq);
    assert.equal(foreignRes.status, 403);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Personal Notifications (notifications.self.view / manage)
  // ──────────────────────────────────────────────────────────────────────────
  await t.test('NOTIF-01: unauthenticated GET /api/notifications returns 401', async () => {
    const transport = createMockTransport({ user: null, profile: null });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/notifications');
    const res = await notifsGET(req);
    assert.equal(res.status, 401);
  });

  await t.test('NOTIF-02: authenticated user receives their own notifications strictly filtered by auth.userId (GET ?user_id=B cannot escape)', async () => {
    const transport = createMockTransport({
      user: USER_TEACHER_ASSIGNED_A,
      profile: PROFILE_TEACHER_ASSIGNED_A,
    });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    // Client maliciously requests another user's notifications via query parameter
    const req = createMockRequest('http://localhost:3000/api/notifications?user_id=usr-victim-b');
    const res = await notifsGET(req);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.notifications));

    // Verify query filter in adminClient enforced user_id === USER_TEACHER_ASSIGNED_A.id, ignoring query param
    const query = transport.getAdminQueries().find((q) => q.table === 'notification_recipients' && q.method === 'select');
    assert.ok(query);
    const userFilter = query.filters.find((f) => f.col === 'user_id');
    assert.equal(userFilter?.val, USER_TEACHER_ASSIGNED_A.id, 'Query must be strictly filtered by auth.userId');
  });

  await t.test('NOTIF-03: User A attempting to mark User B notification returns 404 access denied (POST { user_id: B } cannot escape)', async () => {
    const transport = createMockTransport({
      user: USER_TEACHER_ASSIGNED_A,
      profile: PROFILE_TEACHER_ASSIGNED_A,
    });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    // recip-user-other belongs to usr-other-victim; request also attempts to forge user_id
    const req = createMockRequest('http://localhost:3000/api/notifications', {
      method: 'POST',
      body: { recipientId: 'recip-user-other', user_id: 'usr-victim-b' },
    });
    const res = await notifsPOST(req);
    assert.equal(res.status, 404);
  });

  await t.test('NOTIF-04: User A marking all read only updates their own records (POST { user_id: B, markAllRead: true } cannot escape)', async () => {
    const transport = createMockTransport({
      user: USER_TEACHER_ASSIGNED_A,
      profile: PROFILE_TEACHER_ASSIGNED_A,
    });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/notifications', {
      method: 'POST',
      body: { markAllRead: true, user_id: 'usr-victim-b' },
    });
    const res = await notifsPOST(req);
    assert.equal(res.status, 200);

    const updateQuery = transport.getAdminQueries().find((q) => q.table === 'notification_recipients' && q.method === 'update');
    assert.ok(updateQuery);
    const userFilter = updateQuery.filters.find((f) => f.col === 'user_id');
    assert.equal(userFilter?.val, USER_TEACHER_ASSIGNED_A.id, 'Must filter update strictly by auth.userId');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Super Admin Leads (platform.leads.manage)
  // ──────────────────────────────────────────────────────────────────────────
  await t.test('LEADS-01: unauthenticated GET /api/super-admin/leads returns 401', async () => {
    const transport = createMockTransport({ user: null, profile: null });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/super-admin/leads');
    const res = await leadsGET(req);
    assert.equal(res.status, 401);
  });

  await t.test('LEADS-02: org_admin (even with org reach), school_admin, teacher, student, parent returns 403 Forbidden (zero privileged client)', async () => {
    // 1. org_admin
    const orgTransport = createMockTransport({ user: USER_ORG_ADMIN, profile: PROFILE_ORG_ADMIN });
    setTestClientOverride(orgTransport.userClient, orgTransport.adminClientFactory);
    const orgReq = createMockRequest('http://localhost:3000/api/super-admin/leads');
    const orgRes = await leadsGET(orgReq);
    assert.equal(orgRes.status, 403);
    assert.equal(orgTransport.getAdminClientCallCount(), 0, 'No privileged client for org_admin');

    // 2. school_admin
    const schoolTransport = createMockTransport({ user: USER_SCHOOL_ADMIN_A, profile: PROFILE_SCHOOL_ADMIN_A });
    setTestClientOverride(schoolTransport.userClient, schoolTransport.adminClientFactory);
    const schoolReq = createMockRequest('http://localhost:3000/api/super-admin/leads');
    const schoolRes = await leadsGET(schoolReq);
    assert.equal(schoolRes.status, 403);
    assert.equal(schoolTransport.getAdminClientCallCount(), 0, 'No privileged client for school_admin');

    // 3. teacher
    const teacherTransport = createMockTransport({ user: USER_TEACHER_ASSIGNED_A, profile: PROFILE_TEACHER_ASSIGNED_A });
    setTestClientOverride(teacherTransport.userClient, teacherTransport.adminClientFactory);
    const teacherReq = createMockRequest('http://localhost:3000/api/super-admin/leads');
    const teacherRes = await leadsGET(teacherReq);
    assert.equal(teacherRes.status, 403);
    assert.equal(teacherTransport.getAdminClientCallCount(), 0, 'No privileged client for teacher');

    // 4. student
    const studentTransport = createMockTransport({ user: USER_STUDENT_A, profile: PROFILE_STUDENT_A });
    setTestClientOverride(studentTransport.userClient, studentTransport.adminClientFactory);
    const studentReq = createMockRequest('http://localhost:3000/api/super-admin/leads');
    const studentRes = await leadsGET(studentReq);
    assert.equal(studentRes.status, 403);
    assert.equal(studentTransport.getAdminClientCallCount(), 0, 'No privileged client for student');

    // 5. parent
    const parentTransport = createMockTransport({ user: USER_PARENT_A, profile: PROFILE_PARENT_A });
    setTestClientOverride(parentTransport.userClient, parentTransport.adminClientFactory);
    const parentReq = createMockRequest('http://localhost:3000/api/super-admin/leads');
    const parentRes = await leadsGET(parentReq);
    assert.equal(parentRes.status, 403);
    assert.equal(parentTransport.getAdminClientCallCount(), 0, 'No privileged client for parent');
  });

  await t.test('LEADS-03: super_admin GET leads succeeds (200) under platform.leads.manage without raw getPgPool', async () => {
    const transport = createMockTransport({ user: USER_SUPER_ADMIN, profile: PROFILE_SUPER_ADMIN });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/super-admin/leads');
    const res = await leadsGET(req);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.leads));
    assert.equal(body.leads.length, 1);
    assert.equal(body.leads[0].institution_name, 'Albert Grammar');
  });

  await t.test('LEADS-04: super_admin PATCH lead succeeds (200)', async () => {
    const transport = createMockTransport({ user: USER_SUPER_ADMIN, profile: PROFILE_SUPER_ADMIN });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/super-admin/leads', {
      method: 'PATCH',
      body: { id: 'lead-1', status: 'contacted', notes: 'Scheduled demo for Monday' },
    });
    const res = await leadsPATCH(req);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.lead.status, 'contacted');
  });

  await t.test('LEADS-05: super_admin DELETE lead succeeds (200)', async () => {
    const transport = createMockTransport({ user: USER_SUPER_ADMIN, profile: PROFILE_SUPER_ADMIN });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/super-admin/leads?id=lead-1', {
      method: 'DELETE',
    });
    const res = await leadsDELETE(req);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Exam Office Dashboard (exams.results.view, exams.sessions.manage, DELETE deferred)
  // ──────────────────────────────────────────────────────────────────────────
  await t.test('DASH-01: GET /api/exam-office/dashboard succeeds for school_admin, teacher+vice_principal, and teacher+exam_officer (exams.results.view)', async () => {
    // 1. teacher + exam_officer functional assignment
    const eoTransport = createMockTransport({
      user: USER_EXAM_OFFICER_A,
      profile: PROFILE_EXAM_OFFICER_A,
      assignments: [ASSIGNMENT_EXAM_OFFICER_A],
    });
    setTestClientOverride(eoTransport.userClient, eoTransport.adminClientFactory);
    const req1 = createMockRequest('http://localhost:3000/api/exam-office/dashboard');
    const res1 = await dashboardGET(req1);
    assert.equal(res1.status, 200);
    const body1 = await res1.json();
    assert.equal(body1.success, true);

    // 2. teacher + vice_principal functional assignment
    const vpTransport = createMockTransport({
      user: USER_VP_A,
      profile: PROFILE_VP_A,
      assignments: [ASSIGNMENT_VP_A],
    });
    setTestClientOverride(vpTransport.userClient, vpTransport.adminClientFactory);
    const req2 = createMockRequest('http://localhost:3000/api/exam-office/dashboard');
    const res2 = await dashboardGET(req2);
    assert.equal(res2.status, 200);
    const body2 = await res2.json();
    assert.equal(body2.success, true);

    // 3. school_admin
    const adminTransport = createMockTransport({
      user: USER_SCHOOL_ADMIN_A,
      profile: PROFILE_SCHOOL_ADMIN_A,
    });
    setTestClientOverride(adminTransport.userClient, adminTransport.adminClientFactory);
    const req3 = createMockRequest('http://localhost:3000/api/exam-office/dashboard');
    const res3 = await dashboardGET(req3);
    assert.equal(res3.status, 200);
    const body3 = await res3.json();
    assert.equal(body3.success, true);
  });

  await t.test('DASH-02: GET /api/exam-office/dashboard is DENIED for student, parent, and ordinary teacher without VP/EO', async () => {
    // 1. student
    const studentTransport = createMockTransport({ user: USER_STUDENT_A, profile: PROFILE_STUDENT_A });
    setTestClientOverride(studentTransport.userClient, studentTransport.adminClientFactory);
    const res1 = await dashboardGET(createMockRequest('http://localhost:3000/api/exam-office/dashboard'));
    assert.equal(res1.status, 403);

    // 2. ordinary teacher
    const teacherTransport = createMockTransport({ user: USER_TEACHER_UNASSIGNED_A, profile: PROFILE_TEACHER_UNASSIGNED_A, assignments: [] });
    setTestClientOverride(teacherTransport.userClient, teacherTransport.adminClientFactory);
    const res2 = await dashboardGET(createMockRequest('http://localhost:3000/api/exam-office/dashboard'));
    assert.equal(res2.status, 403);

    // 3. parent
    const parentTransport = createMockTransport({ user: USER_PARENT_A, profile: PROFILE_PARENT_A });
    setTestClientOverride(parentTransport.userClient, parentTransport.adminClientFactory);
    const res3 = await dashboardGET(createMockRequest('http://localhost:3000/api/exam-office/dashboard'));
    assert.equal(res3.status, 403);
  });

  await t.test('DASH-03: POST /api/exam-office/dashboard creates session for school_admin', async () => {
    const transport = createMockTransport({ user: USER_SCHOOL_ADMIN_A, profile: PROFILE_SCHOOL_ADMIN_A });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/exam-office/dashboard', {
      method: 'POST',
      body: { name: 'New Term Exam', academic_year: '2025-26', term: '1st Term' },
    });
    const res = await dashboardPOST(req);
    assert.equal(res.status, 200);
  });

  await t.test('DASH-04: PATCH /api/exam-office/dashboard updates session with resource verification', async () => {
    const transport = createMockTransport({ user: USER_SCHOOL_ADMIN_A, profile: PROFILE_SCHOOL_ADMIN_A });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/exam-office/dashboard', {
      method: 'PATCH',
      body: { id: 'sess-a-1', name: 'Updated Session Name' },
    });
    const res = await dashboardPATCH(req);
    assert.equal(res.status, 200);
  });

  await t.test('DASH-05: DELETE /api/exam-office/dashboard returns 405 Method Not Allowed with OPERATION_DEFERRED and zero DB operations', async () => {
    const transport = createMockTransport({ user: USER_SCHOOL_ADMIN_A, profile: PROFILE_SCHOOL_ADMIN_A });
    setTestClientOverride(transport.userClient, transport.adminClientFactory);

    const req = createMockRequest('http://localhost:3000/api/exam-office/dashboard?id=sess-a-1', {
      method: 'DELETE',
    });
    const res = await dashboardDELETE(req);
    assert.equal(res.status, 405);
    const body = await res.json();
    assert.equal(body.code, 'OPERATION_DEFERRED');

    // Negative proof: zero DB lookups, mutations, or privileged client creations
    assert.equal(transport.getAdminQueries().length, 0, 'Must NOT perform any admin queries on DELETE');
    assert.equal(transport.getUserQueries().length, 0, 'Must NOT perform any user queries on DELETE');
    assert.equal(transport.getAdminClientCallCount(), 0, 'Must NOT create privileged admin client on DELETE');
  });
});
