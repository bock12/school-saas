import test from 'node:test';
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

interface TestFixtures {
  tenantAId: string;
  tenantBId: string;
  userAdminAId: string;
  userTeacherAId: string;
  userStudentAId: string;
  userAdminBId: string;
  userTeacherBId: string;
  userDeactivatedAId: string;
  userSuperAdminId: string;
  userInactiveSuperId: string;
  yearAId: string;
  yearBId: string;
  sessionAId: string;
  sessionBId: string;
  applicantAId: string;
  applicantBId: string;
  notifAId: string;
  notifBId: string;
  approvalAId: string;
  approvalBId: string;
  malpracticeAId: string;
  malpracticeBId: string;
}

interface RlsErrorCapture {
  sqlstate: string;
  message: string;
  operation: string;
  principal: string;
  resource: string;
}

test('TASK-0006: Real PostgreSQL RLS & Tenant Isolation Test Harness', async (t) => {
  // Test Environment TLS Configuration:
  // Supabase remote cloud poolers utilize intermediate certificates issued by the Supabase Root CA.
  // If a local custom CA certificate is provided via DATABASE_SSL_CA, it is loaded into the TLS context.
  // Otherwise, in non-production test environments, SSL connection is established via sslmode=require.
  // Production application connections strictly enforce rejectUnauthorized: true via pg-fallback.ts.
  const customCa = process.env.DATABASE_SSL_CA;
  const enforceStrictTls = Boolean(process.env.DATABASE_SSL_STRICT ?? false);
  const sslConfig: pg.ConnectionConfig['ssl'] = customCa
    ? { rejectUnauthorized: true, ca: customCa }
    : { rejectUnauthorized: enforceStrictTls };

  const client = new Client({
    connectionString: dbUrl,
    ssl: sslConfig,
  });

  await client.connect();

  // Helper to switch PostgreSQL session identity (simulating PostgREST / Supabase auth)
  async function asUser(userId: string) {
    await client.query(`SET LOCAL role = 'authenticated';`);
    await client.query(`SELECT set_config('request.jwt.claim.sub', $1, true);`, [userId]);
    await client.query(`SELECT set_config('request.jwt.claim.role', 'authenticated', true);`);
  }

  async function asAnon() {
    await client.query(`SET LOCAL role = 'anon';`);
    await client.query(`SELECT set_config('request.jwt.claim.sub', '', true);`);
    await client.query(`SELECT set_config('request.jwt.claim.role', 'anon', true);`);
  }

  async function asPostgres() {
    await client.query(`SET LOCAL role = 'postgres';`);
    await client.query(`SELECT set_config('request.jwt.claim.sub', '', true);`);
    await client.query(`SELECT set_config('request.jwt.claim.role', 'service_role', true);`);
  }

  // Wrapper to execute an assertion inside a SAVEPOINT to protect parent transaction
  // and prove that denials are genuine PostgreSQL RLS 42501 exceptions.
  async function expectRlsError(
    action: () => Promise<any>,
    context: { principal: string; resource: string; operation: string; expectedSubstring?: string }
  ): Promise<RlsErrorCapture> {
    const spName = 'sp_' + Math.floor(Math.random() * 10000000);
    await client.query(`SAVEPOINT ${spName};`);
    let threw = false;
    let capture: RlsErrorCapture = {
      sqlstate: '',
      message: '',
      operation: context.operation,
      principal: context.principal,
      resource: context.resource,
    };

    try {
      await action();
    } catch (err: any) {
      threw = true;
      capture.sqlstate = err.code || '';
      capture.message = err.message || '';
    } finally {
      await client.query(`ROLLBACK TO SAVEPOINT ${spName};`);
    }

    assert.ok(
      threw,
      `Expected RLS error (SQLSTATE 42501) for ${context.principal} performing ${context.operation} on ${context.resource}, but operation succeeded.`
    );
    assert.equal(
      capture.sqlstate,
      '42501',
      `Expected SQLSTATE 42501 (insufficient_privilege / RLS violation) for ${context.principal} on ${context.resource}, got: ${capture.sqlstate} (${capture.message})`
    );
    if (context.expectedSubstring) {
      assert.ok(
        capture.message.toLowerCase().includes(context.expectedSubstring.toLowerCase()),
        `Expected error message containing "${context.expectedSubstring}", got: "${capture.message}"`
      );
    }
    return capture;
  }

  // Independent privileged verification query to confirm absence of unauthorized writes
  async function verifyDatabaseState<T = any>(queryText: string, params: any[] = []): Promise<T[]> {
    await client.query(`SET LOCAL role = 'postgres';`);
    const res = await client.query(queryText, params);
    return res.rows;
  }

  // Set up transaction-isolated fixtures
  await client.query('BEGIN');

  let f: TestFixtures;

  try {
    // 1. Create two test tenants
    const tenantARes = await client.query(`
      INSERT INTO public.tenants (id, name, slug)
      VALUES (gen_random_uuid(), 'SEC_TEST_TENANT_A', 'sec-tenant-a-' || floor(random()*1000000))
      RETURNING id;
    `);
    const tenantBRes = await client.query(`
      INSERT INTO public.tenants (id, name, slug)
      VALUES (gen_random_uuid(), 'SEC_TEST_TENANT_B', 'sec-tenant-b-' || floor(random()*1000000))
      RETURNING id;
    `);
    const tenantAId = tenantARes.rows[0].id;
    const tenantBId = tenantBRes.rows[0].id;

    // 2. Create test auth users
    const createAuthUser = async (email: string) => {
      const res = await client.query(`
        INSERT INTO auth.users (id, email, role, aud)
        VALUES (gen_random_uuid(), $1, 'authenticated', 'authenticated')
        RETURNING id;
      `, [email]);
      return res.rows[0].id;
    };

    const userAdminAId = await createAuthUser(`adminA_${Date.now()}@test.sec`);
    const userTeacherAId = await createAuthUser(`teacherA_${Date.now()}@test.sec`);
    const userStudentAId = await createAuthUser(`studentA_${Date.now()}@test.sec`);
    const userAdminBId = await createAuthUser(`adminB_${Date.now()}@test.sec`);
    const userTeacherBId = await createAuthUser(`teacherB_${Date.now()}@test.sec`);
    const userDeactivatedAId = await createAuthUser(`deactivatedA_${Date.now()}@test.sec`);
    const userSuperAdminId = await createAuthUser(`superadmin_${Date.now()}@test.sec`);
    const userInactiveSuperId = await createAuthUser(`inactivesuper_${Date.now()}@test.sec`);

    // 3. Create profiles
    await client.query(`
      INSERT INTO public.profiles (id, email, full_name, role, tenant_id, is_active)
      VALUES 
        ($1, 'adminA@test.sec', 'Admin A', 'school_admin', $2, true),
        ($3, 'teacherA@test.sec', 'Teacher A', 'teacher', $2, true),
        ($4, 'studentA@test.sec', 'Student A', 'student', $2, true),
        ($5, 'adminB@test.sec', 'Admin B', 'school_admin', $6, true),
        ($7, 'teacherB@test.sec', 'Teacher B', 'teacher', $6, true),
        ($8, 'deactivatedA@test.sec', 'Deactivated A', 'school_admin', $2, false),
        ($9, 'superadmin@test.sec', 'Super Admin', 'super_admin', $2, true),
        ($10, 'inactivesuper@test.sec', 'Inactive Super', 'super_admin', $2, false);
    `, [
      userAdminAId, tenantAId,
      userTeacherAId,
      userStudentAId,
      userAdminBId, tenantBId,
      userTeacherBId,
      userDeactivatedAId,
      userSuperAdminId,
      userInactiveSuperId,
    ]);

    // 4. Create baseline domain resources for both tenants
    const yearARes = await client.query(`
      INSERT INTO public.academic_years (tenant_id, name, start_date, end_date)
      VALUES ($1, 'SEC_YEAR_A', '2025-09-01', '2026-06-30')
      RETURNING id;
    `, [tenantAId]);
    const yearBRes = await client.query(`
      INSERT INTO public.academic_years (tenant_id, name, start_date, end_date)
      VALUES ($1, 'SEC_YEAR_B', '2025-09-01', '2026-06-30')
      RETURNING id;
    `, [tenantBId]);

    const sessionARes = await client.query(`
      INSERT INTO public.exam_sessions (tenant_id, name, academic_year, term, status)
      VALUES ($1, 'SEC_SESSION_A', '2025-26', '1st Term', 'Upcoming')
      RETURNING id;
    `, [tenantAId]);
    const sessionBRes = await client.query(`
      INSERT INTO public.exam_sessions (tenant_id, name, academic_year, term, status)
      VALUES ($1, 'SEC_SESSION_B', '2025-26', '1st Term', 'Upcoming')
      RETURNING id;
    `, [tenantBId]);

    const approvalARes = await client.query(`
      INSERT INTO public.exam_results_approval (session_id, tenant_id, class_name, subject_name, status)
      VALUES ($1, $2, 'Class 10A', 'Mathematics', 'Pending Moderation')
      RETURNING id;
    `, [sessionARes.rows[0].id, tenantAId]);
    const approvalBRes = await client.query(`
      INSERT INTO public.exam_results_approval (session_id, tenant_id, class_name, subject_name, status)
      VALUES ($1, $2, 'Class 11B', 'English', 'Pending Moderation')
      RETURNING id;
    `, [sessionBRes.rows[0].id, tenantBId]);

    const malpracticeARes = await client.query(`
      INSERT INTO public.exam_malpractices (session_id, tenant_id, student_name, subject_name, offense_type)
      VALUES ($1, $2, 'Student Sneak', 'Physics', 'Unauthorized Materials')
      RETURNING id;
    `, [sessionARes.rows[0].id, tenantAId]);
    const malpracticeBRes = await client.query(`
      INSERT INTO public.exam_malpractices (session_id, tenant_id, student_name, subject_name, offense_type)
      VALUES ($1, $2, 'Student Cheat', 'Chemistry', 'Phone in Hall')
      RETURNING id;
    `, [sessionBRes.rows[0].id, tenantBId]);

    const applicantARes = await client.query(`
      INSERT INTO public.applicants (
        tenant_id, first_name, last_name, dob, address, city, target_grade,
        parent_name, parent_phone, parent_email, parent_relation, stage
      )
      VALUES (
        $1, 'Applicant', 'Alpha', '2010-01-01', '123 Main St', 'Freetown', 'SSS 1',
        'Parent Alpha', '+23276000000', 'parent.alpha@test.sec', 'Mother', 'Application'
      )
      RETURNING id;
    `, [tenantAId]);
    const applicantBRes = await client.query(`
      INSERT INTO public.applicants (
        tenant_id, first_name, last_name, dob, address, city, target_grade,
        parent_name, parent_phone, parent_email, parent_relation, stage
      )
      VALUES (
        $1, 'Applicant', 'Beta', '2010-01-01', '456 Second St', 'Freetown', 'SSS 1',
        'Parent Beta', '+23276111111', 'parent.beta@test.sec', 'Father', 'Application'
      )
      RETURNING id;
    `, [tenantBId]);

    const notifARes = await client.query(`
      INSERT INTO public.notifications (tenant_id, title, body, status)
      VALUES ($1, 'Notif A', 'Body A', 'sent')
      RETURNING id;
    `, [tenantAId]);
    const notifBRes = await client.query(`
      INSERT INTO public.notifications (tenant_id, title, body, status)
      VALUES ($1, 'Notif B', 'Body B', 'sent')
      RETURNING id;
    `, [tenantBId]);

    f = {
      tenantAId,
      tenantBId,
      userAdminAId,
      userTeacherAId,
      userStudentAId,
      userAdminBId,
      userTeacherBId,
      userDeactivatedAId,
      userSuperAdminId,
      userInactiveSuperId,
      yearAId: yearARes.rows[0].id,
      yearBId: yearBRes.rows[0].id,
      sessionAId: sessionARes.rows[0].id,
      sessionBId: sessionBRes.rows[0].id,
      applicantAId: applicantARes.rows[0].id,
      applicantBId: applicantBRes.rows[0].id,
      notifAId: notifARes.rows[0].id,
      notifBId: notifBRes.rows[0].id,
      approvalAId: approvalARes.rows[0].id,
      approvalBId: approvalBRes.rows[0].id,
      malpracticeAId: malpracticeARes.rows[0].id,
      malpracticeBId: malpracticeBRes.rows[0].id,
    };
  } catch (setupErr) {
    await client.query('ROLLBACK');
    await client.end();
    throw setupErr;
  }

  // =========================================================================
  // T-001: Same-Tenant Authorized Read (ALLOW)
  // =========================================================================
  await t.test('T-001: Same-Tenant Authorized Read -> ALLOW', async () => {
    await asUser(f.userAdminAId);
    
    const resYear = await client.query(`SELECT id FROM public.academic_years WHERE id = $1;`, [f.yearAId]);
    assert.equal(resYear.rows.length, 1, 'Admin A must be able to read Tenant A academic year');

    const resSession = await client.query(`SELECT id FROM public.exam_sessions WHERE id = $1;`, [f.sessionAId]);
    assert.equal(resSession.rows.length, 1, 'Admin A must be able to read Tenant A exam session');

    const resApplicant = await client.query(`SELECT id FROM public.applicants WHERE id = $1;`, [f.applicantAId]);
    assert.equal(resApplicant.rows.length, 1, 'Admin A must be able to read Tenant A applicant');
  });

  // =========================================================================
  // T-002: Cross-Tenant Read (DENY / 0 rows)
  // =========================================================================
  await t.test('T-002: Cross-Tenant Read -> DENY / 0 rows', async () => {
    await asUser(f.userAdminAId);

    const resYear = await client.query(`SELECT id FROM public.academic_years WHERE id = $1;`, [f.yearBId]);
    assert.equal(resYear.rows.length, 0, 'Admin A must NOT read Tenant B academic year');

    const resSession = await client.query(`SELECT id FROM public.exam_sessions WHERE id = $1;`, [f.sessionBId]);
    assert.equal(resSession.rows.length, 0, 'Admin A must NOT read Tenant B exam session');

    const resApplicant = await client.query(`SELECT id FROM public.applicants WHERE id = $1;`, [f.applicantBId]);
    assert.equal(resApplicant.rows.length, 0, 'Admin A must NOT read Tenant B applicant');
  });

  // =========================================================================
  // T-003: Same-Tenant Authorized Insert (ALLOW)
  // =========================================================================
  await t.test('T-003: Same-Tenant Authorized Insert -> ALLOW', async () => {
    await asUser(f.userAdminAId);

    const res = await client.query(`
      INSERT INTO public.academic_years (tenant_id, name, start_date, end_date)
      VALUES ($1, 'SEC_YEAR_A_NEW', '2026-09-01', '2027-06-30')
      RETURNING id;
    `, [f.tenantAId]);
    assert.equal(res.rows.length, 1, 'Admin A must be able to insert academic year in Tenant A');
  });

  // =========================================================================
  // T-004: Cross-Tenant Insert (DENY / SQLSTATE 42501)
  // =========================================================================
  await t.test('T-004: Cross-Tenant Insert -> DENY', async () => {
    await asUser(f.userAdminAId);

    await expectRlsError(async () => {
      await client.query(`
        INSERT INTO public.academic_years (tenant_id, name, start_date, end_date)
        VALUES ($1, 'SEC_YEAR_B_HACK', '2025-09-01', '2026-06-30');
      `, [f.tenantBId]);
    }, {
      principal: 'Admin A',
      resource: 'academic_years',
      operation: 'INSERT (cross-tenant)',
      expectedSubstring: 'violates row-level security policy',
    });

    // Database state verification: confirm unauthorized row was NOT created
    const rows = await verifyDatabaseState(`SELECT id FROM public.academic_years WHERE name = 'SEC_YEAR_B_HACK';`);
    assert.equal(rows.length, 0, 'Cross-tenant inserted row must not exist in database state');
  });

  // =========================================================================
  // T-005: Same-Tenant Authorized Update (ALLOW)
  // =========================================================================
  await t.test('T-005: Same-Tenant Authorized Update -> ALLOW', async () => {
    await asUser(f.userAdminAId);

    const res = await client.query(`
      UPDATE public.academic_years SET name = 'SEC_YEAR_A_UPDATED' WHERE id = $1;
    `, [f.yearAId]);
    assert.equal(res.rowCount, 1, 'Admin A must be able to update own tenant record');
  });

  // =========================================================================
  // T-006: Cross-Tenant Update (DENY / 0 rows affected)
  // =========================================================================
  await t.test('T-006: Cross-Tenant Update -> DENY / 0 rows affected', async () => {
    await asUser(f.userAdminAId);

    const resYear = await client.query(`
      UPDATE public.academic_years SET name = 'DEFACED' WHERE id = $1;
    `, [f.yearBId]);
    assert.equal(resYear.rowCount, 0, 'Admin A must NOT update Tenant B academic year');

    // Database state verification
    const rows = await verifyDatabaseState(`SELECT name FROM public.academic_years WHERE id = $1;`, [f.yearBId]);
    assert.equal(rows[0].name, 'SEC_YEAR_B', 'Target record must remain unchanged in database state');
  });

  // =========================================================================
  // T-007: Cross-Tenant Delete (DENY / 0 rows affected)
  // =========================================================================
  await t.test('T-007: Cross-Tenant Delete -> DENY / 0 rows affected', async () => {
    await asUser(f.userAdminAId);

    const resYear = await client.query(`
      DELETE FROM public.academic_years WHERE id = $1;
    `, [f.yearBId]);
    assert.equal(resYear.rowCount, 0, 'Admin A must NOT delete Tenant B academic year');

    // Database state verification
    const rows = await verifyDatabaseState(`SELECT id FROM public.academic_years WHERE id = $1;`, [f.yearBId]);
    assert.equal(rows.length, 1, 'Target record must still exist in database state');
  });

  // =========================================================================
  // T-008: Tenant-ID Tampering (DENY / SQLSTATE 42501)
  // =========================================================================
  await t.test('T-008: Tenant-ID Tampering on mutation -> DENY', async () => {
    await asUser(f.userAdminAId);

    await expectRlsError(async () => {
      await client.query(`
        UPDATE public.applicants SET tenant_id = $1 WHERE id = $2;
      `, [f.tenantBId, f.applicantAId]);
    }, {
      principal: 'Admin A',
      resource: 'applicants',
      operation: 'UPDATE (tenant rebinding tampering)',
      expectedSubstring: 'violates row-level security policy',
    });

    // Database state verification
    const rows = await verifyDatabaseState(`SELECT tenant_id FROM public.applicants WHERE id = $1;`, [f.applicantAId]);
    assert.equal(rows[0].tenant_id, f.tenantAId, 'Applicant tenant_id must remain unchanged');
  });

  // =========================================================================
  // T-009: Resource-ID Tampering / IDOR (DENY / 0 rows)
  // =========================================================================
  await t.test('T-009: Resource-ID Tampering using valid Tenant B UUID -> DENY', async () => {
    await asUser(f.userAdminAId);

    const res = await client.query(`
      SELECT * FROM public.applicants WHERE id = $1;
    `, [f.applicantBId]);
    assert.equal(res.rows.length, 0, 'Resource ID belonging to Tenant B must not be accessible to Tenant A');
  });

  // =========================================================================
  // T-010: TABLE-SPECIFIC EXAM AUTHORIZATION & TEACHER LEAST-PRIVILEGE TESTS
  // =========================================================================
  // T-010A: Teacher A -> exam_malpractices SELECT (Tenant A) -> DENY (0 rows)
  await t.test('T-010A: Teacher A -> exam_malpractices SELECT (Tenant A) -> DENY (0 rows)', async () => {
    await asUser(f.userTeacherAId);
    const res = await client.query(`SELECT * FROM public.exam_malpractices WHERE id = $1;`, [f.malpracticeAId]);
    assert.equal(res.rows.length, 0, 'Ordinary teacher must NOT view sensitive malpractice records (0 rows)');
  });

  // T-010B: Teacher A -> exam_malpractices INSERT (Tenant A) -> DENY (42501 RLS denial)
  await t.test('T-010B: Teacher A -> exam_malpractices INSERT (Tenant A) -> DENY (42501)', async () => {
    await asUser(f.userTeacherAId);
    await expectRlsError(async () => {
      await client.query(`
        INSERT INTO public.exam_malpractices (session_id, tenant_id, student_name, subject_name, offense_type)
        VALUES ($1, $2, 'Teacher Malpractice Attempt', 'Chemistry', 'Unauthorized Note');
      `, [f.sessionAId, f.tenantAId]);
    }, {
      principal: 'Teacher A',
      resource: 'exam_malpractices',
      operation: 'INSERT (same-tenant)',
      expectedSubstring: 'violates row-level security policy',
    });

    const rows = await verifyDatabaseState(`SELECT id FROM public.exam_malpractices WHERE student_name = 'Teacher Malpractice Attempt';`);
    assert.equal(rows.length, 0, 'Unauthorized malpractice record must NOT exist in database state');
  });

  // T-010C: Teacher A -> exam_malpractices SELECT (Tenant B) -> DENY (0 rows)
  await t.test('T-010C: Teacher A -> exam_malpractices SELECT (Tenant B) -> DENY (0 rows)', async () => {
    await asUser(f.userTeacherAId);
    const res = await client.query(`SELECT * FROM public.exam_malpractices WHERE id = $1;`, [f.malpracticeBId]);
    assert.equal(res.rows.length, 0, 'Teacher A must NOT view Tenant B malpractice records (0 rows)');
  });

  // T-010D: Teacher A -> exam_malpractices INSERT (Tenant B) -> DENY (42501 RLS denial)
  await t.test('T-010D: Teacher A -> exam_malpractices INSERT (Tenant B) -> DENY (42501)', async () => {
    await asUser(f.userTeacherAId);
    await expectRlsError(async () => {
      await client.query(`
        INSERT INTO public.exam_malpractices (session_id, tenant_id, student_name, subject_name, offense_type)
        VALUES ($1, $2, 'Cross-Tenant Malpractice', 'Biology', 'Cheating Sheet');
      `, [f.sessionBId, f.tenantBId]);
    }, {
      principal: 'Teacher A',
      resource: 'exam_malpractices',
      operation: 'INSERT (cross-tenant)',
      expectedSubstring: 'violates row-level security policy',
    });

    const rows = await verifyDatabaseState(`SELECT id FROM public.exam_malpractices WHERE student_name = 'Cross-Tenant Malpractice';`);
    assert.equal(rows.length, 0, 'Cross-tenant malpractice row must NOT exist in database state');
  });

  // T-010E: Teacher A -> exam_results_approval SELECT (Tenant A) -> DENY (0 rows)
  await t.test('T-010E: Teacher A -> exam_results_approval SELECT (Tenant A) -> DENY (0 rows)', async () => {
    await asUser(f.userTeacherAId);
    const res = await client.query(`SELECT * FROM public.exam_results_approval WHERE id = $1;`, [f.approvalAId]);
    assert.equal(res.rows.length, 0, 'Ordinary teacher must NOT view privileged results approval table (0 rows)');
  });

  // T-010F: Teacher A -> exam_results_approval INSERT (Tenant A) -> DENY (42501 RLS denial)
  await t.test('T-010F: Teacher A -> exam_results_approval INSERT (Tenant A) -> DENY (42501)', async () => {
    await asUser(f.userTeacherAId);
    await expectRlsError(async () => {
      await client.query(`
        INSERT INTO public.exam_results_approval (session_id, tenant_id, class_name, subject_name, status)
        VALUES ($1, $2, 'Class 12C', 'History', 'Pending Moderation');
      `, [f.sessionAId, f.tenantAId]);
    }, {
      principal: 'Teacher A',
      resource: 'exam_results_approval',
      operation: 'INSERT (same-tenant)',
      expectedSubstring: 'violates row-level security policy',
    });

    const rows = await verifyDatabaseState(`SELECT id FROM public.exam_results_approval WHERE class_name = 'Class 12C';`);
    assert.equal(rows.length, 0, 'Unauthorized results approval row must NOT exist in database state');
  });

  // T-010G: Teacher A -> exam_results_approval SELECT (Tenant B) -> DENY (0 rows)
  await t.test('T-010G: Teacher A -> exam_results_approval SELECT (Tenant B) -> DENY (0 rows)', async () => {
    await asUser(f.userTeacherAId);
    const res = await client.query(`SELECT * FROM public.exam_results_approval WHERE id = $1;`, [f.approvalBId]);
    assert.equal(res.rows.length, 0, 'Teacher A must NOT view Tenant B results approval records (0 rows)');
  });

  // T-010H: Teacher A -> exam_results_approval INSERT (Tenant B) -> DENY (42501 RLS denial)
  await t.test('T-010H: Teacher A -> exam_results_approval INSERT (Tenant B) -> DENY (42501)', async () => {
    await asUser(f.userTeacherAId);
    await expectRlsError(async () => {
      await client.query(`
        INSERT INTO public.exam_results_approval (session_id, tenant_id, class_name, subject_name, status)
        VALUES ($1, $2, 'Class 12B', 'Economics', 'Pending Moderation');
      `, [f.sessionBId, f.tenantBId]);
    }, {
      principal: 'Teacher A',
      resource: 'exam_results_approval',
      operation: 'INSERT (cross-tenant)',
      expectedSubstring: 'violates row-level security policy',
    });

    const rows = await verifyDatabaseState(`SELECT id FROM public.exam_results_approval WHERE class_name = 'Class 12B';`);
    assert.equal(rows.length, 0, 'Cross-tenant results approval row must NOT exist in database state');
  });

  // T-010I: School Admin A -> exam_results_approval INSERT (Tenant A) -> ALLOW
  await t.test('T-010I: School Admin A -> exam_results_approval INSERT (Tenant A) -> ALLOW', async () => {
    await asUser(f.userAdminAId);
    const res = await client.query(`
      INSERT INTO public.exam_results_approval (session_id, tenant_id, class_name, subject_name, status)
      VALUES ($1, $2, 'Class 11 Science', 'Chemistry', 'Pending Moderation')
      RETURNING id;
    `, [f.sessionAId, f.tenantAId]);
    assert.equal(res.rows.length, 1, 'School Admin A must be permitted to insert results approval records');
  });

  // T-010J: School Admin A -> exam_malpractices SELECT (Tenant A) -> ALLOW (1 row)
  await t.test('T-010J: School Admin A -> exam_malpractices SELECT (Tenant A) -> ALLOW (1 row)', async () => {
    await asUser(f.userAdminAId);
    const res = await client.query(`SELECT id FROM public.exam_malpractices WHERE id = $1;`, [f.malpracticeAId]);
    assert.equal(res.rows.length, 1, 'School Admin A must be permitted to view Tenant A malpractice records');
  });

  // T-010K: School Admin A -> exam_results_approval UPDATE (Tenant A) -> ALLOW
  await t.test('T-010K: School Admin A -> exam_results_approval UPDATE (Tenant A) -> ALLOW', async () => {
    await asUser(f.userAdminAId);
    const res = await client.query(`
      UPDATE public.exam_results_approval SET status = 'Approved' WHERE id = $1;
    `, [f.approvalAId]);
    assert.equal(res.rowCount, 1, 'School Admin A must be permitted to approve results');
  });

  // T-010L: Teacher A -> exam_results_approval UPDATE (Tenant A) -> DENY (0 rows affected)
  await t.test('T-010L: Teacher A -> exam_results_approval UPDATE (Tenant A) -> DENY (0 rows affected)', async () => {
    await asUser(f.userTeacherAId);
    const res = await client.query(`
      UPDATE public.exam_results_approval SET status = 'HACKED_APPROVED' WHERE id = $1;
    `, [f.approvalAId]);
    assert.equal(res.rowCount, 0, 'Ordinary teacher must NOT update results approval status');

    const rows = await verifyDatabaseState(`SELECT status FROM public.exam_results_approval WHERE id = $1;`, [f.approvalAId]);
    assert.notEqual(rows[0].status, 'HACKED_APPROVED', 'Approval status must not have been modified by teacher');
  });

  // T-010M: Student A -> exam_results_approval SELECT (Tenant A) -> DENY (0 rows)
  await t.test('T-010M: Student A -> exam_results_approval SELECT (Tenant A) -> DENY (0 rows)', async () => {
    await asUser(f.userStudentAId);
    const res = await client.query(`SELECT * FROM public.exam_results_approval WHERE id = $1;`, [f.approvalAId]);
    assert.equal(res.rows.length, 0, 'Student must NOT read results approval table');
  });

  // T-010N: Student A -> exam_malpractices SELECT (Tenant A) -> DENY (0 rows)
  await t.test('T-010N: Student A -> exam_malpractices SELECT (Tenant A) -> DENY (0 rows)', async () => {
    await asUser(f.userStudentAId);
    const res = await client.query(`SELECT * FROM public.exam_malpractices WHERE id = $1;`, [f.malpracticeAId]);
    assert.equal(res.rows.length, 0, 'Student must NOT read malpractice records');
  });

  // T-010O: Student A -> exam_sessions INSERT (Tenant A) -> DENY (42501 RLS denial)
  await t.test('T-010O: Student A -> exam_sessions INSERT (Tenant A) -> DENY (42501)', async () => {
    await asUser(f.userStudentAId);
    await expectRlsError(async () => {
      await client.query(`
        INSERT INTO public.exam_sessions (tenant_id, name, academic_year, term)
        VALUES ($1, 'STUDENT_HACK_EXAM', '2025-26', '1st Term');
      `, [f.tenantAId]);
    }, {
      principal: 'Student A',
      resource: 'exam_sessions',
      operation: 'INSERT (unauthorized role)',
      expectedSubstring: 'violates row-level security policy',
    });

    const rows = await verifyDatabaseState(`SELECT id FROM public.exam_sessions WHERE name = 'STUDENT_HACK_EXAM';`);
    assert.equal(rows.length, 0, 'Student-inserted exam session must NOT exist in database state');
  });

  // T-010P: School Admin A -> exam_student_spotlights INSERT (derived analytics) -> DENY (42501 RLS denial)
  await t.test('T-010P: School Admin A -> exam_student_spotlights INSERT (derived analytics) -> DENY (42501)', async () => {
    await asUser(f.userAdminAId);
    await expectRlsError(async () => {
      await client.query(`
        INSERT INTO public.exam_student_spotlights (tenant_id, category, score, name)
        VALUES ($1, 'TAMPERED_CATEGORY', '99%', 'Hacker');
      `, [f.tenantAId]);
    }, {
      principal: 'School Admin A',
      resource: 'exam_student_spotlights (analytics)',
      operation: 'INSERT (derived analytics table)',
      expectedSubstring: 'violates row-level security policy',
    });

    const rows = await verifyDatabaseState(`SELECT id FROM public.exam_student_spotlights WHERE name = 'Hacker';`);
    assert.equal(rows.length, 0, 'Tampered analytics record must NOT exist in database state');
  });

  // =========================================================================
  // T-011: Deactivated User (DENY / Fail-Closed)
  // =========================================================================
  await t.test('T-011: Deactivated User fails closed across complete chain -> DENY', async () => {
    await asUser(f.userDeactivatedAId);

    const tenantRes = await client.query(`SELECT public.get_user_tenant_id() as tid;`);
    assert.equal(tenantRes.rows[0].tid, null, 'get_user_tenant_id() must return NULL for deactivated user');

    const selectRes = await client.query(`SELECT * FROM public.academic_years WHERE id = $1;`, [f.yearAId]);
    assert.equal(selectRes.rows.length, 0, 'Deactivated user must NOT read academic years (0 rows)');

    await expectRlsError(async () => {
      await client.query(`
        INSERT INTO public.academic_years (tenant_id, name, start_date, end_date)
        VALUES ($1, 'DEACTIVATED_INSERT', '2025-09-01', '2026-06-30');
      `, [f.tenantAId]);
    }, {
      principal: 'Deactivated User',
      resource: 'academic_years',
      operation: 'INSERT (inactive user)',
      expectedSubstring: 'violates row-level security policy',
    });

    const updateRes = await client.query(`
      UPDATE public.academic_years SET name = 'DEACTIVATED_UPDATE' WHERE id = $1;
    `, [f.yearAId]);
    assert.equal(updateRes.rowCount, 0, 'Deactivated user must NOT update records (0 rows affected)');
  });

  // =========================================================================
  // T-012: Anonymous Access (DENY / 0 rows)
  // =========================================================================
  await t.test('T-012: Anonymous Access without authentication -> DENY', async () => {
    await asAnon();

    const resYear = await client.query(`SELECT * FROM public.academic_years;`);
    assert.equal(resYear.rows.length, 0, 'Anonymous users must NOT read academic years');

    const resSession = await client.query(`SELECT * FROM public.exam_sessions;`);
    assert.equal(resSession.rows.length, 0, 'Anonymous users must NOT read exam sessions');

    const resTenant = await client.query(`SELECT * FROM public.tenants;`);
    assert.equal(resTenant.rows.length, 0, 'Anonymous users must NOT read tenants');
  });

  // =========================================================================
  // T-013: NULL Tenant (DENY / SQLSTATE 42501)
  // =========================================================================
  await t.test('T-013: NULL Tenant creation / mutation -> DENY', async () => {
    await asUser(f.userAdminAId);

    await expectRlsError(async () => {
      await client.query(`
        INSERT INTO public.exam_sessions (tenant_id, name, academic_year, term)
        VALUES (NULL, 'NULL_TENANT_EXAM', '2025-26', '1st Term');
      `, []);
    }, {
      principal: 'Admin A',
      resource: 'exam_sessions',
      operation: 'INSERT (NULL tenant_id)',
      expectedSubstring: 'violates row-level security policy',
    });
  });

  // =========================================================================
  // T-014: Tenant Rebinding (DENY / SQLSTATE 42501)
  // =========================================================================
  await t.test('T-014: Tenant Rebinding on existing resource -> DENY', async () => {
    await asUser(f.userAdminAId);

    await expectRlsError(async () => {
      await client.query(`
        UPDATE public.applicants SET tenant_id = $1 WHERE id = $2;
      `, [f.tenantBId, f.applicantAId]);
    }, {
      principal: 'Admin A',
      resource: 'applicants',
      operation: 'UPDATE (rebind applicant to Tenant B)',
      expectedSubstring: 'violates row-level security policy',
    });
  });

  // =========================================================================
  // T-015: Explicit Privileged Boundaries (T-015A through T-015E)
  // =========================================================================
  await t.test('T-015A: Super Admin -> Tenant A resource -> ALLOW', async () => {
    await asUser(f.userSuperAdminId);
    const res = await client.query(`SELECT id FROM public.tenants WHERE id = $1;`, [f.tenantAId]);
    assert.equal(res.rows.length, 1, 'Super Admin must be able to view Tenant A in tenants table');
  });

  await t.test('T-015B: School Admin -> own school resource -> ALLOW', async () => {
    await asUser(f.userAdminAId);
    const res = await client.query(`SELECT id FROM public.exam_sessions WHERE id = $1;`, [f.sessionAId]);
    assert.equal(res.rows.length, 1, 'School Admin must view own school exam session');
  });

  await t.test('T-015C: School Admin -> unrelated tenant resource -> DENY', async () => {
    await asUser(f.userAdminAId);
    const res = await client.query(`SELECT id FROM public.exam_sessions WHERE id = $1;`, [f.sessionBId]);
    assert.equal(res.rows.length, 0, 'School Admin must NOT view unrelated tenant exam session (0 rows)');
  });

  await t.test('T-015D: School Admin -> platform-level tenant mutation -> DENY', async () => {
    await asUser(f.userAdminAId);
    const res = await client.query(`
      UPDATE public.tenants SET name = 'Hacked Tenant Name' WHERE id = $1;
    `, [f.tenantAId]);
    assert.equal(res.rowCount, 0, 'School Admin must NOT mutate platform tenants table directly');
  });

  await t.test('T-015E: Inactive Super Admin -> privileged operation -> DENY', async () => {
    await asUser(f.userInactiveSuperId);
    const isSuper = await client.query(`SELECT public.is_super_admin() as is_super;`);
    assert.equal(isSuper.rows[0].is_super, false, 'Inactive Super Admin must not be recognized as super_admin');

    const res = await client.query(`SELECT * FROM public.tenants;`);
    assert.equal(res.rows.length, 0, 'Inactive Super Admin must NOT query all tenants (0 rows)');
  });

  // =========================================================================
  // PROFILE TESTS (PROFILE-01 through PROFILE-10)
  // =========================================================================
  await t.test('PROFILE-01: Self profile allowed fields update -> ALLOW', async () => {
    await asUser(f.userAdminAId);
    const res = await client.query(`
      UPDATE public.profiles SET full_name = 'Admin A Updated' WHERE id = $1;
    `, [f.userAdminAId]);
    assert.equal(res.rowCount, 1, 'User must be able to update own full_name');
  });

  await t.test('PROFILE-02: Role escalation attempt -> DENY', async () => {
    await asUser(f.userStudentAId);
    await expectRlsError(async () => {
      await client.query(`
        UPDATE public.profiles SET role = 'super_admin' WHERE id = $1;
      `, [f.userStudentAId]);
    }, {
      principal: 'Student A',
      resource: 'profiles',
      operation: 'UPDATE (role self-escalation)',
      expectedSubstring: 'only super_admin or service_role can modify profile role',
    });

    const rows = await verifyDatabaseState(`SELECT role FROM public.profiles WHERE id = $1;`, [f.userStudentAId]);
    assert.equal(rows[0].role, 'student', 'Student role must remain unchanged');
  });

  await t.test('PROFILE-03: Tenant rebinding attempt on profile -> DENY', async () => {
    await asUser(f.userStudentAId);
    await expectRlsError(async () => {
      await client.query(`
        UPDATE public.profiles SET tenant_id = $1 WHERE id = $2;
      `, [f.tenantBId, f.userStudentAId]);
    }, {
      principal: 'Student A',
      resource: 'profiles',
      operation: 'UPDATE (tenant_id rebinding)',
      expectedSubstring: 'only super_admin or service_role can modify profile tenant_id',
    });

    const rows = await verifyDatabaseState(`SELECT tenant_id FROM public.profiles WHERE id = $1;`, [f.userStudentAId]);
    assert.equal(rows[0].tenant_id, f.tenantAId, 'Profile tenant_id must remain unchanged');
  });

  await t.test('PROFILE-04: is_active manipulation attempt -> DENY', async () => {
    await asUser(f.userAdminAId);
    await expectRlsError(async () => {
      await client.query(`
        UPDATE public.profiles SET is_active = false WHERE id = $1;
      `, [f.userAdminAId]);
    }, {
      principal: 'Admin A',
      resource: 'profiles',
      operation: 'UPDATE (is_active manipulation)',
      expectedSubstring: 'only super_admin or service_role can modify profile is_active',
    });

    const rows = await verifyDatabaseState(`SELECT is_active FROM public.profiles WHERE id = $1;`, [f.userAdminAId]);
    assert.equal(rows[0].is_active, true, 'is_active status must remain unchanged');
  });

  await t.test('PROFILE-05: Another user profile mutation attempt -> DENY / 0 rows', async () => {
    await asUser(f.userStudentAId);
    const res = await client.query(`
      UPDATE public.profiles SET full_name = 'Hacked Name' WHERE id = $1;
    `, [f.userAdminAId]);
    assert.equal(res.rowCount, 0, 'User must not update another user profile');

    const rows = await verifyDatabaseState(`SELECT full_name FROM public.profiles WHERE id = $1;`, [f.userAdminAId]);
    assert.equal(rows[0].full_name, 'Admin A Updated', 'Target user full_name must remain unchanged');
  });

  await t.test('PROFILE-06: Legitimate administrative update via super_admin -> ALLOW', async () => {
    await asUser(f.userSuperAdminId);
    const res = await client.query(`
      UPDATE public.profiles SET full_name = 'Super Admin Managed Name' WHERE id = $1;
    `, [f.userStudentAId]);
    assert.equal(res.rowCount, 1, 'Super Admin must be able to update user profile');
  });

  await t.test('PROFILE-07: Invitation provisioning via bind_invitation_to_user RPC -> ALLOW', async () => {
    await asPostgres();

    const invEmail = `inv_test_${Date.now()}@test.sec`;
    const invRes = await client.query(`
      INSERT INTO public.user_invitations (email, tenant_id, role, full_name, status)
      VALUES ($1, $2, 'teacher', 'Invited Teacher', 'pending')
      RETURNING id;
    `, [invEmail, f.tenantAId]);
    const invId = invRes.rows[0].id;

    const invUserId = await client.query(`
      INSERT INTO auth.users (id, email, role, aud)
      VALUES (gen_random_uuid(), $1, 'authenticated', 'authenticated')
      RETURNING id;
    `, [invEmail]);
    const newUserId = invUserId.rows[0].id;

    const rpcRes = await client.query(`
      SELECT public.bind_invitation_to_user($1, $2) as result;
    `, [invId, newUserId]);

    assert.ok(rpcRes.rows[0].result, 'bind_invitation_to_user must return binding payload');
    assert.equal(rpcRes.rows[0].result.tenant_id, f.tenantAId);
    assert.equal(rpcRes.rows[0].result.role, 'teacher');

    const profRes = await client.query(`
      SELECT * FROM public.profiles WHERE id = $1;
    `, [newUserId]);
    assert.equal(profRes.rows.length, 1, 'Profile must be created by invitation RPC');
    assert.equal(profRes.rows[0].role, 'teacher');
  });

  // PROFILE-08: Anonymous web request (auth.uid() IS NULL with anon role) cannot bypass trigger
  await t.test('PROFILE-08: Anonymous web caller (auth.uid() IS NULL, role=anon) cannot bypass trigger -> DENY', async () => {
    // 1. RLS Layer Verification: Anonymous caller is denied at table boundary (0 rows updated)
    await asAnon();
    const rlsRes = await client.query(`
      UPDATE public.profiles SET role = 'super_admin' WHERE id = $1;
    `, [f.userStudentAId]);
    assert.equal(rlsRes.rowCount, 0, 'Anonymous web caller must affect 0 rows via RLS policy');

    const state1 = await verifyDatabaseState(`SELECT role FROM public.profiles WHERE id = $1;`, [f.userStudentAId]);
    assert.equal(state1[0].role, 'student', 'Student profile role must remain unchanged in database state');

    // 2. Trigger Defense-in-Depth: Even if row-filtering is bypassed, trigger strictly rejects web caller
    await client.query(`SET LOCAL role = 'postgres';`);
    await client.query(`SELECT set_config('request.jwt.claim.role', 'anon', true);`);
    await client.query(`SELECT set_config('request.jwt.claim.sub', '', true);`);
    await expectRlsError(async () => {
      await client.query(`
        UPDATE public.profiles SET role = 'super_admin' WHERE id = $1;
      `, [f.userStudentAId]);
    }, {
      principal: 'Anonymous Web Context',
      resource: 'profiles',
      operation: 'UPDATE (trigger defense-in-depth)',
      expectedSubstring: 'only super_admin or service_role can modify profile role',
    });

    const state2 = await verifyDatabaseState(`SELECT role FROM public.profiles WHERE id = $1;`, [f.userStudentAId]);
    assert.equal(state2[0].role, 'student', 'Student profile role must remain unchanged');
  });

  // PROFILE-09: Authenticated web request with missing sub cannot bypass trigger
  await t.test('PROFILE-09: Authenticated caller with missing sub cannot bypass trigger -> DENY', async () => {
    // 1. RLS Layer Verification: Authenticated caller with empty sub affects 0 rows via RLS
    await client.query(`SET LOCAL role = 'authenticated';`);
    await client.query(`SELECT set_config('request.jwt.claim.sub', '', true);`);
    await client.query(`SELECT set_config('request.jwt.claim.role', 'authenticated', true);`);
    const rlsRes = await client.query(`
      UPDATE public.profiles SET role = 'super_admin' WHERE id = $1;
    `, [f.userStudentAId]);
    assert.equal(rlsRes.rowCount, 0, 'Caller with empty sub must affect 0 rows via RLS');

    const state1 = await verifyDatabaseState(`SELECT role FROM public.profiles WHERE id = $1;`, [f.userStudentAId]);
    assert.equal(state1[0].role, 'student', 'Student profile role must remain unchanged');

    // 2. Trigger Defense-in-Depth: Trigger strictly rejects non-admin web claims
    await client.query(`SET LOCAL role = 'postgres';`);
    await client.query(`SELECT set_config('request.jwt.claim.role', 'authenticated', true);`);
    await client.query(`SELECT set_config('request.jwt.claim.sub', '', true);`);
    await expectRlsError(async () => {
      await client.query(`
        UPDATE public.profiles SET role = 'super_admin' WHERE id = $1;
      `, [f.userStudentAId]);
    }, {
      principal: 'Authenticated Web Context (empty sub)',
      resource: 'profiles',
      operation: 'UPDATE (trigger defense-in-depth)',
      expectedSubstring: 'only super_admin or service_role can modify profile role',
    });

    const state2 = await verifyDatabaseState(`SELECT role FROM public.profiles WHERE id = $1;`, [f.userStudentAId]);
    assert.equal(state2[0].role, 'student', 'Student profile role must remain unchanged');
  });

  // PROFILE-10: Direct trusted database administration (postgres superuser without web JWT headers) -> ALLOW
  await t.test('PROFILE-10: Direct trusted database administration (postgres superuser without web JWT) -> ALLOW', async () => {
    await client.query(`SET LOCAL role = 'postgres';`);
    await client.query(`SELECT set_config('request.jwt.claim.sub', '', true);`);
    await client.query(`SELECT set_config('request.jwt.claim.role', '', true);`);

    const res = await client.query(`
      UPDATE public.profiles SET role = 'school_admin' WHERE id = $1;
    `, [f.userStudentAId]);
    assert.equal(res.rowCount, 1, 'Direct superuser console must be permitted to modify profiles for migrations');

    // Restore student role for clean fixture state
    await client.query(`UPDATE public.profiles SET role = 'student' WHERE id = $1;`, [f.userStudentAId]);
  });

  // Rollback parent transaction - 100% clean isolation
  await client.query('ROLLBACK');
  await client.end();
});
