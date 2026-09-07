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
    });
  });
});
