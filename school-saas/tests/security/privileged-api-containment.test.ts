import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import {
  setTestClientOverride,
  resetTestClientOverride,
  AppRole,
} from '@/lib/auth/api-guard';
import {
  GET as admissionsGET,
  POST as admissionsPOST,
  PATCH as admissionsPATCH,
  DELETE as admissionsDELETE,
} from '@/app/api/admissions/route';
import { GET as cassGET, POST as cassPOST } from '@/app/api/cass-export/route';
import { GET as dashboardGET } from '@/app/api/exam-office/dashboard/route';
import { GET as adminExamsGET } from '@/app/api/admin/exams/route';
import { GET as superAdminLeadsGET } from '@/app/api/super-admin/leads/route';

/**
 * ============================================================================
 * PRIVILEGED API ROUTE-HANDLER CONTAINMENT SECURITY TEST SUITE (TASK-0005)
 * ============================================================================
 * 
 * These tests execute the ACTUAL Next.js route handlers:
 *   - admissionsGET(req), admissionsPOST(req), admissionsPATCH(req), admissionsDELETE(req)
 *   - cassGET(req), cassPOST(req)
 *   - dashboardGET(req)
 *   - adminExamsGET(req), superAdminLeadsGET(req)
 * 
 * Each test routes real NextRequest payloads through the complete handler lifecycle,
 * exercising authorizeApiRequest(), role checks, candidate tenant resolution,
 * application-layer IDOR/BOLA protections, downstream adminClient instantiation,
 * strict allowlisting, and tenant query constraints.
 * 
 * NOTE: Application/API-layer authorization is tested here with deterministic mock transports.
 * Live PostgreSQL/Supabase RLS integration testing is explicitly scheduled for TASK-0008.
 */

// ── Test Fixtures ─────────────────────────────────────────────────────────────

const TENANT_A = { id: 'tenant-a-1111-1111-1111', slug: 'albert-academy', name: 'Albert Academy' };
const TENANT_B = { id: 'tenant-b-2222-2222-2222', slug: 'other-school', name: 'Other School' };
const ORG_PARENT = { id: 'org-parent-0000', slug: 'sl-schools-org', name: 'SL Schools Org' };
const CHILD_TENANT = { id: 'child-tenant-3333', slug: 'child-school', parent_id: ORG_PARENT.id, name: 'Child School' };

const USER_ADMIN_A = { id: 'user-admin-a' };
const USER_EXAM_OFFICER_A = { id: 'user-exam-officer-a' };
const USER_TEACHER_A = { id: 'user-teacher-a' };
const USER_STUDENT_A = { id: 'user-student-a' };
const USER_SUPER_ADMIN = { id: 'user-super-admin' };

