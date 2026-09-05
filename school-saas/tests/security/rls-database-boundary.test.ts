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
  malpracticeAId: string;
}

test('TASK-0006: Real PostgreSQL RLS & Tenant Isolation Test Harness', async (t) => {
  const allowSelfSigned = true;
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: !allowSelfSigned },
  });

  await client.connect();

  // Helper to switch PostgreSQL session identity
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

  // Wrapper to execute an assertion inside a SAVEPOINT to protect the parent transaction from error aborts
  async function expectError(action: () => Promise<any>, expectedErrorSubstring?: string): Promise<string> {
    const spName = 'sp_' + Math.floor(Math.random() * 10000000);
    await client.query(`SAVEPOINT ${spName};`);
    let threw = false;
    let errorMessage = '';
    try {
      await action();
    } catch (err: any) {
      threw = true;
      errorMessage = err.message;
    }
    await client.query(`ROLLBACK TO SAVEPOINT ${spName};`);
    assert.ok(threw, 'Expected operation to fail with error, but it succeeded.');
    if (expectedErrorSubstring) {
      assert.ok(
        errorMessage.toLowerCase().includes(expectedErrorSubstring.toLowerCase()),
        `Expected error containing "${expectedErrorSubstring}", got: "${errorMessage}"`
      );
    }
    return errorMessage;
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
        ($7, 'deactivatedA@test.sec', 'Deactivated A', 'school_admin', $2, false),
        ($8, 'superadmin@test.sec', 'Super Admin', 'super_admin', $2, true),
        ($9, 'inactivesuper@test.sec', 'Inactive Super', 'super_admin', $2, false);
    `, [
      userAdminAId, tenantAId,
      userTeacherAId,
      userStudentAId,
      userAdminBId, tenantBId,
      userDeactivatedAId,
      userSuperAdminId,
      userInactiveSuperId,
    ]);

    // 4. Create baseline domain resources for both tenants
    // Academic Years
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

    // Exam Sessions
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

    // Exam Results Approval (privileged workflow)
    const approvalARes = await client.query(`
      INSERT INTO public.exam_results_approval (session_id, tenant_id, class_name, subject_name, status)
      VALUES ($1, $2, 'Class 10A', 'Mathematics', 'Pending Moderation')
      RETURNING id;
    `, [sessionARes.rows[0].id, tenantAId]);

    // Exam Malpractice (sensitive)
    const malpracticeARes = await client.query(`
      INSERT INTO public.exam_malpractices (session_id, tenant_id, student_name, subject_name, offense_type)
      VALUES ($1, $2, 'Student Sneak', 'Physics', 'Unauthorized Materials')
      RETURNING id;
    `, [sessionARes.rows[0].id, tenantAId]);

    // Applicants
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

    // Notifications (Master)
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

    // Notification Recipient for Student A
    await client.query(`
      INSERT INTO public.notification_recipients (notification_id, user_id, status)
      VALUES ($1, $2, 'unread');
    `, [notifARes.rows[0].id, userStudentAId]);

    f = {
      tenantAId,
      tenantBId,
      userAdminAId,
      userTeacherAId,
      userStudentAId,
      userAdminBId,
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
      malpracticeAId: malpracticeARes.rows[0].id,
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
    
    // Academic Years
    const resYear = await client.query(`SELECT id FROM public.academic_years WHERE id = $1;`, [f.yearAId]);
    assert.equal(resYear.rows.length, 1, 'Admin A must be able to read Tenant A academic year');

    // Exam Sessions
    const resSession = await client.query(`SELECT id FROM public.exam_sessions WHERE id = $1;`, [f.sessionAId]);
    assert.equal(resSession.rows.length, 1, 'Admin A must be able to read Tenant A exam session');

    // Applicants
    const resApplicant = await client.query(`SELECT id FROM public.applicants WHERE id = $1;`, [f.applicantAId]);
    assert.equal(resApplicant.rows.length, 1, 'Admin A must be able to read Tenant A applicant');
  });

  // =========================================================================
  // T-002: Cross-Tenant Read (DENY / 0 rows)
  // =========================================================================
  await t.test('T-002: Cross-Tenant Read -> DENY / 0 rows', async () => {
    await asUser(f.userAdminAId);

    // Attempt to read Tenant B academic year
    const resYear = await client.query(`SELECT id FROM public.academic_years WHERE id = $1;`, [f.yearBId]);
    assert.equal(resYear.rows.length, 0, 'Admin A must NOT read Tenant B academic year');

    // Attempt to read Tenant B exam session
    const resSession = await client.query(`SELECT id FROM public.exam_sessions WHERE id = $1;`, [f.sessionBId]);
    assert.equal(resSession.rows.length, 0, 'Admin A must NOT read Tenant B exam session');

    // Attempt to read Tenant B applicant
    const resApplicant = await client.query(`SELECT id FROM public.applicants WHERE id = $1;`, [f.applicantBId]);
    assert.equal(resApplicant.rows.length, 0, 'Admin A must NOT read Tenant B applicant');

    // Attempt to read Tenant B notifications
    const resNotif = await client.query(`SELECT id FROM public.notifications WHERE id = $1;`, [f.notifBId]);
    assert.equal(resNotif.rows.length, 0, 'Admin A must NOT read Tenant B notifications');
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
    assert.ok(res.rows[0].id, 'Admin A must insert valid record into Tenant A');

    // Exam session insert
    const resSession = await client.query(`
      INSERT INTO public.exam_sessions (tenant_id, name, academic_year, term)
      VALUES ($1, 'SEC_SESSION_A_NEW', '2025-26', '2nd Term')
      RETURNING id;
    `, [f.tenantAId]);
    assert.ok(resSession.rows[0].id, 'Admin A must insert valid exam session into Tenant A');
  });

  // =========================================================================
  // T-004: Cross-Tenant Insert (DENY)
  // =========================================================================
  await t.test('T-004: Cross-Tenant Insert -> DENY', async () => {
    await asUser(f.userAdminAId);

    // Attempt to insert record into Tenant B
    await expectError(async () => {
      await client.query(`
        INSERT INTO public.academic_years (tenant_id, name, start_date, end_date)
        VALUES ($1, 'SEC_YEAR_B_HACK', '2025-09-01', '2026-06-30');
      `, [f.tenantBId]);
    }, 'violates row-level security policy');

    // Attempt to insert exam session into Tenant B
    await expectError(async () => {
      await client.query(`
        INSERT INTO public.exam_sessions (tenant_id, name, academic_year, term)
        VALUES ($1, 'SEC_SESSION_B_HACK', '2025-26', '2nd Term');
      `, [f.tenantBId]);
    }, 'violates row-level security policy');
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

    const resSession = await client.query(`
      UPDATE public.exam_sessions SET name = 'DEFACED' WHERE id = $1;
    `, [f.sessionBId]);
    assert.equal(resSession.rowCount, 0, 'Admin A must NOT update Tenant B exam session');
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

    const resSession = await client.query(`
      DELETE FROM public.exam_sessions WHERE id = $1;
    `, [f.sessionBId]);
    assert.equal(resSession.rowCount, 0, 'Admin A must NOT delete Tenant B exam session');
  });

  // =========================================================================
  // T-008: Tenant-ID Tampering (DENY)
  // =========================================================================
  await t.test('T-008: Tenant-ID Tampering on mutation -> DENY', async () => {
    await asUser(f.userAdminAId);

    // Attempt to tamper tenant_id on update
    await expectError(async () => {
      await client.query(`
        UPDATE public.applicants SET tenant_id = $1 WHERE id = $2;
      `, [f.tenantBId, f.applicantAId]);
    }, 'violates row-level security policy');
  });

  // =========================================================================
  // T-009: Resource-ID Tampering / IDOR (DENY)
  // =========================================================================
  await t.test('T-009: Resource-ID Tampering using valid Tenant B UUID -> DENY', async () => {
    await asUser(f.userAdminAId);

    // Direct fetch of Tenant B applicant UUID by Tenant A user
    const res = await client.query(`
      SELECT * FROM public.applicants WHERE id = $1;
    `, [f.applicantBId]);
    assert.equal(res.rows.length, 0, 'Resource ID belonging to Tenant B must not be accessible to Tenant A');
  });

  // =========================================================================
  // T-010: Unauthorized Role (DENY)
  // =========================================================================
  await t.test('T-010: Unauthorized Role boundaries -> DENY', async () => {
    // 1. Student attempting to insert an exam session
    await asUser(f.userStudentAId);
    await expectError(async () => {
      await client.query(`
        INSERT INTO public.exam_sessions (tenant_id, name, academic_year, term)
        VALUES ($1, 'STUDENT_HACK_EXAM', '2025-26', '1st Term');
      `, [f.tenantAId]);
    }, 'violates row-level security policy');

    // 2. Student attempting to read privileged results approval workflow table
    const resApproval = await client.query(`SELECT * FROM public.exam_results_approval WHERE id = $1;`, [f.approvalAId]);
    assert.equal(resApproval.rows.length, 0, 'Student must NOT read exam results approval table');

    // 3. Student attempting to read sensitive malpractices table
    const resMalpractice = await client.query(`SELECT * FROM public.exam_malpractices WHERE id = $1;`, [f.malpracticeAId]);
    assert.equal(resMalpractice.rows.length, 0, 'Student must NOT read exam malpractices table');

    // 4. Ordinary admin attempting to mutate derived analytics table
    await asUser(f.userAdminAId);
    await expectError(async () => {
      await client.query(`
        INSERT INTO public.exam_student_spotlights (tenant_id, category, score, name)
        VALUES ($1, 'TAMPERED_CATEGORY', '99%', 'Hacker');
      `, [f.tenantAId]);
    }, 'violates row-level security policy');
  });

  // =========================================================================
  // T-011: Deactivated User (DENY)
  // =========================================================================
  await t.test('T-011: Deactivated User fails closed across complete chain -> DENY', async () => {
    await asUser(f.userDeactivatedAId);

    // Helper function get_user_tenant_id() must return NULL for deactivated user
    const tenantRes = await client.query(`SELECT public.get_user_tenant_id() as tid;`);
    assert.equal(tenantRes.rows[0].tid, null, 'get_user_tenant_id() must return NULL for deactivated user');

    // Protected SELECT on academic_years
    const selectRes = await client.query(`SELECT * FROM public.academic_years WHERE id = $1;`, [f.yearAId]);
    assert.equal(selectRes.rows.length, 0, 'Deactivated user must NOT read academic years');

    // Protected INSERT on academic_years
    await expectError(async () => {
      await client.query(`
        INSERT INTO public.academic_years (tenant_id, name, start_date, end_date)
        VALUES ($1, 'DEACTIVATED_INSERT', '2025-09-01', '2026-06-30');
      `, [f.tenantAId]);
    }, 'violates row-level security policy');

    // Protected UPDATE on academic_years
    const updateRes = await client.query(`
      UPDATE public.academic_years SET name = 'DEACTIVATED_UPDATE' WHERE id = $1;
    `, [f.yearAId]);
    assert.equal(updateRes.rowCount, 0, 'Deactivated user must NOT update records');
  });

  // =========================================================================
  // T-012: Anonymous Access (DENY)
  // =========================================================================
  await t.test('T-012: Anonymous Access without authentication -> DENY', async () => {
    await asAnon();

    // Anonymous query on academic_years
    const resYear = await client.query(`SELECT * FROM public.academic_years;`);
    assert.equal(resYear.rows.length, 0, 'Anonymous users must NOT read academic years');

    // Anonymous query on exam_sessions
    const resSession = await client.query(`SELECT * FROM public.exam_sessions;`);
    assert.equal(resSession.rows.length, 0, 'Anonymous users must NOT read exam sessions');

    // Anonymous query on tenants
    const resTenant = await client.query(`SELECT * FROM public.tenants;`);
    assert.equal(resTenant.rows.length, 0, 'Anonymous users must NOT read tenants');
  });

  // =========================================================================
  // T-013: NULL Tenant (DENY)
  // =========================================================================
  await t.test('T-013: NULL Tenant creation / mutation -> DENY', async () => {
    await asUser(f.userAdminAId);

    // Attempt to insert exam session with NULL tenant
    await expectError(async () => {
      await client.query(`
        INSERT INTO public.exam_sessions (tenant_id, name, academic_year, term)
        VALUES (NULL, 'NULL_TENANT_EXAM', '2025-26', '1st Term');
      `, []);
    }, 'violates row-level security policy');
  });

  // =========================================================================
  // T-014: Tenant Rebinding (DENY)
  // =========================================================================
  await t.test('T-014: Tenant Rebinding on existing resource -> DENY', async () => {
    await asUser(f.userAdminAId);

    // Attempt to move an existing applicant to Tenant B
    await expectError(async () => {
      await client.query(`
        UPDATE public.applicants SET tenant_id = $1 WHERE id = $2;
      `, [f.tenantBId, f.applicantAId]);
    }, 'violates row-level security policy');
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
    assert.equal(res.rows.length, 0, 'School Admin must NOT view unrelated tenant exam session');
  });

  await t.test('T-015D: School Admin -> platform-level tenant mutation -> DENY', async () => {
    await asUser(f.userAdminAId);
    // School admin attempting to update tenant record directly in public.tenants
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
    assert.equal(res.rows.length, 0, 'Inactive Super Admin must NOT query all tenants');
  });

  // =========================================================================
  // PROFILE TESTS (PROFILE-01 through PROFILE-07)
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
    await expectError(async () => {
      await client.query(`
        UPDATE public.profiles SET role = 'super_admin' WHERE id = $1;
      `, [f.userStudentAId]);
    }, 'cannot change user role');
  });

  await t.test('PROFILE-03: Tenant rebinding attempt on profile -> DENY', async () => {
    await asUser(f.userStudentAId);
    await expectError(async () => {
      await client.query(`
        UPDATE public.profiles SET tenant_id = $1 WHERE id = $2;
      `, [f.tenantBId, f.userStudentAId]);
    }, 'cannot change tenant_id');
  });

  await t.test('PROFILE-04: is_active manipulation attempt -> DENY', async () => {
    await asUser(f.userAdminAId);
    await expectError(async () => {
      await client.query(`
        UPDATE public.profiles SET is_active = false WHERE id = $1;
      `, [f.userAdminAId]);
    }, 'cannot change is_active status');
  });

  await t.test('PROFILE-05: Another user profile mutation attempt -> DENY / 0 rows', async () => {
    await asUser(f.userStudentAId);
    const res = await client.query(`
      UPDATE public.profiles SET full_name = 'Hacked Name' WHERE id = $1;
    `, [f.userAdminAId]);
    assert.equal(res.rowCount, 0, 'User must not update another user profile');
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

    // 1. Create test invitation
    const invEmail = `inv_test_${Date.now()}@test.sec`;
    const invRes = await client.query(`
      INSERT INTO public.user_invitations (email, tenant_id, role, full_name, status)
      VALUES ($1, $2, 'teacher', 'Invited Teacher', 'pending')
      RETURNING id;
    `, [invEmail, f.tenantAId]);
    const invId = invRes.rows[0].id;

    // 2. Create matching auth user
    const invUserId = await client.query(`
      INSERT INTO auth.users (id, email, role, aud)
      VALUES (gen_random_uuid(), $1, 'authenticated', 'authenticated')
      RETURNING id;
    `, [invEmail]);
    const newUserId = invUserId.rows[0].id;

    // 3. Call bind_invitation_to_user RPC as service_role/postgres
    const rpcRes = await client.query(`
      SELECT public.bind_invitation_to_user($1, $2) as result;
    `, [invId, newUserId]);

    assert.ok(rpcRes.rows[0].result, 'bind_invitation_to_user must return binding payload');
    assert.equal(rpcRes.rows[0].result.tenant_id, f.tenantAId);
    assert.equal(rpcRes.rows[0].result.role, 'teacher');

    // Verify profile was created
    const profRes = await client.query(`
      SELECT * FROM public.profiles WHERE id = $1;
    `, [newUserId]);
    assert.equal(profRes.rows.length, 1, 'Profile must be created by invitation RPC');
    assert.equal(profRes.rows[0].role, 'teacher');
  });

  // Rollback parent transaction - 100% clean isolation
  await client.query('ROLLBACK');
  await client.end();
});
