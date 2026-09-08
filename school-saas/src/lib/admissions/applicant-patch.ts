import { NextResponse } from 'next/server';
import { apiError } from '@/lib/auth/api-guard';

export const IMMUTABLE_FIELDS = new Set(['id', 'tenant_id', 'tenantId', 'tenantSlug']);

export const LIFECYCLE_COMMAND_FIELDS = new Set([
  'stage',
  'status',
  'targetStream',
  'target_stream',
  'stream',
  'interviewScore',
  'interview_score',
  'assessmentScore',
  'assessment_score',
  'docsVerified',
  'docs_verified',
  'admissionLetterSent',
  'admission_letter_sent',
  'admissionLetterSentAt',
  'admission_letter_sent_at',
  'streamAutoPlaced',
  'stream_auto_placed',
  'streamPlacedAt',
  'stream_placed_at',
  'streamPlacedBy',
  'stream_placed_by',
  'rejectionReason',
  'rejection_reason',
  'enrollmentDate',
  'enrollment_date',
  'studentId',
  'student_id',
]);

export const ALLOWED_DEMOGRAPHIC_PATCH_FIELDS: Record<string, string> = {
  firstName: 'first_name',
  first_name: 'first_name',
  lastName: 'last_name',
  last_name: 'last_name',
  dob: 'dob',
  gender: 'gender',
  bloodGroup: 'blood_group',
  blood_group: 'blood_group',
  nin: 'nin',
  email: 'email',
  phone: 'phone',
  address: 'address',
  city: 'city',
  parentName: 'parent_name',
  parent_name: 'parent_name',
  parentPhone: 'parent_phone',
  parent_phone: 'parent_phone',
  parentEmail: 'parent_email',
  parent_email: 'parent_email',
  parentRelation: 'parent_relation',
  parent_relation: 'parent_relation',
  previousSchool: 'previous_school',
  previous_school: 'previous_school',
  targetGrade: 'target_grade',
  target_grade: 'target_grade',
  nationalIndexNo: 'national_index_no',
  national_index_no: 'national_index_no',
};

/**
 * Validates untrusted patch updates against the demographic allowlist,
 * rejecting immutable identifiers and lifecycle fields with explicit HTTP 400 responses.
 */
export function validateAndBuildDemographicUpdates(
  updates: Record<string, unknown>
): { ok: true; dbFields: Record<string, unknown> } | { ok: false; response: NextResponse } {
  // 1. Check immutable fields
  for (const field of IMMUTABLE_FIELDS) {
    if (field in updates) {
      return {
        ok: false,
        response: apiError(`Cannot modify immutable field: ${field}`, 'INVALID_REQUEST', 400),
      };
    }
  }

  // 2. Reject lifecycle/command fields
  for (const field of LIFECYCLE_COMMAND_FIELDS) {
    if (field in updates) {
      return {
        ok: false,
        response: apiError(
          `Mutation of lifecycle field '${field}' is prohibited on PATCH. Use dedicated command endpoints.`,
          'INVALID_REQUEST',
          400
        ),
      };
    }
  }

  // 3. Validate against allowlist
  const dbFields: Record<string, unknown> = {};
  const entries = Object.entries(updates);

  if (entries.length === 0) {
    return {
      ok: false,
      response: apiError('No valid update fields provided', 'INVALID_REQUEST', 400),
    };
  }

  for (const [key, value] of entries) {
    const dbColumn = ALLOWED_DEMOGRAPHIC_PATCH_FIELDS[key];
    if (!dbColumn) {
      return {
        ok: false,
        response: apiError(`Unsupported applicant field: ${key}`, 'INVALID_REQUEST', 400),
      };
    }
    dbFields[dbColumn] = value;
  }

  dbFields['updated_at'] = new Date().toISOString();

  return { ok: true, dbFields };
}
