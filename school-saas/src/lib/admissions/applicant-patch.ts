import { NextResponse } from 'next/server';
import { apiError } from '@/lib/auth/api-guard';

// 1. Immutable System Identifiers (Strictly prohibited from any mutation)
export const IMMUTABLE_FIELDS = new Set(['id', 'tenant_id', 'tenantId', 'tenantSlug']);

// 2. Workflow, Lifecycle, Streaming & Exam Evaluation Fields
// (Prohibited on PATCH. Must be executed via dedicated, privileged command endpoints)
export const WORKFLOW_COMMAND_FIELDS = new Set([
  // Core lifecycle & status
  'stage',
  'status',
  'rejectionReason',
  'rejection_reason',
  // SSS Stream allocation workflow
  'targetStream',
  'target_stream',
  'stream',
  'streamAutoPlaced',
  'stream_auto_placed',
  'streamPlacedAt',
  'stream_placed_at',
  'streamPlacedBy',
  'stream_placed_by',
  // Entrance assessment & interview evaluation
  'interviewScore',
  'interview_score',
  'assessmentScore',
  'assessment_score',
  'assessmentDetails',
  'assessment_details',
  // Sierra Leone national examination credentials (NPSE, BECE, WASSCE)
  'npseAggregate',
  'npse_aggregate',
  'beceAggregate',
  'bece_aggregate',
  'beceSubjects',
  'bece_subjects',
  'wassceCredits',
  'wassce_credits',
  'wassceSubjects',
  'wassce_subjects',
  // Document verification & official letters
  'docsVerified',
  'docs_verified',
  'admissionLetterSent',
  'admission_letter_sent',
  'admissionLetterSentAt',
  'admission_letter_sent_at',
  // Matriculation & registry enrollment
  'enrollmentDate',
  'enrollment_date',
  'studentId',
  'student_id',
  'studentIdNumber',
  'student_id_number',
  'classArm',
  'class_arm',
]);

// Backwards-compatible alias for existing imports
export const LIFECYCLE_COMMAND_FIELDS = WORKFLOW_COMMAND_FIELDS;

// 3A. Record Maintenance Fields (Demographic, contact & guardian data)
export const RECORD_MAINTENANCE_FIELDS: Record<string, string> = {
  firstName: 'first_name',
  first_name: 'first_name',
  lastName: 'last_name',
  last_name: 'last_name',
  dob: 'dob',
  gender: 'gender',
  bloodGroup: 'blood_group',
  blood_group: 'blood_group',
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
};

// 3B. Official / National Identity Data
// (Civil identity and official WAEC exam candidate index numbers.
// Allowed on PATCH for typo/record corrections, but distinguished from routine demographics)
export const NATIONAL_IDENTITY_FIELDS: Record<string, string> = {
  nin: 'nin',
  nationalIndexNo: 'national_index_no',
  national_index_no: 'national_index_no',
};

// Complete allowlist permitted on demographic PATCH
export const ALLOWED_DEMOGRAPHIC_PATCH_FIELDS: Record<string, string> = {
  ...RECORD_MAINTENANCE_FIELDS,
  ...NATIONAL_IDENTITY_FIELDS,
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
