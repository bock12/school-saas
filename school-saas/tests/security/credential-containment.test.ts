import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createAdminClient } from '../../src/lib/supabase/admin';
import { authorizeApiRequest } from '../../src/lib/auth/api-guard';
import { validateAndSyncInvitedProfile } from '../../src/lib/auth/callback-sync';
import { NextRequest } from 'next/server';

const ROOT_DIR = path.resolve(__dirname, '../..');

/**
 * Helper to recursively collect all source and script files in the repository,
 * strictly excluding node_modules, .git, .next, and temporary build directories.
 */
function getTrackedFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');

    if (
      entry.name === 'node_modules' ||
      entry.name === '.git' ||
      entry.name === '.next' ||
      entry.name === 'scratch' ||
      entry.name.startsWith('.env')
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      files = files.concat(getTrackedFiles(fullPath));
    } else if (
      entry.isFile() &&
      /\.(ts|tsx|js|cjs|mjs|json|sql)$/.test(entry.name) &&
      !entry.name.endsWith('.d.ts') &&
      entry.name !== 'package-lock.json' &&
      !relPath.startsWith('tests/security/credential-containment.test.ts')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

test('TASK-0002: Credential Exposure Containment Test Suite', async (t) => {
  const trackedFiles = getTrackedFiles(ROOT_DIR);

  // SEC-01: No known hardcoded production credentials
  await t.test('SEC-01: No known hardcoded production credentials or pooler passwords in source', () => {
    const knownCommittedHost = 'aws-0-eu-west-1.pooler.supabase.com';
    const knownProjectRef = 'yhrvmppfwjxninvbblrt';
    const violations: string[] = [];

    for (const filePath of trackedFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

      // Check if file contains the known pooler connection string or password signature
      if (content.includes(knownCommittedHost) || content.includes(knownProjectRef)) {
        violations.push(`${relPath} contains committed Supabase pooler host/project-ref.`);
      }
    }

    assert.equal(
      violations.length,
      0,
      `SEC-01 Violation: Found exposed database pooler credentials in source:\n${violations.join('\n')}`
    );
  });

  // SEC-02: No service-role credential in client-side source
  await t.test('SEC-02: No service-role key in client components or client bundles', () => {
    const violations: string[] = [];

    for (const filePath of trackedFiles) {
      if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx') && !filePath.endsWith('.ts')) continue;
      const content = fs.readFileSync(filePath, 'utf8');
      const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

      const isClientComponent =
        content.startsWith("'use client'") ||
        content.startsWith('"use client"') ||
        content.includes("\n'use client'") ||
        content.includes('\n"use client"');

      if (isClientComponent) {
        if (
          content.includes('SUPABASE_SERVICE_ROLE_KEY') ||
          content.includes('createAdminClient') ||
          content.includes('@/lib/supabase/admin')
        ) {
          violations.push(`${relPath} is a client component but references service-role credentials/modules.`);
        }
      }
    }

    assert.equal(
      violations.length,
      0,
      `SEC-02 Violation: Found service-role references in client-side source:\n${violations.join('\n')}`
    );
  });

  // SEC-03: No database connection strings with passwords in tracked source
  await t.test('SEC-03: No raw database password/connection credentials in tracked source', () => {
    const violations: string[] = [];
    const dbUrlPattern = /postgres(?:ql)?:\/\/[^:]+:([^@]+)@[^/:]+:\d+\/\w+/i;

    for (const filePath of trackedFiles) {
      const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
      // Skip example files and documentation markdown
      if (relPath.endsWith('.example') || relPath.endsWith('.md')) continue;

      const content = fs.readFileSync(filePath, 'utf8');
      const match = content.match(dbUrlPattern);

      if (match) {
        const passwordPart = match[1];
        if (!passwordPart.includes('${') && !passwordPart.includes('[') && passwordPart !== 'password') {
          violations.push(`${relPath} contains raw database connection string with password.`);
        }
      }
    }

    assert.equal(
      violations.length,
      0,
      `SEC-03 Violation: Found raw database connection string with embedded password:\n${violations.join('\n')}`
    );
  });

  // SEC-04: Sensitive configuration is environment-driven
  await t.test('SEC-04: Sensitive configuration is strictly environment-driven with fail-closed validation', () => {
    const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const prevRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const prevAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      // 1. Missing SUPABASE_SERVICE_ROLE_KEY must fail closed
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://valid-url.supabase.co';
      assert.throws(() => createAdminClient(), /SUPABASE_SERVICE_ROLE_KEY is required/);

      // 2. Placeholder SUPABASE_SERVICE_ROLE_KEY must fail closed
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_placeholder';
      assert.throws(() => createAdminClient(), /placeholder/i);

      // 3. Service role key matching anon key must fail closed
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key-12345';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'public-anon-key-12345';
      assert.throws(() => createAdminClient(), /must not be the public anonymous key/i);
    } finally {
      if (prevUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;
      else delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (prevRole) process.env.SUPABASE_SERVICE_ROLE_KEY = prevRole;
      else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (prevAnon) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = prevAnon;
      else delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    }
  });

  // SEC-05: API responses do not expose credentials/tokens
  await t.test('SEC-05: API route handlers do not emit credentials, secrets, or password hashes', async () => {
    const apiDir = path.join(ROOT_DIR, 'src/app/api');
    const apiFiles = getTrackedFiles(apiDir);
    const violations: string[] = [];

    for (const filePath of apiFiles) {
      if (!filePath.endsWith('route.ts')) continue;
      const content = fs.readFileSync(filePath, 'utf8');
      const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

      // Check for responses that leak encrypted_password, service keys, or connection strings
      if (
        content.includes("json({ password") ||
        content.includes("json({ secret") ||
        content.includes("json({ token: process.env") ||
        content.includes("json({ serviceRole") ||
        content.includes("encrypted_password")
      ) {
        violations.push(`${relPath} contains response code that may emit sensitive auth material.`);
      }
    }

    assert.equal(
      violations.length,
      0,
      `SEC-05 Violation: Found potential credential leakage in API routes:\n${violations.join('\n')}`
    );
  });

  // SEC-06: Credential values are not logged by affected utilities
  await t.test('SEC-06: Maintenance scripts and utilities do not log plaintext passwords or secrets', () => {
    const scriptsDir = path.join(ROOT_DIR, 'scripts');
    const scriptFiles = getTrackedFiles(scriptsDir);
    const violations: string[] = [];

    for (const filePath of scriptFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

      if (
        content.match(/console\.(log|info)\(.*password.*\)/i) &&
        !content.includes('[CONFIGURED VIA ENV]') &&
        !content.includes('Resetting password for')
      ) {
        violations.push(`${relPath} logs password values to console.`);
      }
    }

    assert.equal(
      violations.length,
      0,
      `SEC-06 Violation: Found password logging in scripts:\n${violations.join('\n')}`
    );
  });

  // SEC-07: pg-fallback is server-only and securely constrained
  await t.test('SEC-07: pg-fallback.ts enforces server-only execution and safe pool initialization', () => {
    const pgFallbackPath = path.join(ROOT_DIR, 'src/lib/db/pg-fallback.ts');
    const content = fs.readFileSync(pgFallbackPath, 'utf8');

    assert.ok(
      content.includes("import 'server-only';"),
      'pg-fallback.ts must import server-only'
    );
    assert.ok(
      !content.includes('createAuthUserAndProfileDirectly'),
      'pg-fallback.ts must not contain raw createAuthUserAndProfileDirectly'
    );
    assert.ok(
      !content.includes('rejectUnauthorized: false'),
      'pg-fallback.ts must not contain rejectUnauthorized: false'
    );
  });

  // SEC-08: Insecure PostgreSQL TLS configuration is absent
  await t.test('SEC-08: Insecure PostgreSQL TLS (rejectUnauthorized: false) is absent repository-wide', () => {
    const violations: string[] = [];

    for (const filePath of trackedFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

      if (/rejectUnauthorized\s*:\s*false/.test(content)) {
        violations.push(`${relPath} contains insecure TLS setting "rejectUnauthorized: false".`);
      }
    }

    assert.equal(
      violations.length,
      0,
      `SEC-08 Violation: Found insecure TLS configuration in repository files:\n${violations.join('\n')}`
    );
  });

  // SEC-09: Direct auth.users SQL manipulation is absent
  await t.test('SEC-09: Direct raw SQL manipulation of auth.users is absent from application source', () => {
    const srcDir = path.join(ROOT_DIR, 'src');
    const srcFiles = getTrackedFiles(srcDir);
    const violations: string[] = [];

    for (const filePath of srcFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

      if (
        /INSERT\s+INTO\s+auth\.users/i.test(content) ||
        /UPDATE\s+auth\.users/i.test(content) ||
        /DELETE\s+FROM\s+auth\.users/i.test(content)
      ) {
        violations.push(`${relPath} performs direct SQL mutation on auth.users.`);
      }
    }

    assert.equal(
      violations.length,
      0,
      `SEC-09 Violation: Found direct SQL mutation of auth.users in application source:\n${violations.join('\n')}`
    );
  });

  // SEC-10: Existing TASK-0004 authorization behavior remains intact
  await t.test('SEC-10: TASK-0004 authorizeApiRequest authorization guard functions correctly', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/exams');
    const authResult = await authorizeApiRequest(req, {
      roles: ['school_admin', 'exam_officer'],
      scope: 'tenant',
      supabaseClient: {
        auth: {
          getUser: async () => ({ data: { user: null }, error: { message: 'No session' } }),
        },
      } as unknown as NonNullable<Parameters<typeof authorizeApiRequest>[1]>['supabaseClient'],
    });

    assert.equal(authResult.ok, false);
    assert.equal(authResult.response.status, 401);
  });

  // SEC-11: Admin client integrity (AC-010)
  await t.test('SEC-11: Admin client integrity: server-only, fail-closed, no browser exposure', () => {
    const adminPath = path.join(ROOT_DIR, 'src/lib/supabase/admin.ts');
    const content = fs.readFileSync(adminPath, 'utf8');

    assert.ok(
      content.includes("import 'server-only';"),
      'src/lib/supabase/admin.ts must enforce server-only import'
    );
    assert.ok(
      content.includes('requireServiceRoleKey'),
      'src/lib/supabase/admin.ts must validate service role key before instantiation'
    );
  });

  // SEC-12: Service-role consumer audit (AC-011)
  await t.test('SEC-12: All consumers of SUPABASE_SERVICE_ROLE_KEY and DATABASE_URL are server-confined', () => {
    const violations: string[] = [];

    for (const filePath of trackedFiles) {
      if (!filePath.startsWith(path.join(ROOT_DIR, 'src'))) continue;
      const content = fs.readFileSync(filePath, 'utf8');
      const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

      const usesPrivilegedSecrets =
        content.includes('SUPABASE_SERVICE_ROLE_KEY') ||
        content.includes('createAdminClient');

      if (usesPrivilegedSecrets) {
        const isClient =
          content.includes("'use client'") ||
          content.includes('"use client"') ||
          relPath.includes('/components/');

        if (isClient) {
          violations.push(`${relPath} is a client-side module but references service-role credentials/clients.`);
        }
      }
    }

    assert.equal(
      violations.length,
      0,
      `SEC-12 Violation: Found service-role consumers not safely confined:\n${violations.join('\n')}`
    );
  });

  // SEC-13: Authentication flow integrity (AC-013)
  await t.test('SEC-13: Registration and provisioning routes strictly use Supabase Auth APIs', () => {
    const registerRoute = path.join(ROOT_DIR, 'src/app/api/public/register-tenant/route.ts');
    const registerContent = fs.readFileSync(registerRoute, 'utf8');

    assert.ok(
      registerContent.includes('auth.admin.createUser'),
      'register-tenant route must use auth.admin.createUser'
    );
    assert.ok(
      !registerContent.includes('crypt('),
      'register-tenant route must not use pgcrypto crypt()'
    );

    const provisionPath = path.join(ROOT_DIR, 'src/app/[tenant]/login/provision-auth.ts');
    const provisionContent = fs.readFileSync(provisionPath, 'utf8');

    assert.ok(
      provisionContent.includes('adminSupabase.auth.admin.createUser'),
      'provision-auth.ts must use adminSupabase.auth.admin.createUser'
    );
    assert.ok(
      !provisionContent.includes('INSERT INTO auth.users'),
      'provision-auth.ts must not directly insert into auth.users'
    );
  });

  // SEC-14: No unnecessary PostgreSQL pool instantiation on login failure (AC-012)
  await t.test('SEC-14: Tenant login action does not mutate auth.users or execute fallback DB queries on auth failure', () => {
    const loginActionPath = path.join(ROOT_DIR, 'src/app/[tenant]/login/actions.ts');
    const content = fs.readFileSync(loginActionPath, 'utf8');

    assert.ok(
      !content.includes('UPDATE auth.users'),
      'login/actions.ts must not contain UPDATE auth.users'
    );
    assert.ok(
      !content.includes('Staff password sync error'),
      'login/actions.ts must not contain staff password sync fallback'
    );
  });

  // Helper to create mock admin client for profile synchronization and invitation tests
  interface MockInvitation {
    id: string;
    email: string;
    tenant_id: string;
    role: string;
    full_name?: string | null;
    created_by?: string | null;
    created_at?: string;
    expires_at: string;
    accepted_at?: string | null;
    accepted_by?: string | null;
    token?: string | null;
    status: 'pending' | 'accepted' | 'expired' | 'revoked';
    [key: string]: unknown;
  }

  interface MockProfile {
    id: string;
    email?: string;
    role: string;
    tenant_id: string;
    full_name?: string;
    [key: string]: unknown;
  }

  /**
   * Creates a mock Supabase admin client for validateAndSyncInvitedProfile() tests.
   *
   * CORRECTION-03 changes:
   * - Added .ilike() to select builder (callback-sync uses .ilike() for email lookup)
   * - Added .rpc('bind_invitation_to_user', ...) simulating the PostgreSQL stored procedure's
   *   atomic binding: SELECT FOR UPDATE, validation, profile insert, invitation consumption.
   * - rpcFailMode allows tests to simulate RPC/transaction failure (rollback scenario).
   */
  function createMockAdminForSync(
    existingProfiles: MockProfile[] = [],
    existingInvitations: MockInvitation[] = [],
    options: {
      failOnTable?: string;
      failOnOperation?: string;
      rpcFailMode?: 'error' | 'false_success' | null;
    } = {}
  ) {
    const profiles = [...existingProfiles];
    const invitations = [...existingInvitations];
    const operations: { type: string; table: string; data: unknown; filters: Record<string, unknown> }[] = [];

    // Simulates bind_invitation_to_user() PostgreSQL stored procedure.
    // Security invariants mirrored from the real function:
    //   - Role, tenant_id, email taken from LOCKED invitation â€” not from parameters.
    //   - Profile insert and invitation consumption are atomic (or both rolled back).
    function simulateBindInvitationRpc(params: { p_invitation_id: string; p_user_id: string }) {
      const now = new Date();
      const inv = invitations.find((i) => i.id === params.p_invitation_id);
      if (!inv) {
        return { data: { success: false, reason: 'invitation_not_found' }, error: null };
      }
      if (inv.status !== 'pending') {
        return { data: { success: false, reason: 'invitation_not_pending', status: inv.status }, error: null };
      }
      if (now > new Date(inv.expires_at)) {
        inv.status = 'expired';
        return { data: { success: false, reason: 'invitation_expired' }, error: null };
      }
      if (inv.accepted_by && inv.accepted_by !== params.p_user_id) {
        return { data: { success: false, reason: 'invitation_bound_to_other_user' }, error: null };
      }
      const emailLower = (inv.email as string).toLowerCase();
      const conflicting = profiles.find(
        (p) => (p.email ?? '').toLowerCase() === emailLower && p.id !== params.p_user_id
      );
      if (conflicting) {
        return { data: { success: false, reason: 'conflicting_existing_profile_identity' }, error: null };
      }
      if (!profiles.find((p) => p.id === params.p_user_id)) {
        profiles.push({
          id: params.p_user_id,
          email: emailLower,
          full_name: (inv.full_name as string | null) ?? 'Staff Member',
          role: inv.role,
          tenant_id: inv.tenant_id,
        });
        operations.push({ type: 'rpc_insert_profile', table: 'profiles', data: { id: params.p_user_id }, filters: {} });
      }
      inv.status = 'accepted';
      inv.accepted_at = now.toISOString();
      inv.accepted_by = params.p_user_id;
      operations.push({ type: 'rpc_update_invitation', table: 'user_invitations', data: { status: 'accepted' }, filters: { id: inv.id } });
      return {
        data: { success: true, role: inv.role, tenant_id: inv.tenant_id, email: emailLower },
        error: null,
      };
    }

    const client = {
      from: (table: string) => {
        const filters: Record<string, unknown> = {};
        const isErrorTable = options.failOnTable === table;

        const queryBuilder = {
          select: () => {
            if (isErrorTable && (!options.failOnOperation || options.failOnOperation === 'select')) {
              const failBuilder = {
                eq: () => failBuilder,
                ilike: () => failBuilder,
                order: () => failBuilder,
                limit: () => failBuilder,
                maybeSingle: async () => ({ data: null, error: new Error(`Simulated select error on ${table}`) }),
              };
              return failBuilder;
            }
            const selectBuilder = {
              eq: (col: string, val: unknown) => { filters[col] = val; return selectBuilder; },
              ilike: (col: string, val: unknown) => {
                filters[`ilike:${col}`] = (val as string).toLowerCase();
                return selectBuilder;
              },
              order: () => selectBuilder,
              limit: () => selectBuilder,
              maybeSingle: async () => {
                const list: Record<string, unknown>[] = table === 'profiles' ? profiles : invitations;
                const found = list.find((item) =>
                  Object.entries(filters).every(([k, v]) => {
                    if (k.startsWith('ilike:')) {
                      const field = k.replace('ilike:', '');
                      return ((item[field] as string) ?? '').toLowerCase() === v;
                    }
                    return item[k] === v;
                  })
                );
                return { data: found ? { ...found } : null, error: null };
              },
            };
            return selectBuilder;
          },
          delete: () => ({
            eq: (col: string, val: unknown) => {
              if (isErrorTable && (!options.failOnOperation || options.failOnOperation === 'delete')) {
                return Promise.resolve({ error: new Error(`Simulated delete error on ${table}`) });
              }
              operations.push({ type: 'delete', table, data: null, filters: { [col]: val } });
              if (table === 'profiles') {
                const idx = profiles.findIndex((p) => p[col] === val);
                if (idx !== -1) profiles.splice(idx, 1);
              } else if (table === 'user_invitations') {
                const idx = invitations.findIndex((i) => i[col] === val);
                if (idx !== -1) invitations.splice(idx, 1);
              }
              return Promise.resolve({ error: null });
            },
          }),
          insert: (data: unknown) => {
            if (isErrorTable && (!options.failOnOperation || options.failOnOperation === 'insert')) {
              return Promise.resolve({ data: null, error: new Error(`Simulated insert error on ${table}`) });
            }
            operations.push({ type: 'insert', table, data, filters: {} });
            if (table === 'profiles') profiles.push({ ...(data as MockProfile) });
            else if (table === 'user_invitations') invitations.push({ ...(data as MockInvitation) });
            return Promise.resolve({ data, error: null });
          },
          update: (data: unknown) => {
            const updateFilters: Record<string, unknown> = {};
            const updateBuilder = {
              eq: (col: string, val: unknown) => { updateFilters[col] = val; return updateBuilder; },
              ilike: (col: string, val: unknown) => {
                updateFilters[`ilike:${col}`] = (val as string).toLowerCase();
                return updateBuilder;
              },
              then: (resolve: (arg: unknown) => unknown) => {
                if (isErrorTable && (!options.failOnOperation || options.failOnOperation === 'update')) {
                  return resolve({ error: new Error(`Simulated update error on ${table}`) });
                }
                operations.push({ type: 'update', table, data, filters: updateFilters });
                const list: Record<string, unknown>[] = table === 'profiles' ? profiles : invitations;
                const target = list.find((item) =>
                  Object.entries(updateFilters).every(([k, v]) => item[k] === v)
                );
                if (target) Object.assign(target, data);
                return resolve({ error: null });
              },
            };
            return updateBuilder;
          },
        };
        return queryBuilder;
      },
      // RPC handler â€” simulates bind_invitation_to_user() PostgreSQL stored procedure
      rpc: (fn: string, params: Record<string, unknown>) => {
        if (fn === 'bind_invitation_to_user') {
          if (options.rpcFailMode === 'error') {
            return Promise.resolve({ data: null, error: new Error('Simulated RPC execution error') });
          }
          if (options.rpcFailMode === 'false_success') {
            return Promise.resolve({ data: { success: false, reason: 'simulated_rpc_rejection' }, error: null });
          }
          return Promise.resolve(
            simulateBindInvitationRpc(params as { p_invitation_id: string; p_user_id: string })
          );
        }
        return Promise.resolve({ data: null, error: new Error(`Unknown RPC function: ${fn}`) });
      },
    } as unknown as ReturnType<typeof createAdminClient>;

    return { profiles, invitations, operations, client };
  }

  // SEC-15: Callback route rejects untrusted user_metadata.role (privilege escalation defense)
  await t.test('SEC-15: Callback route rejects or ignores untrusted user_metadata.role (privilege escalation defense)', async () => {
    const callbackPath = path.join(ROOT_DIR, 'src/app/api/auth/callback/route.ts');
    const content = fs.readFileSync(callbackPath, 'utf8');
    assert.ok(!content.includes('role: meta.role'),
      'src/app/api/auth/callback/route.ts must not directly write role: meta.role into profiles');

    const mock = createMockAdminForSync([]);
    const attackerUser = {
      id: 'attacker-uuid-1',
      email: 'attacker@evil.com',
      user_metadata: { role: 'super_admin', tenant_id: 'target-tenant-uuid' },
    };
    const result = await validateAndSyncInvitedProfile(attackerUser, () => mock.client);
    assert.equal(result.synced, false, 'Unprovisioned user sync must fail');
    assert.equal(result.trusted, false, 'Unprovisioned user must not be trusted');
    assert.notEqual(result.role, 'super_admin', 'Attacker must not be assigned super_admin role');
    assert.equal(mock.profiles.length, 0, 'No profile row must be created for untrusted user');
  });

  // SEC-16: Callback route rejects untrusted user_metadata.tenant_id (cross-tenant spoofing)
  await t.test('SEC-16: Callback route rejects or ignores untrusted user_metadata.tenant_id (cross-tenant spoofing defense)', async () => {
    const callbackPath = path.join(ROOT_DIR, 'src/app/api/auth/callback/route.ts');
    const content = fs.readFileSync(callbackPath, 'utf8');
    assert.ok(!content.includes('tenant_id: meta.tenant_id'),
      'src/app/api/auth/callback/route.ts must not directly write tenant_id: meta.tenant_id into profiles');

    const mock = createMockAdminForSync([]);
    const attackerUser = {
      id: 'attacker-uuid-2',
      email: 'spoofed@evil.com',
      user_metadata: { role: 'school_admin', tenant_id: 'victim-school-uuid' },
    };
    const result = await validateAndSyncInvitedProfile(attackerUser, () => mock.client);
    assert.equal(result.synced, false, 'Untrusted tenant spoofing sync must fail');
    assert.equal(result.trusted, false, 'Untrusted tenant spoofing must not be marked trusted');
    assert.notEqual(result.tenantId, 'victim-school-uuid', 'Attacker must not be bound to victim tenant');
    assert.equal(mock.profiles.length, 0, 'No profile row must be created for untrusted tenant request');
  });

  // SEC-17: Existing profile preserves authoritative role/tenant against metadata escalation
  await t.test('SEC-17: Callback route establishes and validates trusted invitation/provisioning source first', async () => {
    const existingStudentProfile = {
      id: 'student-uuid-1',
      email: 'student@school.edu',
      role: 'student',
      tenant_id: 'school-tenant-1',
      full_name: 'Legitimate Student',
    };
    const mock = createMockAdminForSync([existingStudentProfile]);
    const studentUser = {
      id: 'student-uuid-1',
      email: 'student@school.edu',
      user_metadata: { role: 'super_admin', tenant_id: 'arbitrary-tenant-id' },
    };
    const result = await validateAndSyncInvitedProfile(studentUser, () => mock.client);
    assert.equal(result.synced, true);
    assert.equal(result.trusted, true);
    assert.equal(result.role, 'student', 'Existing authoritative role must be preserved');
    assert.equal(result.tenantId, 'school-tenant-1', 'Existing authoritative tenant must be preserved');
    const dbProfile = mock.profiles.find((p) => p.id === 'student-uuid-1');
    assert.ok(dbProfile);
    assert.equal(dbProfile.role, 'student', 'Database profile role must remain student');
    assert.equal(dbProfile.tenant_id, 'school-tenant-1', 'Database profile tenant must remain school-tenant-1');
  });

  // SEC-18: Legitimate invitation acceptance works via server-authoritative data
  await t.test('SEC-18: Legitimate invitation behavior is preserved using server-authoritative data', async () => {
    const authoritativeInvitation: MockInvitation = {
      id: 'inv-legit-1',
      email: 'newadmin@school.org',
      role: 'school_admin',
      tenant_id: 'authorized-school-uuid',
      full_name: 'New School Admin',
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    };
    const mock = createMockAdminForSync([], [authoritativeInvitation]);
    const invitedUser = {
      id: 'final-gotrue-auth-id',
      email: 'newadmin@school.org',
      user_metadata: { full_name: 'New School Admin Updated' },
    };
    const result = await validateAndSyncInvitedProfile(invitedUser, () => mock.client);
    assert.equal(result.synced, true);
    assert.equal(result.trusted, true);
    assert.equal(result.role, 'school_admin', 'Role must come from authoritative invitation record');
    assert.equal(result.tenantId, 'authorized-school-uuid', 'Tenant must come from authoritative invitation record');
    const createdProfile = mock.profiles.find((p) => p.id === 'final-gotrue-auth-id');
    assert.ok(createdProfile, 'Profile must be linked to final auth user ID');
    assert.equal(createdProfile.role, 'school_admin');
    assert.equal(createdProfile.tenant_id, 'authorized-school-uuid');
    const inv = mock.invitations.find((i) => i.id === 'inv-legit-1');
    assert.ok(inv);
    assert.equal(inv.status, 'accepted');
    assert.equal(inv.accepted_by, 'final-gotrue-auth-id');
  });

  // SEC-19: Arbitrary existing profile by email is not proof of invitation
  await t.test('SEC-19: Arbitrary existing profile by email is not sufficient evidence of invitation', async () => {
    const existingProfile = {
      id: 'target-existing-id',
      email: 'victim@school.edu',
      role: 'school_admin',
      tenant_id: 'victim-school-uuid',
      full_name: 'Existing Staff',
    };
    const mock = createMockAdminForSync([existingProfile], []);
    const attackerUser = {
      id: 'attacker-gotrue-id',
      email: 'victim@school.edu',
      user_metadata: {},
    };
    const result = await validateAndSyncInvitedProfile(attackerUser, () => mock.client);
    assert.equal(result.synced, false, 'Arbitrary email match without invitation must fail sync');
    assert.equal(result.trusted, false, 'Arbitrary email match without invitation must not be trusted');
    assert.equal(mock.profiles.length, 1, 'No new profile row or overwrite permitted');
    assert.equal(mock.profiles[0].id, 'target-existing-id', 'Existing profile must not be re-linked to attacker ID');
  });

  // SEC-20: Expired invitation rejected
  await t.test('SEC-20: Expired invitation rejected', async () => {
    const expiredInvitation: MockInvitation = {
      id: 'inv-expired-1',
      email: 'lateuser@school.org',
      role: 'teacher',
      tenant_id: 'school-uuid-1',
      status: 'pending',
      expires_at: new Date(Date.now() - 3600000).toISOString(),
    };
    const mock = createMockAdminForSync([], [expiredInvitation]);
    const lateUser = { id: 'late-user-gotrue-id', email: 'lateuser@school.org', user_metadata: {} };
    const result = await validateAndSyncInvitedProfile(lateUser, () => mock.client);
    assert.equal(result.synced, false, 'Expired invitation must fail sync');
    assert.equal(result.trusted, false, 'Expired invitation must not be trusted');
    assert.equal(result.reason, 'invitation_expired');
    assert.equal(mock.profiles.length, 0, 'No profile created for expired invitation');
  });

  // SEC-21: Consumed invitation cannot be replayed
  await t.test('SEC-21: Consumed invitation cannot be replayed', async () => {
    const consumedInvitation: MockInvitation = {
      id: 'inv-consumed-1',
      email: 'invited@school.org',
      role: 'teacher',
      tenant_id: 'school-uuid-1',
      status: 'accepted',
      accepted_at: new Date(Date.now() - 86400000).toISOString(),
      accepted_by: 'original-user-id',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    const mock = createMockAdminForSync([], [consumedInvitation]);
    const replayUser = { id: 'replay-attacker-id', email: 'invited@school.org', user_metadata: {} };
    const result = await validateAndSyncInvitedProfile(replayUser, () => mock.client);
    assert.equal(result.synced, false, 'Replayed invitation must fail sync');
    assert.equal(result.trusted, false, 'Replayed invitation must not be trusted');
    assert.equal(result.reason, 'no_authoritative_invitation', 'Consumed invitation not found via pending-only lookup');
    assert.equal(mock.profiles.length, 0, 'No profile created for consumed invitation');
  });

  // SEC-22: Invitation cannot be rebound to a second GoTrue user
  await t.test('SEC-22: Invitation cannot be rebound to a second GoTrue user', async () => {
    const boundInvitation: MockInvitation = {
      id: 'inv-bound-1',
      email: 'bound@school.org',
      role: 'school_admin',
      tenant_id: 'school-uuid-1',
      status: 'pending',
      accepted_by: 'first-user-uuid',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    const mock = createMockAdminForSync([], [boundInvitation]);
    const secondUser = { id: 'second-user-uuid', email: 'bound@school.org', user_metadata: {} };
    const result = await validateAndSyncInvitedProfile(secondUser, () => mock.client);
    assert.equal(result.synced, false, 'Rebinding invitation to second user must fail');
    assert.equal(result.trusted, false, 'Rebinding invitation must not be trusted');
    assert.equal(result.reason, 'invitation_bound_to_other_user');
    assert.equal(mock.profiles.length, 0, 'No profile created for rebinding attempt');
  });

  // SEC-23: Role comes only from invitation/provisioning record
  await t.test('SEC-23: Role comes only from invitation/provisioning record', async () => {
    const invitation: MockInvitation = {
      id: 'inv-role-test',
      email: 'staff@school.org',
      role: 'teacher',
      tenant_id: 'school-uuid-1',
      status: 'pending',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    const mock = createMockAdminForSync([], [invitation]);
    const userWithMetadata = {
      id: 'staff-auth-id',
      email: 'staff@school.org',
      user_metadata: { role: 'super_admin' },
    };
    const result = await validateAndSyncInvitedProfile(userWithMetadata, () => mock.client);
    assert.equal(result.synced, true);
    assert.equal(result.trusted, true);
    assert.equal(result.role, 'teacher', 'Resulting role must come strictly from invitation');
    assert.notEqual(result.role, 'super_admin', 'Attacker metadata role must be ignored');
    const created = mock.profiles.find((p) => p.id === 'staff-auth-id');
    assert.ok(created);
    assert.equal(created.role, 'teacher', 'Database profile role must be teacher');
  });

  // SEC-24: Tenant comes only from invitation/provisioning record
  await t.test('SEC-24: Tenant comes only from invitation/provisioning record', async () => {
    const invitation: MockInvitation = {
      id: 'inv-tenant-test',
      email: 'staff2@school.org',
      role: 'teacher',
      tenant_id: 'school-uuid-legit',
      status: 'pending',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    const mock = createMockAdminForSync([], [invitation]);
    const userWithMetadata = {
      id: 'staff2-auth-id',
      email: 'staff2@school.org',
      user_metadata: { tenant_id: 'victim-tenant-spoofed' },
    };
    const result = await validateAndSyncInvitedProfile(userWithMetadata, () => mock.client);
    assert.equal(result.synced, true);
    assert.equal(result.trusted, true);
    assert.equal(result.tenantId, 'school-uuid-legit', 'Resulting tenant must come strictly from invitation');
    assert.notEqual(result.tenantId, 'victim-tenant-spoofed', 'Attacker metadata tenant must be ignored');
    const created = mock.profiles.find((p) => p.id === 'staff2-auth-id');
    assert.ok(created);
    assert.equal(created.tenant_id, 'school-uuid-legit', 'Database profile tenant must be school-uuid-legit');
  });

  // SEC-25: Profile binding is atomic â€” uses RPC, no compensating delete
  await t.test('SEC-25: Profile binding is atomic / failed binding does not delete the original record', async () => {
    const callbackSyncPath = path.join(ROOT_DIR, 'src/lib/auth/callback-sync.ts');
    const syncSource = fs.readFileSync(callbackSyncPath, 'utf8');
    assert.ok(
      syncSource.includes("rpc('bind_invitation_to_user'"),
      'callback-sync.ts must use the atomic RPC for new profile binding'
    );
    assert.ok(
      !syncSource.includes(".delete().eq('id', user.id)") &&
      !syncSource.includes('.delete().eq("id", user.id)'),
      'callback-sync.ts must not contain application-level compensating delete on profiles'
    );

    const invitation: MockInvitation = {
      id: 'inv-atomic-test',
      email: 'atomic@school.org',
      role: 'teacher',
      tenant_id: 'school-uuid-1',
      status: 'pending',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    const mock = createMockAdminForSync([], [invitation], { rpcFailMode: 'error' });
    const user = { id: 'atomic-auth-id', email: 'atomic@school.org', user_metadata: {} };
    const result = await validateAndSyncInvitedProfile(user, () => mock.client);
    assert.equal(result.synced, false, 'RPC failure must report sync failure');
    assert.equal(result.trusted, false, 'RPC failure must not be marked trusted');
    const inv = mock.invitations.find((i) => i.id === 'inv-atomic-test');
    assert.ok(inv, 'Original invitation must be preserved');
    assert.equal(inv.status, 'pending', 'Invitation status must remain pending after RPC failure (rollback)');
    assert.equal(mock.profiles.length, 0, 'No profile must exist after RPC failure (rollback)');
  });

  // SEC-26: Database errors fail closed
  await t.test('SEC-26: Database errors fail closed', async () => {
    const invitation: MockInvitation = {
      id: 'inv-db-err',
      email: 'dberror@school.org',
      role: 'teacher',
      tenant_id: 'school-uuid-1',
      status: 'pending',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    const mock = createMockAdminForSync([], [invitation], {
      failOnTable: 'user_invitations',
      failOnOperation: 'select',
    });
    const user = { id: 'dberr-auth-id', email: 'dberror@school.org', user_metadata: {} };
    const result = await validateAndSyncInvitedProfile(user, () => mock.client);
    assert.equal(result.synced, false, 'Database error must fail closed');
    assert.equal(result.trusted, false, 'Database error must not be trusted');
    assert.equal(result.reason, 'database_error');
    assert.equal(mock.profiles.length, 0, 'No profile created on database error');
  });

  // SEC-27: Conflicting existing user/profile identity is rejected
  await t.test('SEC-27: Conflicting existing user/profile identity is rejected', async () => {
    const existingProfile = {
      id: 'existing-user-uuid',
      email: 'user@school.org',
      role: 'student',
      tenant_id: 'tenant-alpha',
      full_name: 'Existing Alpha Student',
    };
    const conflictingInvitation: MockInvitation = {
      id: 'inv-conflict-1',
      email: 'user@school.org',
      role: 'school_admin',
      tenant_id: 'tenant-beta',
      status: 'pending',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    const mockA = createMockAdminForSync([existingProfile], [conflictingInvitation]);
    const userA = { id: 'existing-user-uuid', email: 'user@school.org', user_metadata: {} };
    const resultA = await validateAndSyncInvitedProfile(userA, () => mockA.client);
    assert.equal(resultA.synced, false, 'Conflicting identity binding must fail');
    assert.equal(resultA.trusted, false);
    assert.equal(resultA.reason, 'conflicting_identity_binding');

    const existingOtherProfile = {
      id: 'other-user-uuid',
      email: 'shared@school.org',
      role: 'teacher',
      tenant_id: 'school-uuid-1',
      full_name: 'Legitimate Owner',
    };
    const validInvitation: MockInvitation = {
      id: 'inv-conflict-2',
      email: 'shared@school.org',
      role: 'teacher',
      tenant_id: 'school-uuid-1',
      status: 'pending',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    const mockB = createMockAdminForSync([existingOtherProfile], [validInvitation]);
    const rogueUser = { id: 'rogue-attacker-uuid', email: 'shared@school.org', user_metadata: {} };
    const resultB = await validateAndSyncInvitedProfile(rogueUser, () => mockB.client);
    assert.equal(resultB.synced, false, 'Conflicting profile email with different ID must fail');
    assert.equal(resultB.trusted, false);
    assert.equal(resultB.reason, 'conflicting_existing_profile_identity');
  });

  // SEC-28: Attacker user_metadata cannot alter invitation role, tenant, or identity
  await t.test('SEC-28: Attacker-controlled user_metadata cannot alter invitation role, tenant, or identity binding', async () => {
    const invitation: MockInvitation = {
      id: 'inv-metadata-override',
      email: 'target@school.org',
      role: 'student',
      tenant_id: 'school-student-tenant',
      full_name: 'Enrolled Student',
      status: 'pending',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    const mock = createMockAdminForSync([], [invitation]);
    const attacker = {
      id: 'attacker-auth-override-id',
      email: 'target@school.org',
      user_metadata: {
        role: 'super_admin',
        tenant_id: 'spoofed-root-tenant',
        status: 'accepted',
        accepted_by: 'attacker-auth-override-id',
        id: 'some-other-id',
      },
    };
    const result = await validateAndSyncInvitedProfile(attacker, () => mock.client);
    assert.equal(result.synced, true);
    assert.equal(result.trusted, true);
    assert.equal(result.role, 'student', 'Role must remain student from authoritative invitation');
    assert.equal(result.tenantId, 'school-student-tenant', 'Tenant must remain school-student-tenant');
    const created = mock.profiles.find((p) => p.id === 'attacker-auth-override-id');
    assert.ok(created);
    assert.equal(created.role, 'student');
    assert.equal(created.tenant_id, 'school-student-tenant');
  });

  // â”€â”€ CORRECTION-03: SEC-29 through SEC-38 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // SEC-29: Transactional binding â€” profile and invitation atomically succeed or fail together
  await t.test('SEC-29: Transactional binding: profile and invitation consumption succeed or fail atomically', async () => {
    // Sub-case A: Successful binding â€” profile created AND invitation consumed
    const inv1: MockInvitation = {
      id: 'inv-txn-1', email: 'txnuser@school.org', role: 'teacher',
      tenant_id: 'txn-school-uuid', status: 'pending',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    const mockA = createMockAdminForSync([], [inv1]);
    const user1 = { id: 'txn-user-id', email: 'txnuser@school.org', user_metadata: {} };
    const resultA = await validateAndSyncInvitedProfile(user1, () => mockA.client);
    assert.equal(resultA.synced, true, 'Successful binding must report synced=true');
    assert.equal(mockA.profiles.length, 1, 'Profile must be created on success');
    assert.equal(mockA.profiles[0].role, 'teacher', 'Profile role must come from invitation');
    const invA = mockA.invitations.find((i) => i.id === 'inv-txn-1');
    assert.ok(invA);
    assert.equal(invA.status, 'accepted', 'Invitation must be consumed on success');
    assert.equal(invA.accepted_by, 'txn-user-id', 'accepted_by must be the authenticated user id');

    // Sub-case B: RPC failure â€” neither profile created nor invitation consumed (rollback)
    const inv2: MockInvitation = {
      id: 'inv-txn-2', email: 'txnuser2@school.org', role: 'teacher',
      tenant_id: 'txn-school-uuid', status: 'pending',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    const mockB = createMockAdminForSync([], [inv2], { rpcFailMode: 'error' });
    const user2 = { id: 'txn-user-2-id', email: 'txnuser2@school.org', user_metadata: {} };
    const resultB = await validateAndSyncInvitedProfile(user2, () => mockB.client);
    assert.equal(resultB.synced, false, 'Failed binding must report synced=false');
    assert.equal(mockB.profiles.length, 0, 'No profile must exist after RPC failure');
    const invB = mockB.invitations.find((i) => i.id === 'inv-txn-2');
    assert.ok(invB);
    assert.equal(invB.status, 'pending', 'Invitation must remain pending after RPC failure (rollback)');
  });

  // SEC-30: Concurrent invitation acceptance â€” exactly one succeeds
  await t.test('SEC-30: Concurrent invitation acceptance: exactly one succeeds, one fails', async () => {
    // CONCURRENCY LIMITATION: This test environment has no live PostgreSQL connection.
    // True database-level race safety is provided by SELECT FOR UPDATE in
    // 045_bind_invitation_rpc.sql. This test verifies the logical invariant sequentially.
    // A full concurrent integration test requires a live Supabase project with two
    // simultaneous Supabase client connections â€” this is PENDING human action.

    const invitation: MockInvitation = {
      id: 'inv-concurrent-1', email: 'concurrent@school.org', role: 'teacher',
      tenant_id: 'concurrent-school-uuid', status: 'pending',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    const mock = createMockAdminForSync([], [invitation]);
    const userA = { id: 'concurrent-user-1', email: 'concurrent@school.org', user_metadata: {} };
    const userB = { id: 'concurrent-user-2', email: 'concurrent@school.org', user_metadata: {} };

    const result1 = await validateAndSyncInvitedProfile(userA, () => mock.client);
    const result2 = await validateAndSyncInvitedProfile(userB, () => mock.client);

    assert.equal(result1.synced, true, 'First acceptor must succeed');
    assert.equal(result2.synced, false, 'Second acceptor must fail (invitation no longer pending)');
    assert.equal(mock.profiles.length, 1, 'Exactly one profile must be created');
    assert.equal(mock.profiles[0].id, 'concurrent-user-1', 'Profile must belong to the first acceptor');
    const inv = mock.invitations.find((i) => i.id === 'inv-concurrent-1');
    assert.ok(inv);
    assert.equal(inv.status, 'accepted', 'Invitation must be accepted exactly once');
    assert.equal(inv.accepted_by, 'concurrent-user-1', 'accepted_by must be the first acceptor');
  });

  // SEC-31: Token security â€” no bearer credential generated, stored, returned, or logged
  await t.test('SEC-31: Token security: invitation token column is unused and no bearer credential is exposed', () => {
    const invContent = fs.readFileSync(path.join(ROOT_DIR, 'src/lib/auth/invitations.ts'), 'utf8');
    assert.ok(
      !invContent.includes('token: crypto') &&
      !invContent.includes('token: randomUUID') &&
      !invContent.includes('token: generateToken'),
      'invitations.ts must not generate or store raw token values'
    );

    const syncContent = fs.readFileSync(path.join(ROOT_DIR, 'src/lib/auth/callback-sync.ts'), 'utf8');
    // The token field must not be read as a return value
    assert.ok(
      !syncContent.match(/return.*invitation\.token/),
      'callback-sync.ts must not return invitation.token'
    );
    // Token status must be documented
    assert.ok(
      syncContent.toLowerCase().includes('unused'),
      'callback-sync.ts must document that the token column is currently unused'
    );

    // Migration must not populate the token column
    const migContent = fs.readFileSync(path.join(ROOT_DIR, 'supabase/migrations/045_bind_invitation_rpc.sql'), 'utf8');
    assert.ok(
      !migContent.includes('token :=') && !migContent.includes("token ="),
      '045 migration must not assign any token value'
    );
  });

  // SEC-32: GoTrue/application correlation â€” authentication alone doesn't grant role/tenant
  await t.test('SEC-32: GoTrue/application correlation: authentication alone does not grant invitation role/tenant', async () => {
    const syncContent = fs.readFileSync(path.join(ROOT_DIR, 'src/lib/auth/callback-sync.ts'), 'utf8');
    assert.ok(
      syncContent.includes('GoTrue') || syncContent.includes('GoTrue/application'),
      'callback-sync.ts must document the GoTrue/application invitation correlation'
    );
    assert.ok(
      syncContent.includes('user_metadata') && syncContent.includes('never'),
      'callback-sync.ts must explicitly state that user_metadata is never authoritative'
    );

    // Behavioral: authenticated user with valid GoTrue session but NO pending invitation
    const mock = createMockAdminForSync([], []);
    const authenticatedUser = {
      id: 'authenticated-but-uninvited',
      email: 'uninvited@school.org',
      user_metadata: { full_name: 'Legitimate GoTrue User' },
    };
    const result = await validateAndSyncInvitedProfile(authenticatedUser, () => mock.client);
    assert.equal(result.synced, false, 'Authenticated user without invitation must not be synced');
    assert.equal(result.trusted, false, 'Authentication alone must not grant trust');
    assert.equal(result.reason, 'no_authoritative_invitation');
    assert.equal(result.role, undefined, 'No role must be assigned without authoritative invitation');
    assert.equal(result.tenantId, undefined, 'No tenant must be assigned without authoritative invitation');
    assert.equal(mock.profiles.length, 0, 'No profile must be created for uninvited authenticated user');
  });

  // SEC-33: Metadata manipulation cannot alter authoritative role, tenant, email
  await t.test('SEC-33: user_metadata manipulation cannot alter authoritative role, tenant, email, or full_name', async () => {
    const invitation: MockInvitation = {
      id: 'inv-meta-override',
      email: 'legitimate@school.org',
      role: 'student',
      tenant_id: 'correct-tenant-uuid',
      full_name: 'Authorized Student',
      status: 'pending',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    const mock = createMockAdminForSync([], [invitation]);
    const attacker = {
      id: 'meta-attacker-id',
      email: 'legitimate@school.org',
      user_metadata: {
        role: 'super_admin', tenant_id: 'stolen-tenant', full_name: 'Hacked Name',
        email: 'hacker@evil.com', id: 'fake-user-id',
        accepted_by: 'meta-attacker-id', status: 'accepted',
      },
    };
    const result = await validateAndSyncInvitedProfile(attacker, () => mock.client);
    assert.equal(result.synced, true, 'Legitimate invited user must succeed');
    assert.equal(result.trusted, true);
    assert.equal(result.role, 'student', 'Role must come from invitation, not metadata');
    assert.equal(result.tenantId, 'correct-tenant-uuid', 'Tenant must come from invitation, not metadata');
    const profile = mock.profiles.find((p) => p.id === 'meta-attacker-id');
    assert.ok(profile, 'Profile must be created');
    assert.equal(profile.role, 'student', 'Profile role must be student from invitation');
    assert.equal(profile.tenant_id, 'correct-tenant-uuid', 'Profile tenant must be from invitation');
    assert.equal(profile.email, 'legitimate@school.org', 'Profile email must be the invitation email, not metadata');
    assert.notEqual(profile.email, 'hacker@evil.com', 'Metadata email must not override invitation email');
    const inv = mock.invitations.find((i) => i.id === 'inv-meta-override');
    assert.ok(inv);
    assert.equal(inv.status, 'accepted');
    assert.equal(inv.accepted_by, 'meta-attacker-id');
  });

  // SEC-34: Replay after successful acceptance
  await t.test('SEC-34: Replay after successful acceptance: the same invitation cannot be reused', async () => {
    const invitation: MockInvitation = {
      id: 'inv-replay-after-accept',
      email: 'onetime@school.org',
      role: 'teacher',
      tenant_id: 'school-replay-uuid',
      status: 'pending',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    const mock = createMockAdminForSync([], [invitation]);
    const legitUser = { id: 'legit-user-id', email: 'onetime@school.org', user_metadata: {} };
    const result1 = await validateAndSyncInvitedProfile(legitUser, () => mock.client);
    assert.equal(result1.synced, true, 'First acceptance must succeed');

    const replayUser = { id: 'replay-attacker-id', email: 'onetime@school.org', user_metadata: {} };
    const result2 = await validateAndSyncInvitedProfile(replayUser, () => mock.client);
    assert.equal(result2.synced, false, 'Replay of accepted invitation must fail');
    assert.equal(result2.trusted, false);
    assert.equal(result2.reason, 'no_authoritative_invitation', 'Accepted invitation not returned by pending-only query');
    assert.equal(mock.profiles.length, 1, 'Only one profile must exist after replay attempt');
    assert.equal(mock.profiles[0].id, 'legit-user-id', 'Profile must belong to legitimate user only');
  });

  // SEC-35: Expired invitation cannot bind accounts
  await t.test('SEC-35: Expired invitation cannot bind accounts', async () => {
    const expiredInvitation: MockInvitation = {
      id: 'inv-sec35-expired',
      email: 'expired35@school.org',
      role: 'teacher',
      tenant_id: 'school-uuid-1',
      status: 'pending',
      expires_at: new Date(Date.now() - 7200000).toISOString(),
    };
    const mock = createMockAdminForSync([], [expiredInvitation]);
    const user = { id: 'sec35-user-id', email: 'expired35@school.org', user_metadata: {} };
    const result = await validateAndSyncInvitedProfile(user, () => mock.client);
    assert.equal(result.synced, false, 'Expired invitation must not allow binding');
    assert.equal(result.trusted, false);
    assert.equal(result.reason, 'invitation_expired');
    assert.equal(mock.profiles.length, 0, 'No profile must be created for expired invitation');
    const inv = mock.invitations.find((i) => i.id === 'inv-sec35-expired');
    assert.ok(inv);
    assert.equal(inv.status, 'expired', 'Expired invitation must be marked expired');
  });

  // SEC-36: Revoked invitation cannot bind accounts
  await t.test('SEC-36: Revoked invitation cannot bind accounts', async () => {
    const revokedInvitation: MockInvitation = {
      id: 'inv-sec36-revoked',
      email: 'revoked36@school.org',
      role: 'teacher',
      tenant_id: 'school-uuid-1',
      status: 'revoked',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    const mock = createMockAdminForSync([], [revokedInvitation]);
    const user = { id: 'sec36-user-id', email: 'revoked36@school.org', user_metadata: {} };
    const result = await validateAndSyncInvitedProfile(user, () => mock.client);
    assert.equal(result.synced, false, 'Revoked invitation must not allow binding');
    assert.equal(result.trusted, false);
    assert.equal(result.reason, 'no_authoritative_invitation', 'Revoked invitation not found via pending-only query');
    assert.equal(mock.profiles.length, 0, 'No profile must be created for revoked invitation');
  });

  // SEC-37: Cross-tenant invitation abuse
  await t.test('SEC-37: Cross-tenant invitation abuse: user cannot use another tenant invitation', async () => {
    const tenantAInvitation: MockInvitation = {
      id: 'inv-sec37-tenant-a',
      email: 'staffA@tenant-a.org',
      role: 'teacher',
      tenant_id: 'tenant-a-uuid',
      status: 'pending',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    const mock = createMockAdminForSync([], [tenantAInvitation]);
    const attackerFromTenantB = {
      id: 'tenant-b-attacker-uuid',
      email: 'staffB@tenant-b.org',
      user_metadata: { tenant_id: 'tenant-a-uuid' },
    };
    const result = await validateAndSyncInvitedProfile(attackerFromTenantB, () => mock.client);
    assert.equal(result.synced, false, 'Cross-tenant invitation abuse must fail');
    assert.equal(result.trusted, false);
    assert.equal(result.reason, 'no_authoritative_invitation', 'No invitation exists for attacker email');
    assert.equal(result.tenantId, undefined, 'Attacker must not receive Tenant A membership');
    assert.equal(mock.profiles.length, 0, 'No profile created for cross-tenant attack');
    const inv = mock.invitations.find((i) => i.id === 'inv-sec37-tenant-a');
    assert.ok(inv);
    assert.equal(inv.status, 'pending', 'Tenant A invitation must remain pending');
  });

  // SEC-38: Existing identity conflict via invitation abuse
  await t.test('SEC-38: Existing identity conflict: existing account cannot be rebound through invitation', async () => {
    const establishedProfile = {
      id: 'established-user-uuid',
      email: 'established@school.org',
      role: 'student',
      tenant_id: 'tenant-alpha',
      full_name: 'Established Student',
    };
    const upgradeInvitation: MockInvitation = {
      id: 'inv-sec38-upgrade',
      email: 'established@school.org',
      role: 'super_admin',
      tenant_id: 'tenant-beta',
      status: 'pending',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    const mock = createMockAdminForSync([establishedProfile], [upgradeInvitation]);
    const user = {
      id: 'established-user-uuid',
      email: 'established@school.org',
      user_metadata: {},
    };
    const result = await validateAndSyncInvitedProfile(user, () => mock.client);
    assert.equal(result.synced, false, 'Conflicting invitation against established profile must fail');
    assert.equal(result.trusted, false);
    assert.equal(result.reason, 'conflicting_identity_binding', 'Must report conflicting_identity_binding');
    const existingProfile = mock.profiles.find((p) => p.id === 'established-user-uuid');
    assert.ok(existingProfile, 'Established profile must still exist');
    assert.equal(existingProfile.role, 'student', 'Role must remain student, not super_admin');
    assert.equal(existingProfile.tenant_id, 'tenant-alpha', 'Tenant must remain tenant-alpha, not tenant-beta');
  });
});
