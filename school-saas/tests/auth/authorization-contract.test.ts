/**
 * ============================================================================
 * AUTHORIZATION CONTRACT TESTS (MATRIX-DRIVEN)
 * Architecture: TASK-0007 Phase 3A — Canonical Authorization Engine
 * Mathematical & Empirical Verification of the Canonical RBAC Matrix
 * Verifies both Positive Grants and Negative Space (Default-Deny)
 * ============================================================================
 */

import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_PERMISSIONS,
  BASE_ROLES,
  STAFF_ASSIGNMENT_TYPES,
  type CanonicalPermission,
  type BaseRole,
  type StaffAssignmentType,
  getBaseRoleGrants,
  getAssignmentGrants,
  getPermissionDefinition,
} from '@/lib/auth/permissions-registry';

import {
  evaluateAuthorization,
  createTestSecurityContext,
  type ResourceTarget,
  type ResolvedStaffAssignment,
} from '@/lib/auth/authorization-engine';

describe('Canonical Authorization Contract — Matrix-Driven Verification', () => {

  // --------------------------------------------------------------------------
  // 1. BASE ROLES: POSITIVE & NEGATIVE CONTRACT
  // --------------------------------------------------------------------------
  describe('Group 1 — Base Roles Full Matrix (Positive Grants & Negative Space)', () => {
    for (const role of BASE_ROLES) {
      test(`Base Role [${role}] strictly enforces declared grants and denies unentitled permissions`, () => {
        const grants = getBaseRoleGrants(role);
        const grantedPerms = new Set(grants.map((g) => g.permission));

        const ctx = createTestSecurityContext({
          actorId: `usr-${role}-contract`,
          baseRole: role,
          tenantId: 'ten-school-contract',
          isSuperAdmin: role === 'super_admin',
          verifiedChildStudentIds: ['stu-verified-child'],
          activeAssignments: [],
        });

        for (const perm of CANONICAL_PERMISSIONS) {
          const permDef = getPermissionDefinition(perm);
          const isGranted = grantedPerms.has(perm);

          // Build appropriate valid target for the permission
          const target: ResourceTarget = {
            tenantId: 'ten-school-contract',
            departmentId: 'dept-contract',
            sectionId: 'sec-contract',
            subjectOfferingId: 'off-contract',
            ownerId: role === 'parent' ? 'stu-verified-child' : `usr-${role}-contract`,
            submitterId: 'other-actor-id',
            stage: 'draft',
          };

          const decision = evaluateAuthorization(ctx, perm, target);

          if (isGranted) {
            // Must ALLOW
            assert.equal(
              decision.allowed,
              true,
              `Base role [${role}] MUST be allowed permission [${perm}]`
            );
            assert.equal(decision.decision, 'ALLOW');
            assert.equal(decision.code, 'AUTHORIZED');
          } else {
            // Must DENY (Default Deny / Negative Space)
            assert.equal(
              decision.allowed,
              false,
              `Base role [${role}] MUST be denied unentitled permission [${perm}] (Negative Space Violation!)`
            );
            assert.equal(decision.decision, 'DENY');
            assert.ok(
              decision.code === 'PERMISSION_NOT_GRANTED' ||
                decision.code === 'OUT_OF_SCOPE' ||
                decision.code === 'TENANT_CONTEXT_MISSING',
              `Expected denial code for [${role}] on [${perm}], got: ${decision.code}`
            );
          }
        }
      });
    }
  });

  // --------------------------------------------------------------------------
  // 2. FUNCTIONAL ASSIGNMENTS: POSITIVE & NEGATIVE CONTRACT
  // --------------------------------------------------------------------------
  describe('Group 2 — Functional Assignments Full Matrix (Positive Grants & Negative Space)', () => {
    for (const assignmentType of STAFF_ASSIGNMENT_TYPES) {
      test(`Functional Assignment [${assignmentType}] strictly grants declared permissions and denies unentitled permissions`, () => {
        const grants = getAssignmentGrants(assignmentType);
        const grantedPerms = new Set(grants.map((g) => g.permission));

        const activeAssignment: ResolvedStaffAssignment = {
          id: `asg-${assignmentType}-contract`,
          assignmentType,
          tenantId: 'ten-school-contract',
          academicYearId: 'ay-contract-current',
          departmentId: 'dept-contract',
          sectionId: 'sec-contract',
          subjectOfferingId: 'off-contract',
          status: 'active',
          isActive: true,
          effectiveFrom: '2026-09-01',
          effectiveUntil: '2027-06-30',
        };

        // Teacher holding ONLY this specific functional assignment
        const ctx = createTestSecurityContext({
          actorId: `usr-${assignmentType}-contract`,
          baseRole: 'teacher',
          tenantId: 'ten-school-contract',
          evaluationDate: '2026-10-15',
          activeAssignments: [activeAssignment],
        });

        // Base teacher permissions (inherent)
        const baseTeacherPerms = new Set(
          getBaseRoleGrants('teacher').map((g) => g.permission)
        );

        for (const perm of CANONICAL_PERMISSIONS) {
          const isExplicitlyGranted =
            grantedPerms.has(perm) || baseTeacherPerms.has(perm);

          const target: ResourceTarget = {
            tenantId: 'ten-school-contract',
            departmentId: 'dept-contract',
            sectionId: 'sec-contract',
            subjectOfferingId: 'off-contract',
            ownerId: `usr-${assignmentType}-contract`,
            submitterId: 'other-colleague-id',
            stage: 'draft',
          };

          const decision = evaluateAuthorization(ctx, perm, target);

          if (isExplicitlyGranted) {
            assert.equal(
              decision.allowed,
              true,
              `Assignment [${assignmentType}] MUST be allowed permission [${perm}]`
            );
            assert.equal(decision.decision, 'ALLOW');
          } else {
            // Must DENY (Default Deny / Negative Space)
            assert.equal(
              decision.allowed,
              false,
              `Assignment [${assignmentType}] MUST be denied unentitled permission [${perm}]`
            );
            assert.equal(decision.decision, 'DENY');
          }
        }
      });
    }
  });

  // --------------------------------------------------------------------------
  // 3. SEPARATION OF DUTIES CONSTITUTIONAL INVARIANTS
  // --------------------------------------------------------------------------
  describe('Group 3 — Constitutional SoD Invariants across All 33 Permissions', () => {
    test('exams.results.approve is NEVER held by any teacher assignment (VP, EO, HOD, FM, ST, AT)', () => {
      for (const assignmentType of STAFF_ASSIGNMENT_TYPES) {
        const assignmentGrants = getAssignmentGrants(assignmentType);
        const hasApproval = assignmentGrants.some(
          (g) => g.permission === 'exams.results.approve'
        );
        assert.equal(
          hasApproval,
          false,
          `Constitutional Violation: Assignment [${assignmentType}] must NEVER hold exams.results.approve`
        );
      }
    });

    test('exams.results.publish is NEVER held by any teacher assignment (VP, EO, HOD, FM, ST, AT)', () => {
      for (const assignmentType of STAFF_ASSIGNMENT_TYPES) {
        const assignmentGrants = getAssignmentGrants(assignmentType);
        const hasPublish = assignmentGrants.some(
          (g) => g.permission === 'exams.results.publish'
        );
        assert.equal(
          hasPublish,
          false,
          `Constitutional Violation: Assignment [${assignmentType}] must NEVER hold exams.results.publish`
        );
      }
    });

    test('exams.results.approve and publish: among base roles, strictly held ONLY by super_admin, org_admin, school_admin; strictly denied to teacher, student, parent', () => {
      const allowedRoles: BaseRole[] = ['super_admin', 'org_admin', 'school_admin'];
      const deniedRoles: BaseRole[] = ['teacher', 'student', 'parent'];

      for (const role of allowedRoles) {
        const grants = getBaseRoleGrants(role);
        const hasApprove = grants.some((g) => g.permission === 'exams.results.approve');
        const hasPublish = grants.some((g) => g.permission === 'exams.results.publish');
        assert.equal(
          hasApprove,
          true,
          `Administrative role [${role}] MUST hold exams.results.approve`
        );
        assert.equal(
          hasPublish,
          true,
          `Administrative role [${role}] MUST hold exams.results.publish`
        );
      }

      for (const role of deniedRoles) {
        const grants = getBaseRoleGrants(role);
        const hasApprove = grants.some((g) => g.permission === 'exams.results.approve');
        const hasPublish = grants.some((g) => g.permission === 'exams.results.publish');
        assert.equal(
          hasApprove,
          false,
          `Non-administrative role [${role}] must NEVER hold exams.results.approve`
        );
        assert.equal(
          hasPublish,
          false,
          `Non-administrative role [${role}] must NEVER hold exams.results.publish`
        );
      }
    });

    test('curriculum.version.publish is held by school_admin and org_admin, NEVER by VP or HOD', () => {
      for (const assignmentType of ['vice_principal', 'hod'] as StaffAssignmentType[]) {
        const assignmentGrants = getAssignmentGrants(assignmentType);
        const hasPublish = assignmentGrants.some(
          (g) => g.permission === 'curriculum.version.publish'
        );
        assert.equal(
          hasPublish,
          false,
          `Constitutional Violation: Assignment [${assignmentType}] must NEVER hold curriculum.version.publish`
        );
      }
    });

    test('platform management permissions are NEVER granted to any role other than super_admin', () => {
      const platformPerms: CanonicalPermission[] = [
        'platform.tenants.manage',
        'platform.billing.manage',
        'platform.leads.manage',
      ];

      for (const role of BASE_ROLES) {
        if (role === 'super_admin') continue;
        const grants = getBaseRoleGrants(role);
        for (const pp of platformPerms) {
          const has = grants.some((g) => g.permission === pp);
          assert.equal(
            has,
            false,
            `Role [${role}] must NEVER hold platform permission [${pp}]`
          );
        }
      }

      for (const asg of STAFF_ASSIGNMENT_TYPES) {
        const grants = getAssignmentGrants(asg);
        for (const pp of platformPerms) {
          const has = grants.some((g) => g.permission === pp);
          assert.equal(
            has,
            false,
            `Staff assignment [${asg}] must NEVER hold platform permission [${pp}]`
          );
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // 4. PHASE 3C COHORT 1: 39-PERMISSION CANONICAL EXTENSION & DEMARCATION
  // --------------------------------------------------------------------------
  describe('Group 4 — Phase 3C Cohort 1 Catalog & Demarcation Invariants', () => {
    const PHASE_3A_PERMISSIONS: CanonicalPermission[] = [
      'admissions.applicants.view',
      'admissions.applicants.create',
      'admissions.applicants.approve',
      'students.records.view',
      'students.records.manage',
      'students.welfare.manage',
      'attendance.sessions.mark',
      'attendance.sessions.approve',
      'attendance.records.view',
      'curriculum.version.create',
      'curriculum.version.review',
      'curriculum.version.approve',
      'curriculum.version.publish',
      'curriculum.coverage.log',
      'exams.sessions.manage',
      'exams.schedules.manage',
      'exams.results.enter',
      'exams.results.moderate',
      'exams.results.approve',
      'exams.results.publish',
      'exams.results.view',
      'exams.malpractice.manage',
      'exams.appeals.submit',
      'exams.appeals.resolve',
      'exams.cass.export',
      'finance.invoices.view',
      'finance.invoices.manage',
      'finance.waivers.approve',
      'staff.directory.view',
      'staff.allocations.manage',
      'staff.accounts.manage',
      'platform.tenants.manage',
      'platform.billing.manage',
    ];

    const PHASE_3C_NEW_PERMISSIONS: CanonicalPermission[] = [
      'admissions.applicants.manage',
      'admissions.applicants.evaluate',
      'admissions.applicants.place',
      'admissions.letters.dispatch',
      'admissions.applicants.enroll',
      'curriculum.lesson_plan.generate',
    ];

    const ADR_0004_COMMUNICATIONS_PERMISSIONS: CanonicalPermission[] = [
      'notifications.self.view',
      'notifications.self.manage',
      'communications.templates.manage',
      'communications.rules.manage',
      'communications.broadcast.send',
      'communications.broadcast.view',
    ];

    const ADR_0005_LEADS_PERMISSIONS: CanonicalPermission[] = [
      'platform.leads.manage',
    ];

    test('canonical catalog contains exactly 46 permissions (33 Phase 3A + 6 Phase 3C + 6 ADR-0004 + 1 ADR-0005)', () => {
      assert.equal(
        CANONICAL_PERMISSIONS.length,
        46,
        `Expected exactly 46 canonical permissions, but found ${CANONICAL_PERMISSIONS.length}`
      );
      assert.equal(PHASE_3A_PERMISSIONS.length, 33);
      assert.equal(PHASE_3C_NEW_PERMISSIONS.length, 6);
      assert.equal(ADR_0004_COMMUNICATIONS_PERMISSIONS.length, 6);
      assert.equal(ADR_0005_LEADS_PERMISSIONS.length, 1);

      // Verify every Phase 3A permission is present
      for (const p3aPerm of PHASE_3A_PERMISSIONS) {
        assert.ok(
          CANONICAL_PERMISSIONS.includes(p3aPerm),
          `Missing frozen Phase 3A permission: ${p3aPerm}`
        );
      }

      // Verify every Phase 3C new permission is present
      for (const newPerm of PHASE_3C_NEW_PERMISSIONS) {
        assert.ok(
          CANONICAL_PERMISSIONS.includes(newPerm),
          `Missing Phase 3C permission: ${newPerm}`
        );
      }

      // Verify every ADR-0004 permission is present
      for (const commsPerm of ADR_0004_COMMUNICATIONS_PERMISSIONS) {
        assert.ok(
          CANONICAL_PERMISSIONS.includes(commsPerm),
          `Missing ADR-0004 permission: ${commsPerm}`
        );
      }

      // Verify ADR-0005 leads permission is present
      for (const leadsPerm of ADR_0005_LEADS_PERMISSIONS) {
        assert.ok(
          CANONICAL_PERMISSIONS.includes(leadsPerm),
          `Missing ADR-0005 permission: ${leadsPerm}`
        );
      }
    });

    test('admissions.applicants.manage, letters.dispatch, applicants.enroll are executive-only (held by super/org/school_admin; denied to teacher/student/parent and all staff assignments)', () => {
      const executivePerms: CanonicalPermission[] = [
        'admissions.applicants.manage',
        'admissions.letters.dispatch',
        'admissions.applicants.enroll',
      ];

      // Base roles allowed
      for (const role of ['super_admin', 'org_admin', 'school_admin'] as BaseRole[]) {
        const grants = getBaseRoleGrants(role);
        for (const perm of executivePerms) {
          assert.ok(
            grants.some((g) => g.permission === perm),
            `Administrative role [${role}] MUST hold ${perm}`
          );
        }
      }

      // Base roles denied
      for (const role of ['teacher', 'student', 'parent'] as BaseRole[]) {
        const grants = getBaseRoleGrants(role);
        for (const perm of executivePerms) {
          assert.equal(
            grants.some((g) => g.permission === perm),
            false,
            `Non-administrative role [${role}] must NEVER hold ${perm}`
          );
        }
      }

      // Staff assignments denied (CRITICAL: exam_officer must NOT receive these)
      for (const asg of STAFF_ASSIGNMENT_TYPES) {
        const grants = getAssignmentGrants(asg);
        for (const perm of executivePerms) {
          assert.equal(
            grants.some((g) => g.permission === perm),
            false,
            `Staff assignment [${asg}] must NEVER receive ${perm}`
          );
        }
      }
    });

    test('admissions.applicants.evaluate and admissions.applicants.place are held by exam_officer and executive admins; denied to other staff and unassigned roles', () => {
      const evalAndPlacePerms: CanonicalPermission[] = [
        'admissions.applicants.evaluate',
        'admissions.applicants.place',
      ];

      // Exam Officer receives both
      const eoGrants = getAssignmentGrants('exam_officer');
      for (const perm of evalAndPlacePerms) {
        assert.ok(
          eoGrants.some((g) => g.permission === perm && g.scope === 'school'),
          `exam_officer MUST hold ${perm} at school scope`
        );
      }

      // Executive admins receive both
      for (const role of ['super_admin', 'org_admin', 'school_admin'] as BaseRole[]) {
        const grants = getBaseRoleGrants(role);
        for (const perm of evalAndPlacePerms) {
          assert.ok(
            grants.some((g) => g.permission === perm),
            `Admin role [${role}] MUST hold ${perm}`
          );
        }
      }

      // Other staff assignments strictly denied
      const otherStaffAssignments: StaffAssignmentType[] = [
        'vice_principal',
        'hod',
        'form_master',
        'subject_teacher',
        'assistant_teacher',
      ];
      for (const asg of otherStaffAssignments) {
        const grants = getAssignmentGrants(asg);
        for (const perm of evalAndPlacePerms) {
          assert.equal(
            grants.some((g) => g.permission === perm),
            false,
            `Staff assignment [${asg}] must NEVER receive ${perm}`
          );
        }
      }

      // Non-admin base roles denied
      for (const role of ['teacher', 'student', 'parent'] as BaseRole[]) {
        const grants = getBaseRoleGrants(role);
        for (const perm of evalAndPlacePerms) {
          assert.equal(
            grants.some((g) => g.permission === perm),
            false,
            `Base role [${role}] must NEVER receive ${perm}`
          );
        }
      }
    });

    test('curriculum.lesson_plan.generate is held by subject_teacher (offering), hod (department), and executive admins; denied to base teacher, exam_officer, form_master, vp, student, parent', () => {
      // subject_teacher holds at offering scope
      const stGrants = getAssignmentGrants('subject_teacher');
      assert.ok(
        stGrants.some(
          (g) => g.permission === 'curriculum.lesson_plan.generate' && g.scope === 'offering'
        ),
        'subject_teacher MUST hold curriculum.lesson_plan.generate at offering scope'
      );

      // hod holds at department scope
      const hodGrants = getAssignmentGrants('hod');
      assert.ok(
        hodGrants.some(
          (g) => g.permission === 'curriculum.lesson_plan.generate' && g.scope === 'department'
        ),
        'hod MUST hold curriculum.lesson_plan.generate at department scope'
      );

      // Executive admins hold
      for (const role of ['super_admin', 'org_admin', 'school_admin'] as BaseRole[]) {
        const grants = getBaseRoleGrants(role);
        assert.ok(
          grants.some((g) => g.permission === 'curriculum.lesson_plan.generate'),
          `Admin role [${role}] MUST hold curriculum.lesson_plan.generate`
        );
      }

      // Denied staff assignments
      const deniedAssignments: StaffAssignmentType[] = [
        'exam_officer',
        'vice_principal',
        'form_master',
        'assistant_teacher',
      ];
      for (const asg of deniedAssignments) {
        const grants = getAssignmentGrants(asg);
        assert.equal(
          grants.some((g) => g.permission === 'curriculum.lesson_plan.generate'),
          false,
          `Staff assignment [${asg}] must NEVER receive curriculum.lesson_plan.generate`
        );
      }

      // Denied base roles
      for (const role of ['teacher', 'student', 'parent'] as BaseRole[]) {
        const grants = getBaseRoleGrants(role);
        assert.equal(
          grants.some((g) => g.permission === 'curriculum.lesson_plan.generate'),
          false,
          `Base role [${role}] must NEVER receive curriculum.lesson_plan.generate`
        );
      }
    });

    test('ADR-0005: platform.leads.manage is strictly platform-scoped, granted ONLY to super_admin, and denied to all other base roles and staff assignments', () => {
      const def = getPermissionDefinition('platform.leads.manage');
      assert.equal(def.key, 'platform.leads.manage');
      assert.equal(def.canonicalScope, 'platform');
      assert.deepEqual(def.allowedScopes, ['platform']);

      // super_admin holds it
      const superGrants = getBaseRoleGrants('super_admin');
      assert.ok(
        superGrants.some((g) => g.permission === 'platform.leads.manage' && g.scope === 'platform'),
        'super_admin MUST hold platform.leads.manage at platform scope'
      );

      // All other base roles denied
      for (const role of BASE_ROLES) {
        if (role === 'super_admin') continue;
        const grants = getBaseRoleGrants(role);
        assert.equal(
          grants.some((g) => g.permission === 'platform.leads.manage'),
          false,
          `Base role [${role}] must NEVER hold platform.leads.manage`
        );
      }

      // All staff assignments denied
      for (const asg of STAFF_ASSIGNMENT_TYPES) {
        const grants = getAssignmentGrants(asg);
        assert.equal(
          grants.some((g) => g.permission === 'platform.leads.manage'),
          false,
          `Staff assignment [${asg}] must NEVER hold platform.leads.manage`
        );
      }
    });
  });
});

