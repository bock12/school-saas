/**
 * ============================================================================
 * CANONICAL AUTHORIZATION ENGINE
 * Architecture: TASK-0007 Phase 3A — Canonical Authorization Engine
 * Single Authoritative Server-Side Decision Evaluator & Enforcement Core
 * ============================================================================
 */

import {
  type BaseRole,
  type CanonicalPermission,
  type CanonicalScope,
  type StaffAssignmentType,
  getBaseRoleGrants,
  getAssignmentGrants,
  isCanonicalPermission,
  getPermissionDefinition,
} from './permissions-registry';

// ----------------------------------------------------------------------------
// 1. DATA CONTRACTS & INTERFACES
// ----------------------------------------------------------------------------

export type AuthorizationDecisionResult = 'ALLOW' | 'DENY';

export type AuthorizationDenialCode =
  | 'UNAUTHENTICATED'
  | 'ACCOUNT_INACTIVE'
  | 'UNKNOWN_PERMISSION'
  | 'TENANT_CONTEXT_MISSING'
  | 'CROSS_TENANT_DENIED'
  | 'PERMISSION_NOT_GRANTED'
  | 'ASSIGNMENT_INACTIVE'
  | 'ASSIGNMENT_NOT_YET_EFFECTIVE'
  | 'ASSIGNMENT_EXPIRED'
  | 'ASSIGNMENT_REVOKED'
  | 'ASSIGNMENT_SUSPENDED'
  | 'OUT_OF_SCOPE'
  | 'SELF_SCOPE_MISMATCH'
  | 'SOD_SELF_MODERATION_BLOCKED'
  | 'SOD_SELF_APPROVAL_BLOCKED'
  | 'SOD_STAGE_RESTRICTION';

export interface AuthorizationDecision {
  readonly allowed: boolean;
  readonly decision: AuthorizationDecisionResult;
  readonly code: AuthorizationDenialCode | 'AUTHORIZED';
  readonly safeMessage: string;
  readonly diagnostics?: {
    readonly actorId?: string;
    readonly tenantId?: string | null;
    readonly requestedPermission: string;
    readonly evaluatedScope?: CanonicalScope;
    readonly reasonDetails?: string;
  };
}

/**
 * Branded, opaque security context representing server-verified identity,
 * tenant membership, base role, active staff assignments, and relations.
 * Guardrail 5: Constructed strictly by server-side resolver or test fixtures.
 */
export interface TrustedSecurityContext {
  readonly _brand: 'TrustedSecurityContext';
  readonly actorId: string;
  readonly tenantId: string | null;
  readonly baseRole: BaseRole;
  readonly isActive: boolean;
  readonly isSuperAdmin: boolean;
  /** Server-resolved child school tenant IDs for org_admin (via get_org_subtenant_ids) */
  readonly organizationSubtenantIds: readonly string[];
  /** Authoritative staff assignments for the current academic year */
  readonly activeAssignments: readonly ResolvedStaffAssignment[];
  /** Verified child student IDs for parents (via parent_students) */
  readonly verifiedChildStudentIds: readonly string[];
  /** Evaluation date in YYYY-MM-DD format */
  readonly evaluationDate: string;
}

export interface ResolvedStaffAssignment {
  readonly id: string;
  readonly assignmentType: StaffAssignmentType;
  readonly tenantId: string;
  readonly academicYearId: string;
  readonly departmentId?: string | null;
  readonly sectionId?: string | null;
  readonly subjectOfferingId?: string | null;
  readonly status: 'active' | 'expired' | 'revoked' | 'suspended';
  readonly isActive: boolean;
  readonly effectiveFrom: string; // YYYY-MM-DD
  readonly effectiveUntil?: string | null; // YYYY-MM-DD
}

/**
 * Target resource specifier.
 * Callers provide entity identifiers; the engine validates scope containment and SoD.
 */
export interface ResourceTarget {
  readonly tenantId: string;
  readonly organizationId?: string | null;
  readonly departmentId?: string | null;
  readonly sectionId?: string | null;
  readonly classId?: string | null; // Alias for sectionId
  readonly subjectOfferingId?: string | null;
  readonly offeringId?: string | null; // Alias for subjectOfferingId
  readonly ownerId?: string | null; // For self/parent-child checks
  readonly submitterId?: string | null; // For SoD checks (mark entry vs moderation/approval)
  readonly stage?: string | null; // e.g. 'draft', 'submitted', 'moderated', 'approved'
}

