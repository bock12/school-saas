import { SupabaseClient } from '@supabase/supabase-js';
import { ResourceTarget } from './authorization-engine';

/**
 * Unique symbol brand preventing unverified dictionaries from satisfying
 * the TrustedResourceTarget type at compile time and runtime.
 */
export const TRUSTED_TARGET_BRAND = Symbol('TrustedResourceTarget');

export type TrustedResourceTarget = ResourceTarget & {
  readonly [TRUSTED_TARGET_BRAND]: true;
  readonly applicantId?: string;
  readonly status?: string;
};

/**
 * Runtime type guard verifying that a resource target was constructed
 * by an authoritative server-side resource resolver.
 */
export function isTrustedResourceTarget(target: unknown): target is TrustedResourceTarget {
  return (
    typeof target === 'object' &&
    target !== null &&
    (target as Record<symbol, unknown>)[TRUSTED_TARGET_BRAND] === true
  );
}

// ---------------------------------------------------------------------------
// Security Errors for Resource Resolution
// ---------------------------------------------------------------------------

export class ResourceNotFoundError extends Error {
  public readonly code = 'NOT_FOUND';
  public readonly statusCode = 404;
  constructor(resourceType: string, identifier: string) {
    super(`Resource of type '${resourceType}' with identifier '${identifier}' was not found.`);
    this.name = 'ResourceNotFoundError';
  }
}

export class CrossTenantResourceMismatchError extends Error {
  public readonly code = 'CROSS_TENANT_DENIED';
  public readonly statusCode = 403;
  constructor() {
    super('Access denied: Resource does not belong to authorized tenant boundary.');
    this.name = 'CrossTenantResourceMismatchError';
  }
}

export class ResourceResolutionError extends Error {
  public readonly code = 'INVALID_REQUEST';
  public readonly statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ResourceResolutionError';
  }
}

// ---------------------------------------------------------------------------
// Internal Fact Construction Factory
// ---------------------------------------------------------------------------

function createTrustedTarget(target: ResourceTarget & Record<string, unknown>): TrustedResourceTarget {
  return Object.freeze({
    ...target,
    [TRUSTED_TARGET_BRAND]: true as const,
  });
}

// ---------------------------------------------------------------------------
// Authoritative Fact Resolvers
// ---------------------------------------------------------------------------

/**
 * Resolves authoritative tenant facts from public.tenants given an untrusted identifier or slug.
 * Resolver reports database truth; authorization engine evaluates access.
 */
export async function resolveTrustedTenantTarget(
  supabase: SupabaseClient,
  untrustedIdentifierOrSlug: string
): Promise<TrustedResourceTarget> {
  if (!untrustedIdentifierOrSlug || typeof untrustedIdentifierOrSlug !== 'string') {
    throw new ResourceResolutionError('Tenant identifier must be a non-empty string.');
  }

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('id, parent_id, type')
    .or(`id.eq.${untrustedIdentifierOrSlug},slug.eq.${untrustedIdentifierOrSlug}`)
    .maybeSingle();

  if (error) {
    throw new ResourceResolutionError(`Database error resolving tenant: ${error.message}`);
  }

  if (!tenant) {
    throw new ResourceNotFoundError('tenant', untrustedIdentifierOrSlug);
  }

  return createTrustedTarget({
    tenantId: tenant.id,
    organizationId: tenant.parent_id || undefined,
  });
}

/**
 * Resolves authoritative exam session facts from public.exam_sessions.
 * Does NOT perform role checks or cross-tenant rejection; reports database facts.
 */
export async function resolveTrustedExamSessionTarget(
  supabase: SupabaseClient,
  examSessionId: string
): Promise<TrustedResourceTarget> {
  if (!examSessionId || typeof examSessionId !== 'string') {
    throw new ResourceResolutionError('Exam session ID must be a non-empty string.');
  }

  const { data: session, error } = await supabase
    .from('exam_sessions')
    .select('id, tenant_id, academic_year_id, status')
    .eq('id', examSessionId)
    .maybeSingle();

  if (error) {
    throw new ResourceResolutionError(`Database error resolving exam session: ${error.message}`);
  }

  if (!session) {
    throw new ResourceNotFoundError('exam_session', examSessionId);
  }

  return createTrustedTarget({
    tenantId: session.tenant_id,
    stage: session.status || undefined,
  });
}