const PROFILE_ADMIN_A = {
  id: USER_ADMIN_A.id,
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

const PROFILE_TEACHER_A = {
  id: USER_TEACHER_A.id,
  tenant_id: TENANT_A.id,
  role: 'teacher' as AppRole,
  email: 'teacher@albert.edu.sl',
  full_name: 'Teacher Joe',
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

const PROFILE_SUPER_ADMIN = {
  id: USER_SUPER_ADMIN.id,
  tenant_id: null,
  role: 'super_admin' as AppRole,
  email: 'root@platform.sl',
  full_name: 'Platform Super Admin',
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
  tenants?: any[];
  applicants?: any[];
  examSessions?: any[];
  simulateQueryError?: Error | null;
}) {
  const {
    user = null,
    profile = null,
    tenants = [TENANT_A, TENANT_B, ORG_PARENT, CHILD_TENANT],
    applicants = [
      { id: 'app-a-1', tenant_id: TENANT_A.id, first_name: 'Alpha', last_name: 'Kamara', school_level: 'SSS', target_stream: 'Science' },
      { id: 'app-b-1', tenant_id: TENANT_B.id, first_name: 'Beta', last_name: 'Sesay', school_level: 'SSS', target_stream: 'Arts' },
    ],
    examSessions = [
      { id: 'sess-a-1', tenant_id: TENANT_A.id, title: 'WASSCE Mock 2026', status: 'Ongoing' },
    ],
    simulateQueryError = null,
  } = config;

  let adminFactoryCallCount = 0;
  const adminQueries: MockQueryLog[] = [];
  const userQueries: MockQueryLog[] = [];

  // User-scoped client (used inside authorizeApiRequest for auth, profile, candidate tenant, and resource check)
  const userClient = {
    auth: {
      async getUser() {
        if (!user) {
          return { data: { user: null }, error: new Error('No active user session') };
        }
        return { data: { user }, error: null };
      },
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
        async single() {
          if (table === 'profiles') {
            if (!profile) return { data: null, error: new Error('Profile not found') };
            const idFilter = filters.find((f) => f.col === 'id');
            if (idFilter && idFilter.val === profile.id) {
              return { data: profile, error: null };
            }
            return { data: null, error: new Error('Profile not found') };
          }
          if (table === 'tenants') {
            const match = tenants.find((t) => {
              return filters.every((f) => f.op === 'eq' && (t as any)[f.col] === f.val);
            });
            return { data: match || null, error: match ? null : new Error('Tenant not found') };
          }
          return { data: null, error: new Error(`Unknown table ${table}`) };
        },
        async maybeSingle() {
          if (table === 'tenants') {
            const match = tenants.find((t) => {
              return filters.every((f) => f.op === 'eq' && (t as any)[f.col] === f.val);
            });
            return { data: match || null, error: null };
          }
          if (table === 'applicants') {
            // Resource authorization check
            const match = applicants.find((a) => {
              return filters.every((f) => f.op === 'eq' && (a as any)[f.col] === f.val);
            });
            return { data: match ? { id: match.id } : null, error: null };
          }
          return { data: null, error: null };
        },
      };
      return queryObj;
    },
  };

  // Admin client (instantiated downstream ONLY after authorization passes)
  const adminClient = {
    from(table: string) {
      const filters: Array<{ col: string; val: any; op: string }> = [];
      let insertPayload: any = null;
      let updatePayload: any = null;
      let isDelete = false;

      const builder: any = {
        select(cols?: string, opts?: any) {
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
          isDelete = true;
          adminQueries.push({ table, method: 'delete', filters });
          return builder;
        },
        eq(col: string, val: any) {
          filters.push({ col, val, op: 'eq' });
          return builder;
        },
        is(col: string, val: any) {
          filters.push({ col, val, op: 'is' });
          return builder;
        },
        order(col: string, opts?: any) {
          return builder;
        },
        range(from: number, to: number) {
          return builder;
        },
        async single() {
          if (simulateQueryError) return { data: null, error: simulateQueryError };
          if (insertPayload) {
            return { data: { id: 'new-row-uuid', ...insertPayload }, error: null };
          }
          if (updatePayload) {
            return { data: { id: 'updated-row-uuid', ...updatePayload }, error: null };
          }
          const matches = filterRows(table);
          return { data: matches[0] || null, error: matches[0] ? null : new Error('Not found') };
        },
        async maybeSingle() {
          if (simulateQueryError) return { data: null, error: simulateQueryError };
          if (table === 'tenants') {
            const idF = filters.find((f) => f.col === 'id');
            const match = tenants.find((t) => t.id === idF?.val);
            return { data: match || null, error: null };
          }
          const matches = filterRows(table);
          return { data: matches[0] || null, error: null };
        },
        then(resolve: (val: any) => any, reject?: (err: any) => any) {
          if (simulateQueryError) {
            return Promise.resolve({ data: null, error: simulateQueryError }).then(resolve, reject);
          }
          const data = filterRows(table);
          return Promise.resolve({ data, error: null, count: data.length }).then(resolve, reject);
        },
      };

      function filterRows(tbl: string): any[] {
        let pool: any[] = [];
        if (tbl === 'applicants') pool = applicants;
        else if (tbl === 'exam_sessions') pool = examSessions;
        else pool = [{ id: 'mock-row-1', tenant_id: TENANT_A.id, status: 'Ongoing' }];

        return pool.filter((row) => {
          return filters.every((f) => {
            if (f.op === 'eq') return (row as any)[f.col] === f.val;
            if (f.op === 'is') return (row as any)[f.col] === null || (row as any)[f.col] === undefined;
            return true;
          });
        });
      }

      return builder;
    },
  };

  const adminClientFactory = () => {
    adminFactoryCallCount++;
    return adminClient;
  };

  return {
    userClient,
    adminClientFactory,
    getAdminFactoryCallCount: () => adminFactoryCallCount,
    getAdminQueries: () => adminQueries,
    getUserQueries: () => userQueries,
  };
}