/**
 * Represents a single evaluated entitlement grant.
 * Guardrail 3: Retains grant origin to distinguish base role vs functional assignment.
 */
export interface EvaluatedGrant {
  readonly sourceType: 'base_role' | 'functional_assignment';
  readonly sourceId?: string; // assignment UUID if functional assignment
  readonly assignmentType?: StaffAssignmentType;
  readonly permission: CanonicalPermission;
  readonly scope: CanonicalScope;
  readonly tenantId?: string | null;
  readonly departmentId?: string | null;
  readonly sectionId?: string | null;
  readonly subjectOfferingId?: string | null;
  readonly stageConstraint?: 'draft';
}

// ----------------------------------------------------------------------------
// 2. AUTHORIZATION ERROR
// ----------------------------------------------------------------------------

export class AuthorizationError extends Error {
  public readonly decision: AuthorizationDecision;
  public readonly code: AuthorizationDenialCode;
  public readonly safeMessage: string;

  constructor(decision: AuthorizationDecision) {
    super(decision.safeMessage);
    this.name = 'AuthorizationError';
    this.decision = decision;
    this.code = decision.code as AuthorizationDenialCode;
    this.safeMessage = decision.safeMessage;
  }
}

// ----------------------------------------------------------------------------
// 3. PURE DETERMINISTIC EVALUATOR (Zero Supabase/DB dependencies)
// ----------------------------------------------------------------------------

/**
 * Evaluates authorization for an actor against a permission and target resource.
 * Pure function: deterministic, side-effect free, and offline-testable.
 */
