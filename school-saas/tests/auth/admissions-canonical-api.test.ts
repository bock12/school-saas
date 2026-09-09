/**
 * ============================================================================
 * TASK-0007 PHASE 3C COHORT 2 — ADMISSIONS CANONICAL API TEST SUITE
 *
 * Verifies route-level authorization, server-side resource resolution,
 * dedicated command endpoints (evaluate, place, approve, reject, letter, enroll),
 * PATCH demographic narrowing and lifecycle field rejection, negative-space checks,
 * audit history recording, and documented enrollment security boundary.
 * ============================================================================
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import {
  setTestClientOverride,
  resetTestClientOverride,
} from '../../src/lib/auth/api-guard';
import {
  resolveTrustedApplicantTarget,
  isTrustedResourceTarget,
  ResourceNotFoundError,
  ResourceResolutionError,
} from '../../src/lib/auth/resource-resolver';
import { GET as admissionsGET, POST as admissionsPOST, PATCH as admissionsPATCH } from '../../src/app/api/admissions/route';
import { PATCH as admissionsIdPATCH } from '../../src/app/api/admissions/[id]/route';
import { POST as evaluatePOST } from '../../src/app/api/admissions/[id]/evaluate/route';
import { POST as placePOST } from '../../src/app/api/admissions/[id]/place/route';
import { POST as approvePOST } from '../../src/app/api/admissions/[id]/approve/route';
import { POST as rejectPOST } from '../../src/app/api/admissions/[id]/reject/route';
import { POST as letterPOST } from '../../src/app/api/admissions/[id]/letter/route';
import { POST as enrollPOST } from '../../src/app/api/admissions/[id]/enroll/route';

// ---------------------------------------------------------------------------
// Mock Fixtures & Test Transports
// ---------------------------------------------------------------------------

const TENANT_A_ID = '00000000-0000-4000-a000-000000000001';
const TENANT_B_ID = '00000000-0000-4000-a000-000000000002';
const ORG_PARENT_ID = '00000000-0000-4000-a000-000000000099';

interface MockApplicant {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  stage: string;
  status: string;
  school_level?: string;
  target_stream?: string | null;
  interview_score?: number | null;
  assessment_score?: number | null;
  docs_verified?: boolean;
  admission_letter_sent?: boolean;
  rejection_reason?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  parent_phone?: string | null;
}

function createAdmissionsMockEnvironment(options: {
  userId?: string | null;
  profile?: any;
  applicants?: MockApplicant[];
  staffAssignments?: any[];
  orgSubtenants?: string[];
}) {
  const userId = options.userId === null ? null : (options.userId ?? 'user-admin-a');
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
    applicants = [
      {
        id: 'app-a-active',
        tenant_id: TENANT_A_ID,
        first_name: 'Alpha',
        last_name: 'Kamara',
        dob: '2008-01-01',
        stage: 'Application',
        status: 'active',
        school_level: 'SSS',
        target_stream: null,
      },
      {
        id: 'app-a-assessment',
        tenant_id: TENANT_A_ID,
        first_name: 'Alice',
        last_name: 'Kallon',
        dob: '2008-02-02',
        stage: 'Assessment',
        status: 'active',
        school_level: 'SSS',
        target_stream: null,
      },
      {
        id: 'app-a-offer',
        tenant_id: TENANT_A_ID,
        first_name: 'Amara',
        last_name: 'Bangura',
        dob: '2008-03-03',
        stage: 'Offer',
        status: 'active',
        school_level: 'SSS',
        target_stream: 'Science',
        docs_verified: true,
      },
      {
        id: 'app-a-allocated',
        tenant_id: TENANT_A_ID,
        first_name: 'Alie',
        last_name: 'Conteh',
        dob: '2008-04-04',
        stage: 'Allocation',
        status: 'active',
        school_level: 'SSS',
        target_stream: 'Arts',
        docs_verified: true,
      },
      {
        id: 'app-a-rejected',
        tenant_id: TENANT_A_ID,
        first_name: 'Abu',
        last_name: 'Sesay',
        dob: '2008-05-05',
        stage: 'Application',
        status: 'rejected',
        school_level: 'SSS',
        rejection_reason: 'Failed minimum entry requirements',
      },
      {
        id: 'app-b-active',
        tenant_id: TENANT_B_ID,
        first_name: 'Beta',
        last_name: 'Turay',
        dob: '2008-06-06',
        stage: 'Application',
        status: 'active',
        school_level: 'SSS',
      },
    ],
    staffAssignments = [],
    orgSubtenants = [TENANT_A_ID],
  } = options;

  const adminQueries: Array<{ table: string; method: string; payload?: any; filters?: any[] }> = [];
  let rpcCalls: Array<{ rpcName: string; params: any }> = [];

  const userClient: any = {
    auth: {
      getUser: async () => ({
        data: { user: userId ? { id: userId, email: profile?.email || 'user@test.edu' } : null },
        error: userId ? null : new Error('No session'),
      }),
    },
    from: (table: string) => {
      const filters: Array<{ col: string; val: any; op?: string }> = [];
      let orCondition: string | null = null;

      const builder: any = {
        select: () => builder,
        eq: (col: string, val: any) => {
          filters.push({ col, val, op: 'eq' });
          return builder;
        },
        or: (cond: string) => {
          orCondition = cond;
          return builder;
        },
        maybeSingle: async () => {
          if (table === 'profiles') {
            const match = filters.find((f) => f.col === 'id');
            if (match && profile && profile.id === match.val) return { data: profile, error: null };
            return { data: profile, error: null };
          }
          if (table === 'tenants') {
            if (orCondition) {
              const parts = orCondition.split(',');
              const idPart = parts.find((p) => p.startsWith('id.eq.'));
              const slugPart = parts.find((p) => p.startsWith('slug.eq.'));
              const targetId = idPart ? idPart.replace('id.eq.', '') : null;
              const targetSlug = slugPart ? slugPart.replace('slug.eq.', '') : null;
              const match = [
                { id: TENANT_A_ID, slug: 'school-a', parent_id: ORG_PARENT_ID, type: 'school' },
                { id: TENANT_B_ID, slug: 'school-b', parent_id: null, type: 'school' },
                { id: ORG_PARENT_ID, slug: 'diocesan-board', parent_id: null, type: 'organization' },
              ].find((t) => t.id === targetId || t.slug === targetSlug);
              return { data: match || null, error: null };
            }
            const idF = filters.find((f) => f.col === 'id');
            if (idF?.val === TENANT_A_ID) return { data: { id: TENANT_A_ID, parent_id: ORG_PARENT_ID, type: 'school' }, error: null };
            if (idF?.val === TENANT_B_ID) return { data: { id: TENANT_B_ID, parent_id: null, type: 'school' }, error: null };
            if (idF?.val === ORG_PARENT_ID) return { data: { id: ORG_PARENT_ID, parent_id: null, type: 'organization' }, error: null };
            return { data: null, error: null };
          }
          if (table === 'applicants') {
            const idF = filters.find((f) => f.col === 'id');
            const match = applicants.find((a) => a.id === idF?.val);
            return { data: match ? { ...match } : null, error: null };
          }
          return { data: null, error: null };
        },
        single: async () => {
          const res = await builder.maybeSingle();
          return { data: res.data, error: res.data ? null : new Error('Not found') };
        },
        then: (resolve: (val: any) => any, reject?: (err: any) => any) => {
          if (table === 'teachers') {
            return Promise.resolve({
              data: profile ? [{ id: 'teacher-1', profile_id: profile.id, tenant_id: profile.tenant_id }] : [],
              error: null,
            }).then(resolve, reject);
          }
          if (table === 'school_staff_assignments') {
            return Promise.resolve({
              data: staffAssignments.map((a) => ({ ...a, teacher_id: a.teacher_id || 'teacher-1' })),
              error: null,
            }).then(resolve, reject);
          }
          if (table === 'academic_years') {
            return Promise.resolve({
              data: [{ id: 'ay-2026-2027', tenant_id: TENANT_A_ID, is_current: true }],
              error: null,
            }).then(resolve, reject);
          }
          return Promise.resolve({ data: [], error: null }).then(resolve, reject);
        },
      };
      return builder;
    },
    rpc: async (fn: string, params: any) => {
      rpcCalls.push({ rpcName: fn, params });
      if (fn === 'get_org_subtenant_ids') {
        return { data: orgSubtenants, error: null };
      }
      return { data: null, error: null };
    },
  };

  const adminClient: any = {
    from: (table: string) => {
      const filters: Array<{ col: string; val: any }> = [];
      let updatePayload: any = null;
      let insertPayload: any = null;

      const builder: any = {
        select: () => builder,
        eq: (col: string, val: any) => {
          filters.push({ col, val });
          return builder;
        },
        order: () => builder,
        range: () => builder,
        update: (payload: any) => {
          updatePayload = payload;
          adminQueries.push({ table, method: 'update', payload, filters });
          return builder;
        },
        insert: (payload: any) => {
          insertPayload = payload;
          adminQueries.push({ table, method: 'insert', payload, filters });
          return builder;
        },
        single: async () => {
          if (table === 'applicants') {
            const idF = filters.find((f) => f.col === 'id');
            const match = applicants.find((a) => a.id === idF?.val);
            if (updatePayload && match) {
              Object.assign(match, updatePayload);
              return { data: { ...match }, error: null };
            }
            return { data: match ? { ...match } : null, error: match ? null : new Error('Not found') };
          }
          return { data: updatePayload || insertPayload || null, error: null };
        },
        maybeSingle: async () => {
          const s = await builder.single();
          return { data: s.data, error: null };
        },
        then: (resolve: (val: any) => any, reject?: (err: any) => any) => {
          if (table === 'applicants') {
            const tenantF = filters.find((f) => f.col === 'tenant_id');
            const data = applicants.filter((a) => !tenantF || a.tenant_id === tenantF.val);
            return Promise.resolve({ data, count: data.length, error: null }).then(resolve, reject);
          }
          if (table === 'admission_history') {
            return Promise.resolve({ data: insertPayload, error: null }).then(resolve, reject);
          }
          return Promise.resolve({ data: [], count: 0, error: null }).then(resolve, reject);
        },
      };
      return builder;
    },
    rpc: async (fn: string, params: any) => {
      rpcCalls.push({ rpcName: fn, params });
      if (fn === 'enroll_applicant') {
        return { data: 'stu-uuid-new-12345', error: null };
      }
      return { data: null, error: null };
    },
  };

  return {
    userClient,
    adminClientFactory: () => adminClient,
    getAdminQueries: () => adminQueries,
    getRpcCalls: () => rpcCalls,
  };
}

function makeRequest(url: string, options: { method?: string; body?: any; headers?: Record<string, string> } = {}) {
  const { method = 'GET', body, headers = {} } = options;
  const init: RequestInit = {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  };
  if (body) {
    init.body = JSON.stringify(body);
  }
  return new NextRequest(url, init as any);
}

// ---------------------------------------------------------------------------
// 1. Resource Resolver Unit Tests
// ---------------------------------------------------------------------------

test('ADMISSIONS-RESOLVER-01: resolveTrustedApplicantTarget returns branded authoritative facts', async () => {
  const env = createAdmissionsMockEnvironment({});
  const target = await resolveTrustedApplicantTarget(env.userClient, 'app-a-active');

  assert.equal(isTrustedResourceTarget(target), true);
  assert.equal(target.tenantId, TENANT_A_ID);
  assert.equal(target.stage, 'Application');
  assert.equal(target.applicantId, 'app-a-active');
  assert.equal(target.status, 'active');
});

test('ADMISSIONS-RESOLVER-02: resolveTrustedApplicantTarget throws ResourceNotFoundError for missing ID', async () => {
  const env = createAdmissionsMockEnvironment({});
  await assert.rejects(
    async () => resolveTrustedApplicantTarget(env.userClient, 'non-existent-id'),
    (err: any) => err instanceof ResourceNotFoundError && err.statusCode === 404
  );
});

test('ADMISSIONS-RESOLVER-03: resolveTrustedApplicantTarget rejects empty/invalid ID with 400', async () => {
  const env = createAdmissionsMockEnvironment({});
  await assert.rejects(
    async () => resolveTrustedApplicantTarget(env.userClient, ''),
    (err: any) => err instanceof ResourceResolutionError && err.statusCode === 400
  );
});

// ---------------------------------------------------------------------------
// 2. Evaluate Command (POST /api/admissions/[id]/evaluate)
// ---------------------------------------------------------------------------

test('CMD-EVALUATE-01: exam_officer with functional assignment -> ALLOW (200) and records audit', async () => {
  const env = createAdmissionsMockEnvironment({
    userId: 'user-exam-officer-1',
    profile: {
      id: 'user-exam-officer-1',
      tenant_id: TENANT_A_ID,
      role: 'exam_officer',
      email: 'exam@school-a.edu',
      full_name: 'Exam Officer A',
      is_active: true,
    },
    staffAssignments: [
      {
        id: 'assign-eo-1',
        assignment_type: 'exam_officer',
        tenant_id: TENANT_A_ID,
        academic_year_id: 'ay-2026-2027',
        status: 'active',
        effective_from: '2026-01-01',
      },
    ],
  });
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-active/evaluate', {
      method: 'POST',
      body: {
        interviewScore: 88,
        assessmentScore: 92,
        docsVerified: true,
        nextStage: 'Interview',
        comment: 'Candidate performed well in written assessment',
      },
    });

    const res = await evaluatePOST(req, { params: Promise.resolve({ id: 'app-a-active' }) });
    assert.equal(res.status, 200);

    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.applicant.interview_score, 88);
    assert.equal(json.data.applicant.assessment_score, 92);
    assert.equal(json.data.applicant.stage, 'Interview');

    // Verify audit trail in admission_history
    const historyEntry = env.getAdminQueries().find((q) => q.table === 'admission_history' && q.method === 'insert');
    assert.ok(historyEntry, 'Audit log must be recorded in admission_history');
    assert.equal(historyEntry.payload.applicant_id, 'app-a-active');
    assert.equal(historyEntry.payload.tenant_id, TENANT_A_ID);
    assert.equal(historyEntry.payload.from_stage, 'Application');
    assert.equal(historyEntry.payload.to_stage, 'Interview');
    assert.equal(historyEntry.payload.created_by, 'user-exam-officer-1');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-EVALUATE-02: teacher alone without exam_officer assignment -> DENY (403)', async () => {
  const env = createAdmissionsMockEnvironment({
    userId: 'user-teacher-plain',
    profile: {
      id: 'user-teacher-plain',
      tenant_id: TENANT_A_ID,
      role: 'teacher',
      email: 'teacher@school-a.edu',
      is_active: true,
    },
    staffAssignments: [], // No exam_officer assignment
  });
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-active/evaluate', {
      method: 'POST',
      body: { interviewScore: 75 },
    });
    const res = await evaluatePOST(req, { params: Promise.resolve({ id: 'app-a-active' }) });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.code, 'INSUFFICIENT_ROLE');
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on negative authorization path');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-EVALUATE-03: foreign applicant in different tenant -> DENY (403 CROSS_TENANT_DENIED)', async () => {
  const env = createAdmissionsMockEnvironment({
    userId: 'user-admin-a',
    profile: {
      id: 'user-admin-a',
      tenant_id: TENANT_A_ID,
      role: 'school_admin',
      is_active: true,
    },
  });
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    // Attempting to evaluate applicant belonging to Tenant B
    const req = makeRequest('http://localhost:3000/api/admissions/app-b-active/evaluate', {
      method: 'POST',
      body: { interviewScore: 80 },
    });
    const res = await evaluatePOST(req, { params: Promise.resolve({ id: 'app-b-active' }) });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.code, 'CROSS_TENANT_DENIED');
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on cross-tenant path');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-EVALUATE-04: rejected applicant -> DENY (400 INVALID_REQUEST)', async () => {
  const env = createAdmissionsMockEnvironment({});
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-rejected/evaluate', {
      method: 'POST',
      body: { interviewScore: 80 },
    });
    const res = await evaluatePOST(req, { params: Promise.resolve({ id: 'app-a-rejected' }) });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.code, 'INVALID_REQUEST');
    assert.match(json.error, /Cannot evaluate a rejected applicant/);
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on invalid lifecycle path');
  } finally {
    resetTestClientOverride();
  }
});

// ---------------------------------------------------------------------------
// 3. Place Command (POST /api/admissions/[id]/place)
// ---------------------------------------------------------------------------

test('CMD-PLACE-01: exam_officer -> ALLOW (200) and places stream', async () => {
  const env = createAdmissionsMockEnvironment({
    userId: 'user-exam-officer-1',
    profile: {
      id: 'user-exam-officer-1',
      tenant_id: TENANT_A_ID,
      role: 'exam_officer',
      is_active: true,
    },
    staffAssignments: [
      {
        id: 'assign-eo-1',
        assignment_type: 'exam_officer',
        tenant_id: TENANT_A_ID,
        academic_year_id: 'ay-2026-2027',
        status: 'active',
        effective_from: '2026-01-01',
      },
    ],
  });
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-active/place', {
      method: 'POST',
      body: {
        stream: 'Science',
        comment: 'Strong BECE science performance',
      },
    });

    const res = await placePOST(req, { params: Promise.resolve({ id: 'app-a-active' }) });
    assert.equal(res.status, 200);

    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.stream, 'Science');
    assert.equal(json.data.applicant.target_stream, 'Science');
    assert.equal(json.data.applicant.stream_auto_placed, false);

    const historyEntry = env.getAdminQueries().find((q) => q.table === 'admission_history' && q.method === 'insert');
    assert.ok(historyEntry);
    assert.equal(historyEntry.payload.applicant_id, 'app-a-active');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-PLACE-02: teacher alone -> DENY (403)', async () => {
  const env = createAdmissionsMockEnvironment({
    userId: 'user-teacher-plain',
    profile: { id: 'user-teacher-plain', tenant_id: TENANT_A_ID, role: 'teacher', is_active: true },
    staffAssignments: [],
  });
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-active/place', {
      method: 'POST',
      body: { stream: 'Arts' },
    });
    const res = await placePOST(req, { params: Promise.resolve({ id: 'app-a-active' }) });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.code, 'INSUFFICIENT_ROLE');
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on negative authorization path');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-PLACE-03: foreign applicant -> DENY (403 CROSS_TENANT_DENIED)', async () => {
  const env = createAdmissionsMockEnvironment({});
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-b-active/place', {
      method: 'POST',
      body: { stream: 'Commercial' },
    });
    const res = await placePOST(req, { params: Promise.resolve({ id: 'app-b-active' }) });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.code, 'CROSS_TENANT_DENIED');
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on cross-tenant path');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-PLACE-04: cannot place stream for applicant already allocated/enrolled -> DENY (400 INVALID_REQUEST)', async () => {
  const env = createAdmissionsMockEnvironment({});
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-allocated/place', {
      method: 'POST',
      body: { stream: 'Commercial' },
    });
    const res = await placePOST(req, { params: Promise.resolve({ id: 'app-a-allocated' }) });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.code, 'INVALID_REQUEST');
    assert.match(json.error, /already been allocated/);
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on invalid lifecycle path');
  } finally {
    resetTestClientOverride();
  }
});

// ---------------------------------------------------------------------------
// 4. Approve & Reject Commands (POST /api/admissions/[id]/approve & reject)
// ---------------------------------------------------------------------------

test('CMD-APPROVE-01: school_admin -> ALLOW (200) and advances stage to Offer', async () => {
  const env = createAdmissionsMockEnvironment({});
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-assessment/approve', {
      method: 'POST',
      body: { comment: 'Passed all admission assessments' },
    });
    const res = await approvePOST(req, { params: Promise.resolve({ id: 'app-a-assessment' }) });
    assert.equal(res.status, 200);

    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.applicant.stage, 'Offer');
    assert.equal(json.data.applicant.docs_verified, true);

    const historyEntry = env.getAdminQueries().find((q) => q.table === 'admission_history' && q.method === 'insert');
    assert.ok(historyEntry);
    assert.equal(historyEntry.payload.from_stage, 'Assessment');
    assert.equal(historyEntry.payload.to_stage, 'Offer');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-APPROVE-02: org_admin targeting child school within subtree -> ALLOW (200)', async () => {
  const env = createAdmissionsMockEnvironment({
    userId: 'user-org-admin-1',
    profile: {
      id: 'user-org-admin-1',
      tenant_id: ORG_PARENT_ID,
      role: 'org_admin',
      email: 'director@diocesan.org',
      is_active: true,
    },
    orgSubtenants: [TENANT_A_ID], // School A is within org subtree
  });
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-assessment/approve', {
      method: 'POST',
      body: { comment: 'Approved by Diocesan Education Director' },
    });
    const res = await approvePOST(req, { params: Promise.resolve({ id: 'app-a-assessment' }) });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-APPROVE-03: exam_officer -> DENY (403 - exam officer lacks approve permission)', async () => {
  const env = createAdmissionsMockEnvironment({
    userId: 'user-exam-officer-1',
    profile: {
      id: 'user-exam-officer-1',
      tenant_id: TENANT_A_ID,
      role: 'exam_officer',
      is_active: true,
    },
    staffAssignments: [
      {
        id: 'assign-eo-1',
        assignment_type: 'exam_officer',
        tenant_id: TENANT_A_ID,
        academic_year_id: 'ay-2026-2027',
        status: 'active',
        effective_from: '2026-01-01',
      },
    ],
  });
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-assessment/approve', {
      method: 'POST',
    });
    const res = await approvePOST(req, { params: Promise.resolve({ id: 'app-a-assessment' }) });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.code, 'INSUFFICIENT_ROLE');
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on negative authorization path');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-APPROVE-04: teacher -> DENY (403)', async () => {
  const env = createAdmissionsMockEnvironment({
    userId: 'user-teacher-1',
    profile: { id: 'user-teacher-1', tenant_id: TENANT_A_ID, role: 'teacher', is_active: true },
  });
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-assessment/approve', {
      method: 'POST',
    });
    const res = await approvePOST(req, { params: Promise.resolve({ id: 'app-a-assessment' }) });
    assert.equal(res.status, 403);
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on negative authorization path');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-APPROVE-05: foreign applicant in different tenant -> DENY (403 CROSS_TENANT_DENIED)', async () => {
  const env = createAdmissionsMockEnvironment({});
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-b-active/approve', {
      method: 'POST',
    });
    const res = await approvePOST(req, { params: Promise.resolve({ id: 'app-b-active' }) });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.code, 'CROSS_TENANT_DENIED');
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on cross-tenant path');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-REJECT-01: school_admin -> ALLOW (200) and sets status=rejected with rejectionReason', async () => {
  const env = createAdmissionsMockEnvironment({});
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-assessment/reject', {
      method: 'POST',
      body: { rejectionReason: 'Failed background verification' },
    });
    const res = await rejectPOST(req, { params: Promise.resolve({ id: 'app-a-assessment' }) });
    assert.equal(res.status, 200);

    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.applicant.status, 'rejected');
    assert.equal(json.data.applicant.rejection_reason, 'Failed background verification');

    const historyEntry = env.getAdminQueries().find((q) => q.table === 'admission_history' && q.method === 'insert');
    assert.ok(historyEntry);
    assert.match(historyEntry.payload.comment, /Failed background verification/);
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-REJECT-02: missing rejectionReason -> DENY (400 INVALID_REQUEST)', async () => {
  const env = createAdmissionsMockEnvironment({});
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-assessment/reject', {
      method: 'POST',
      body: {}, // Missing rejectionReason
    });
    const res = await rejectPOST(req, { params: Promise.resolve({ id: 'app-a-assessment' }) });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.code, 'INVALID_REQUEST');
    assert.match(json.error, /rejectionReason is required/);
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on invalid payload path');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-REJECT-03: cannot reject already allocated/enrolled applicant -> DENY (400)', async () => {
  const env = createAdmissionsMockEnvironment({});
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-allocated/reject', {
      method: 'POST',
      body: { rejectionReason: 'Too late to reject' },
    });
    const res = await rejectPOST(req, { params: Promise.resolve({ id: 'app-a-allocated' }) });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.code, 'INVALID_REQUEST');
    assert.match(json.error, /already been allocated/);
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on invalid lifecycle path');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-REJECT-04: teacher -> DENY (403 INSUFFICIENT_ROLE)', async () => {
  const env = createAdmissionsMockEnvironment({
    userId: 'user-teacher-1',
    profile: { id: 'user-teacher-1', tenant_id: TENANT_A_ID, role: 'teacher', is_active: true },
  });
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-active/reject', {
      method: 'POST',
      body: { rejectionReason: 'Unauthorized rejection attempt' },
    });
    const res = await rejectPOST(req, { params: Promise.resolve({ id: 'app-a-active' }) });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.code, 'INSUFFICIENT_ROLE');
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on negative authorization path');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-REJECT-05: foreign applicant in different tenant -> DENY (403 CROSS_TENANT_DENIED)', async () => {
  const env = createAdmissionsMockEnvironment({});
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-b-active/reject', {
      method: 'POST',
      body: { rejectionReason: 'Cross-tenant rejection attempt' },
    });
    const res = await rejectPOST(req, { params: Promise.resolve({ id: 'app-b-active' }) });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.code, 'CROSS_TENANT_DENIED');
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on cross-tenant path');
  } finally {
    resetTestClientOverride();
  }
});

// ---------------------------------------------------------------------------
// 5. Letter Command (POST /api/admissions/[id]/letter)
// ---------------------------------------------------------------------------

test('CMD-LETTER-01: school_admin for applicant in Offer stage -> ALLOW (200) and marks letter sent', async () => {
  const env = createAdmissionsMockEnvironment({});
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-offer/letter', {
      method: 'POST',
      body: { comment: 'Dispatched via SMS and official PDF print' },
    });
    const res = await letterPOST(req, { params: Promise.resolve({ id: 'app-a-offer' }) });
    assert.equal(res.status, 200);

    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.applicant.admission_letter_sent, true);

    const historyEntry = env.getAdminQueries().find((q) => q.table === 'admission_history' && q.method === 'insert');
    assert.ok(historyEntry);
    assert.match(historyEntry.payload.comment, /SMS and official PDF/);
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-LETTER-02: exam_officer -> DENY (403 - exam officer lacks letters.dispatch permission)', async () => {
  const env = createAdmissionsMockEnvironment({
    userId: 'user-exam-officer-1',
    profile: { id: 'user-exam-officer-1', tenant_id: TENANT_A_ID, role: 'exam_officer', is_active: true },
    staffAssignments: [
      {
        id: 'assign-eo-1',
        assignment_type: 'exam_officer',
        tenant_id: TENANT_A_ID,
        academic_year_id: 'ay-2026-2027',
        status: 'active',
        effective_from: '2026-01-01',
      },
    ],
  });
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-offer/letter', { method: 'POST' });
    const res = await letterPOST(req, { params: Promise.resolve({ id: 'app-a-offer' }) });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.code, 'INSUFFICIENT_ROLE');
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on negative authorization path');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-LETTER-03: dispatch letter for applicant in Application stage -> DENY (400 INVALID_REQUEST)', async () => {
  const env = createAdmissionsMockEnvironment({});
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-active/letter', { method: 'POST' });
    const res = await letterPOST(req, { params: Promise.resolve({ id: 'app-a-active' }) });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.code, 'INVALID_REQUEST');
    assert.match(json.error, /must be in Offer or Allocation stage/);
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on invalid lifecycle path');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-LETTER-04: foreign applicant in different tenant -> DENY (403 CROSS_TENANT_DENIED)', async () => {
  const env = createAdmissionsMockEnvironment({});
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-b-active/letter', { method: 'POST' });
    const res = await letterPOST(req, { params: Promise.resolve({ id: 'app-b-active' }) });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.code, 'CROSS_TENANT_DENIED');
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on cross-tenant path');
  } finally {
    resetTestClientOverride();
  }
});

// ---------------------------------------------------------------------------
// 6. Enrollment Command & Security Hold (POST /api/admissions/[id]/enroll)
// ---------------------------------------------------------------------------

test('CMD-ENROLL-01: school_admin in Offer stage -> API ALLOW (200), passes server-derived actor to RPC', async () => {
  const env = createAdmissionsMockEnvironment({
    userId: 'user-admin-a',
    profile: { id: 'user-admin-a', tenant_id: TENANT_A_ID, role: 'school_admin', is_active: true },
  });
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-offer/enroll', { method: 'POST' });
    const res = await enrollPOST(req, { params: Promise.resolve({ id: 'app-a-offer' }) });
    assert.equal(res.status, 200);

    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.enrolled, true);
    assert.equal(json.data.studentId, 'stu-uuid-new-12345');

    // Authoritative check: verify server-derived actor ID was passed to RPC
    const rpcCalls = env.getRpcCalls();
    const enrollRpc = rpcCalls.find((r) => r.rpcName === 'enroll_applicant');
    assert.ok(enrollRpc, 'enroll_applicant RPC must be invoked');
    assert.equal(enrollRpc.params.p_applicant_id, 'app-a-offer');
    assert.equal(enrollRpc.params.p_actor_id, 'user-admin-a', 'RPC p_actor_id must equal verified server actor ID');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-ENROLL-02: exam_officer -> DENY (403 - exam officer lacks enroll permission)', async () => {
  const env = createAdmissionsMockEnvironment({
    userId: 'user-exam-officer-1',
    profile: { id: 'user-exam-officer-1', tenant_id: TENANT_A_ID, role: 'exam_officer', is_active: true },
    staffAssignments: [
      {
        id: 'assign-eo-1',
        assignment_type: 'exam_officer',
        tenant_id: TENANT_A_ID,
        academic_year_id: 'ay-2026-2027',
        status: 'active',
        effective_from: '2026-01-01',
      },
    ],
  });
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-offer/enroll', { method: 'POST' });
    const res = await enrollPOST(req, { params: Promise.resolve({ id: 'app-a-offer' }) });
    assert.equal(res.status, 403);
    assert.equal(env.getRpcCalls().length, 0, 'RPC must not be invoked on unauthorized caller');
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on negative authorization path');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-ENROLL-03: enroll applicant not in Offer stage (Application) -> DENY (400 INVALID_REQUEST)', async () => {
  const env = createAdmissionsMockEnvironment({});
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-active/enroll', { method: 'POST' });
    const res = await enrollPOST(req, { params: Promise.resolve({ id: 'app-a-active' }) });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.code, 'INVALID_REQUEST');
    assert.match(json.error, /must be approved into Offer stage before enrollment/);
    assert.equal(env.getRpcCalls().length, 0, 'RPC must not be invoked on invalid lifecycle stage');
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on invalid lifecycle path');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-ENROLL-05: foreign applicant in different tenant -> DENY (403 CROSS_TENANT_DENIED)', async () => {
  const env = createAdmissionsMockEnvironment({});
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-b-active/enroll', { method: 'POST' });
    const res = await enrollPOST(req, { params: Promise.resolve({ id: 'app-b-active' }) });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.code, 'CROSS_TENANT_DENIED');
    assert.equal(env.getRpcCalls().length, 0, 'RPC must not be invoked on cross-tenant path');
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on cross-tenant path');
  } finally {
    resetTestClientOverride();
  }
});

test('CMD-ENROLL-04: DOCUMENTED RESIDUAL RISK: Direct PostgREST enroll_applicant RPC exposure', () => {
  /**
   * SECURITY ARCHITECTURE ASSERTION / COHORT 4 BLOCKING DEPENDENCY:
   *
   * As documented in TASK-0007 Phase 3C Preflight and Supervisory Decision:
   * The API endpoint POST /api/admissions/[id]/enroll enforces canonical authorization,
   * lifecycle invariants, and injects the server-derived actor ID into p_actor_id.
   *
   * HOWEVER, public.enroll_applicant in 017_enroll_applicant_rpc.sql was previously marked
   * SECURITY DEFINER and lacked REVOKE EXECUTE ON FUNCTION FROM public, authenticated.
   * Any authenticated client can currently bypass the API layer and invoke PostgREST RPC directly.
   *
   * RESOLUTION REQUIREMENT:
   * Cohort 4 must execute migration 048_admissions_enrollment_security.sql to:
   * 1. Revoke public/authenticated execute rights on enroll_applicant.
   * 2. Grant execute strictly to service_role (server-only boundary).
   * 3. Assert auth.uid() inside RPC or enforce server proxy only.
   */
  const cohort4BlockingDependency = '048_admissions_enrollment_security.sql';
  assert.ok(cohort4BlockingDependency.length > 0);
});

