/**
 * TASK-0007 Phase 2 — RBAC Database Foundation Comprehensive Test Suite
 *
 * Verifies Migration 047 (047_rbac_database_foundation.sql):
 *   Group 1: Schema & Permission Catalog (33 permissions, 7 scopes, 'own' absent, uniqueness)
 *   Group 2: Assignment Lifecycle & Integrity (Check constraints, future-dated validity semantics)
 *   Group 3: Uniqueness & Concurrency (Partial unique indexes, current academic year index)
 *   Group 4: Academic Year Scoping (Fail-closed current year check, past-year exclusion, tenant isolation)
 *   Group 5: Authorization Helper Functions (Caller predicates, SECURITY DEFINER, subtenant resolver)
 *   Group 6: Legacy Synchronization (Triggers A-D, recursion guards, bi-directional sync, no LIMIT 1)
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;

// Read DATABASE_URL from .env.local
const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
let dbUrl = '';
for (const line of envContent.split(/\r?\n/)) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^['"]|['"]$/g, '');
  }
}

if (!dbUrl) {
  throw new Error('DATABASE_URL must be configured in .env.local');
}

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

// Fixtures created in isolation during test execution
const runId = Date.now();
let testTenantId: string;
let testOtherTenantId: string;
let testOrgTenantId: string;
let testSubTenantId: string;
let currentAcademicYearId: string;
let pastAcademicYearId: string;
let testTeacherProfileId: string;
let testTeacherId: string;
let testTeacher2ProfileId: string;
let testTeacher2Id: string;
let testDeptId: string;
let testClassId: string;
let testSectionId: string;

before(async () => {
  await client.connect();

  // 1. Create test tenants
  const tRes = await client.query(`
    INSERT INTO public.tenants (name, type, slug)
    VALUES
      ($1, 'school', $2),
      ($3, 'school', $4),
      ($5, 'organization', $6)
    RETURNING id, type;
  `, [
    `RBAC Test School A ${runId}`, `rbac-school-a-${runId}`,
    `RBAC Test School B ${runId}`, `rbac-school-b-${runId}`,
    `RBAC Test Org ${runId}`, `rbac-org-${runId}`
  ]);

  for (const row of tRes.rows) {
    if (row.type === 'organization') testOrgTenantId = row.id;
    else if (!testTenantId) testTenantId = row.id;
    else testOtherTenantId = row.id;
  }

  // Create subtenant for org
  const subRes = await client.query(`
    INSERT INTO public.tenants (name, type, slug, parent_id)
    VALUES ($1, 'campus', $2, $3)
    RETURNING id;
  `, [`RBAC Test Campus ${runId}`, `rbac-campus-${runId}`, testOrgTenantId]);
  testSubTenantId = subRes.rows[0].id;

  // 2. Create academic years: one current, one past
  const ayRes = await client.query(`
    INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current)
    VALUES
      ($1, $2, '2026-09-01', '2027-07-31', true),
      ($1, $3, '2025-09-01', '2026-07-31', false)
    RETURNING id, is_current;
  `, [testTenantId, `2026/2027 Current ${runId}`, `2025/2026 Past ${runId}`]);

  for (const row of ayRes.rows) {
    if (row.is_current) currentAcademicYearId = row.id;
    else pastAcademicYearId = row.id;
  }

  // 3. Create auth users and teacher profiles
  const createAuthUser = async (email: string) => {
    const res = await client.query(`
      INSERT INTO auth.users (id, email, role, aud)
      VALUES (gen_random_uuid(), $1, 'authenticated', 'authenticated')
      RETURNING id;
    `, [email]);
    return res.rows[0].id;
  };

  const email1 = `teacher1_${runId}@test.sec`;
  const email2 = `teacher2_${runId}@test.sec`;

  testTeacherProfileId = await createAuthUser(email1);
  testTeacher2ProfileId = await createAuthUser(email2);

  await client.query(`
    INSERT INTO public.profiles (id, email, full_name, role, tenant_id, is_active)
    VALUES
      ($1, $2, 'Teacher One', 'teacher', $3, true),
      ($4, $5, 'Teacher Two', 'teacher', $3, true);
  `, [testTeacherProfileId, email1, testTenantId, testTeacher2ProfileId, email2]);

  const tcRes = await client.query(`
    INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name)
    VALUES
      ($1, $2, 'Teacher', 'One'),
      ($1, $3, 'Teacher', 'Two')
    RETURNING id, profile_id;
  `, [testTenantId, testTeacherProfileId, testTeacher2ProfileId]);

  for (const row of tcRes.rows) {
    if (row.profile_id === testTeacherProfileId) testTeacherId = row.id;
    if (row.profile_id === testTeacher2ProfileId) testTeacher2Id = row.id;
  }

  // 4. Create test department, class, and section
  const dRes = await client.query(`
    INSERT INTO public.departments (tenant_id, name)
    VALUES ($1, $2)
    RETURNING id;
  `, [testTenantId, `RBAC Sciences Department ${runId}`]);
  testDeptId = dRes.rows[0].id;

  const cRes = await client.query(`
    INSERT INTO public.classes (tenant_id, name)
    VALUES ($1, $2)
    RETURNING id;
  `, [testTenantId, `RBAC Class Grade 10 ${runId}`]);
  testClassId = cRes.rows[0].id;

  const sRes = await client.query(`
    INSERT INTO public.sections (tenant_id, class_id, name)
    VALUES ($1, $2, $3)
    RETURNING id;
  `, [testTenantId, testClassId, `RBAC Section 10-A ${runId}`]);
  testSectionId = sRes.rows[0].id;
});

after(async () => {
  // Clean up all fixtures created in before()
  try {
    await client.query('ROLLBACK');
  } catch {}

  try {
    if (testTenantId) {
      await client.query('DELETE FROM public.school_staff_assignments WHERE tenant_id = $1', [testTenantId]);
      await client.query('DELETE FROM public.sections WHERE tenant_id = $1', [testTenantId]);
      await client.query('DELETE FROM public.classes WHERE tenant_id = $1', [testTenantId]);
      await client.query('DELETE FROM public.departments WHERE tenant_id = $1', [testTenantId]);
      await client.query('DELETE FROM public.teachers WHERE tenant_id = $1', [testTenantId]);
      await client.query('DELETE FROM public.profiles WHERE tenant_id = $1', [testTenantId]);
      await client.query('DELETE FROM public.academic_years WHERE tenant_id = $1', [testTenantId]);
      await client.query('DELETE FROM public.tenants WHERE id = $1', [testTenantId]);
    }
    if (testTeacherProfileId) {
      await client.query('DELETE FROM auth.users WHERE id = $1', [testTeacherProfileId]);
    }
    if (testTeacher2ProfileId) {
      await client.query('DELETE FROM auth.users WHERE id = $1', [testTeacher2ProfileId]);
    }
    if (testOtherTenantId) {
      await client.query('DELETE FROM public.tenants WHERE id = $1', [testOtherTenantId]);
    }
    if (testSubTenantId) {
      await client.query('DELETE FROM public.tenants WHERE id = $1', [testSubTenantId]);
    }
    if (testOrgTenantId) {
      await client.query('DELETE FROM public.tenants WHERE id = $1', [testOrgTenantId]);
    }
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await client.end();
  }
});

// ---------------------------------------------------------------------------
// GROUP 1: Schema & Permission Catalog
// ---------------------------------------------------------------------------
describe('Group 1 — Schema & Permission Catalog', () => {

  test('permissions_catalog contains exactly 33 rows', async () => {
    const res = await client.query('SELECT COUNT(*)::int AS cnt FROM public.permissions_catalog');
    assert.equal(res.rows[0].cnt, 33, 'Expected exactly 33 seeded permissions');
  });

  test('all permission_keys adhere to <module>.<resource>.<action> grammar', async () => {
    const res = await client.query('SELECT permission_key FROM public.permissions_catalog');
    const grammar = /^[a-z_]+\.[a-z_]+\.[a-z_]+$/;
    for (const row of res.rows) {
      assert.match(
        row.permission_key,
        grammar,
        `Permission key "${row.permission_key}" does not match <module>.<resource>.<action>`
      );
    }
  });

  test('all 7 canonical scopes are represented in canonical_scope enum without "own" alias', async () => {
    const res = await client.query(`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'canonical_scope';
    `);
    const scopes = new Set(res.rows.map(r => r.enumlabel));
    const expected = ['platform', 'org', 'school', 'department', 'class', 'offering', 'self'];
    for (const exp of expected) {
      assert.ok(scopes.has(exp), `Expected scope "${exp}" to be present in canonical_scope enum`);
    }
    assert.ok(!scopes.has('own'), 'Alias scope "own" must not exist in canonical_scope enum');

    const permRes = await client.query('SELECT DISTINCT scope::text FROM public.permissions_catalog');
    const permScopes = new Set(permRes.rows.map(r => r.scope));
    assert.ok(!permScopes.has('own'), 'Alias scope "own" must not exist in permissions_catalog');
  });

  test('duplicate permission_key insert is rejected by UNIQUE constraint', async () => {
    await client.query('BEGIN');
    let threw = false;
    try {
      await client.query(`
        INSERT INTO public.permissions_catalog (permission_key, module, resource, action, description, scope)
        VALUES ('exams.results.enter', 'exams', 'results', 'enter', 'Duplicate test', 'offering');
      `);
    } catch (err: any) {
      threw = true;
      assert.equal(err.code, '23505', 'Expected unique violation (23505)');
    } finally {
      await client.query('ROLLBACK');
    }
    assert.ok(threw, 'Expected duplicate permission_key to fail');
  });

  test('permissions_catalog has RLS enabled', async () => {
    const res = await client.query(`
      SELECT rowsecurity FROM pg_tables
      WHERE schemaname = 'public' AND tablename = 'permissions_catalog'
    `);
    assert.equal(res.rows[0].rowsecurity, true, 'RLS must be enabled on permissions_catalog');
  });

  test('school_staff_assignments has NO school_id column', async () => {
    const res = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'school_staff_assignments'
        AND column_name = 'school_id'
    `);
    assert.equal(res.rows.length, 0, 'school_id column must NOT exist on school_staff_assignments');
  });

});

// ---------------------------------------------------------------------------
// GROUP 2: Staff Assignment Lifecycle & Integrity
// ---------------------------------------------------------------------------
describe('Group 2 — Staff Assignment Lifecycle & Integrity', () => {

  test('check_date_range rejects effective_until < effective_from', async () => {
    await client.query('BEGIN');
    let threw = false;
    try {
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id, department_id,
           status, is_active, effective_from, effective_until)
        VALUES
          ($1, $2, 'hod', $3, $4, 'active', true, '2026-09-01', '2026-08-01');
      `, [testTenantId, testTeacherId, currentAcademicYearId, testDeptId]);
    } catch (err: any) {
      threw = true;
      assert.equal(err.code, '23514', 'Expected check constraint violation (23514)');
    } finally {
      await client.query('ROLLBACK');
    }
    assert.ok(threw, 'check_date_range should reject effective_until < effective_from');
  });

  test('check_lifecycle_consistency rejects revoked with is_active = true', async () => {
    await client.query('BEGIN');
    let threw = false;
    try {
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id, department_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'hod', $3, $4, 'revoked', true, CURRENT_DATE);
      `, [testTenantId, testTeacherId, currentAcademicYearId, testDeptId]);
    } catch (err: any) {
      threw = true;
      assert.equal(err.code, '23514', 'Expected check constraint violation');
    } finally {
      await client.query('ROLLBACK');
    }
    assert.ok(threw, 'check_lifecycle_consistency should reject revoked with is_active=true');
  });

  test('check_lifecycle_consistency rejects active with is_active = false', async () => {
    await client.query('BEGIN');
    let threw = false;
    try {
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id, department_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'hod', $3, $4, 'active', false, CURRENT_DATE);
      `, [testTenantId, testTeacherId, currentAcademicYearId, testDeptId]);
    } catch (err: any) {
      threw = true;
      assert.equal(err.code, '23514');
    } finally {
      await client.query('ROLLBACK');
    }
    assert.ok(threw, 'check_lifecycle_consistency should reject active with is_active=false');
  });

  test('check_revocation_consistency rejects revoked with revoked_at IS NULL', async () => {
    await client.query('BEGIN');
    let threw = false;
    try {
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id, department_id,
           status, is_active, effective_from, revoked_at)
        VALUES
          ($1, $2, 'hod', $3, $4, 'revoked', false, CURRENT_DATE, NULL);
      `, [testTenantId, testTeacherId, currentAcademicYearId, testDeptId]);
    } catch (err: any) {
      threw = true;
      assert.equal(err.code, '23514');
    } finally {
      await client.query('ROLLBACK');
    }
    assert.ok(threw, 'check_revocation_consistency should reject revoked without revoked_at');
  });

  test('check_hod_dept rejects HOD without department_id', async () => {
    await client.query('BEGIN');
    let threw = false;
    try {
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'hod', $3, 'active', true, CURRENT_DATE);
      `, [testTenantId, testTeacherId, currentAcademicYearId]);
    } catch (err: any) {
      threw = true;
      assert.equal(err.code, '23514');
    } finally {
      await client.query('ROLLBACK');
    }
    assert.ok(threw, 'check_hod_dept should reject HOD without department_id');
  });

  test('check_form_master_section rejects form_master without section_id', async () => {
    await client.query('BEGIN');
    let threw = false;
    try {
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'form_master', $3, 'active', true, CURRENT_DATE);
      `, [testTenantId, testTeacherId, currentAcademicYearId]);
    } catch (err: any) {
      threw = true;
      assert.equal(err.code, '23514');
    } finally {
      await client.query('ROLLBACK');
    }
    assert.ok(threw, 'check_form_master_section should reject form_master without section_id');
  });

  test('check_school_scope_assignment rejects vice_principal with department_id', async () => {
    await client.query('BEGIN');
    let threw = false;
    try {
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id, department_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'vice_principal', $3, $4, 'active', true, CURRENT_DATE);
      `, [testTenantId, testTeacherId, currentAcademicYearId, testDeptId]);
    } catch (err: any) {
      threw = true;
      assert.equal(err.code, '23514');
    } finally {
      await client.query('ROLLBACK');
    }
    assert.ok(threw, 'check_school_scope_assignment should reject vice_principal with department_id');
  });

  test('Future-dated assignment (effective_from > CURRENT_DATE) is ALLOWED but inactive', async () => {
    await client.query('BEGIN');
    try {
      // 1. Insertion must succeed (advance scheduling is valid institutional practice)
      const insRes = await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id, department_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'hod', $3, $4, 'active', true, CURRENT_DATE + 30)
        RETURNING id;
      `, [testTenantId, testTeacherId, currentAcademicYearId, testDeptId]);

      const assignmentId = insRes.rows[0].id;
      assert.ok(assignmentId, 'Future-dated assignment insertion should succeed');

      // 2. is_staff_assignment_active() row-level check returns FALSE because effective_from > CURRENT_DATE
      const actRes = await client.query(`
        SELECT public.is_staff_assignment_active($1) AS is_active;
      `, [assignmentId]);
      assert.equal(
        actRes.rows[0].is_active,
        false,
        'is_staff_assignment_active must return false for future-dated assignment'
      );
    } finally {
      await client.query('ROLLBACK');
    }
  });

});

// ---------------------------------------------------------------------------
// GROUP 3: Uniqueness & Concurrency
// ---------------------------------------------------------------------------
describe('Group 3 — Uniqueness & Concurrency', () => {

  test('uniq_active_hod_per_dept_year rejects duplicate active HOD for same department and year', async () => {
    await client.query('BEGIN');
    let threw = false;
    try {
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id, department_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'hod', $3, $4, 'active', true, CURRENT_DATE);
      `, [testTenantId, testTeacherId, currentAcademicYearId, testDeptId]);

      // Attempt second active HOD for same dept and year
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id, department_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'hod', $3, $4, 'active', true, CURRENT_DATE);
      `, [testTenantId, testTeacher2Id, currentAcademicYearId, testDeptId]);
    } catch (err: any) {
      threw = true;
      assert.equal(err.code, '23505', 'Expected unique constraint violation (23505)');
    } finally {
      await client.query('ROLLBACK');
    }
    assert.ok(threw, 'Should reject duplicate active HOD in same dept and year');
  });

  test('uniq_active_form_master_per_section_year rejects duplicate active Form Master', async () => {
    await client.query('BEGIN');
    let threw = false;
    try {
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id, section_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'form_master', $3, $4, 'active', true, CURRENT_DATE);
      `, [testTenantId, testTeacherId, currentAcademicYearId, testSectionId]);

      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id, section_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'form_master', $3, $4, 'active', true, CURRENT_DATE);
      `, [testTenantId, testTeacher2Id, currentAcademicYearId, testSectionId]);
    } catch (err: any) {
      threw = true;
      assert.equal(err.code, '23505');
    } finally {
      await client.query('ROLLBACK');
    }
    assert.ok(threw, 'Should reject duplicate active Form Master in same section and year');
  });

  test('uniq_active_vp_per_school_year rejects duplicate active Vice Principal', async () => {
    await client.query('BEGIN');
    let threw = false;
    try {
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'vice_principal', $3, 'active', true, CURRENT_DATE);
      `, [testTenantId, testTeacherId, currentAcademicYearId]);

      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'vice_principal', $3, 'active', true, CURRENT_DATE);
      `, [testTenantId, testTeacher2Id, currentAcademicYearId]);
    } catch (err: any) {
      threw = true;
      assert.equal(err.code, '23505');
    } finally {
      await client.query('ROLLBACK');
    }
    assert.ok(threw, 'Should reject duplicate active Vice Principal in same year');
  });

  test('uniq_active_exam_officer_per_school_year rejects duplicate active Exam Officer', async () => {
    await client.query('BEGIN');
    let threw = false;
    try {
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'exam_officer', $3, 'active', true, CURRENT_DATE);
      `, [testTenantId, testTeacherId, currentAcademicYearId]);

      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'exam_officer', $3, 'active', true, CURRENT_DATE);
      `, [testTenantId, testTeacher2Id, currentAcademicYearId]);
    } catch (err: any) {
      threw = true;
      assert.equal(err.code, '23505');
    } finally {
      await client.query('ROLLBACK');
    }
    assert.ok(threw, 'Should reject duplicate active Exam Officer in same year');
  });

  test('uniq_current_academic_year_per_tenant rejects multiple is_current = true rows for same tenant', async () => {
    await client.query('BEGIN');
    let threw = false;
    try {
      await client.query(`
        INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current)
        VALUES ($1, $2, '2027-09-01', '2028-07-31', true);
      `, [testTenantId, `2027/2028 Conflicting Current ${runId}`]);
    } catch (err: any) {
      threw = true;
      assert.equal(err.code, '23505', 'Expected unique violation on uniq_current_academic_year_per_tenant');
    } finally {
      await client.query('ROLLBACK');
    }
    assert.ok(threw, 'Should reject second current academic year for same tenant');
  });

});

// ---------------------------------------------------------------------------
// GROUP 4: Academic Year Scoping (CRITICAL)
// ---------------------------------------------------------------------------
describe('Group 4 — Academic Year Scoping', () => {

  test('is_hod returns false for assignment in past academic year (is_current = false)', async () => {
    await client.query('BEGIN');
    try {
      // Assign teacher to past academic year
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id, department_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'hod', $3, $4, 'active', true, '2025-09-01');
      `, [testTenantId, testTeacherId, pastAcademicYearId, testDeptId]);

      // Impersonate teacher 1
      await client.query(`SET LOCAL role = 'authenticated';`);
      await client.query(`SELECT set_config('request.jwt.claim.sub', $1, true);`, [testTeacherProfileId]);
      await client.query(`SELECT set_config('request.jwt.claim.role', 'authenticated', true);`);

      const res = await client.query(`SELECT public.is_hod($1) AS is_hod;`, [testDeptId]);
      assert.equal(res.rows[0].is_hod, false, 'is_hod must return false for past academic year assignment');
    } finally {
      await client.query('ROLLBACK');
    }
  });

  test('is_hod returns true for assignment in current academic year (is_current = true)', async () => {
    await client.query('BEGIN');
    try {
      // Assign teacher to current academic year
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id, department_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'hod', $3, $4, 'active', true, CURRENT_DATE);
      `, [testTenantId, testTeacherId, currentAcademicYearId, testDeptId]);

      // Impersonate teacher 1
      await client.query(`SET LOCAL role = 'authenticated';`);
      await client.query(`SELECT set_config('request.jwt.claim.sub', $1, true);`, [testTeacherProfileId]);
      await client.query(`SELECT set_config('request.jwt.claim.role', 'authenticated', true);`);

      const res = await client.query(`SELECT public.is_hod($1) AS is_hod;`, [testDeptId]);
      assert.equal(res.rows[0].is_hod, true, 'is_hod must return true for current academic year assignment');
    } finally {
      await client.query('ROLLBACK');
    }
  });

  test('is_hod returns false for future-dated assignment even in current academic year', async () => {
    await client.query('BEGIN');
    try {
      // Future-dated assignment in current year
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id, department_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'hod', $3, $4, 'active', true, CURRENT_DATE + 14);
      `, [testTenantId, testTeacherId, currentAcademicYearId, testDeptId]);

      // Impersonate teacher 1
      await client.query(`SET LOCAL role = 'authenticated';`);
      await client.query(`SELECT set_config('request.jwt.claim.sub', $1, true);`, [testTeacherProfileId]);
      await client.query(`SELECT set_config('request.jwt.claim.role', 'authenticated', true);`);

      const res = await client.query(`SELECT public.is_hod($1) AS is_hod;`, [testDeptId]);
      assert.equal(res.rows[0].is_hod, false, 'is_hod must return false for future-dated assignment');
    } finally {
      await client.query('ROLLBACK');
    }
  });

  test('Cross-tenant isolation: assignment in Tenant A does not grant authority in Tenant B', async () => {
    await client.query('BEGIN');
    try {
      // Assign teacher in Tenant A
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id, department_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'hod', $3, $4, 'active', true, CURRENT_DATE);
      `, [testTenantId, testTeacherId, currentAcademicYearId, testDeptId]);

      // Create department in Tenant B
      const deptB = await client.query(`
        INSERT INTO public.departments (tenant_id, name)
        VALUES ($1, $2)
        RETURNING id;
      `, [testOtherTenantId, `Tenant B Department ${runId}`]);

      // Impersonate teacher 1 (from Tenant A)
      await client.query(`SET LOCAL role = 'authenticated';`);
      await client.query(`SELECT set_config('request.jwt.claim.sub', $1, true);`, [testTeacherProfileId]);
      await client.query(`SELECT set_config('request.jwt.claim.role', 'authenticated', true);`);

      const res = await client.query(`SELECT public.is_hod($1) AS is_hod;`, [deptB.rows[0].id]);
      assert.equal(res.rows[0].is_hod, false, 'is_hod must return false for department in another tenant');
    } finally {
      await client.query('ROLLBACK');
    }
  });

  test('Fails closed if profile is deactivated', async () => {
    await client.query('BEGIN');
    try {
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id, department_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'hod', $3, $4, 'active', true, CURRENT_DATE);
      `, [testTenantId, testTeacherId, currentAcademicYearId, testDeptId]);

      // Deactivate profile
      await client.query('UPDATE public.profiles SET is_active = false WHERE id = $1', [testTeacherProfileId]);

      await client.query(`SET LOCAL role = 'authenticated';`);
      await client.query(`SELECT set_config('request.jwt.claim.sub', $1, true);`, [testTeacherProfileId]);
      await client.query(`SELECT set_config('request.jwt.claim.role', 'authenticated', true);`);

      const res = await client.query(`SELECT public.is_hod($1) AS is_hod;`, [testDeptId]);
      assert.equal(res.rows[0].is_hod, false, 'is_hod must fail closed if profile is inactive');
    } finally {
      await client.query('ROLLBACK');
    }
  });

  test('Fails closed for anonymous caller', async () => {
    await client.query('BEGIN');
    try {
      await client.query(`SET LOCAL role = 'anon';`);
      await client.query(`SELECT set_config('request.jwt.claim.sub', '', true);`);
      await client.query(`SELECT set_config('request.jwt.claim.role', 'anon', true);`);

      try {
        const res = await client.query(`SELECT public.is_hod($1) AS is_hod;`, [testDeptId]);
        assert.equal(res.rows[0].is_hod, false, 'Anonymous caller should return false');
      } catch (err: any) {
        assert.equal(err.code, '42501', 'Anon execution denied by REVOKE');
      }
    } finally {
      await client.query('ROLLBACK');
    }
  });

});

// ---------------------------------------------------------------------------
// GROUP 5: Authorization Helper Functions
// ---------------------------------------------------------------------------
describe('Group 5 — Authorization Helper Functions', () => {

  test('is_form_master returns true for active Form Master in current year', async () => {
    await client.query('BEGIN');
    try {
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id, section_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'form_master', $3, $4, 'active', true, CURRENT_DATE);
      `, [testTenantId, testTeacherId, currentAcademicYearId, testSectionId]);

      await client.query(`SET LOCAL role = 'authenticated';`);
      await client.query(`SELECT set_config('request.jwt.claim.sub', $1, true);`, [testTeacherProfileId]);
      await client.query(`SELECT set_config('request.jwt.claim.role', 'authenticated', true);`);

      const res = await client.query(`SELECT public.is_form_master($1) AS is_fm;`, [testSectionId]);
      assert.equal(res.rows[0].is_fm, true, 'is_form_master should return true');
    } finally {
      await client.query('ROLLBACK');
    }
  });

  test('is_vice_principal returns true for active VP in current year', async () => {
    await client.query('BEGIN');
    try {
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'vice_principal', $3, 'active', true, CURRENT_DATE);
      `, [testTenantId, testTeacherId, currentAcademicYearId]);

      await client.query(`SET LOCAL role = 'authenticated';`);
      await client.query(`SELECT set_config('request.jwt.claim.sub', $1, true);`, [testTeacherProfileId]);
      await client.query(`SELECT set_config('request.jwt.claim.role', 'authenticated', true);`);

      const res = await client.query(`SELECT public.is_vice_principal($1) AS is_vp;`, [testTenantId]);
      assert.equal(res.rows[0].is_vp, true, 'is_vice_principal should return true');
    } finally {
      await client.query('ROLLBACK');
    }
  });

  test('is_exam_officer returns true for active Exam Officer in current year', async () => {
    await client.query('BEGIN');
    try {
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'exam_officer', $3, 'active', true, CURRENT_DATE);
      `, [testTenantId, testTeacherId, currentAcademicYearId]);

      await client.query(`SET LOCAL role = 'authenticated';`);
      await client.query(`SELECT set_config('request.jwt.claim.sub', $1, true);`, [testTeacherProfileId]);
      await client.query(`SELECT set_config('request.jwt.claim.role', 'authenticated', true);`);

      const res = await client.query(`SELECT public.is_exam_officer($1) AS is_eo;`, [testTenantId]);
      assert.equal(res.rows[0].is_eo, true, 'is_exam_officer should return true');
    } finally {
      await client.query('ROLLBACK');
    }
  });

  test('get_org_subtenant_ids returns depth-1 subtenants', async () => {
    const res = await client.query(`
      SELECT public.get_org_subtenant_ids($1) AS subtenant_id;
    `, [testOrgTenantId]);
    assert.equal(res.rows.length, 1, 'Expected 1 subtenant');
    assert.equal(res.rows[0].subtenant_id, testSubTenantId);
  });

  test('all 6 authorization helper functions are SECURITY DEFINER', async () => {
    const res = await client.query(`
      SELECT proname, prosecdef FROM pg_proc
      WHERE proname IN (
        'is_staff_assignment_active',
        'is_hod',
        'is_form_master',
        'is_exam_officer',
        'is_vice_principal',
        'get_org_subtenant_ids'
      ) AND pronamespace = 'public'::regnamespace;
    `);
    for (const row of res.rows) {
      assert.equal(row.prosecdef, true, `Function ${row.proname} must be SECURITY DEFINER`);
    }
  });

});

// ---------------------------------------------------------------------------
// GROUP 6: Legacy Synchronization
// ---------------------------------------------------------------------------
describe('Group 6 — Legacy Synchronization', () => {

  test('Trigger A: Forward sync from school_staff_assignments to departments.head_teacher_id', async () => {
    await client.query('BEGIN');
    try {
      // 1. Insert active HOD assignment
      await client.query(`
        INSERT INTO public.school_staff_assignments
          (tenant_id, teacher_id, assignment_type, academic_year_id, department_id,
           status, is_active, effective_from)
        VALUES
          ($1, $2, 'hod', $3, $4, 'active', true, CURRENT_DATE);
      `, [testTenantId, testTeacherId, currentAcademicYearId, testDeptId]);

      // Check that department.head_teacher_id was updated to testTeacherId
      let dRes = await client.query('SELECT head_teacher_id FROM public.departments WHERE id = $1', [testDeptId]);
      assert.equal(dRes.rows[0].head_teacher_id, testTeacherId, 'Trigger A should set departments.head_teacher_id');

      // 2. Revoke HOD assignment
      await client.query(`
        UPDATE public.school_staff_assignments
        SET status = 'revoked', is_active = false, revoked_at = now()
        WHERE tenant_id = $1 AND department_id = $2 AND assignment_type = 'hod';
      `, [testTenantId, testDeptId]);

      // Check that department.head_teacher_id was set to NULL
      dRes = await client.query('SELECT head_teacher_id FROM public.departments WHERE id = $1', [testDeptId]);
      assert.equal(dRes.rows[0].head_teacher_id, null, 'Trigger A should clear departments.head_teacher_id on revocation');
    } finally {
      await client.query('ROLLBACK');
    }
  });

  test('Trigger B: Reverse sync from departments.head_teacher_id to school_staff_assignments', async () => {
    await client.query('BEGIN');
    try {
      // Update department head_teacher_id directly (legacy action)
      await client.query(`
        UPDATE public.departments
        SET head_teacher_id = $1
        WHERE id = $2;
      `, [testTeacherId, testDeptId]);

      // Verify Trigger B created an active HOD assignment in school_staff_assignments
      const saRes = await client.query(`
        SELECT id, teacher_id, status, is_active, academic_year_id
        FROM public.school_staff_assignments
        WHERE tenant_id = $1 AND department_id = $2 AND assignment_type = 'hod' AND status = 'active';
      `, [testTenantId, testDeptId]);

      assert.equal(saRes.rows.length, 1, 'Trigger B should insert active HOD assignment');
      assert.equal(saRes.rows[0].teacher_id, testTeacherId);
      assert.equal(saRes.rows[0].academic_year_id, currentAcademicYearId);

      // Now clear legacy field
      await client.query(`
        UPDATE public.departments
        SET head_teacher_id = NULL
        WHERE id = $1;
      `, [testDeptId]);

      // Verify Trigger B revoked the previous assignment
      const revRes = await client.query(`
        SELECT status, is_active, revocation_reason
        FROM public.school_staff_assignments
        WHERE id = $1;
      `, [saRes.rows[0].id]);
      assert.equal(revRes.rows[0].status, 'revoked', 'Trigger B should revoke assignment on head_teacher_id = NULL');
      assert.equal(revRes.rows[0].is_active, false);
    } finally {
      await client.query('ROLLBACK');
    }
  });

  test('Trigger C & D: Forward and reverse sync for sections.class_teacher_id', async () => {
    await client.query('BEGIN');
    try {
      // Update section class_teacher_id directly (Trigger D)
      await client.query(`
        UPDATE public.sections
        SET class_teacher_id = $1
        WHERE id = $2;
      `, [testTeacherId, testSectionId]);

      // Verify Trigger D created active form_master assignment
      const saRes = await client.query(`
        SELECT id, teacher_id, status, is_active
        FROM public.school_staff_assignments
        WHERE tenant_id = $1 AND section_id = $2 AND assignment_type = 'form_master' AND status = 'active';
      `, [testTenantId, testSectionId]);
      assert.equal(saRes.rows.length, 1, 'Trigger D should create form_master assignment');
      assert.equal(saRes.rows[0].teacher_id, testTeacherId);

      // Update assignment directly (Trigger C)
      await client.query(`
        UPDATE public.school_staff_assignments
        SET status = 'revoked', is_active = false, revoked_at = now()
        WHERE id = $1;
      `, [saRes.rows[0].id]);

      // Verify Trigger C cleared sections.class_teacher_id
      const secRes = await client.query('SELECT class_teacher_id FROM public.sections WHERE id = $1', [testSectionId]);
      assert.equal(secRes.rows[0].class_teacher_id, null, 'Trigger C should clear sections.class_teacher_id');
    } finally {
      await client.query('ROLLBACK');
    }
  });

  test('Trigger functions contain pg_trigger_depth() recursion guards and NO LIMIT 1', async () => {
    const res = await client.query(`
      SELECT proname, prosrc FROM pg_proc
      WHERE proname IN (
        'sync_hod_to_departments',
        'sync_department_hod_to_assignments',
        'sync_form_master_to_sections',
        'sync_section_class_teacher_to_assignments'
      ) AND pronamespace = 'public'::regnamespace;
    `);
    assert.equal(res.rows.length, 4, 'All 4 sync trigger functions must exist');
    for (const row of res.rows) {
      assert.match(
        row.prosrc,
        /pg_trigger_depth\(\)\s*>\s*[01]/,
        `Function ${row.proname} must have pg_trigger_depth() guard`
      );
      assert.doesNotMatch(
        row.prosrc,
        /LIMIT\s+1/i,
        `Function ${row.proname} must NOT contain LIMIT 1`
      );
    }
  });

});
