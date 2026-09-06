import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import {
  setTestClientOverride,
  resetTestClientOverride,
  AppRole,
} from '../../src/lib/auth/api-guard';
import {
  GET as admissionsGET,
  POST as admissionsPOST,
  PATCH as admissionsPATCH,
  DELETE as admissionsDELETE,
} from '../../src/app/api/admissions/route';
import { GET as dashboardGET } from '../../src/app/api/exam-office/dashboard/route';
import { GET as adminExamsGET } from '../../src/app/api/admin/exams/route';

test('TASK-0006: API + RLS Integration Verification', async (t) => {
  const TENANT_A = { id: 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', slug: 'tenant-alpha' };
  const TENANT_B = { id: 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', slug: 'tenant-beta' };

  const USER_ADMIN_A = { id: '11111111-aaaa-aaaa-aaaa-111111111111', email: 'adminA@test.sec' };
  const USER_STUDENT_A = { id: '22222222-aaaa-aaaa-aaaa-222222222222', email: 'studentA@test.sec' };
  const USER_ADMIN_B = { id: '33333333-bbbb-bbbb-bbbb-333333333333', email: 'adminB@test.sec' };

  const PROFILE_ADMIN_A = {
    id: USER_ADMIN_A.id,
    tenant_id: TENANT_A.id,
    role: 'school_admin' as AppRole,
    email: USER_ADMIN_A.email,
    full_name: 'Admin Alpha',
    is_active: true,
  };

  const PROFILE_STUDENT_A = {
    id: USER_STUDENT_A.id,
    tenant_id: TENANT_A.id,
    role: 'student' as AppRole,
    email: USER_STUDENT_A.email,
    full_name: 'Student Alpha',
    is_active: true,
  };

  const PROFILE_ADMIN_B = {
    id: USER_ADMIN_B.id,
    tenant_id: TENANT_B.id,
    role: 'school_admin' as AppRole,
    email: USER_ADMIN_B.email,
    full_name: 'Admin Beta',
    is_active: true,
  };

  function createMockSupabase(user: any, profile: any) {
    return {
      auth: {
        getUser: async () => ({ data: { user }, error: null }),
      },
      from: (table: string) => {
        let selectedFields = '*';
        let filters: Record<string, any> = {};
        const builder: any = {
          select: (fields: string) => {
            selectedFields = fields;
            return builder;
          },
          eq: (col: string, val: any) => {
            filters[col] = val;
            return builder;
          },
          single: async () => {
            if (table === 'profiles') {
              if (filters.id === user?.id && profile) {
                return { data: profile, error: null };
              }
              return { data: null, error: { message: 'Not found' } };
            }
            if (table === 'tenants') {
              if (filters.slug === TENANT_A.slug) return { data: TENANT_A, error: null };
              if (filters.slug === TENANT_B.slug) return { data: TENANT_B, error: null };
              return { data: null, error: { message: 'Tenant not found' } };
            }
            return { data: null, error: null };
          },
          maybeSingle: async () => builder.single(),
        };
        return builder;
      },
    };
  }

  function createMockAdminClient(tenantId: string) {
    return {
      from: (table: string) => {
        const query: any = {
          select: (fields: string, opts?: any) => query,
          eq: (col: string, val: any) => {
            if (col === 'tenant_id' && val !== tenantId) {
              // RLS / tenant boundary simulation
              return {
                order: () => query,
                is: () => query,
                range: () => Promise.resolve({ data: [], error: null, count: 0 }),
                then: (resolve: any) => resolve({ data: [], error: null }),
              };
            }
            return query;
          },
          is: (col: string, val: any) => query,
          order: () => query,
          range: () => Promise.resolve({
            data: [{ id: 'resource-1', tenant_id: tenantId, first_name: 'John' }],
            error: null,
            count: 1,
          }),
          insert: async (data: any) => {
            const row = Array.isArray(data) ? data[0] : data;
            if (row.tenant_id !== tenantId) {
              return { data: null, error: { message: 'new row violates row-level security policy' } };
            }
            return { data: [row], error: null };
          },
          update: (data: any) => ({
            eq: (col: string, val: any) => ({
              eq: (col2: string, val2: any) => Promise.resolve({ data: [{ ...data, id: val }], error: null }),
            }),
          }),
          delete: () => ({
            eq: (col: string, val: any) => ({
              eq: (col2: string, val2: any) => Promise.resolve({ data: [], error: null }),
            }),
          }),
        };
        return query;
      },
    };
  }

  t.afterEach(() => {
    resetTestClientOverride();
  });

  // 1. Authorized request -> 200 OK
  await t.test('API-01: Authorized same-tenant request -> HTTP 200', async () => {
    const mockSupabase = createMockSupabase(USER_ADMIN_A, PROFILE_ADMIN_A);
    const mockAdminFactory = () => createMockAdminClient(TENANT_A.id);
    setTestClientOverride(mockSupabase, mockAdminFactory);

    const req = new NextRequest('http://localhost/api/admissions?tenantSlug=tenant-alpha');
    const res = await admissionsGET(req);
    assert.equal(res.status, 200, 'Authorized request must return 200 OK');
    const body = await res.json();
    assert.ok(body.data?.applicants, 'Response must include applicants');
  });

  // 2. Cross-tenant request -> HTTP 403 Forbidden
  await t.test('API-02: Cross-tenant request -> HTTP 403 Forbidden', async () => {
    const mockSupabase = createMockSupabase(USER_ADMIN_A, PROFILE_ADMIN_A);
    const mockAdminFactory = () => createMockAdminClient(TENANT_A.id);
    setTestClientOverride(mockSupabase, mockAdminFactory);

    // Admin A attempting to access Tenant B
    const req = new NextRequest('http://localhost/api/admissions?tenantSlug=tenant-beta');
    const res = await admissionsGET(req);
    assert.equal(res.status, 403, 'Cross-tenant request must return 403 Forbidden');
    const body = await res.json();
    assert.equal(body.code, 'TENANT_ACCESS_DENIED');
  });

  // 3. Unauthorized role -> HTTP 403 Forbidden
  await t.test('API-03: Unauthorized role request -> HTTP 403 Forbidden', async () => {
    const mockSupabase = createMockSupabase(USER_STUDENT_A, PROFILE_STUDENT_A);
    const mockAdminFactory = () => createMockAdminClient(TENANT_A.id);
    setTestClientOverride(mockSupabase, mockAdminFactory);

    // Student attempting to access admissions admin GET
    const req = new NextRequest('http://localhost/api/admissions?tenantSlug=tenant-alpha');
    const res = await admissionsGET(req);
    assert.equal(res.status, 403, 'Unauthorized role request must return 403 Forbidden');
    const body = await res.json();
    assert.equal(body.code, 'INSUFFICIENT_ROLE');
  });

  // 4. Unauthenticated request -> HTTP 401 Unauthorized
  await t.test('API-04: Unauthenticated request -> HTTP 401 Unauthorized', async () => {
    const mockSupabase = createMockSupabase(null, null);
    setTestClientOverride(mockSupabase);

    const req = new NextRequest('http://localhost/api/admissions?tenantSlug=tenant-alpha');
    const res = await admissionsGET(req);
    assert.equal(res.status, 401, 'Unauthenticated request must return 401 Unauthorized');
    const body = await res.json();
    assert.equal(body.code, 'UNAUTHENTICATED');
  });

  // 5. Response body safety (no leaked internal authorization details)
  await t.test('API-05: Denial responses do not expose internal authorization details', async () => {
    const mockSupabase = createMockSupabase(USER_ADMIN_A, PROFILE_ADMIN_A);
    setTestClientOverride(mockSupabase);

    const req = new NextRequest('http://localhost/api/admissions?tenantSlug=tenant-beta');
    const res = await admissionsGET(req);
    const text = await res.text();
    assert.ok(!text.includes('auth.uid()'), 'Must not leak auth.uid() in response');
    assert.ok(!text.includes('service_role'), 'Must not leak service_role in response');
    assert.ok(!text.includes('postgres'), 'Must not leak postgres in response');
  });
});
