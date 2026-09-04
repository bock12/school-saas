/**
 * Academic Engine — Unified TypeScript Type Definitions
 *
 * This file is the single source of truth for all TypeScript types
 * related to the Subjects & Curriculum module (Academic Engine Phase 1).
 *
 * Entity hierarchy:
 *   subjects → curriculum_versions → curriculum_topics → learning_outcomes
 *   subjects → subject_offerings (year contract) → term_offerings (per-term)
 *   curriculum_streams → stream_subject_rules → student_stream_assignments
 *   subject_offerings → student_subject_enrollments
 */

// ─────────────────────────────────────────────────────────────
// 1. ENUMS & UNIONS
// ─────────────────────────────────────────────────────────────

export type SubjectCategory =
  | 'science'
  | 'mathematics'
  | 'language'
  | 'social_science'
  | 'business'
  | 'technology'
  | 'vocational'
  | 'creative_arts'
  | 'physical_education'
  | 'general'
  | 'other';

export type SubjectTypeVal = 'academic' | 'vocational' | 'co_curricular';

export type GradeLevel =
  | 'JSS1' | 'JSS2' | 'JSS3'
  | 'SSS1' | 'SSS2' | 'SSS3'
  | 'Primary1' | 'Primary2' | 'Primary3'
  | 'Primary4' | 'Primary5' | 'Primary6';

/**
 * Full workflow status for curriculum versions.
 * DRAFT → SUBMITTED → IN_REVIEW → (CHANGES_REQUESTED → DRAFT loop) → APPROVED → PUBLISHED → SUPERSEDED → ARCHIVED
 */
export type CurriculumWorkflowStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'published'
  | 'superseded'
  | 'archived';

/** Kept for backward compat with the older actions/curriculum.ts */
export type CurriculumStatus = CurriculumWorkflowStatus;

export type CurriculumSource =
  | 'school'
  | 'district'
  | 'ministry'
  | 'waec'
  | 'bece'
  | 'other';

export type BloomLevel =
  | 'remember'
  | 'understand'
  | 'apply'
  | 'analyze'
  | 'evaluate'
  | 'create';

export type TopicLevel = 0 | 1 | 2; // 0=Strand, 1=Topic, 2=Subtopic

export type OfferingStatus = 'active' | 'inactive' | 'cancelled';

export type TermOfferingStatus = 'pending' | 'active' | 'suspended' | 'completed' | 'cancelled';

export type TimetableStatus = 'pending' | 'scheduled' | 'active' | 'completed';

export type EnrollmentStatus = 'active' | 'dropped' | 'transferred' | 'completed';

export type EnrollmentType = 'stream_core' | 'stream_elective' | 'standard' | 'transfer' | 'repeat' | 'exempt';

export type EnrollmentApprovalStatus = 'pending' | 'approved' | 'rejected';

export type StreamRuleType = 'core' | 'elective';

export type StreamAssignmentStatus = 'active' | 'changed' | 'withdrawn';

export type RequirementType = 'core' | 'elective' | 'optional';

export type ResourceType =
  | 'textbook'
  | 'teacher_guide'
  | 'syllabus'
  | 'pdf'
  | 'document'
  | 'video'
  | 'url'
  | 'handout'
  | 'learning_material'
  | 'other';

export type TopicProgress = 'planned' | 'started' | 'completed' | 'deferred' | 'skipped' | 'revised';

// ─────────────────────────────────────────────────────────────
// 2. SUBJECTS
// ─────────────────────────────────────────────────────────────

export interface SubjectRecord {
  id: string;
  tenant_id: string;
  name: string;
  short_name?: string;
  code?: string;
  national_code?: string;
  exam_board_code?: string;       // WAEC/BECE official code
  description?: string;
  category: SubjectCategory;
  subject_type: SubjectTypeVal;   // Note: stored as subject_type_col in DB
  department_id?: string;
  department_name?: string;
  is_elective: boolean;
  is_examinable: boolean;          // appears in BECE/WASSCE?
  is_active: boolean;
  archived_at?: string;
  default_periods_per_week: number;
  default_period_duration: number; // minutes
  max_class_size?: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  streams?: SubjectStreamInfo[];
}

export interface SubjectStreamInfo {
  stream_id: string;
  stream_name: string;
  stream_code: string;
  is_core: boolean;
}