export function evaluateAuthorization(
  context: TrustedSecurityContext,
  permission: string,
  target?: ResourceTarget
): AuthorizationDecision {
  // ── Step 1: Authentication Check ──────────────────────────────────────────
  if (!context || !context.actorId || context.actorId.trim() === '') {
    return {
      allowed: false,
      decision: 'DENY',
      code: 'UNAUTHENTICATED',
      safeMessage: 'Authentication required',
      diagnostics: { requestedPermission: permission, reasonDetails: 'Missing or empty actorId' },
    };
  }

  // ── Step 2: Account Active Check ──────────────────────────────────────────
  if (!context.isActive) {
    return {
      allowed: false,
      decision: 'DENY',
      code: 'ACCOUNT_INACTIVE',
      safeMessage: 'User account is deactivated',
      diagnostics: {
        actorId: context.actorId,
        requestedPermission: permission,
        reasonDetails: 'profiles.is_active is false',
      },
    };
  }

  // ── Step 3: Canonical Permission Registry Check ───────────────────────────
  if (!isCanonicalPermission(permission)) {
    return {
      allowed: false,
      decision: 'DENY',
      code: 'UNKNOWN_PERMISSION',
      safeMessage: 'Requested permission does not exist',
      diagnostics: {
        actorId: context.actorId,
        requestedPermission: permission,
        reasonDetails: 'Permission key not recognized in canonical registry',
      },
    };
  }

  const permDef = getPermissionDefinition(permission);

  // ── Step 4: Tenant Boundary & Platform Scope Check ────────────────────────
  const isPlatformPermission = permDef.canonicalScope === 'platform';

  if (isPlatformPermission) {
    // Only super_admin may exercise platform-scoped permissions
    if (!context.isSuperAdmin && context.baseRole !== 'super_admin') {
      return {
        allowed: false,
        decision: 'DENY',
        code: 'PERMISSION_NOT_GRANTED',
        safeMessage: 'Platform administrator authority required',
        diagnostics: {
          actorId: context.actorId,
          requestedPermission: permission,
          reasonDetails: 'Non-super-admin attempted platform-scoped permission',
        },
      };
    }
  } else {
    // Non-platform permissions strictly require tenant context on resource
    if (!target || !target.tenantId || target.tenantId.trim() === '') {
      return {
        allowed: false,
        decision: 'DENY',
        code: 'TENANT_CONTEXT_MISSING',
        safeMessage: 'Target tenant context is required',
        diagnostics: {
          actorId: context.actorId,
          requestedPermission: permission,
          reasonDetails: 'Resource target missing tenantId',
        },
      };
    }

    // Verify actor tenant boundary
    if (!context.isSuperAdmin && context.baseRole !== 'super_admin') {
      if (!context.tenantId) {
        return {
          allowed: false,
          decision: 'DENY',
          code: 'TENANT_CONTEXT_MISSING',
          safeMessage: 'Actor has no associated tenant',
          diagnostics: {
            actorId: context.actorId,
            requestedPermission: permission,
            reasonDetails: 'Actor profile missing tenant_id',
          },
        };
      }

      const isSameTenant = context.tenantId === target.tenantId;
      const isOrgAdminReachingChild =
        context.baseRole === 'org_admin' &&
        (context.organizationSubtenantIds.includes(target.tenantId) ||
          target.organizationId === context.tenantId);

      if (!isSameTenant && !isOrgAdminReachingChild) {
        return {
          allowed: false,
          decision: 'DENY',
          code: 'CROSS_TENANT_DENIED',
          safeMessage: 'Cross-tenant access denied',
          diagnostics: {
            actorId: context.actorId,
            tenantId: context.tenantId,
            requestedPermission: permission,
            reasonDetails: `Target tenant ${target.tenantId} outside actor boundary`,
          },
        };
      }
    }
  }

  // ── Step 5: Collect Active Grants (Base Role + Active Assignments) ─────────
  const grants: EvaluatedGrant[] = [];

  // 5A. Base Role Grants
  const baseGrants = getBaseRoleGrants(context.baseRole);
  for (const bg of baseGrants) {
    if (bg.permission === permission) {
      grants.push({
        sourceType: 'base_role',
        permission: bg.permission,
        scope: bg.scope,
        tenantId: context.tenantId,
      });
    }
  }

  // 5B. Functional Assignment Grants (evaluated against lifecycle & temporal validity)
  const evalDate = context.evaluationDate || new Date().toISOString().slice(0, 10);

  for (const assignment of context.activeAssignments) {
    // Tenant matching on assignment
    if (!context.isSuperAdmin && target && assignment.tenantId !== target.tenantId) {
      continue;
    }

    // Lifecycle status checks
    if (assignment.status === 'revoked') continue;
    if (assignment.status === 'suspended') continue;
    if (assignment.status === 'expired') continue;
    if (assignment.status !== 'active' || !assignment.isActive) continue;

    // Temporal effective date checks
    if (assignment.effectiveFrom > evalDate) continue; // Future-dated assignment fails closed
    if (assignment.effectiveUntil && assignment.effectiveUntil < evalDate) continue; // Expired

    // Additive functional assignment permissions
    const faGrants = getAssignmentGrants(assignment.assignmentType);
    for (const fag of faGrants) {
      if (fag.permission === permission) {
        grants.push({
          sourceType: 'functional_assignment',
          sourceId: assignment.id,
          assignmentType: assignment.assignmentType,
          permission: fag.permission,
          scope: fag.scope,
          tenantId: assignment.tenantId,
          departmentId: assignment.departmentId,
          sectionId: assignment.sectionId,
          subjectOfferingId: assignment.subjectOfferingId,
          stageConstraint: fag.stageConstraint,
        });
      }
    }
  }

  if (grants.length === 0) {
    return {
      allowed: false,
      decision: 'DENY',
      code: 'PERMISSION_NOT_GRANTED',
      safeMessage: 'Insufficient permissions for this operation',
      diagnostics: {
        actorId: context.actorId,
        requestedPermission: permission,
        reasonDetails: `Actor holds no active grant for permission ${permission}`,
      },
    };
  }

  // If platform permission and actor is super_admin, allowed immediately
  if (isPlatformPermission && (context.isSuperAdmin || context.baseRole === 'super_admin')) {
    return {
      allowed: true,
      decision: 'ALLOW',
      code: 'AUTHORIZED',
      safeMessage: 'Authorized',
    };
  }

  // ── Step 6: Resource Scope Containment Evaluation ─────────────────────────
  if (!target) {
    return {
      allowed: false,
      decision: 'DENY',
      code: 'OUT_OF_SCOPE',
      safeMessage: 'Target resource specification required for scope evaluation',
      diagnostics: { requestedPermission: permission, reasonDetails: 'Missing target' },
    };
  }

  const effectiveOfferingId = target.subjectOfferingId || target.offeringId;
  const effectiveSectionId = target.sectionId || target.classId;

  // Filter grants that structurally cover the target resource
  const coveringGrants = grants.filter((grant) => {
    // Validate that grant's scope is among permission's authoritative allowedScopes (Guardrail 1)
    if (!permDef.allowedScopes.includes(grant.scope)) {
      return false;
    }

    if (grant.scope === 'platform') {
      return true;
    }

    if (grant.scope === 'organization') {
      return (
        context.tenantId === target.tenantId ||
        context.organizationSubtenantIds.includes(target.tenantId) ||
        target.organizationId === context.tenantId
      );
    }

    if (grant.scope === 'school') {
      // School-level grant covers everything within that school tenant
      if (context.isSuperAdmin) return true;
      if (context.baseRole === 'org_admin') {
        return (
          context.tenantId === target.tenantId ||
          context.organizationSubtenantIds.includes(target.tenantId)
        );
      }
      return grant.tenantId === target.tenantId;
    }

    if (grant.scope === 'department') {
      if (!target.departmentId || !grant.departmentId) return false;
      return grant.tenantId === target.tenantId && grant.departmentId === target.departmentId;
    }

    if (grant.scope === 'class') {
      if (!effectiveSectionId || !grant.sectionId) return false;
      return grant.tenantId === target.tenantId && grant.sectionId === effectiveSectionId;
    }

    if (grant.scope === 'offering') {
      if (!effectiveOfferingId || !grant.subjectOfferingId) return false;
      return (
        grant.tenantId === target.tenantId && grant.subjectOfferingId === effectiveOfferingId
      );
    }

    if (grant.scope === 'self') {
      if (!target.ownerId) return false;
      if (context.baseRole === 'student') {
        return target.ownerId === context.actorId;
      }
      if (context.baseRole === 'parent') {
        // Parent access strictly requires verified child relationship (Guardrail 5)
        return context.verifiedChildStudentIds.includes(target.ownerId);
      }
      return target.ownerId === context.actorId;
    }

    return false;
  });

  if (coveringGrants.length === 0) {
    const isSelfPermission = permDef.allowedScopes.includes('self') && !target.ownerId;
    return {
      allowed: false,
      decision: 'DENY',
      code: isSelfPermission ? 'SELF_SCOPE_MISMATCH' : 'OUT_OF_SCOPE',
      safeMessage: 'Resource is outside of authorized operational scope',
      diagnostics: {
        actorId: context.actorId,
        requestedPermission: permission,
        reasonDetails: 'No active grant covers the requested target resource scope',
      },
    };
  }

  // ── Step 7: Separation of Duties (SoD) & Workflow Constraints ─────────────
  // 7A. Self-Moderation Prohibition: Actor cannot moderate their own score entries
  if (permission === 'exams.results.moderate') {
    if (target.submitterId && target.submitterId === context.actorId) {
      return {
        allowed: false,
        decision: 'DENY',
        code: 'SOD_SELF_MODERATION_BLOCKED',
        safeMessage: 'Separation of duties: Actors cannot moderate results they entered',
        diagnostics: {
          actorId: context.actorId,
          requestedPermission: permission,
          reasonDetails: `actorId ${context.actorId} equals submitterId ${target.submitterId}`,
        },
      };
    }
  }

  // 7B. Self-Approval Prohibition: Actor cannot approve results they submitted
  if (permission === 'exams.results.approve') {
    if (target.submitterId && target.submitterId === context.actorId) {
      return {
        allowed: false,
        decision: 'DENY',
        code: 'SOD_SELF_APPROVAL_BLOCKED',
        safeMessage: 'Separation of duties: Actors cannot approve results they entered',
        diagnostics: {
          actorId: context.actorId,
          requestedPermission: permission,
          reasonDetails: `actorId ${context.actorId} equals submitterId ${target.submitterId}`,
        },
      };
    }
  }

  // 7C. Assistant Teacher Stage Restriction:
  // If the ONLY covering grant is assistant_teacher, restricted to draft stage only
  const hasFullEntryGrant = coveringGrants.some(
    (g) => g.assignmentType !== 'assistant_teacher' && !g.stageConstraint
  );
  if (!hasFullEntryGrant && permission === 'exams.results.enter') {
    const isDraft = target.stage === 'draft';
    if (!isDraft) {
      return {
        allowed: false,
        decision: 'DENY',
        code: 'SOD_STAGE_RESTRICTION',
        safeMessage: 'Assistant teachers may only enter examination results in draft stage',
        diagnostics: {
          actorId: context.actorId,
          requestedPermission: permission,
          reasonDetails: `Target stage '${target.stage}' is not 'draft'`,
        },
      };
    }
  }

  // ── Step 8: Authorization Granted ─────────────────────────────────────────
  return {
    allowed: true,
    decision: 'ALLOW',
    code: 'AUTHORIZED',
    safeMessage: 'Authorized',
    diagnostics: {
      actorId: context.actorId,
      requestedPermission: permission,
      evaluatedScope: coveringGrants[0]?.scope,
    },
  };
}

