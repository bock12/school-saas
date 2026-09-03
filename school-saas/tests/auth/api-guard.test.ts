import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { authorizeApiRequest, AppRole } from '@/lib/auth/api-guard';

function createMockRequest(url = 'http://localhost:3000/api/test', headers: Record<string, string> = {}) {
  return new NextRequest(url, { headers });
}

function createMockSupabaseClient(params: {
  user?: { id: string; email?: string } | null;
  authError?: Error | null;
  profile?: {
    id: string;
    tenant_id: string | null;
    role: AppRole;
    email: string | null;
    full_name: string | null;
    is_active: boolean;
  } | null;
  profileError?: Error | null;
  tenants?: Array<{ id: string; slug: string; parent_id?: string | null }>;
}) {
  const { user = null, authError = null, profile = null, profileError = null, tenants = [] } = params;

  return {
    auth: {
      async getUser() {
        if (authError || !user) {
          return { data: { user: null }, error: authError || new Error('No user session') };
        }
        return { data: { user }, error: null };
      },
    },
    from(tableName: string) {
      return {
        select(cols: string) {
          return {
            eq(col: string, val: any) {
              return {
                async single() {
                  if (tableName === 'profiles') {
                    if (profileError || !profile) {
                      return { data: null, error: profileError || new Error('Profile not found') };
                    }
                    if (col === 'id' && val === profile.id) {
                      return { data: profile, error: null };
                    }
                    return { data: null, error: new Error('Profile not found') };
                  }
                  if (tableName === 'tenants') {
                    const match = tenants.find((t) => (t as any)[col] === val);
                    return { data: match || null, error: match ? null : new Error('Tenant not found') };
                  }
                  return { data: null, error: new Error(`Table ${tableName} not mocked`) };
                },
                async maybeSingle() {
                  if (tableName === 'profiles') {
                    return { data: profile, error: profileError };
                  }
                  if (tableName === 'tenants') {
                    const match = tenants.find((t) => (t as any)[col] === val);
                    return { data: match || null, error: null };
                  }
                  return { data: null, error: null };
                },
              };
            },
          };
        },
      };
    },
  };
}

test('T-01: Anonymous request returns 401 Unauthorized', async () => {
  const req = createMockRequest();
  const mockClient = createMockSupabaseClient({ user: null });

  const result = await authorizeApiRequest(req, {
    supabaseClient: mockClient,
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.response.status, 401);
    const body = await result.response.json();
    assert.equal(body.code, 'UNAUTHENTICATED');
  }
});

test('T-02: Inactive account returns 403 Forbidden', async () => {
  const req = createMockRequest();
  const mockClient = createMockSupabaseClient({
    user: { id: 'user-inactive' },
    profile: {
      id: 'user-inactive',
      tenant_id: 'tenant-1',
      role: 'school_admin',
      email: 'admin@school.com',
      full_name: 'Inactive Admin',
      is_active: false,
    },
  });

  const result = await authorizeApiRequest(req, {
    roles: ['school_admin'],
    supabaseClient: mockClient,
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.response.status, 403);
    const body = await result.response.json();
    assert.equal(body.code, 'ACCOUNT_INACTIVE');
  }
});

test('T-03: Authenticated user with missing role returns 403 Forbidden', async () => {
  const req = createMockRequest();
  const mockClient = createMockSupabaseClient({
    user: { id: 'user-student' },
    profile: {
      id: 'user-student',
      tenant_id: 'tenant-1',
      role: 'student',
      email: 'student@school.com',
      full_name: 'Test Student',
      is_active: true,
    },
  });

  const result = await authorizeApiRequest(req, {
    roles: ['school_admin', 'exam_officer'],
    supabaseClient: mockClient,
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.response.status, 403);
    const body = await result.response.json();
    assert.equal(body.code, 'INSUFFICIENT_ROLE');
  }
});

test('T-04: Authenticated user with authorized role succeeds', async () => {
  const req = createMockRequest();
  const mockClient = createMockSupabaseClient({
    user: { id: 'user-exam-officer' },
    profile: {
      id: 'user-exam-officer',
      tenant_id: 'tenant-1',
      role: 'exam_officer',
      email: 'officer@school.com',
      full_name: 'Exam Officer',
      is_active: true,
    },
  });

  let adminClientCalled = false;
  const mockAdminFactory = () => {
    adminClientCalled = true;
    return {} as any;
  };

  const result = await authorizeApiRequest(req, {
    roles: ['exam_officer', 'school_admin'],
    supabaseClient: mockClient,
    adminClientFactory: mockAdminFactory,
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.profile.role, 'exam_officer');
    assert.equal(result.tenantId, 'tenant-1');
    assert.equal(adminClientCalled, false); // Not instantiated until invoked
    result.adminClient();
    assert.equal(adminClientCalled, true);
  }
});