/**
 * Resolves authoritative approval request facts from public.approval_requests.
 * Populates submitterId and stage for Separation of Duties (SoD) evaluation.
 */
export async function resolveTrustedExamApprovalTarget(
  supabase: SupabaseClient,
  approvalRequestId: string
): Promise<TrustedResourceTarget> {
  if (!approvalRequestId || typeof approvalRequestId !== 'string') {
    throw new ResourceResolutionError('Approval request ID must be a non-empty string.');
  }

  const { data: approval, error } = await supabase
    .from('approval_requests')
    .select('id, tenant_id, requested_by, status')
    .eq('id', approvalRequestId)
    .maybeSingle();

  if (error) {
    throw new ResourceResolutionError(`Database error resolving approval request: ${error.message}`);
  }

  if (!approval) {
    throw new ResourceNotFoundError('approval_request', approvalRequestId);
  }

  return createTrustedTarget({
    tenantId: approval.tenant_id,
    submitterId: approval.requested_by || undefined,
    stage: approval.status || undefined,
  });
}

/**
 * Resolves authoritative subject offering facts from public.subject_offerings.
 * Populates departmental and section structural scopes.
 */
export async function resolveTrustedSubjectOfferingTarget(
  supabase: SupabaseClient,
  subjectOfferingId: string
): Promise<TrustedResourceTarget> {
  if (!subjectOfferingId || typeof subjectOfferingId !== 'string') {
    throw new ResourceResolutionError('Subject offering ID must be a non-empty string.');
  }

  const { data: offering, error } = await supabase
    .from('subject_offerings')
    .select('id, tenant_id, department_id, section_id')
    .eq('id', subjectOfferingId)
    .maybeSingle();

  if (error) {
    throw new ResourceResolutionError(`Database error resolving subject offering: ${error.message}`);
  }

  if (!offering) {
    throw new ResourceNotFoundError('subject_offering', subjectOfferingId);
  }

  return createTrustedTarget({
    tenantId: offering.tenant_id,
    departmentId: offering.department_id || undefined,
    sectionId: offering.section_id || undefined,
    subjectOfferingId: offering.id,
  });
}

/**
 * Resolves authoritative applicant facts from public.applicants.
 * Does NOT perform authorization or lifecycle validation; reports database truth.
 */
export async function resolveTrustedApplicantTarget(
  supabase: SupabaseClient,
  applicantId: string
): Promise<TrustedResourceTarget> {
  if (!applicantId || typeof applicantId !== 'string') {
    throw new ResourceResolutionError('Applicant ID must be a non-empty string.');
  }

  const { data: applicant, error } = await supabase
    .from('applicants')
    .select('id, tenant_id, stage, status')
    .eq('id', applicantId)
    .maybeSingle();

  if (error) {
    throw new ResourceResolutionError(`Database error resolving applicant: ${error.message}`);
  }

  if (!applicant) {
    throw new ResourceNotFoundError('applicant', applicantId);
  }

  return createTrustedTarget({
    tenantId: applicant.tenant_id,
    stage: applicant.stage || undefined,
    applicantId: applicant.id,
    status: applicant.status || undefined,
  });
}

export type SupportedResourceType =
  | 'tenant'
  | 'exam_session'
  | 'exam_approval'
  | 'subject_offering'
  | 'applicant';

/**
 * Unified dispatcher to resolve an authoritative TrustedResourceTarget
 * given an untrusted type and identifier.
 */
export async function resolveTrustedResourceTarget(
  supabase: SupabaseClient,
  request: { type: SupportedResourceType; id: string }
): Promise<TrustedResourceTarget> {
  switch (request.type) {
    case 'tenant':
      return resolveTrustedTenantTarget(supabase, request.id);
    case 'exam_session':
      return resolveTrustedExamSessionTarget(supabase, request.id);
    case 'exam_approval':
      return resolveTrustedExamApprovalTarget(supabase, request.id);
    case 'subject_offering':
      return resolveTrustedSubjectOfferingTarget(supabase, request.id);
    case 'applicant':
      return resolveTrustedApplicantTarget(supabase, request.id);
    default:
      throw new ResourceResolutionError(`Unsupported resource type: ${(request as any).type}`);
  }
}