// ── 1. Route Handler Authentication Enforcement (401) ─────────────────────────

test('SEC-01: Anonymous request to admissionsGET returns 401 Unauthorized', async () => {
  const transport = createMockTransport({ user: null });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/admissions');
    const res = await admissionsGET(req);

    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.code, 'UNAUTHENTICATED');
    assert.equal(transport.getAdminFactoryCallCount(), 0, 'Admin client must not be created for anonymous request');
  } finally {
    resetTestClientOverride();
  }
});

test('SEC-02: Anonymous request to cassGET returns 401 Unauthorized', async () => {
  const transport = createMockTransport({ user: null });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/cass-export');
    const res = await cassGET(req);

    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.code, 'UNAUTHENTICATED');
    assert.equal(transport.getAdminFactoryCallCount(), 0, 'Admin client must not be created for anonymous request');
  } finally {
    resetTestClientOverride();
  }
});

test('SEC-03: Anonymous request to dashboardGET returns 401 Unauthorized', async () => {
  const transport = createMockTransport({ user: null });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/exam-office/dashboard');
    const res = await dashboardGET(req);

    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.code, 'UNAUTHENTICATED');
    assert.equal(transport.getAdminFactoryCallCount(), 0, 'Admin client must not be created for anonymous request');
  } finally {
    resetTestClientOverride();
  }
});

// ── 2. Route Handler Role Enforcement (403) ───────────────────────────────────

test('SEC-04: Wrong-role Teacher calling admissionsGET returns 403 Forbidden', async () => {
  const transport = createMockTransport({ user: USER_TEACHER_A, profile: PROFILE_TEACHER_A });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/admissions');
    const res = await admissionsGET(req);

    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.code, 'INSUFFICIENT_ROLE');
    assert.equal(transport.getAdminFactoryCallCount(), 0, 'Admin client must not be created for unauthorized role');
  } finally {
    resetTestClientOverride();
  }
});

test('SEC-05: Wrong-role Student calling cassGET returns 403 Forbidden', async () => {
  const transport = createMockTransport({ user: USER_STUDENT_A, profile: PROFILE_STUDENT_A });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/cass-export');
    const res = await cassGET(req);

    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.code, 'INSUFFICIENT_ROLE');
    assert.equal(transport.getAdminFactoryCallCount(), 0);
  } finally {
    resetTestClientOverride();
  }
});

test('SEC-06: Wrong-role Teacher calling dashboardGET returns 403 Forbidden', async () => {
  const transport = createMockTransport({ user: USER_TEACHER_A, profile: PROFILE_TEACHER_A });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/exam-office/dashboard');
    const res = await dashboardGET(req);

    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.code, 'INSUFFICIENT_ROLE');
    assert.equal(transport.getAdminFactoryCallCount(), 0);
  } finally {
    resetTestClientOverride();
  }
});

test('SEC-07: Exam Officer calling admissionsDELETE returns 403 Forbidden (administrative deletion restriction)', async () => {
  // Exam Officer is allowed for GET, POST, PATCH but strictly forbidden from DELETE
  const transport = createMockTransport({ user: USER_EXAM_OFFICER_A, profile: PROFILE_EXAM_OFFICER_A });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/admissions?id=app-a-1', { method: 'DELETE' });
    const res = await admissionsDELETE(req);

    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.code, 'INSUFFICIENT_ROLE');
    assert.equal(transport.getAdminFactoryCallCount(), 0, 'Admin client must not be created when role is denied');
  } finally {
    resetTestClientOverride();
  }
});

// ── 3. Cross-Tenant Isolation & IDOR/BOLA Protection ──────────────────────────

