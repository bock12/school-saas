import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ACTIONS = [
  'src/app/[tenant]/admin/students/actions.ts',
  'src/app/[tenant]/admin/teachers/actions.ts',
  'src/app/[tenant]/admin/parents/actions.ts',
  'src/app/[tenant]/admin/classes/actions.ts',
  'src/app/[tenant]/admin/bursary/actions.ts',
  'src/app/actions/subjects.ts',
  'src/app/actions/curriculum.ts',
  'src/app/actions/offerings.ts',
  'src/app/actions/academic-calendar.ts',
];

function read(relativePath: string) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('Phase 3D-2 Server Actions contain the canonical authorization boundary', () => {
  for (const relativePath of ACTIONS) {
    const source = read(relativePath);
    assert.match(
      source,
      /requireServerActionAuthorization/,
      `${relativePath} must use the canonical Server Action authorization boundary`,
    );
  }
});

test('Phase 3D-2 mutation actions authorize before privileged DB access', () => {
  const mutationFiles = ACTIONS.filter((file) => !file.endsWith('academic-calendar.ts'));
  for (const relativePath of mutationFiles) {
    const source = read(relativePath);
    const functionMatches = [...source.matchAll(/export async function\s+([A-Za-z0-9_]+)[\s\S]*?(?=\nexport async function|$)/g)];

    for (const match of functionMatches) {
      const body = match[0];
      if (!body.includes('requireServerActionAuthorization')) continue;

      const authIndex = body.indexOf('requireServerActionAuthorization');
      const privilegedIndexes = [
        body.indexOf('getPgPool('),
        body.indexOf('createAdminClient('),
      ].filter((index) => index >= 0);

      for (const privilegedIndex of privilegedIndexes) {
        assert.ok(
          authIndex < privilegedIndex,
          `${relativePath}:${match[1]} reaches privileged DB access before authorization`,
        );
      }
    }
  }
});

test('academic calendar has no arbitrary tenant fallback or module-level admin client', () => {
  const source = read('src/app/actions/academic-calendar.ts');

  assert.doesNotMatch(source, /const\s+supabaseAdmin\s*=\s*createAdminClient\(\)/);
  assert.doesNotMatch(source, /SELECT id FROM tenants\s+LIMIT 1/i);
  assert.doesNotMatch(source, /SELECT id FROM tenants[\s\S]*?LIMIT 1/i);
  assert.doesNotMatch(source, /ILIKE '%|ilike\(.*%/i);
  assert.match(source, /requireServerActionAuthorization/);
});

test('offering workload reads and mutation preconditions are tenant-scoped', () => {
  const source = read('src/app/actions/offerings.ts');

  assert.match(
    source,
    /SELECT id FROM subject_offerings WHERE id = \$1 AND tenant_id = \$2/,
    'subject offering updates must verify ownership before workload checks',
  );
  assert.match(
    source,
    /SELECT id FROM term_offerings WHERE id = \$1 AND tenant_id = \$2/,
    'term offering updates must verify ownership before workload checks',
  );
  assert.match(
    source,
    /SELECT term_id, periods_per_week, term_teacher_id FROM term_offerings WHERE id = \$1 AND tenant_id = \$2/,
    'term workload reads must be scoped to the authorized tenant',
  );
  assert.match(
    source,
    /JOIN subject_offerings so ON so\.id = sse\.offering_id[\s\S]*?so\.tenant_id = \$2 AND sse\.tenant_id = \$2/,
    'active enrollment checks must be scoped through the tenant-owned offering',
  );
  assert.match(
    source,
    /SELECT first_name, last_name FROM teachers WHERE id = \$1 AND tenant_id = \$2/,
    'teacher detail lookups must be tenant-scoped',
  );
});

test('academic calendar mutations require dedicated permission and tenant-owned references', () => {
  const source = read('src/app/actions/academic-calendar.ts');
  assert.equal((source.match(/permission: 'calendar\.events\.manage'/g) || []).length, 3);
  assert.doesNotMatch(source, /permission: 'curriculum\.version\.create'/);
  assert.match(source, /calendarReferencesBelongToTenant/);
  assert.match(source, /\.eq\('tenant_id', tenantId\)/);
});

test('teacher workload calculations are constrained to the authorized tenant', () => {
  const source = read('src/app/actions/offerings.ts');
  assert.match(source, /permission: 'staff\.allocations\.manage',[\s\S]*?requestedTenantSlug: tenantSlug/);
  assert.match(source, /WHERE so\.tenant_id = \$1[\s\S]*?AND so\.teacher_id = \$2[\s\S]*?AND so\.academic_year_id = \$3/);
  assert.match(source, /WHERE tro\.tenant_id = \$1[\s\S]*?AND so\.tenant_id = \$1[\s\S]*?AND tro\.id <> \$3/);
});
