/**
 * ============================================================================
 * TASK-0007 PHASE 3B — CANONICAL API AUTHORIZATION INTEGRATION TEST SUITE
 * Verifies End-to-End Route Handlers, Authoritative Resource Facts,
 * Gate 3B-01 through Gate 3B-08, Org-Admin Reach, and Tamper Resistance.
 * ============================================================================
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import {
  authorizeApiRequest,
  setTestClientOverride,
  resetTestClientOverride,
} from '../../src/lib/auth/api-guard';
import {
  resolveTrustedTenantTarget,
  resolveTrustedExamSessionTarget,
  resolveTrustedExamApprovalTarget,
  resolveTrustedSubjectOfferingTarget,
  resolveTrustedResourceTarget,
  isTrustedResourceTarget,
  ResourceNotFoundError,
  CrossTenantResourceMismatchError,
} from '../../src/lib/auth/resource-resolver';
import { GET as adminExamsGet, PATCH as adminExamsPatch } from '../../src/app/api/admin/exams/route';
import {
  GET as dashboardGet,
  POST as dashboardPost,
  PATCH as dashboardPatch,
} from '../../src/app/api/exam-office/dashboard/route';
import { GET as cassGet, POST as cassPost } from '../../src/app/api/cass-export/route';

// ---------------------------------------------------------------------------
// Mock Helpers & Fixtures
// ---------------------------------------------------------------------------

const TENANT_A_ID = '00000000-0000-4000-a000-000000000001';
const TENANT_B_ID = '00000000-0000-4000-a000-000000000002';
const ORG_PARENT_ID = '00000000-0000-4000-a000-000000000099';

function createMockSupabase(options: {
  userId?: string | null;
  profile?: any;
  tenants?: any[];
  examSessions?: any[];
  approvalRequests?: any[];
  subjectOfferings?: any[];
  staffAssignments?: any[];
  currentAcademicYearId?: string;
  orgSubtenants?: string[];
}) {
  const userId = options.userId === null ? null : (options.userId ?? 'user-1');
  const {
    profile = userId
      ? {
          id: userId,
          tenant_id: TENANT_A_ID,
          role: 'school_admin',
          email: 'admin@school-a.edu',
          full_name: 'School Admin A',
          is_active: true,
        }
      : null,
    tenants = [
      { id: TENANT_A_ID, slug: 'school-a', parent_id: ORG_PARENT_ID, type: 'school' },
      { id: TENANT_B_ID, slug: 'school-b', parent_id: null, type: 'school' },
      { id: ORG_PARENT_ID, slug: 'diocesan-board', parent_id: null, type: 'organization' },
    ],
    examSessions = [
      {
        id: 'session-101',
        tenant_id: TENANT_A_ID,
        academic_year_id: 'ay-2026-2027',
        status: 'Ongoing',
      },
      {
        id: 'session-201',
        tenant_id: TENANT_B_ID,
        academic_year_id: 'ay-2026-2027',
        status: 'Ongoing',
      },
    ],
    approvalRequests = [
      {
        id: 'req-101',
        tenant_id: TENANT_A_ID,
        requested_by: 'teacher-submitter',
        status: 'submitted',
      },
    ],
    subjectOfferings = [
      {
        id: 'offering-101',
        tenant_id: TENANT_A_ID,
        department_id: 'dept-sci',
        section_id: 'sec-sss1a',
      },
    ],
    staffAssignments = [],
    currentAcademicYearId = 'ay-2026-2027',
    orgSubtenants = [TENANT_A_ID],
  } = options;

  const mockClient: any = {
    auth: {
      getUser: async () => ({
        data: { user: userId ? { id: userId, email: profile?.email || 'user@test.edu' } : null },
        error: userId ? null : new Error('No session'),
      }),
    },
    from: (table: string) => {
      const builder: any = {
        _filters: [] as Array<{ col: string; val: any }>,
        select: function () {
          return builder;
        },
        eq: function (col: string, val: any) {
          builder._filters.push({ col, val });
          return builder;
        },
        or: function (condition: string) {
          builder._or = condition;
          return builder;
        },
        order: function () {
          return builder;
        },
        limit: function () {
          return builder;
        },
        range: function () {
          return builder;
        },
        single: async function () {
          const res = await builder._execute();
          return { data: res[0] || null, error: res[0] ? null : new Error('Not found') };
        },
        maybeSingle: async function () {
          const res = await builder._execute();
          return { data: res[0] || null, error: null };
        },
        then: function (resolve: (val: any) => any, reject?: (err: any) => any) {
          return builder._execute().then(
            (data: any) => resolve({ data, error: null }),
            (err: any) => (reject ? reject(err) : Promise.reject(err))
          );
        },
        _execute: async function () {
          if (table === 'profiles') {
            const match = builder._filters.find((f: any) => f.col === 'id');
            if (match && profile && profile.id === match.val) return [profile];
            return profile ? [profile] : [];
          }
          if (table === 'tenants') {
            if (builder._or) {
              const parts = builder._or.split(',');
              const idPart = parts.find((p: string) => p.startsWith('id.eq.'));
              const slugPart = parts.find((p: string) => p.startsWith('slug.eq.'));
              const targetId = idPart ? idPart.replace('id.eq.', '') : null;
              const targetSlug = slugPart ? slugPart.replace('slug.eq.', '') : null;
              return tenants.filter((t) => t.id === targetId || t.slug === targetSlug);
            }
            let res = tenants;
            for (const f of builder._filters) {
              res = res.filter((t) => t[f.col] === f.val);
            }
            return res;
          }
          if (table === 'exam_sessions') {
            let res = examSessions;
            for (const f of builder._filters) {
              res = res.filter((s) => s[f.col] === f.val);
            }
            return res;
          }
          if (table === 'approval_requests') {
            let res = approvalRequests;
            for (const f of builder._filters) {
              res = res.filter((a) => a[f.col] === f.val);
            }
            return res;
          }
          if (table === 'subject_offerings') {
            let res = subjectOfferings;
            for (const f of builder._filters) {
              res = res.filter((o) => o[f.col] === f.val);
            }
            return res;
          }
          if (table === 'teachers') {
            return profile ? [{ id: 'teacher-rec-1', profile_id: profile.id, tenant_id: profile.tenant_id }] : [];
          }
          if (table === 'school_staff_assignments') {
            return staffAssignments.map((a) => ({
              ...a,
              teacher_id: a.teacher_id || 'teacher-rec-1',
            }));
          }
          if (table === 'academic_years') {
            return currentAcademicYearId
              ? [{ id: currentAcademicYearId, is_current: true, status: 'active' }]
              : [];
          }
          if (table === 'student_parents') {
            return [];
          }
          if (table === 'applicants') {
            return [{ id: 'app-1', national_index_no: 'WAEC-001', first_name: 'John', last_name: 'Doe' }];
          }
          if (table === 'sl_cass_export_batches') {
            return [{ id: 'batch-1' }];
          }
          if (
            table === 'exam_results_approval' ||
            table === 'exam_malpractices' ||
            table === 'exam_appeals' ||
            table === 'exam_student_spotlights' ||
            table === 'exam_grade_distributions' ||
            table === 'exam_student_details' ||
            table === 'exam_subject_results' ||
            table === 'exam_subject_averages' ||
            table === 'exam_class_gender_counts'
          ) {
            return [];
          }
          return [];
        },
        insert: function () {
          return {
            select: () => ({
              single: async () => ({
                data: { id: 'new-id', status: 'Ongoing' },
                error: null,
              }),
            }),
          };
        },
        update: function (payload: any) {
          return {
            eq: () => ({
              eq: () => ({
                select: () => ({
                  single: async () => ({
                    data: { id: 'session-101', ...payload },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        },
      };
      return builder;
    },
    rpc: async (fn: string) => {
      if (fn === 'get_org_subtenant_ids') {
        return { data: orgSubtenants, error: null };
      }
      return { data: [], error: null };
    },
  };

  return mockClient;
}

function mockRequest(url: string, method: string = 'GET', body?: any): NextRequest {
  const init: any = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init);
}

// ---------------------------------------------------------------------------
// TEST SUITES
// ---------------------------------------------------------------------------

test('TASK-0007 Phase 3B: Resource Resolver & Construction Boundary', async (t) => {
  const supabase = createMockSupabase({});

  await t.test('RR-01: Resolves authoritative tenant facts from database with symbol brand', async () => {
    const target = await resolveTrustedTenantTarget(supabase, 'school-a');
    assert.strictEqual(target.tenantId, TENANT_A_ID);
    assert.strictEqual(isTrustedResourceTarget(target), true);
  });

  await t.test('RR-02: Resolves authoritative exam session facts without role checks', async () => {
    const target = await resolveTrustedExamSessionTarget(supabase, 'session-101');
    assert.strictEqual(target.tenantId, TENANT_A_ID);
    assert.strictEqual(target.stage, 'Ongoing');
    assert.strictEqual(isTrustedResourceTarget(target), true);
  });

  await t.test('RR-03: Non-existent exam session lookup throws ResourceNotFoundError (404)', async () => {
    await assert.rejects(
      async () => resolveTrustedExamSessionTarget(supabase, 'non-existent-session'),
      (err: any) => err instanceof ResourceNotFoundError && err.statusCode === 404
    );
  });

  await t.test('RR-04: Resolves approval request facts including submitterId and stage for SoD', async () => {
    const target = await resolveTrustedExamApprovalTarget(supabase, 'req-101');
    assert.strictEqual(target.tenantId, TENANT_A_ID);
    assert.strictEqual(target.submitterId, 'teacher-submitter');
    assert.strictEqual(target.stage, 'submitted');
    assert.strictEqual(isTrustedResourceTarget(target), true);
  });

  await t.test('RR-05: Raw unbranded dictionary is rejected by isTrustedResourceTarget guard', () => {
    const fakeTarget = { tenantId: TENANT_A_ID, stage: 'approved' };
    assert.strictEqual(isTrustedResourceTarget(fakeTarget), false);
  });
});

test('TASK-0007 Phase 3B: Gate 3B-08 Request-Scoped Lazy Admin Client', async (t) => {
  await t.test('AC-01: Admin client access throws if requested prior to authorization passing', async () => {
    const req = mockRequest('/api/admin/exams');
    const supabase = createMockSupabase({ userId: null }); // unauthenticated
    setTestClientOverride(supabase);

    const auth = await authorizeApiRequest(req, { permission: 'exams.sessions.manage' });
    assert.strictEqual(auth.ok, false);
    // In failure, adminClient is not even on the failure object
    assert.strictEqual('adminClient' in auth, false);
    resetTestClientOverride();
  });

  await t.test('AC-02: Admin client access succeeds when authorization passes and is request-scoped', async () => {
    const req = mockRequest('/api/admin/exams');
    let adminInstantiations = 0;
    const mockAdminFactory = () => {
      adminInstantiations++;
      return { from: () => ({ select: () => [] }) };
    };

    const supabase = createMockSupabase({
      profile: { id: 'admin-1', tenant_id: TENANT_A_ID, role: 'school_admin', is_active: true },
    });
    setTestClientOverride(supabase, mockAdminFactory);

    const auth = await authorizeApiRequest(req, {
      permission: 'exams.sessions.manage',
      requestedTenantSlug: 'school-a',
    });

    assert.strictEqual(auth.ok, true);
    if (auth.ok) {
      assert.strictEqual(adminInstantiations, 0); // Not called prematurely
      const client1 = auth.adminClient();
      assert.strictEqual(adminInstantiations, 1); // Called lazily on demand
      const client2 = auth.adminClient();
      assert.strictEqual(adminInstantiations, 1); // Memoized within request
      assert.strictEqual(client1, client2);
    }
    resetTestClientOverride();
  });
});

test('TASK-0007 Phase 3B: Supervisory Mandate 12 — Forged Authorization Fields Invariant', async (t) => {
  await t.test('FORGE-01: Client request payload containing forged tenantId, stage, submitterId does NOT alter authorization', async () => {
    // Database record for session-201 belongs to TENANT_B_ID.
    // Attacker is school_admin of TENANT_A_ID.
    // Attacker sends forged body: { id: 'session-201', tenantId: TENANT_A_ID, stage: 'approved' }
    const supabase = createMockSupabase({
      profile: { id: 'attacker', tenant_id: TENANT_A_ID, role: 'school_admin', is_active: true },
    });
    setTestClientOverride(supabase);

    const req = mockRequest('/api/admin/exams', 'PATCH', {
      id: 'session-201',
      tenantId: TENANT_A_ID, // Forged!
      stage: 'approved',     // Forged!
      submitterId: 'attacker',// Forged!
    });

    const res = await adminExamsPatch(req);
    const json = await res.json();

    // Must be DENIED because the database record for session-201 authoritatively belongs to Tenant B!
    assert.strictEqual(res.status, 403);
    assert.strictEqual(json.code, 'CROSS_TENANT_DENIED');
    resetTestClientOverride();
  });
});

test('TASK-0007 Phase 3B: Org-Admin Reach Preservation (Scope ≠ Reach)', async (t) => {
  await t.test('ORG-01: Org admin can manage exam session in authorized child school', async () => {
    // Org Admin belongs to ORG_PARENT_ID, whose subtenants include TENANT_A_ID
    const supabase = createMockSupabase({
      profile: { id: 'org-exec', tenant_id: ORG_PARENT_ID, role: 'org_admin', is_active: true },
      orgSubtenants: [TENANT_A_ID],
    });
    setTestClientOverride(supabase);

    const req = mockRequest('/api/admin/exams', 'PATCH', { id: 'session-101', status: 'Approved' });
    const res = await adminExamsPatch(req);
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    resetTestClientOverride();
  });

  await t.test('ORG-02: Org admin is DENIED access to foreign school outside their organization', async () => {
    // Org Admin belongs to ORG_PARENT_ID, whose subtenants DO NOT include TENANT_B_ID
    const supabase = createMockSupabase({
      profile: { id: 'org-exec', tenant_id: ORG_PARENT_ID, role: 'org_admin', is_active: true },
      orgSubtenants: [TENANT_A_ID], // Only Tenant A, not Tenant B
    });
    setTestClientOverride(supabase);

    const req = mockRequest('/api/admin/exams', 'PATCH', { id: 'session-201', status: 'Approved' });
    const res = await adminExamsPatch(req);
    const json = await res.json();

    assert.strictEqual(res.status, 403);
    assert.strictEqual(json.code, 'CROSS_TENANT_DENIED');
    resetTestClientOverride();
  });
});

test('TASK-0007 Phase 3B: Functional Assignment Lifecycle & Containment', async (t) => {
  await t.test('ASSIGN-01: Active exam_officer assignment can manage exam sessions', async () => {
    const supabase = createMockSupabase({
      profile: { id: 'teacher-officer', tenant_id: TENANT_A_ID, role: 'teacher', is_active: true },
      staffAssignments: [
        {
          id: 'asgn-1',
          assignment_type: 'exam_officer',
          tenant_id: TENANT_A_ID,
          academic_year_id: 'ay-2026-2027',
          status: 'active',
          is_active: true,
          effective_from: '2025-09-01',
          effective_until: '2027-08-31',
        },
      ],
    });
    setTestClientOverride(supabase);

    const req = mockRequest('/api/admin/exams', 'PATCH', { id: 'session-101', status: 'Approved' });
    const res = await adminExamsPatch(req);
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    resetTestClientOverride();
  });

  await t.test('ASSIGN-02: Expired exam_officer assignment is DENIED', async () => {
    const supabase = createMockSupabase({
      profile: { id: 'teacher-officer', tenant_id: TENANT_A_ID, role: 'teacher', is_active: true },
      staffAssignments: [
        {
          id: 'asgn-1',
          assignment_type: 'exam_officer',
          tenant_id: TENANT_A_ID,
          academic_year_id: 'ay-2026-2027',
          status: 'active',
          is_active: true,
          effective_from: '2024-09-01',
          effective_until: '2025-08-31', // Past date relative to simulation time
        },
      ],
    });
    setTestClientOverride(supabase);

    const req = mockRequest('/api/admin/exams', 'PATCH', { id: 'session-101', status: 'Approved' });
    const res = await adminExamsPatch(req);
    assert.strictEqual(res.status, 403);
    resetTestClientOverride();
  });

  await t.test('ASSIGN-03: Suspended exam_officer assignment is DENIED', async () => {
    const supabase = createMockSupabase({
      profile: { id: 'teacher-officer', tenant_id: TENANT_A_ID, role: 'teacher', is_active: true },
      staffAssignments: [
        {
          id: 'asgn-1',
          assignment_type: 'exam_officer',
          tenant_id: TENANT_A_ID,
          academic_year_id: 'ay-2026-2027',
          status: 'suspended', // Suspended
          is_active: false,
          effective_from: '2025-09-01',
          effective_until: '2027-08-31',
        },
      ],
    });
    setTestClientOverride(supabase);

    const req = mockRequest('/api/admin/exams', 'PATCH', { id: 'session-101', status: 'Approved' });
    const res = await adminExamsPatch(req);
    assert.strictEqual(res.status, 403);
    resetTestClientOverride();
  });

  await t.test('ASSIGN-04: Ordinary teacher without exam assignment is DENIED exams.sessions.manage', async () => {
    const supabase = createMockSupabase({
      profile: { id: 'teacher-ordinary', tenant_id: TENANT_A_ID, role: 'teacher', is_active: true },
      staffAssignments: [], // No exam officer assignment
    });
    setTestClientOverride(supabase);

    const req = mockRequest('/api/admin/exams', 'PATCH', { id: 'session-101', status: 'Approved' });
    const res = await adminExamsPatch(req);
    assert.strictEqual(res.status, 403);
    resetTestClientOverride();
  });
});

test('TASK-0007 Phase 3B: Route Handler Invocations (Cohort 1 Endpoints)', async (t) => {
  await t.test('ROUTE-01: /api/admin/exams GET succeeds for school_admin', async () => {
    const supabase = createMockSupabase({
      profile: { id: 'admin-1', tenant_id: TENANT_A_ID, role: 'school_admin', is_active: true },
    });
    setTestClientOverride(supabase);

    const req = mockRequest('/api/admin/exams?tenantSlug=school-a');
    const res = await adminExamsGet(req);
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.strictEqual(Array.isArray(json.data.sessions), true);
    resetTestClientOverride();
  });

  await t.test('ROUTE-02: /api/exam-office/dashboard GET succeeds for exam_officer', async () => {
    const supabase = createMockSupabase({
      profile: { id: 'officer-1', tenant_id: TENANT_A_ID, role: 'teacher', is_active: true },
      staffAssignments: [
        {
          id: 'asgn-1',
          assignment_type: 'exam_officer',
          tenant_id: TENANT_A_ID,
          academic_year_id: 'ay-2026-2027',
          status: 'active',
          is_active: true,
          effective_from: '2025-09-01',
          effective_until: '2027-08-31',
        },
      ],
    });
    setTestClientOverride(supabase);

    const req = mockRequest('/api/exam-office/dashboard?tenantSlug=school-a');
    const res = await dashboardGet(req);
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    resetTestClientOverride();
  });

  await t.test('ROUTE-03: /api/exam-office/dashboard POST creates session for authorized exam_officer', async () => {
    const supabase = createMockSupabase({
      profile: { id: 'officer-1', tenant_id: TENANT_A_ID, role: 'teacher', is_active: true },
      staffAssignments: [
        {
          id: 'asgn-1',
          assignment_type: 'exam_officer',
          tenant_id: TENANT_A_ID,
          academic_year_id: 'ay-2026-2027',
          status: 'active',
          is_active: true,
          effective_from: '2025-09-01',
          effective_until: '2027-08-31',
        },
      ],
    });
    setTestClientOverride(supabase);

    const req = mockRequest('/api/exam-office/dashboard', 'POST', {
      name: 'Mid-Term Exam',
      tenantSlug: 'school-a',
    });
    const res = await dashboardPost(req);
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    resetTestClientOverride();
  });

  await t.test('ROUTE-04: /api/exam-office/dashboard PATCH updates session for exam_officer', async () => {
    const supabase = createMockSupabase({
      profile: { id: 'officer-1', tenant_id: TENANT_A_ID, role: 'teacher', is_active: true },
      staffAssignments: [
        {
          id: 'asgn-1',
          assignment_type: 'exam_officer',
          tenant_id: TENANT_A_ID,
          academic_year_id: 'ay-2026-2027',
          status: 'active',
          is_active: true,
          effective_from: '2025-09-01',
          effective_until: '2027-08-31',
        },
      ],
    });
    setTestClientOverride(supabase);

    const req = mockRequest('/api/exam-office/dashboard', 'PATCH', {
      id: 'session-101',
      name: 'Updated Mid-Term Exam',
    });
    const res = await dashboardPatch(req);
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    resetTestClientOverride();
  });

  await t.test('ROUTE-05: /api/cass-export GET generates CASS export for exam_officer', async () => {
    const supabase = createMockSupabase({
      profile: { id: 'officer-1', tenant_id: TENANT_A_ID, role: 'teacher', is_active: true },
      staffAssignments: [
        {
          id: 'asgn-1',
          assignment_type: 'exam_officer',
          tenant_id: TENANT_A_ID,
          academic_year_id: 'ay-2026-2027',
          status: 'active',
          is_active: true,
          effective_from: '2025-09-01',
          effective_until: '2027-08-31',
        },
      ],
    });
    setTestClientOverride(supabase);

    const req = mockRequest('/api/cass-export?tenantSlug=school-a');
    const res = await cassGet(req);
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.candidateCount, 1);
    resetTestClientOverride();
  });

  await t.test('ROUTE-06: /api/cass-export GET is DENIED for student', async () => {
    const supabase = createMockSupabase({
      profile: { id: 'student-1', tenant_id: TENANT_A_ID, role: 'student', is_active: true },
    });
    setTestClientOverride(supabase);

    const req = mockRequest('/api/cass-export?tenantSlug=school-a');
    const res = await cassGet(req);
    assert.strictEqual(res.status, 403);
    resetTestClientOverride();
  });

  await t.test('ROUTE-07: /api/cass-export POST records export batch for school_admin', async () => {
    const supabase = createMockSupabase({
      profile: { id: 'admin-1', tenant_id: TENANT_A_ID, role: 'school_admin', is_active: true },
    });
    setTestClientOverride(supabase);

    const req = mockRequest('/api/cass-export', 'POST', {
      tenantSlug: 'school-a',
      schoolLevel: 'SSS',
      candidateCount: 45,
    });
    const res = await cassPost(req);
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    resetTestClientOverride();
  });

  await t.test('ROUTE-08: /api/cass-export POST is DENIED for parent', async () => {
    const supabase = createMockSupabase({
      profile: { id: 'parent-1', tenant_id: TENANT_A_ID, role: 'parent', is_active: true },
    });
    setTestClientOverride(supabase);

    const req = mockRequest('/api/cass-export', 'POST', {
      tenantSlug: 'school-a',
      candidateCount: 45,
    });
    const res = await cassPost(req);
    assert.strictEqual(res.status, 403);
    resetTestClientOverride();
  });
});