test('SEC-08: Cross-tenant admissionsPATCH for resource belonging to different tenant returns 404 (IDOR defense)', async () => {
  // Actor belongs to Tenant A; attempts to PATCH applicant app-b-1 which belongs to Tenant B
  const transport = createMockTransport({ user: USER_ADMIN_A, profile: PROFILE_ADMIN_A });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/admissions', {
      method: 'PATCH',
      body: { id: 'app-b-1', stage: 'Interview' },
    });
    const res = await admissionsPATCH(req);

    assert.equal(res.status, 404);
    const json = await res.json();
    assert.equal(json.code, 'NOT_FOUND');
    assert.equal(transport.getAdminFactoryCallCount(), 0, 'Admin client must never be instantiated for IDOR attempt');
  } finally {
    resetTestClientOverride();
  }
});

test('SEC-09: Cross-tenant admissionsDELETE for resource belonging to different tenant returns 404 (IDOR defense)', async () => {
  const transport = createMockTransport({ user: USER_ADMIN_A, profile: PROFILE_ADMIN_A });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/admissions?id=app-b-1', { method: 'DELETE' });
    const res = await admissionsDELETE(req);

    assert.equal(res.status, 404);
    const json = await res.json();
    assert.equal(json.code, 'NOT_FOUND');
    assert.equal(transport.getAdminFactoryCallCount(), 0);
  } finally {
    resetTestClientOverride();
  }
});

test('SEC-10: Client-supplied tenant_id in admissionsPOST cannot override auth.tenantId', async () => {
  const transport = createMockTransport({ user: USER_ADMIN_A, profile: PROFILE_ADMIN_A });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/admissions', {
      method: 'POST',
      body: {
        tenant_id: TENANT_B.id, // Malicious attempt to insert into Tenant B
        firstName: 'John',
        lastName: 'Doe',
        dob: '2010-01-01',
        schoolLevel: 'SSS',
      },
    });
    const res = await admissionsPOST(req);

    assert.equal(res.status, 200);
    const queries = transport.getAdminQueries();
    const insertQuery = queries.find((q) => q.method === 'insert' && q.table === 'applicants');
    assert.ok(insertQuery, 'Insert query must have been performed');
    assert.equal(insertQuery.payload.tenant_id, TENANT_A.id, 'Inserted record must bind strictly to auth.tenantId, ignoring client input');
  } finally {
    resetTestClientOverride();
  }
});

test('SEC-11: Client-supplied tenantSlug in admissionsGET cannot select another tenant (returns 403)', async () => {
  const transport = createMockTransport({ user: USER_ADMIN_A, profile: PROFILE_ADMIN_A });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest(`http://localhost:3000/api/admissions?tenantSlug=${TENANT_B.slug}`);
    const res = await admissionsGET(req);

    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.code, 'TENANT_ACCESS_DENIED');
    assert.equal(transport.getAdminFactoryCallCount(), 0);
  } finally {
    resetTestClientOverride();
  }
});

// ── 4. Authorized Handler Execution & Tenancy Scoping ─────────────────────────

test('SEC-12: Authorized admissionsGET queries strictly within authorized tenant', async () => {
  const transport = createMockTransport({ user: USER_ADMIN_A, profile: PROFILE_ADMIN_A });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/admissions');
    const res = await admissionsGET(req);

    assert.equal(res.status, 200);
    assert.equal(transport.getAdminFactoryCallCount(), 1, 'Admin client must be created downstream');
    const queries = transport.getAdminQueries();
    const applicantQueries = queries.filter((q) => q.table === 'applicants');
    assert.ok(applicantQueries.length > 0);
    for (const q of applicantQueries) {
      const tenantFilter = q.filters.find((f) => f.col === 'tenant_id');
      assert.ok(tenantFilter, 'Every applicant query must filter on tenant_id');
      assert.equal(tenantFilter.val, TENANT_A.id, 'Every applicant query must filter strictly by auth.tenantId');
    }
  } finally {
    resetTestClientOverride();
  }
});

test('SEC-13: Authorized cassGET queries strictly within authorized tenant', async () => {
  const transport = createMockTransport({ user: USER_EXAM_OFFICER_A, profile: PROFILE_EXAM_OFFICER_A });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/cass-export?schoolLevel=SSS&examType=WASSCE');
    const res = await cassGET(req);

    assert.equal(res.status, 200);
    const queries = transport.getAdminQueries();
    const applicantQuery = queries.find((q) => q.table === 'applicants');
    assert.ok(applicantQuery);
    const tenantFilter = applicantQuery.filters.find((f) => f.col === 'tenant_id');
    assert.ok(tenantFilter);
    assert.equal(tenantFilter.val, TENANT_A.id);
  } finally {
    resetTestClientOverride();
  }
});