export interface SubjectPayload {
  name: string;
  short_name?: string;
  code?: string;
  national_code?: string;
  exam_board_code?: string;
  description?: string;
  category?: SubjectCategory;
  subject_type?: SubjectTypeVal;
  department_id?: string;
  is_elective?: boolean;
  is_examinable?: boolean;
  default_periods_per_week?: number;
  default_period_duration?: number;
  max_class_size?: number;
  stream_ids?: string[];
}

export interface SubjectFilters {
  search?: string;
  department_id?: string;
  category?: SubjectCategory;
  is_active?: boolean;
  is_examinable?: boolean;
  stream_id?: string;
  subject_type?: SubjectTypeVal;
  limit?: number;
  offset?: number;
}

// ─────────────────────────────────────────────────────────────
// 3. CURRICULUM STREAMS
// ─────────────────────────────────────────────────────────────

export interface CurriculumStreamRecord {
  id: string;
  tenant_id: string;
  code: string;           // SCI_TECH, ECON_BUS, etc.
  name: string;           // "Sciences & Technologies"
  description?: string;
  level?: string;         // 'SSS' | 'JSS' | 'TVET' | 'ALL'
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Computed/joined
  subject_count?: number;
  student_count?: number;
}

export interface CurriculumStreamPayload {
  code: string;
  name: string;
  description?: string;
  level?: string;
  sort_order?: number;
}

// ─────────────────────────────────────────────────────────────
// 4. STREAM SUBJECT RULES
// ─────────────────────────────────────────────────────────────