// ----------------------------------------------------------------------------
// 4. CANONICAL ENFORCEMENT & HELPER API (Section 8 Compliance)
// ----------------------------------------------------------------------------

/**
 * Authoritative enforcement operation.
 * Evaluates authorization; throws AuthorizationError if denied.
 */
export function authorize(
  context: TrustedSecurityContext,
  permission: string,
  target?: ResourceTarget
): AuthorizationDecision {
  const decision = evaluateAuthorization(context, permission, target);
  if (!decision.allowed) {
    throw new AuthorizationError(decision);
  }
  return decision;
}

/**
 * Non-throwing boolean decision helper.
 * Returns true if allowed, false if denied.
 */
export function can(
  context: TrustedSecurityContext,
  permission: string,
  target?: ResourceTarget
): boolean {
  return evaluateAuthorization(context, permission, target).allowed;
}

/**
 * Non-authoritative abstract capability check (Guardrail 8).
 * Checks if the actor holds the permission in the abstract (e.g. for UI menus).
 * WARNING: NEVER use hasCapability() to authorize access to specific resources!
 */
export function hasCapability(
  context: TrustedSecurityContext,
  permission: string
): boolean {
  if (!context || !context.actorId || !context.isActive) return false;
  if (!isCanonicalPermission(permission)) return false;

  // Platform permission check
  const permDef = getPermissionDefinition(permission);
  if (permDef.canonicalScope === 'platform') {
    return context.isSuperAdmin || context.baseRole === 'super_admin';
  }

  // Check base role
  const baseGrants = getBaseRoleGrants(context.baseRole);
  if (baseGrants.some((g) => g.permission === permission)) {
    return true;
  }

  // Check active assignments
  const evalDate = context.evaluationDate || new Date().toISOString().slice(0, 10);
  for (const assignment of context.activeAssignments) {
    if (assignment.status !== 'active' || !assignment.isActive) continue;
    if (assignment.effectiveFrom > evalDate) continue;
    if (assignment.effectiveUntil && assignment.effectiveUntil < evalDate) continue;

    const faGrants = getAssignmentGrants(assignment.assignmentType);
    if (faGrants.some((g) => g.permission === permission)) {
      return true;
    }
  }

  return false;
}