test('SEC-14: Authorized dashboardGET queries all 10 tables strictly within authorized tenant', async () => {
  const transport = createMockTransport({ user: USER_EXAM_OFFICER_A, profile: PROFILE_EXAM_OFFICER_A });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/exam-office/dashboard');
    const res = await dashboardGET(req);

    assert.equal(res.status, 200);
    const queries = transport.getAdminQueries();
    const expectedTables = [
      'exam_sessions',
      'exam_results_approval',
      'exam_malpractices',
      'exam_appeals',
      'exam_student_spotlights',
      'exam_grade_distributions',
      'exam_student_details',
      'exam_subject_results',
      'exam_subject_averages',
      'exam_class_gender_counts',
    ];

    for (const tbl of expectedTables) {
      const q = queries.find((entry) => entry.table === tbl);
      assert.ok(q, `Query must be recorded for table: ${tbl}`);
      const tf = q.filters.find((f) => f.col === 'tenant_id');
      assert.ok(tf, `Table ${tbl} query must filter by tenant_id`);
      assert.equal(tf.val, TENANT_A.id, `Table ${tbl} query must bind strictly to auth.tenantId`);
      const nullFilter = q.filters.find((f) => f.col === 'tenant_id' && f.op === 'is' && f.val === null);
      assert.equal(nullFilter, undefined, `Table ${tbl} must NEVER allow NULL-tenant fallback`);
    }
  } finally {
    resetTestClientOverride();
  }
});

// ── 5. Admissions Strict Allowlist & Immutability Regression Tests ─────────────

test('SEC-15: Admissions PATCH rejects arbitrary database columns with 400 Bad Request (Strict allowlist test)', async () => {
  const transport = createMockTransport({ user: USER_ADMIN_A, profile: PROFILE_ADMIN_A });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/admissions', {
      method: 'PATCH',
      body: {
        id: 'app-a-1',
        arbitrary_column_attack: 'malicious_value',
      },
    });
    const res = await admissionsPATCH(req);

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.code, 'INVALID_REQUEST');
    assert.match(json.error, /Unsupported applicant field/);
  } finally {
    resetTestClientOverride();
  }
});

test('SEC-16: Admissions PATCH rejects attempt to mutate immutable tenant_id with 400 Bad Request', async () => {
  const transport = createMockTransport({ user: USER_ADMIN_A, profile: PROFILE_ADMIN_A });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/admissions', {
      method: 'PATCH',
      body: {
        id: 'app-a-1',
        tenant_id: TENANT_B.id,
      },
    });
    const res = await admissionsPATCH(req);

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.code, 'INVALID_REQUEST');
    assert.match(json.error, /Cannot modify immutable field/);
  } finally {
    resetTestClientOverride();
  }
});

test('SEC-17: Admissions PATCH with valid allowlisted fields succeeds and updates applicant', async () => {
  const transport = createMockTransport({ user: USER_ADMIN_A, profile: PROFILE_ADMIN_A });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/admissions', {
      method: 'PATCH',
      body: {
        id: 'app-a-1',
        stage: 'Interview',
        targetStream: 'Science',
      },
    });
    const res = await admissionsPATCH(req);

    assert.equal(res.status, 200);
    const queries = transport.getAdminQueries();
    const updateQuery = queries.find((q) => q.method === 'update' && q.table === 'applicants');
    assert.ok(updateQuery);
    assert.equal(updateQuery.payload.stage, 'Interview');
    assert.equal(updateQuery.payload.target_stream, 'Science');
    assert.equal(updateQuery.payload.stream_auto_placed, false);
    const tenantFilter = updateQuery.filters.find((f) => f.col === 'tenant_id');
    assert.ok(tenantFilter);
    assert.equal(tenantFilter.val, TENANT_A.id);
  } finally {
    resetTestClientOverride();
  }
});

