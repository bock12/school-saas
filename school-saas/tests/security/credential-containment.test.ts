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

  function createMockAdminForSync(
    existingProfiles: MockProfile[] = [],
    existingInvitations: MockInvitation[] = [],
    options: {
      failOnTable?: string;
      failOnOperation?: string;
    } = {}
  ) {
    const profiles = [...existingProfiles];
    const invitations = [...existingInvitations];
    const operations: { type: string; table: string; data: unknown; filters: Record<string, unknown> }[] = [];

    return {
      profiles,
      invitations,
      operations,
      client: {
        from: (table: string) => {
          const filters: Record<string, unknown> = {};
          const isErrorTable = options.failOnTable === table;

          const queryBuilder = {
            select: () => {
              if (isErrorTable && (!options.failOnOperation || options.failOnOperation === 'select')) {
                const failBuilder = {
                  eq: () => failBuilder,
                  order: () => failBuilder,
                  limit: () => failBuilder,
                  maybeSingle: async () => ({ data: null, error: new Error(`Simulated select error on ${table}`) }),
                };
                return failBuilder;
              }

              const selectBuilder = {
                eq: (col: string, val: unknown) => {
                  filters[col] = val;
                  return selectBuilder;
                },
                order: () => selectBuilder,
                limit: () => selectBuilder,
                maybeSingle: async () => {
                  if (isErrorTable && (!options.failOnOperation || options.failOnOperation === 'select')) {
                    return { data: null, error: new Error(`Simulated select error on ${table}`) };
                  }
                  const list: Record<string, unknown>[] = table === 'profiles' ? profiles : invitations;
                  const found = list.find((item: Record<string, unknown>) => {
                    return Object.entries(filters).every(([k, v]) => item[k] === v);
                  });
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
                  const idx = profiles.findIndex((p: Record<string, unknown>) => p[col] === val);
                  if (idx !== -1) profiles.splice(idx, 1);
                } else if (table === 'user_invitations') {
                  const idx = invitations.findIndex((i: Record<string, unknown>) => i[col] === val);
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
              if (table === 'profiles') {
                profiles.push({ ...(data as MockProfile) });
              } else if (table === 'user_invitations') {
                invitations.push({ ...(data as MockInvitation) });
              }
              return Promise.resolve({ data, error: null });
            },
            update: (data: unknown) => {
              const updateBuilder = {
                eq: (col: string, val: unknown) => {
                  filters[col] = val;
                  return updateBuilder;
                },
                then: (resolve: (arg: unknown) => unknown) => {
                  if (isErrorTable && (!options.failOnOperation || options.failOnOperation === 'update')) {
                    return resolve({ error: new Error(`Simulated update error on ${table}`) });
                  }
                  operations.push({ type: 'update', table, data, filters });
                  const list: Record<string, unknown>[] = table === 'profiles' ? profiles : invitations;
                  const target = list.find((item: Record<string, unknown>) => {
                    return Object.entries(filters).every(([k, v]) => item[k] === v);
                  });
                  if (target) Object.assign(target, data);
                  return resolve({ error: null });
                },
              };
              return updateBuilder;
            },
          };

          return queryBuilder;
        },
      } as unknown as ReturnType<typeof createAdminClient>,
    };
  }

  // SEC-15: Callback route rejects or ignores untrusted user_metadata.role (privilege escalation defense)
  await t.test('SEC-15: Callback route rejects or ignores untrusted user_metadata.role (privilege escalation defense)', async () => {
    const callbackPath = path.join(ROOT_DIR, 'src/app/api/auth/callback/route.ts');
    const content = fs.readFileSync(callbackPath, 'utf8');

    // Static security assertion: callback route must never upsert raw meta.role
    assert.ok(
      !content.includes('role: meta.role'),
      'src/app/api/auth/callback/route.ts must not directly write role: meta.role into profiles'
    );

    // Behavioral assertion: self-registered attacker attempting privilege escalation without invitation
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
    assert.equal(mock.profiles.length, 0, 'No profile row must be created in the database for untrusted user');
  });

  // SEC-16: Callback route rejects or ignores untrusted user_metadata.tenant_id (cross-tenant spoofing defense)
  await t.test('SEC-16: Callback route rejects or ignores untrusted user_metadata.tenant_id (cross-tenant spoofing defense)', async () => {
    const callbackPath = path.join(ROOT_DIR, 'src/app/api/auth/callback/route.ts');
    const content = fs.readFileSync(callbackPath, 'utf8');

    // Static security assertion: callback route must never upsert raw meta.tenant_id
    assert.ok(
      !content.includes('tenant_id: meta.tenant_id'),
      'src/app/api/auth/callback/route.ts must not directly write tenant_id: meta.tenant_id into profiles'
    );

    // Behavioral assertion: attacker attempting to reassign/spoof another tenant without invitation
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

  // SEC-17: Callback route establishes and validates trusted invitation/provisioning source first
  await t.test('SEC-17: Callback route establishes and validates trusted invitation/provisioning source first', async () => {
    // Existing user with student role attempts to escalate to super_admin via metadata
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

    // Verify database profile was not altered to super_admin
    const dbProfile = mock.profiles.find((p) => p.id === 'student-uuid-1');
    assert.ok(dbProfile);
    assert.equal(dbProfile.role, 'student', 'Database profile role must remain student');
    assert.equal(dbProfile.tenant_id, 'school-tenant-1', 'Database profile tenant must remain school-tenant-1');
  });

  // SEC-18: Legitimate invitation behavior is preserved using server-authoritative data
  await t.test('SEC-18: Legitimate invitation behavior is preserved using server-authoritative data', async () => {
    // Authorized admin invited a school_admin and created an authoritative invitation record
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

    // User accepts invite and exchanges code: their GoTrue auth id is finalized
    const invitedUser = {
      id: 'final-gotrue-auth-id',
      email: 'newadmin@school.org',
      user_metadata: {
        full_name: 'New School Admin Updated',
      },
    };

    const result = await validateAndSyncInvitedProfile(invitedUser, () => mock.client);

    assert.equal(result.synced, true);
    assert.equal(result.trusted, true);
    assert.equal(result.role, 'school_admin', 'Role must come from authoritative invitation record');
    assert.equal(result.tenantId, 'authorized-school-uuid', 'Tenant must come from authoritative invitation record');

    // Verify profile is cleanly created for final GoTrue auth user ID
    const createdProfile = mock.profiles.find((p) => p.id === 'final-gotrue-auth-id');
    assert.ok(createdProfile, 'Profile must be linked to final auth user ID');
    assert.equal(createdProfile.role, 'school_admin');
    assert.equal(createdProfile.tenant_id, 'authorized-school-uuid');

    // Verify invitation is marked accepted
    const inv = mock.invitations.find((i) => i.id === 'inv-legit-1');
    assert.ok(inv);
    assert.equal(inv.status, 'accepted');
    assert.equal(inv.accepted_by, 'final-gotrue-auth-id');
  });

  // SEC-19: Arbitrary existing profile by email is not sufficient evidence of invitation
  await t.test('SEC-19: Arbitrary existing profile by email is not sufficient evidence of invitation', async () => {
    // A profile exists in profiles with an email, but NO record exists in user_invitations
    const existingProfile = {
      id: 'target-existing-id',
      email: 'victim@school.edu',
      role: 'school_admin',
      tenant_id: 'victim-school-uuid',
      full_name: 'Existing Staff',
    };

    const mock = createMockAdminForSync([existingProfile], []);

    // Attacker signs up with the victim's email under a new GoTrue auth ID
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
      expires_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    };

    const mock = createMockAdminForSync([], [expiredInvitation]);
    const lateUser = {
      id: 'late-user-gotrue-id',
      email: 'lateuser@school.org',
      user_metadata: {},
    };

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
    const replayUser = {
      id: 'replay-attacker-id',
      email: 'invited@school.org',
      user_metadata: {},
    };

    const result = await validateAndSyncInvitedProfile(replayUser, () => mock.client);

    assert.equal(result.synced, false, 'Replayed invitation must fail sync');
    assert.equal(result.trusted, false, 'Replayed invitation must not be trusted');
    assert.equal(result.reason, 'invitation_already_consumed');
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
    const secondUser = {
      id: 'second-user-uuid',
      email: 'bound@school.org',
      user_metadata: {},
    };

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
      role: 'teacher', // Authoritative role is teacher
      tenant_id: 'school-uuid-1',
      status: 'pending',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };

    const mock = createMockAdminForSync([], [invitation]);
    const userWithMetadata = {
      id: 'staff-auth-id',
      email: 'staff@school.org',
      user_metadata: { role: 'super_admin' }, // Malicious attempt to self-elevate
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
      tenant_id: 'school-uuid-legit', // Authoritative tenant
      status: 'pending',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };

    const mock = createMockAdminForSync([], [invitation]);
    const userWithMetadata = {
      id: 'staff2-auth-id',
      email: 'staff2@school.org',
      user_metadata: { tenant_id: 'victim-tenant-spoofed' }, // Malicious attempt to spoof tenant
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

  // SEC-25: Profile binding is atomic / failed binding does not delete the original record
  await t.test('SEC-25: Profile binding is atomic / failed binding does not delete the original record', async () => {
    // Static assertion: callback-sync must NEVER use delete + insert for profile relinking
    const callbackSyncPath = path.join(ROOT_DIR, 'src/lib/auth/callback-sync.ts');
    const syncSource = fs.readFileSync(callbackSyncPath, 'utf8');
    assert.ok(
      !syncSource.includes('.delete().eq(\'id\', profileByEmail.id)'),
      'callback-sync.ts must not contain delete + insert pattern on profiles'
    );

    const invitation: MockInvitation = {
      id: 'inv-atomic-test',
      email: 'atomic@school.org',
      role: 'teacher',
      tenant_id: 'school-uuid-1',
      status: 'pending',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };

    // Simulate database failure during profile insert
    const mock = createMockAdminForSync([], [invitation], {
      failOnTable: 'profiles',
      failOnOperation: 'insert',
    });

    const user = {
      id: 'atomic-auth-id',
      email: 'atomic@school.org',
      user_metadata: {},
    };

    const result = await validateAndSyncInvitedProfile(user, () => mock.client);

    assert.equal(result.synced, false, 'Failed profile insertion must report sync failure');
    assert.equal(result.trusted, false, 'Failed profile insertion must not be marked trusted');

    // Verify original invitation was NOT deleted or corrupted
    const inv = mock.invitations.find((i) => i.id === 'inv-atomic-test');
    assert.ok(inv, 'Original invitation must be preserved');
    assert.equal(inv.status, 'pending', 'Original invitation status must remain pending');
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

    // Simulate select failure on user_invitations
    const mock = createMockAdminForSync([], [invitation], {
      failOnTable: 'user_invitations',
      failOnOperation: 'select',
    });

    const user = {
      id: 'dberr-auth-id',
      email: 'dberror@school.org',
      user_metadata: {},
    };

    const result = await validateAndSyncInvitedProfile(user, () => mock.client);

    assert.equal(result.synced, false, 'Database error must fail closed');
    assert.equal(result.trusted, false, 'Database error must not be trusted');
    assert.equal(result.reason, 'database_error');
    assert.equal(mock.profiles.length, 0, 'No profile created on database error');
  });

  // SEC-27: Conflicting existing user/profile identity is rejected
  await t.test('SEC-27: Conflicting existing user/profile identity is rejected', async () => {
    // Scenario A: User already has an existing profile, but receives an invitation with conflicting tenant
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
      tenant_id: 'tenant-beta', // Conflicting tenant
      status: 'pending',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };

    const mockA = createMockAdminForSync([existingProfile], [conflictingInvitation]);
    const userA = {
      id: 'existing-user-uuid',
      email: 'user@school.org',
      user_metadata: {},
    };

    const resultA = await validateAndSyncInvitedProfile(userA, () => mockA.client);
    assert.equal(resultA.synced, false, 'Conflicting identity binding must fail');
    assert.equal(resultA.trusted, false);
    assert.equal(resultA.reason, 'conflicting_identity_binding');

    // Scenario B: Profile already exists with this email under a DIFFERENT user ID
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
    const rogueUser = {
      id: 'rogue-attacker-uuid', // Different ID attempting to hijack existing profile email
      email: 'shared@school.org',
      user_metadata: {},
    };

    const resultB = await validateAndSyncInvitedProfile(rogueUser, () => mockB.client);
    assert.equal(resultB.synced, false, 'Conflicting profile email with different ID must fail');
    assert.equal(resultB.trusted, false);
    assert.equal(resultB.reason, 'conflicting_existing_profile_identity');
  });

  // SEC-28: Attacker-controlled user_metadata cannot alter invitation role, tenant, or identity binding
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
});