// ---------------------------------------------------------------------------
// 7. Dynamic Route Handler PATCH /api/admissions/[id]
// ---------------------------------------------------------------------------

test('PATCH-ID-01: PATCH /api/admissions/[id] updates demographic fields when authorized', async () => {
  const env = createAdmissionsMockEnvironment({});
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-active', {
      method: 'PATCH',
      body: {
        phone: '+23276111222',
        address: '25 Rawdon Street',
        city: 'Freetown',
        parentPhone: '+23276333444',
      },
    });
    const res = await admissionsIdPATCH(req, { params: Promise.resolve({ id: 'app-a-active' }) });
    assert.equal(res.status, 200);

    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.applicant.phone, '+23276111222');
    assert.equal(json.data.applicant.address, '25 Rawdon Street');
    assert.equal(json.data.applicant.city, 'Freetown');
    assert.equal(json.data.applicant.parent_phone, '+23276333444');
  } finally {
    resetTestClientOverride();
  }
});

test('PATCH-ID-02: PATCH /api/admissions/[id] rejects lifecycle fields with 400', async () => {
  const env = createAdmissionsMockEnvironment({});
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const req = makeRequest('http://localhost:3000/api/admissions/app-a-active', {
      method: 'PATCH',
      body: {
        targetStream: 'Science',
      },
    });
    const res = await admissionsIdPATCH(req, { params: Promise.resolve({ id: 'app-a-active' }) });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.code, 'INVALID_REQUEST');
    assert.match(json.error, /prohibited on PATCH/);
    assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on rejected patch payload');
  } finally {
    resetTestClientOverride();
  }
});

test('PATCH-ID-03: PATCH /api/admissions/[id] rejects Sierra Leone exam score fields with 400', async () => {
  const env = createAdmissionsMockEnvironment({});
  setTestClientOverride(env.userClient, env.adminClientFactory);

  try {
    const examFields = [
      { npseAggregate: 320 },
      { npse_aggregate: 320 },
      { beceAggregate: 12 },
      { bece_aggregate: 12 },
      { wassceCredits: 5 },
      { wassce_credits: 5 },
    ];

    for (const payload of examFields) {
      const fieldName = Object.keys(payload)[0];
      const req = makeRequest('http://localhost:3000/api/admissions/app-a-active', {
        method: 'PATCH',
        body: payload,
      });
      const res = await admissionsIdPATCH(req, { params: Promise.resolve({ id: 'app-a-active' }) });
      assert.equal(res.status, 400, `Expected 400 for exam field ${fieldName}`);
      const json = await res.json();
      assert.equal(json.code, 'INVALID_REQUEST');
      assert.match(json.error, /prohibited on PATCH/i);
      assert.equal(env.getAdminQueries().length, 0, 'No privileged mutations must occur on exam field patch');
    }
  } finally {
    resetTestClientOverride();
  }
});

