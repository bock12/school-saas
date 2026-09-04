import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createAdminClient } from '../../src/lib/supabase/admin';
import { authorizeApiRequest } from '../../src/lib/auth/api-guard';
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
});