// ----------------------------------------------------------------------------
// 5. TEST CONTEXT BUILDER (For Offline / Contract Testing Only)
// ----------------------------------------------------------------------------

export interface TestContextOptions {
  actorId?: string;
  tenantId?: string | null;
  baseRole?: BaseRole;
  isActive?: boolean;
  isSuperAdmin?: boolean;
  organizationSubtenantIds?: string[];
  activeAssignments?: ResolvedStaffAssignment[];
  verifiedChildStudentIds?: string[];
  evaluationDate?: string;
}

/**
 * Factory for creating test fixture contexts in unit and contract tests.
 * Only used in test files.
 */
export function createTestSecurityContext(
  options: TestContextOptions = {}
): TrustedSecurityContext {
  const {
    actorId = 'usr-test-default',
    tenantId = 'ten-school-1',
    baseRole = 'teacher',
    isActive = true,
    isSuperAdmin = baseRole === 'super_admin',
    organizationSubtenantIds = [],
    activeAssignments = [],
    verifiedChildStudentIds = [],
    evaluationDate = new Date().toISOString().slice(0, 10),
  } = options;

  return {
    _brand: 'TrustedSecurityContext',
    actorId,
    tenantId,
    baseRole,
    isActive,
    isSuperAdmin,
    organizationSubtenantIds,
    activeAssignments,
    verifiedChildStudentIds,
    evaluationDate,
  };
}