test('SEC-18: Admissions DELETE with authorized school_admin for same-tenant resource succeeds', async () => {
  const transport = createMockTransport({ user: USER_ADMIN_A, profile: PROFILE_ADMIN_A });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/admissions?id=app-a-1', { method: 'DELETE' });
    const res = await admissionsDELETE(req);

    assert.equal(res.status, 200);
    const queries = transport.getAdminQueries();
    const deleteQuery = queries.find((q) => q.method === 'delete' && q.table === 'applicants');
    assert.ok(deleteQuery);
    const idFilter = deleteQuery.filters.find((f) => f.col === 'id');
    const tenantFilter = deleteQuery.filters.find((f) => f.col === 'tenant_id');
    assert.equal(idFilter?.val, 'app-a-1');
    assert.equal(tenantFilter?.val, TENANT_A.id);
  } finally {
    resetTestClientOverride();
  }
});

test('SEC-19: CASS POST binds batch insertion strictly to auth.tenantId', async () => {
  const transport = createMockTransport({ user: USER_ADMIN_A, profile: PROFILE_ADMIN_A });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/cass-export', {
      method: 'POST',
      body: {
        tenant_id: TENANT_B.id, // Untrusted input
        schoolLevel: 'SSS',
        academicYear: '2025/2026',
        candidateCount: 45,
      },
    });
    const res = await cassPOST(req);

    assert.equal(res.status, 200);
    const queries = transport.getAdminQueries();
    const insertQuery = queries.find((q) => q.method === 'insert' && q.table === 'sl_cass_export_batches');
    assert.ok(insertQuery);
    assert.equal(insertQuery.payload.tenant_id, TENANT_A.id, 'Batch must bind strictly to auth.tenantId');
  } finally {
    resetTestClientOverride();
  }
});

// ── 6. Dashboard Query Reliability & Error Handling ───────────────────────────

test('SEC-20: Dashboard returns 500 DATABASE_ERROR when a database query fails (no silent failure)', async () => {
  const transport = createMockTransport({
    user: USER_EXAM_OFFICER_A,
    profile: PROFILE_EXAM_OFFICER_A,
    simulateQueryError: new Error('Postgres connection timeout'),
  });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/exam-office/dashboard');
    const res = await dashboardGET(req);

    assert.equal(res.status, 500);
    const json = await res.json();
    assert.equal(json.code, 'DATABASE_ERROR');
    assert.match(json.error, /database query error/);
  } finally {
    resetTestClientOverride();
  }
});

// ── 7. TASK-0004 Foundation Route Regressions ─────────────────────────────────

test('SEC-21: TASK-0004 Regression — /api/admin/exams preserves role and tenant authorization', async () => {
  const transport = createMockTransport({ user: USER_TEACHER_A, profile: PROFILE_TEACHER_A });
  setTestClientOverride(transport.userClient, transport.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/admin/exams');
    const res = await adminExamsGET(req);

    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.code, 'INSUFFICIENT_ROLE');
    assert.equal(transport.getAdminFactoryCallCount(), 0);
  } finally {
    resetTestClientOverride();
  }
});

test('SEC-22: TASK-0004 Regression — /api/super-admin/leads preserves platform scope and super_admin restriction', async () => {
  // Non-super-admin is denied (403)
  const transportForbidden = createMockTransport({ user: USER_ADMIN_A, profile: PROFILE_ADMIN_A });
  setTestClientOverride(transportForbidden.userClient, transportForbidden.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/super-admin/leads');
    const res = await superAdminLeadsGET(req);

    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.code, 'INSUFFICIENT_ROLE');
  } finally {
    resetTestClientOverride();
  }

  // Super-admin passes platform guard check
  const transportAllowed = createMockTransport({ user: USER_SUPER_ADMIN, profile: PROFILE_SUPER_ADMIN });
  setTestClientOverride(transportAllowed.userClient, transportAllowed.adminClientFactory);
  try {
    const req = createMockRequest('http://localhost:3000/api/super-admin/leads');
    // Handler attempts pg query which may fail in unit test transport, but guard allows access past 403
    const res = await superAdminLeadsGET(req);
    assert.notEqual(res.status, 403);
  } finally {
    resetTestClientOverride();
  }
});
