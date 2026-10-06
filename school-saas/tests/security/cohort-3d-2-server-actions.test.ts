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