test('T-05: Missing tenant membership on tenant-scoped route returns 403', async () => {
  const req = createMockRequest();
  const mockClient = createMockSupabaseClient({
    user: { id: 'user-no-tenant' },
    profile: {
      id: 'user-no-tenant',
      tenant_id: null,
      role: 'teacher',
      email: 'teacher@platform.com',
      full_name: 'Floating Teacher',
      is_active: true,
    },
  });

  const result = await authorizeApiRequest(req, {
    roles: ['teacher'],
    requireTenant: true,
    supabaseClient: mockClient,
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.response.status, 403);
    const body = await result.response.json();
    assert.equal(body.code, 'TENANT_REQUIRED');
  }
});

test('T-06: Cross-tenant spoofing attempt returns 403 Forbidden', async () => {
  const req = createMockRequest();
  const mockClient = createMockSupabaseClient({
    user: { id: 'user-school-a' },
    profile: {
      id: 'user-school-a',
      tenant_id: 'tenant-school-a',
      role: 'school_admin',
      email: 'admin@school-a.com',
      full_name: 'School A Admin',
      is_active: true,
    },
    tenants: [
      { id: 'tenant-school-a', slug: 'school-a', parent_id: null },
      { id: 'tenant-school-b', slug: 'school-b', parent_id: null },
    ],
  });

  // User from School A specifies School B in targetTenantSlug
  const result = await authorizeApiRequest(req, {
    roles: ['school_admin'],
    targetTenantSlug: 'school-b',
    supabaseClient: mockClient,
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.response.status, 403);
    const body = await result.response.json();
    assert.equal(body.code, 'TENANT_ACCESS_DENIED');
  }
});

test('T-07: Platform super-admin route accessed by normal user returns 403', async () => {
  const req = createMockRequest();
  const mockClient = createMockSupabaseClient({
    user: { id: 'user-admin' },
    profile: {
      id: 'user-admin',
      tenant_id: 'tenant-1',
      role: 'school_admin',
      email: 'admin@school.com',
      full_name: 'School Admin',
      is_active: true,
    },
  });

  const result = await authorizeApiRequest(req, {
    roles: ['super_admin'],
    requireTenant: false,
    supabaseClient: mockClient,
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.response.status, 403);
    const body = await result.response.json();
    assert.equal(body.code, 'INSUFFICIENT_ROLE');
  }
});

test('T-08: Platform super-admin route accessed by super_admin succeeds', async () => {
  const req = createMockRequest();
  const mockClient = createMockSupabaseClient({
    user: { id: 'user-super' },
    profile: {
      id: 'user-super',
      tenant_id: null,
      role: 'super_admin',
      email: 'super@platform.com',
      full_name: 'Platform Super Admin',
      is_active: true,
    },
  });

  const result = await authorizeApiRequest(req, {
    roles: ['super_admin'],
    requireTenant: false,
    supabaseClient: mockClient,
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.isSuperAdmin, true);
    assert.equal(result.tenantId, null);
  }
});

test('T-09: Org admin accessing child tenant succeeds via hierarchy', async () => {
  const req = createMockRequest();
  const mockClient = createMockSupabaseClient({
    user: { id: 'user-org' },
    profile: {
      id: 'user-org',
      tenant_id: 'org-parent-uuid',
      role: 'org_admin',
      email: 'org@network.com',
      full_name: 'Network Director',
      is_active: true,
    },
    tenants: [
      { id: 'org-parent-uuid', slug: 'network-org', parent_id: null },
      { id: 'school-child-uuid', slug: 'child-school', parent_id: 'org-parent-uuid' },
    ],
  });

  const result = await authorizeApiRequest(req, {
    roles: ['org_admin', 'school_admin'],
    targetTenantSlug: 'child-school',
    supabaseClient: mockClient,
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.tenantId, 'school-child-uuid');
    assert.equal(result.isOrgAdmin, true);
  }
});

test('T-10: Cross-tenant resource authorization (IDOR protection) returns 404', async () => {
  const req = createMockRequest();
  const mockClient = createMockSupabaseClient({
    user: { id: 'user-school-a' },
    profile: {
      id: 'user-school-a',
      tenant_id: 'tenant-school-a',
      role: 'school_admin',
      email: 'admin@school-a.com',
      full_name: 'School A Admin',
      is_active: true,
    },
  });

  // Mock admin client that simulates an exam session belonging to tenant-school-b
  const mockAdminClient = {
    from(table: string) {
      return {
        select(cols: string) {
          return {
            eq(col1: string, val1: any) {
              return {
                eq(col2: string, val2: any) {
                  return {
                    async maybeSingle() {
                      // Session exists for school-b, but query constrains tenant_id = tenant-school-a
                      if (val1 === 'session-belonging-to-b' && val2 === 'tenant-school-a') {
                        return { data: null, error: null }; // Tenant mismatch filtered out!
                      }
                      return { data: null, error: null };
                    },
                  };
                },
              };
            },
          };
        },
      };
    },
  };

  const result = await authorizeApiRequest(req, {
    roles: ['school_admin'],
    resource: {
      table: 'exam_sessions',
      id: 'session-belonging-to-b',
    },
    supabaseClient: mockClient,
    adminClientFactory: () => mockAdminClient as any,
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.response.status, 404);
    const body = await result.response.json();
    assert.equal(body.code, 'NOT_FOUND');
  }
});