export interface StreamSubjectRuleRecord {
  id: string;
  tenant_id: string;
  stream_id: string;
  stream_name?: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  academic_year_id?: string;
  rule_type: StreamRuleType;
  elective_group?: string;    // 'Group A', 'Group B', etc.
  min_selections: number;
  max_selections: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StreamSubjectRulePayload {
  stream_id: string;
  subject_id: string;
  academic_year_id?: string;
  rule_type: StreamRuleType;
  elective_group?: string;
  min_selections?: number;
  max_selections?: number;
  sort_order?: number;
}

/**
 * Grouped view of stream subject rules — one entry per elective group
 * with an array of subjects in that group, used for the enrollment portal.
 */
export interface StreamElectiveGroup {
  group_name: string;           // 'Group A', 'Group B', null → 'Ungrouped'
  min_selections: number;
  max_selections: number;
  subjects: {
    subject_id: string;
    subject_name: string;
    subject_code?: string;
    is_selected?: boolean;      // runtime: has student selected this?
    seats_available?: number;   // runtime: remaining seats
  }[];
}

export interface StreamRulesSummary {
  stream_id: string;
  stream_name: string;
  stream_code: string;
  academic_year_id?: string;
  core_subjects: {
    subject_id: string;
    subject_name: string;
    subject_code?: string;
  }[];
  elective_groups: StreamElectiveGroup[];
}

// ─────────────────────────────────────────────────────────────
// 5. STUDENT STREAM ASSIGNMENTS
// ─────────────────────────────────────────────────────────────

export interface StudentStreamAssignmentRecord {
  id?: string;
  tenant_id: string;
  student_id: string;
  student_name?: string;
  admission_number?: string;
  gender?: string;
  stream_id?: string;
  stream_name?: string;
  stream_code?: string;
  stream_level?: string;
  academic_year_id: string;
  academic_year_name?: string;
  section_id?: string;
  section_name?: string;
  class_name?: string;
  assigned_by?: string;
  assigned_by_name?: string;
  assigned_at?: string;
  status: StreamAssignmentStatus;
  previous_stream_id?: string;
  previous_stream_name?: string;
  change_reason?: string;
  electives_submitted: boolean;
  electives_approved: boolean;
  electives_locked: boolean;
  // Computed
  enrolled_subjects?: number;
  pending_electives?: number;
  core_subjects_count?: number;
  elective_subjects_count?: number;
}

export interface StudentStreamAssignmentPayload {
  student_id: string;
  stream_id: string;
  academic_year_id: string;
  section_id?: string;
  change_reason?: string;
}

export interface AssignStudentStreamPayload {
  student_id: string;
  stream_id: string;
  academic_year_id: string;
  section_id?: string | null;
  change_reason?: string;
}

export interface BatchAssignStreamPayload {
  student_ids: string[];
  stream_id: string;
  academic_year_id: string;
  section_id?: string | null;
  change_reason?: string;
}

export interface StreamAssignmentFilters {
  academic_year_id?: string;
  stream_id?: string;
  class_id?: string;
  section_id?: string;
  status?: StreamAssignmentStatus | 'all';
  elective_status?: 'not_started' | 'submitted' | 'approved' | 'locked';
  search?: string;
}

export interface StudentEnrolledSubjectDetail {
  enrollment_id: string;
  subject_id: string;
  subject_name: string;
  subject_code?: string;
  offering_id: string;
  enrollment_type: EnrollmentType;
  approval_status: EnrollmentApprovalStatus;
  elective_group?: string;
  periods_per_week?: number;
  teacher_name?: string;
  enrolled_at: string;
  waitlist_position?: number | null;
}

export interface ElectiveSubjectOption {
  offering_id: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  periods_per_week: number;
  duration_minutes: number;
  teacher_name?: string;
  capacity: number;
  enrolled_count: number;
  is_full: boolean;
  syllabus_summary?: string;
}

export interface StreamElectiveGroupOption {
  elective_group: string;
  min_selections: number;
  max_selections: number;
  options: ElectiveSubjectOption[];
}

export interface StudentElectivePackage {
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  section_name: string;
  stream_id: string;
  stream_name: string;
  stream_code: string;
  academic_year_id: string;
  academic_year_name: string;
  core_subjects: StudentEnrolledSubjectDetail[];
  elective_groups: StreamElectiveGroupOption[];
  selected_offering_ids: string[];
  electives_submitted: boolean;
  electives_approved: boolean;
  electives_locked: boolean;
  submitted_at?: string;
}

export interface SubmitElectivesPayload {
  student_id: string;
  academic_year_id: string;
  selections: Array<{ offering_id: string; elective_group: string }>;
}

export interface ElectiveSubmissionAdminRow {
  assignment_id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  section_name: string;
  stream_name: string;
  stream_code: string;
  electives_submitted: boolean;
  electives_approved: boolean;
  electives_locked: boolean;
  submitted_at?: string;
  chosen_electives: Array<{
    enrollment_id: string;
    subject_name: string;
    subject_code: string;
    elective_group: string;
    approval_status: string;
    waitlist_position?: number | null;
  }>;
}

export interface ReviewStudentElectivesPayload {
  assignment_id: string;
  student_id: string;
  action: 'approve' | 'reject';
  review_comment?: string;
}

// ─────────────────────────────────────────────────────────────
// 6. CURRICULUM VERSIONS
// ─────────────────────────────────────────────────────────────

export interface CurriculumVersionRecord {
  id: string;
  tenant_id: string;
  subject_id: string;
  subject_name?: string;
  academic_year_id: string;
  academic_year_name?: string;
  grade_level: GradeLevel | string;
  version: number;
  version_label?: string;          // "v2026.1"
  status: CurriculumWorkflowStatus;
  source: CurriculumSource;
  is_national_curriculum: boolean;
  superseded_by?: string;          // curriculum_versions.id
  effective_from?: string;
  effective_to?: string;
  notes?: string;
  review_notes?: string;
  rejection_reason?: string;
  // Workflow actors
  submitted_by?: string;
  submitted_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  approved_by?: string;
  approved_at?: string;
  published_by?: string;
  published_at?: string;
  archived_by?: string;
  archived_at?: string;
  created_at: string;
  updated_at: string;
  // Computed
  topic_count?: number;
  outcome_count?: number;
}

export interface CurriculumVersionPayload {
  subject_id: string;
  academic_year_id: string;
  grade_level: string;
  version_label?: string;
  source?: CurriculumSource;
  is_national_curriculum?: boolean;
  effective_from?: string;
  effective_to?: string;
  notes?: string;
}

export interface CurriculumVersionFilters {
  subject_id?: string;
  academic_year_id?: string;
  grade_level?: string;
  status?: CurriculumWorkflowStatus;
  source?: CurriculumSource;
  is_national_curriculum?: boolean;
}

// ─────────────────────────────────────────────────────────────
// 7. CURRICULUM WORKFLOW LOG
// ─────────────────────────────────────────────────────────────

export interface CurriculumWorkflowLogEntry {
  id: string;
  curriculum_version_id: string;
  from_status?: CurriculumWorkflowStatus;
  to_status: CurriculumWorkflowStatus;
  actioned_by?: string;
  actioned_by_name?: string;
  comment?: string;
  actioned_at: string;
}

// ─────────────────────────────────────────────────────────────
// 8. CURRICULUM TOPICS
// ─────────────────────────────────────────────────────────────

export interface CurriculumTopicRecord {
  id: string;
  curriculum_version_id: string;
  parent_topic_id?: string;
  level?: TopicLevel;
  code?: string;                // "ALG-01"
  title: string;
  description?: string;
  sequence: number;
  sort_order?: number;
  term?: 1 | 2 | 3;
  estimated_periods: number;
  is_assessable?: boolean;
  created_at: string;
  updated_at: string;
  // Tree
  children?: CurriculumTopicRecord[];
  // Joined
  outcomes?: LearningOutcomeRecord[];
  coverage_status?: TopicProgress; // from coverage_log
}

export interface CurriculumTopicPayload {
  id?: string;                  // present = update, absent = insert
  parent_topic_id?: string;
  title: string;
  code?: string;
  description?: string;
  sequence: number;
  term?: 1 | 2 | 3;
  estimated_periods?: number;
  is_assessable?: boolean;
}

// ─────────────────────────────────────────────────────────────
// 9. LEARNING OUTCOMES
// ─────────────────────────────────────────────────────────────

export interface LearningOutcomeRecord {
  id: string;
  curriculum_version_id: string;
  topic_id?: string;
  code?: string;              // "LO-ALG-01-01"
  description: string;
  cognitive_level?: BloomLevel;
  outcome_type?: 'knowledge' | 'skill' | 'attitude';
  is_examinable?: boolean;
  sequence: number;
  created_at: string;
  updated_at?: string;
}

export interface LearningOutcomePayload {
  id?: string;
  code?: string;
  description: string;
  cognitive_level?: BloomLevel;
  outcome_type?: 'knowledge' | 'skill' | 'attitude';
  is_examinable?: boolean;
  sequence: number;
}

// ─────────────────────────────────────────────────────────────
// 10. SUBJECT OFFERINGS (year-level contract)
// ─────────────────────────────────────────────────────────────

export interface SubjectOfferingRecord {
  id: string;
  tenant_id: string;
  academic_year_id: string;
  academic_year_name?: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  section_id: string;
  section_name?: string;
  class_name?: string;
  stream_id?: string;
  stream_name?: string;
  teacher_id?: string;
  teacher_name?: string;
  assistant_teacher_id?: string;
  assistant_teacher_name?: string;
  curriculum_version_id?: string;
  curriculum_version_label?: string;
  // Year-level config
  requirement_type: RequirementType;
  elective_group?: string;
  is_compulsory: boolean;
  overload_flag: boolean;
  enrollment_capacity?: number;
  current_enrollment?: number;
  status: OfferingStatus;
  created_at: string;
  updated_at?: string;
  // Term offerings (optional eager load)
  term_offerings?: TermOfferingRecord[];
}

export interface SubjectOfferingPayload {
  academic_year_id: string;
  subject_id: string;
  section_id: string;
  stream_id?: string;
  teacher_id?: string;
  assistant_teacher_id?: string;
  curriculum_version_id?: string;
  requirement_type?: RequirementType;
  elective_group?: string;
  is_compulsory?: boolean;
  enrollment_capacity?: number;
}

export interface SubjectOfferingFilters {
  academic_year_id?: string;
  subject_id?: string;
  teacher_id?: string;
  section_id?: string;
  stream_id?: string;
  status?: OfferingStatus;
  requirement_type?: RequirementType;
}

// ─────────────────────────────────────────────────────────────
// 11. TERM OFFERINGS (per-term operation)
// ─────────────────────────────────────────────────────────────

export interface TermOfferingRecord {
  id: string;
  tenant_id: string;
  offering_id: string;
  term_id: string;
  term_name?: string;
  // Resolved teacher (override or inherited)
  effective_teacher_id?: string;
  effective_teacher_name?: string;
  teacher_override_id?: string;
  // Resolved curriculum version
  effective_cv_id?: string;
  effective_cv_label?: string;
  curriculum_version_override?: string;
  // Per-term config
  periods_per_week: number;
  period_duration_mins: number;
  timetable_status: TimetableStatus;
  status: TermOfferingStatus;
  // Aggregates
  lesson_count: number;
  attendance_rate?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TermOfferingPayload {
  offering_id: string;
  term_id: string;
  teacher_override_id?: string | null;
  curriculum_version_override?: string | null;
  periods_per_week?: number;
  period_duration_mins?: number;
  status?: TermOfferingStatus;
  notes?: string;
}

export interface TermOfferingUpdatePayload {
  teacher_override_id?: string | null;
  curriculum_version_override?: string | null;
  periods_per_week?: number;
  period_duration_mins?: number;
  timetable_status?: TimetableStatus;
  status?: TermOfferingStatus;
  notes?: string;
}

// ─────────────────────────────────────────────────────────────
// 12. STUDENT SUBJECT ENROLLMENTS
// ─────────────────────────────────────────────────────────────

export interface StudentEnrollmentRecord {
  id: string;
  tenant_id: string;
  student_id: string;
  student_name?: string;
  offering_id: string;
  subject_name?: string;
  subject_code?: string;
  section_name?: string;
  class_name?: string;
  status: EnrollmentStatus;
  enrollment_type: EnrollmentType;
  elective_group?: string;
  approval_status: EnrollmentApprovalStatus;
  approved_by?: string;
  approved_at?: string;
  waitlist_position?: number;
  stream_assignment_id?: string;
  enrolled_by?: string;
  enrolled_at: string;
  dropped_at?: string;
}

export interface EnrollStudentPayload {
  student_id: string;
  offering_id: string;
  enrollment_type?: EnrollmentType;
  elective_group?: string;
  stream_assignment_id?: string;
}

// ─────────────────────────────────────────────────────────────
// 13. TEACHER WORKLOAD
// ─────────────────────────────────────────────────────────────

export interface TeacherWorkloadRecord {
  teacher_id: string;
  teacher_name: string;
  employee_id?: string;
  department_name?: string;
  academic_year_id: string;
  term_id: string;
  total_periods_week: number;
  total_teaching_mins_week: number;
  offering_count: number;
  has_overload_flag: boolean;
  max_periods: number;             // school-configured maximum
  utilization_percent: number;     // (total_periods / max_periods) * 100
  offering_details?: {
    term_offering_id: string;
    offering_id: string;
    subject_id: string;
    section_id: string;
    periods_per_week: number;
  }[];
}

/** Result of a workload check before assignment */
export interface WorkloadCheckResult {
  teacher_id: string;
  current_periods: number;
  proposed_addition: number;
  projected_total: number;
  max_periods: number;
  would_exceed: boolean;
  warning_message?: string;
}

// ─────────────────────────────────────────────────────────────
// 14. CURRICULUM COVERAGE
// ─────────────────────────────────────────────────────────────

export interface CoverageStats {
  total_topics: number;
  planned: number;
  started: number;
  completed: number;
  deferred: number;
  skipped: number;
  coverage_percent: number;       // 0–100
}

export interface CurriculumCoverageEntry {
  id: string;
  offering_id: string;
  topic_id: string;
  topic_title?: string;
  outcome_id?: string;
  status: TopicProgress;
  logged_by?: string;
  logged_by_name?: string;
  logged_at: string;
  notes?: string;
}

// ─────────────────────────────────────────────────────────────
// 15. CURRICULUM RESOURCES
// ─────────────────────────────────────────────────────────────

export interface CurriculumResourceRecord {
  id: string;
  tenant_id: string;
  subject_id?: string;
  curriculum_version_id?: string;
  topic_id?: string;
  resource_type: ResourceType;
  title: string;
  description?: string;
  url?: string;
  file_path?: string;
  author?: string;
  publisher?: string;
  edition?: string;
  isbn?: string;
  is_primary: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CurriculumResourcePayload {
  subject_id?: string;
  curriculum_version_id?: string;
  topic_id?: string;
  resource_type: ResourceType;
  title: string;
  description?: string;
  url?: string;
  file_path?: string;
  author?: string;
  publisher?: string;
  edition?: string;
  isbn?: string;
  is_primary?: boolean;
}

// ─────────────────────────────────────────────────────────────
// 16. DEPARTMENT (used by subjects)
// ─────────────────────────────────────────────────────────────

export interface DepartmentRecord {
  id: string;
  tenant_id: string;
  name: string;
  code?: string;
  head_teacher_id?: string;
  head_teacher_name?: string;
  is_active: boolean;
}

// ─────────────────────────────────────────────────────────────
// 17. SHARED RESPONSE WRAPPERS
// ─────────────────────────────────────────────────────────────

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResult<T> {
  success: boolean;
  data: T[];
  total: number;
  error?: string;
}

export interface BulkActionResult {
  success: boolean;
  created: number;
  updated: number;
  errors: { row: number; error: string }[];
}

// ─────────────────────────────────────────────────────────────
// 18. ENROLLMENT PORTAL TYPES (for the student/parent UI)
// ─────────────────────────────────────────────────────────────

/** Complete view for a student's enrollment portal */
export interface StudentEnrollmentPortal {
  student_id: string;
  student_name: string;
  academic_year_id: string;
  academic_year_name: string;
  assignment?: StudentStreamAssignmentRecord;
  core_subjects: {
    subject_id: string;
    subject_name: string;
    subject_code?: string;
    offering_id?: string;        // null = no offering yet
    enrollment_id?: string;      // null = not enrolled yet
    status: EnrollmentStatus | 'no_offering';
  }[];
  elective_groups: (StreamElectiveGroup & {
    current_selections: string[];   // selected subject_ids
    is_locked: boolean;
    approval_status: EnrollmentApprovalStatus;
  })[];
  total_subjects: number;
  can_submit: boolean;
  submission_deadline?: string;
}

// ─────────────────────────────────────────────────────────────
// 19. HOD DASHBOARD TYPES
// ─────────────────────────────────────────────────────────────

export interface HodDashboardData {
  department_id: string;
  department_name: string;
  academic_year_id: string;
  term_id?: string;
  // Curriculum health
  total_curriculum_versions: number;
  published_versions: number;
  pending_review: number;
  draft_versions: number;
  // Coverage
  average_coverage_percent: number;
  subjects_below_threshold: number;   // < 50% coverage
  // Workload
  teacher_workload: TeacherWorkloadRecord[];
  overloaded_teachers: number;
  unassigned_offerings: number;
  // Enrollment
  total_students: number;
  fully_enrolled_students: number;
}

// ─────────────────────────────────────────────────────────────
// 20. CONSTANTS
// ─────────────────────────────────────────────────────────────

export const GRADE_LEVELS: { value: string; label: string; band: 'primary' | 'jss' | 'sss' }[] = [
  { value: 'Primary1', label: 'Primary 1', band: 'primary' },
  { value: 'Primary2', label: 'Primary 2', band: 'primary' },
  { value: 'Primary3', label: 'Primary 3', band: 'primary' },
  { value: 'Primary4', label: 'Primary 4', band: 'primary' },
  { value: 'Primary5', label: 'Primary 5', band: 'primary' },
  { value: 'Primary6', label: 'Primary 6', band: 'primary' },
  { value: 'JSS1', label: 'JSS 1', band: 'jss' },
  { value: 'JSS2', label: 'JSS 2', band: 'jss' },
  { value: 'JSS3', label: 'JSS 3', band: 'jss' },
  { value: 'SSS1', label: 'SSS 1', band: 'sss' },
  { value: 'SSS2', label: 'SSS 2', band: 'sss' },
  { value: 'SSS3', label: 'SSS 3', band: 'sss' },
];

export const BLOOM_LEVELS: { value: BloomLevel; label: string; color: string }[] = [
  { value: 'remember',   label: 'Remember',   color: '#ef4444' },
  { value: 'understand', label: 'Understand',  color: '#f97316' },
  { value: 'apply',      label: 'Apply',       color: '#eab308' },
  { value: 'analyze',    label: 'Analyze',     color: '#22c55e' },
  { value: 'evaluate',   label: 'Evaluate',    color: '#3b82f6' },
  { value: 'create',     label: 'Create',      color: '#a855f7' },
];

export const SUBJECT_CATEGORIES: { value: SubjectCategory; label: string }[] = [
  { value: 'science',           label: 'Sciences' },
  { value: 'mathematics',       label: 'Mathematics' },
  { value: 'language',          label: 'Languages' },
  { value: 'social_science',    label: 'Social Sciences' },
  { value: 'business',          label: 'Business' },
  { value: 'technology',        label: 'Technology & ICT' },
  { value: 'vocational',        label: 'Vocational' },
  { value: 'creative_arts',     label: 'Creative Arts' },
  { value: 'physical_education',label: 'Physical Education' },
  { value: 'general',           label: 'General' },
  { value: 'other',             label: 'Other' },
];

export const CURRICULUM_STATUS_META: Record<CurriculumWorkflowStatus, {
  label: string;
  color: string;
  next: CurriculumWorkflowStatus[];
}> = {
  draft:             { label: 'Draft',             color: '#6b7280', next: ['submitted'] },
  submitted:         { label: 'Submitted',          color: '#f59e0b', next: ['in_review', 'changes_requested'] },
  in_review:         { label: 'In Review',          color: '#3b82f6', next: ['changes_requested', 'approved'] },
  changes_requested: { label: 'Changes Requested',  color: '#ef4444', next: ['submitted'] },
  approved:          { label: 'Approved',           color: '#10b981', next: ['published'] },
  published:         { label: 'Published',          color: '#059669', next: ['superseded', 'archived'] },
  superseded:        { label: 'Superseded',         color: '#8b5cf6', next: ['archived'] },
  archived:          { label: 'Archived',           color: '#374151', next: [] },
};

export const DEFAULT_SCHOOL_MAX_PERIODS = 30; // periods/week — warn threshold

export const TERM_OFFERING_STATUS_META: Record<TermOfferingStatus, { label: string; color: string }> = {
  pending:   { label: 'Pending',   color: '#6b7280' },
  active:    { label: 'Active',    color: '#10b981' },
  suspended: { label: 'Suspended', color: '#f59e0b' },
  completed: { label: 'Completed', color: '#3b82f6' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
};

// ─────────────────────────────────────────────────────────────
// 14. CURRICULUM COVERAGE & LESSON LOGGER (PHASE 8)
// ─────────────────────────────────────────────────────────────

export type TopicProgressStatus = 'planned' | 'started' | 'completed' | 'deferred' | 'skipped' | 'revised';

export interface CurriculumCoverageRecord {
  id: string;
  offering_id: string;
  topic_id: string;
  outcome_id?: string | null;
  status: TopicProgressStatus;
  logged_by?: string | null;
  logged_at: string;
  notes?: string | null;
  teacher_name?: string;
}

export interface TopicWithCoverage {
  id: string;
  curriculum_version_id: string;
  title: string;
  description?: string | null;
  sequence: number;
  term: number | null;
  estimated_periods: number;
  parent_topic_id?: string | null;
  outcomes: Array<{
    id: string;
    code?: string | null;
    description: string;
    cognitive_level?: string | null;
  }>;
  coverage_id?: string | null;
  status: TopicProgressStatus;
  logged_at?: string | null;
  logged_by_name?: string | null;
  notes?: string | null;
}

export interface OfferingCoverageSummary {
  offering_id: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  class_name: string;
  section_name?: string | null;
  teacher_name?: string | null;
  periods_per_week: number;
  curriculum_version_label?: string | null;
  total_topics: number;
  completed_topics: number;
  started_topics: number;
  deferred_topics: number;
  coverage_percentage: number;
  pacing_status: 'on_track' | 'behind' | 'ahead';
  last_logged_at?: string | null;
}

export interface LogTopicProgressPayload {
  offering_id: string;
  topic_id: string;
  outcome_id?: string | null;
  status: TopicProgressStatus;
  notes?: string;
}

export const TOPIC_PROGRESS_META: Record<TopicProgressStatus, { label: string; color: string; badgeClass: string }> = {
  planned:   { label: 'Planned',   color: '#6b7280', badgeClass: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  started:   { label: 'In Progress', color: '#3b82f6', badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  completed: { label: 'Completed', color: '#10b981', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  deferred:  { label: 'Deferred',  color: '#f59e0b', badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  skipped:   { label: 'Skipped',   color: '#ef4444', badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20' },
  revised:   { label: 'Revised',   color: '#8b5cf6', badgeClass: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
};
