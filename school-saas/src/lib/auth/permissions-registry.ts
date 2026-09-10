/**
 * ============================================================================
 * CANONICAL PERMISSION REGISTRY
 * Architecture: TASK-0007 Phase 3A — Canonical Authorization Engine
 * Single Source of Truth for Platform Permissions, Scopes, and Entitlements
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. CANONICAL ENUMS & LITERAL TYPES
// ----------------------------------------------------------------------------

export const CANONICAL_PERMISSIONS = [
  'admissions.applicants.view',
  'admissions.applicants.create',
  'admissions.applicants.approve',
  'admissions.applicants.manage',
  'admissions.applicants.evaluate',
  'admissions.applicants.place',
  'admissions.letters.dispatch',
  'admissions.applicants.enroll',
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
  'curriculum.lesson_plan.generate',
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
  'notifications.self.view',
  'notifications.self.manage',
  'communications.templates.manage',
  'communications.rules.manage',
  'communications.broadcast.send',
  'communications.broadcast.view',
  'platform.leads.manage',
] as const;

export type CanonicalPermission = (typeof CANONICAL_PERMISSIONS)[number];

export const BASE_ROLES = [
  'super_admin',
  'org_admin',
  'school_admin',
  'teacher',
  'student',
  'parent',
] as const;

export type BaseRole = (typeof BASE_ROLES)[number];

export const STAFF_ASSIGNMENT_TYPES = [
  'vice_principal',
  'exam_officer',
  'hod',
  'form_master',
  'subject_teacher',
  'assistant_teacher',
] as const;

export type StaffAssignmentType = (typeof STAFF_ASSIGNMENT_TYPES)[number];

export const CANONICAL_SCOPES = [
  'platform',
  'organization',
  'school',
  'department',
  'class',
  'offering',
  'self',
] as const;

export type CanonicalScope = (typeof CANONICAL_SCOPES)[number];

// ----------------------------------------------------------------------------
// 2. PERMISSION SPECIFICATION & IMMUTABLE SCOPE DECLARATION
// ----------------------------------------------------------------------------

export interface PermissionDefinition {
  readonly key: CanonicalPermission;
  readonly module: string;
  readonly resource: string;
  readonly action: string;
  readonly description: string;
  /** Primary / nominal scope associated with the entity */
  readonly canonicalScope: CanonicalScope;
  /**
   * Authoritative set of valid resource scopes allowed for this permission.
   * Callers cannot invent or override allowed scopes. (Guardrail 1)
   */
  readonly allowedScopes: readonly CanonicalScope[];
}

export const PERMISSIONS_CATALOG: Readonly<Record<CanonicalPermission, PermissionDefinition>> = {
  'admissions.applicants.view': {
    key: 'admissions.applicants.view',
    module: 'admissions',
    resource: 'applicants',
    action: 'view',
    description: 'View admission applications',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school', 'self'],
  },
  'admissions.applicants.create': {
    key: 'admissions.applicants.create',
    module: 'admissions',
    resource: 'applicants',
    action: 'create',
    description: 'Create admission application',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school', 'self'],
  },
  'admissions.applicants.approve': {
    key: 'admissions.applicants.approve',
    module: 'admissions',
    resource: 'applicants',
    action: 'approve',
    description: 'Approve or reject admission application',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'admissions.applicants.manage': {
    key: 'admissions.applicants.manage',
    module: 'admissions',
    resource: 'applicants',
    action: 'manage',
    description: 'Update applicant demographic records, contact details, and biographical information',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'admissions.applicants.evaluate': {
    key: 'admissions.applicants.evaluate',
    module: 'admissions',
    resource: 'applicants',
    action: 'evaluate',
    description: 'Record interview scores, entrance assessment marks, and verify national exam aggregates',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'admissions.applicants.place': {
    key: 'admissions.applicants.place',
    module: 'admissions',
    resource: 'applicants',
    action: 'place',
    description: 'Allocate senior secondary school applicants to academic stream tracks',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'admissions.letters.dispatch': {
    key: 'admissions.letters.dispatch',
    module: 'admissions',
    resource: 'letters',
    action: 'dispatch',
    description: 'Generate and record official dispatch of formal admission decision letters to applicants',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'admissions.applicants.enroll': {
    key: 'admissions.applicants.enroll',
    module: 'admissions',
    resource: 'applicants',
    action: 'enroll',
    description: 'Execute master enrollment transaction converting an admitted applicant into an active student record',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'students.records.view': {
    key: 'students.records.view',
    module: 'students',
    resource: 'records',
    action: 'view',
    description: 'View student academic and profile records',
    canonicalScope: 'offering',
    allowedScopes: ['platform', 'organization', 'school', 'department', 'class', 'offering', 'self'],
  },
  'students.records.manage': {
    key: 'students.records.manage',
    module: 'students',
    resource: 'records',
    action: 'manage',
    description: 'Create, update, or archive student profiles',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'students.welfare.manage': {
    key: 'students.welfare.manage',
    module: 'students',
    resource: 'welfare',
    action: 'manage',
    description: 'Manage student pastoral and welfare records',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school', 'department', 'class', 'offering'],
  },
  'attendance.sessions.mark': {
    key: 'attendance.sessions.mark',
    module: 'attendance',
    resource: 'sessions',
    action: 'mark',
    description: 'Mark attendance session for a class or offering',
    canonicalScope: 'class',
    allowedScopes: ['platform', 'organization', 'school', 'class', 'offering'],
  },
  'attendance.sessions.approve': {
    key: 'attendance.sessions.approve',
    module: 'attendance',
    resource: 'sessions',
    action: 'approve',
    description: 'Approve or lock finalized attendance registers',
    canonicalScope: 'class',
    allowedScopes: ['platform', 'organization', 'school', 'class'],
  },
  'attendance.records.view': {
    key: 'attendance.records.view',
    module: 'attendance',
    resource: 'records',
    action: 'view',
    description: 'View attendance history and reports',
    canonicalScope: 'offering',
    allowedScopes: ['platform', 'organization', 'school', 'department', 'class', 'offering', 'self'],
  },
  'curriculum.version.create': {
    key: 'curriculum.version.create',
    module: 'curriculum',
    resource: 'version',
    action: 'create',
    description: 'Draft curriculum version or syllabus outline',
    canonicalScope: 'offering',
    allowedScopes: ['platform', 'organization', 'school', 'department', 'offering'],
  },
  'curriculum.version.review': {
    key: 'curriculum.version.review',
    module: 'curriculum',
    resource: 'version',
    action: 'review',
    description: 'Review submitted curriculum draft',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school', 'department'],
  },
  'curriculum.version.approve': {
    key: 'curriculum.version.approve',
    module: 'curriculum',
    resource: 'version',
    action: 'approve',
    description: 'Approve departmental curriculum version',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'curriculum.version.publish': {
    key: 'curriculum.version.publish',
    module: 'curriculum',
    resource: 'version',
    action: 'publish',
    description: 'Publish curriculum to institutional catalog',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'curriculum.coverage.log': {
    key: 'curriculum.coverage.log',
    module: 'curriculum',
    resource: 'coverage',
    action: 'log',
    description: 'Log topic completion and instructional coverage',
    canonicalScope: 'offering',
    allowedScopes: ['platform', 'organization', 'school', 'department', 'offering'],
  },
  'curriculum.lesson_plan.generate': {
    key: 'curriculum.lesson_plan.generate',
    module: 'curriculum',
    resource: 'lesson_plan',
    action: 'generate',
    description: 'Generate ephemeral classroom instructional lesson plans from published curriculum topics using AI',
    canonicalScope: 'offering',
    allowedScopes: ['platform', 'organization', 'school', 'department', 'offering'],
  },
  'exams.sessions.manage': {
    key: 'exams.sessions.manage',
    module: 'exams',
    resource: 'sessions',
    action: 'manage',
    description: 'Configure exam sessions, timetables, and eligibility',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'exams.schedules.manage': {
    key: 'exams.schedules.manage',
    module: 'exams',
    resource: 'schedules',
    action: 'manage',
    description: 'Manage exam hall allocations and invigilator schedules',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'exams.results.enter': {
    key: 'exams.results.enter',
    module: 'exams',
    resource: 'results',
    action: 'enter',
    description: 'Enter provisional student exam and continuous assessment scores',
    canonicalScope: 'offering',
    allowedScopes: ['platform', 'organization', 'school', 'offering'],
  },
  'exams.results.moderate': {
    key: 'exams.results.moderate',
    module: 'exams',
    resource: 'results',
    action: 'moderate',
    description: 'Review, flag, and moderate departmental score entries',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school', 'department'],
  },
  'exams.results.approve': {
    key: 'exams.results.approve',
    module: 'exams',
    resource: 'results',
    action: 'approve',
    description: 'Give administrative approval to final score sheets',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'exams.results.publish': {
    key: 'exams.results.publish',
    module: 'exams',
    resource: 'results',
    action: 'publish',
    description: 'Publish report cards and approved results to students/parents',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'exams.results.view': {
    key: 'exams.results.view',
    module: 'exams',
    resource: 'results',
    action: 'view',
    description: 'View entered results within authorized teaching scope',
    canonicalScope: 'offering',
    allowedScopes: ['platform', 'organization', 'school', 'department', 'class', 'offering', 'self'],
  },
  'exams.malpractice.manage': {
    key: 'exams.malpractice.manage',
    module: 'exams',
    resource: 'malpractice',
    action: 'manage',
    description: 'Log, investigate, and adjudicate examination malpractice cases',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'exams.appeals.submit': {
    key: 'exams.appeals.submit',
    module: 'exams',
    resource: 'appeals',
    action: 'submit',
    description: 'Submit a formal grade review appeal',
    canonicalScope: 'self',
    allowedScopes: ['platform', 'organization', 'self'],
  },
  'exams.appeals.resolve': {
    key: 'exams.appeals.resolve',
    module: 'exams',
    resource: 'appeals',
    action: 'resolve',
    description: 'Review and decide examination grade appeals',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'exams.cass.export': {
    key: 'exams.cass.export',
    module: 'exams',
    resource: 'cass',
    action: 'export',
    description: 'Generate and export official CASS/WAEC examination returns',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'finance.invoices.view': {
    key: 'finance.invoices.view',
    module: 'finance',
    resource: 'invoices',
    action: 'view',
    description: 'View fee invoices and payment status',
    canonicalScope: 'self',
    allowedScopes: ['platform', 'organization', 'school', 'self'],
  },
  'finance.invoices.manage': {
    key: 'finance.invoices.manage',
    module: 'finance',
    resource: 'invoices',
    action: 'manage',
    description: 'Issue, adjust, and void fee invoices',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'finance.waivers.approve': {
    key: 'finance.waivers.approve',
    module: 'finance',
    resource: 'waivers',
    action: 'approve',
    description: 'Approve fee discounts, scholarships, and debt write-offs',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'staff.directory.view': {
    key: 'staff.directory.view',
    module: 'staff',
    resource: 'directory',
    action: 'view',
    description: 'View school staff directory and contact profiles',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'staff.allocations.manage': {
    key: 'staff.allocations.manage',
    module: 'staff',
    resource: 'allocations',
    action: 'manage',
    description: 'Assign teachers to subjects, forms, and departments',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school', 'department'],
  },
  'staff.accounts.manage': {
    key: 'staff.accounts.manage',
    module: 'staff',
    resource: 'accounts',
    action: 'manage',
    description: 'Provision and deprovision staff platform user accounts',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'platform.tenants.manage': {
    key: 'platform.tenants.manage',
    module: 'platform',
    resource: 'tenants',
    action: 'manage',
    description: 'Create, configure, suspend, or migrate school tenants',
    canonicalScope: 'platform',
    allowedScopes: ['platform'],
  },
  'platform.billing.manage': {
    key: 'platform.billing.manage',
    module: 'platform',
    resource: 'billing',
    action: 'manage',
    description: 'Manage SaaS subscriptions, plan tiers, and platform revenue',
    canonicalScope: 'platform',
    allowedScopes: ['platform'],
  },
  'notifications.self.view': {
    key: 'notifications.self.view',
    module: 'notifications',
    resource: 'self',
    action: 'view',
    description: 'View personal incoming notifications and unread badge counts',
    canonicalScope: 'self',
    allowedScopes: ['platform', 'organization', 'school', 'self'],
  },
  'notifications.self.manage': {
    key: 'notifications.self.manage',
    module: 'notifications',
    resource: 'self',
    action: 'manage',
    description: 'Update status of personal notifications (mark as read, dismiss)',
    canonicalScope: 'self',
    allowedScopes: ['platform', 'organization', 'school', 'self'],
  },
  'communications.templates.manage': {
    key: 'communications.templates.manage',
    module: 'communications',
    resource: 'templates',
    action: 'manage',
    description: 'Create, edit, and archive institutional communication message templates',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'communications.rules.manage': {
    key: 'communications.rules.manage',
    module: 'communications',
    resource: 'rules',
    action: 'manage',
    description: 'Configure automated event-driven communication trigger rules and channel routing',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'communications.broadcast.view': {
    key: 'communications.broadcast.view',
    module: 'communications',
    resource: 'broadcast',
    action: 'view',
    description: 'View broadcast dispatch history, recipient delivery logs, and delivery metrics',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'communications.broadcast.send': {
    key: 'communications.broadcast.send',
    module: 'communications',
    resource: 'broadcast',
    action: 'send',
    description: 'Dispatch or schedule mass multi-channel communication broadcasts to school audiences',
    canonicalScope: 'school',
    allowedScopes: ['platform', 'organization', 'school'],
  },
  'platform.leads.manage': {
    key: 'platform.leads.manage',
    module: 'platform',
    resource: 'leads',
    action: 'manage',
    description: 'Manage prospective tenant inquiries, demo scheduling, and onboarding pipeline',
    canonicalScope: 'platform',
    allowedScopes: ['platform'],
  },
};

// ----------------------------------------------------------------------------
// 3. EXPLICIT BASE-ROLE ENTITLEMENT MATRIX (BASE_ROLE_PERMISSIONS)
// ----------------------------------------------------------------------------

export interface BaseRoleGrant {
  readonly permission: CanonicalPermission;
  readonly scope: CanonicalScope;
}

export const BASE_ROLE_PERMISSIONS: Readonly<Record<BaseRole, readonly BaseRoleGrant[]>> = {
  /**
   * super_admin: Global platform operations.
   * Holds ALL 33 permissions at 'platform' scope.
   */
  super_admin: CANONICAL_PERMISSIONS.map((perm) => ({
    permission: perm,
    scope: 'platform' as CanonicalScope,
  })),

  /**
   * org_admin: Multi-school network authority.
   * Holds 31 permissions across owned child schools (excludes platform management).
   * Notice: Permission resource scope remains 'school' or 'offering', while org_admin's
   * reachable boundary is 'organization' (Supervisory Guardrail 4).
   */
  org_admin: [
    { permission: 'admissions.applicants.view', scope: 'school' },
    { permission: 'admissions.applicants.create', scope: 'school' },
    { permission: 'admissions.applicants.approve', scope: 'school' },
    { permission: 'admissions.applicants.manage', scope: 'school' },
    { permission: 'admissions.applicants.evaluate', scope: 'school' },
    { permission: 'admissions.applicants.place', scope: 'school' },
    { permission: 'admissions.letters.dispatch', scope: 'school' },
    { permission: 'admissions.applicants.enroll', scope: 'school' },
    { permission: 'students.records.view', scope: 'school' },
    { permission: 'students.records.manage', scope: 'school' },
    { permission: 'students.welfare.manage', scope: 'school' },
    { permission: 'attendance.sessions.mark', scope: 'school' },
    { permission: 'attendance.sessions.approve', scope: 'school' },
    { permission: 'attendance.records.view', scope: 'school' },
    { permission: 'curriculum.version.create', scope: 'school' },
    { permission: 'curriculum.version.review', scope: 'school' },
    { permission: 'curriculum.version.approve', scope: 'school' },
    { permission: 'curriculum.version.publish', scope: 'school' },
    { permission: 'curriculum.coverage.log', scope: 'school' },
    { permission: 'curriculum.lesson_plan.generate', scope: 'school' },
    { permission: 'exams.sessions.manage', scope: 'school' },
    { permission: 'exams.schedules.manage', scope: 'school' },
    { permission: 'exams.results.enter', scope: 'school' },
    { permission: 'exams.results.moderate', scope: 'school' },
    { permission: 'exams.results.approve', scope: 'school' },
    { permission: 'exams.results.publish', scope: 'school' },
    { permission: 'exams.results.view', scope: 'school' },
    { permission: 'exams.malpractice.manage', scope: 'school' },
    { permission: 'exams.appeals.submit', scope: 'organization' },
    { permission: 'exams.appeals.resolve', scope: 'school' },
    { permission: 'exams.cass.export', scope: 'school' },
    { permission: 'finance.invoices.view', scope: 'school' },
    { permission: 'finance.invoices.manage', scope: 'school' },
    { permission: 'finance.waivers.approve', scope: 'school' },
    { permission: 'staff.directory.view', scope: 'school' },
    { permission: 'staff.allocations.manage', scope: 'school' },
    { permission: 'staff.accounts.manage', scope: 'school' },
    { permission: 'notifications.self.view', scope: 'self' },
    { permission: 'notifications.self.manage', scope: 'self' },
    { permission: 'communications.templates.manage', scope: 'school' },
    { permission: 'communications.rules.manage', scope: 'school' },
    { permission: 'communications.broadcast.view', scope: 'school' },
    { permission: 'communications.broadcast.send', scope: 'school' },
  ],

  /**
   * school_admin: Institutional executive authority (Principal / Headmaster).
   * Holds 29 permissions strictly within their own school tenant.
   * Holds exams.results.approve & exams.results.publish.
   * Does NOT hold platform management or student appeals submission.
   */
  school_admin: [
    { permission: 'admissions.applicants.view', scope: 'school' },
    { permission: 'admissions.applicants.create', scope: 'school' },
    { permission: 'admissions.applicants.approve', scope: 'school' },
    { permission: 'admissions.applicants.manage', scope: 'school' },
    { permission: 'admissions.applicants.evaluate', scope: 'school' },
    { permission: 'admissions.applicants.place', scope: 'school' },
    { permission: 'admissions.letters.dispatch', scope: 'school' },
    { permission: 'admissions.applicants.enroll', scope: 'school' },
    { permission: 'students.records.view', scope: 'school' },
    { permission: 'students.records.manage', scope: 'school' },
    { permission: 'students.welfare.manage', scope: 'school' },
    { permission: 'attendance.sessions.mark', scope: 'school' },
    { permission: 'attendance.sessions.approve', scope: 'school' },
    { permission: 'attendance.records.view', scope: 'school' },
    { permission: 'curriculum.version.create', scope: 'school' },
    { permission: 'curriculum.version.review', scope: 'school' },
    { permission: 'curriculum.version.approve', scope: 'school' },
    { permission: 'curriculum.version.publish', scope: 'school' },
    { permission: 'curriculum.coverage.log', scope: 'school' },
    { permission: 'curriculum.lesson_plan.generate', scope: 'school' },
    { permission: 'exams.sessions.manage', scope: 'school' },
    { permission: 'exams.schedules.manage', scope: 'school' },
    { permission: 'exams.results.enter', scope: 'school' },
    { permission: 'exams.results.moderate', scope: 'school' },
    { permission: 'exams.results.approve', scope: 'school' },
    { permission: 'exams.results.publish', scope: 'school' },
    { permission: 'exams.results.view', scope: 'school' },
    { permission: 'exams.malpractice.manage', scope: 'school' },
    { permission: 'exams.appeals.resolve', scope: 'school' },
    { permission: 'exams.cass.export', scope: 'school' },
    { permission: 'finance.invoices.view', scope: 'school' },
    { permission: 'finance.invoices.manage', scope: 'school' },
    { permission: 'finance.waivers.approve', scope: 'school' },
    { permission: 'staff.directory.view', scope: 'school' },
    { permission: 'staff.allocations.manage', scope: 'school' },
    { permission: 'staff.accounts.manage', scope: 'school' },
    { permission: 'notifications.self.view', scope: 'self' },
    { permission: 'notifications.self.manage', scope: 'self' },
    { permission: 'communications.templates.manage', scope: 'school' },
    { permission: 'communications.rules.manage', scope: 'school' },
    { permission: 'communications.broadcast.view', scope: 'school' },
    { permission: 'communications.broadcast.send', scope: 'school' },
  ],

  /**
   * teacher: Certified instructor base role.
   * Holds staff directory view at school scope.
   * Contextual operational permissions (students records, attendance, curriculum, exams)
   * are granted strictly via functional assignments (subject_teacher, form_master, hod, etc.).
   */
  teacher: [
    { permission: 'staff.directory.view', scope: 'school' },
    { permission: 'notifications.self.view', scope: 'self' },
    { permission: 'notifications.self.manage', scope: 'self' },
  ],

  /**
   * student: Enrolled learner base role.
   * Self-scoped access only to their own academic records, fees, and appeals.
   */
  student: [
    { permission: 'admissions.applicants.view', scope: 'self' },
    { permission: 'admissions.applicants.create', scope: 'self' },
    { permission: 'students.records.view', scope: 'self' },
    { permission: 'attendance.records.view', scope: 'self' },
    { permission: 'exams.results.view', scope: 'self' },
    { permission: 'exams.appeals.submit', scope: 'self' },
    { permission: 'finance.invoices.view', scope: 'self' },
    { permission: 'notifications.self.view', scope: 'self' },
    { permission: 'notifications.self.manage', scope: 'self' },
  ],

  /**
   * parent: Parent or legal guardian base role.
   * Relationship-aware access: evaluated against verified child students (parent_students).
   */
  parent: [
    { permission: 'admissions.applicants.view', scope: 'self' },
    { permission: 'admissions.applicants.create', scope: 'self' },
    { permission: 'students.records.view', scope: 'self' },
    { permission: 'attendance.records.view', scope: 'self' },
    { permission: 'exams.results.view', scope: 'self' },
    { permission: 'exams.appeals.submit', scope: 'self' },
    { permission: 'finance.invoices.view', scope: 'self' },
    { permission: 'notifications.self.view', scope: 'self' },
    { permission: 'notifications.self.manage', scope: 'self' },
  ],
};

// ----------------------------------------------------------------------------
// 4. EXPLICIT FUNCTIONAL ASSIGNMENT ENTITLEMENT MATRIX
// ----------------------------------------------------------------------------

export interface FunctionalAssignmentGrant {
  readonly permission: CanonicalPermission;
  readonly scope: CanonicalScope;
  readonly assignmentType: StaffAssignmentType;
  readonly stageConstraint?: 'draft';
}

export const FUNCTIONAL_ASSIGNMENT_PERMISSIONS: Readonly<
  Record<StaffAssignmentType, readonly FunctionalAssignmentGrant[]>
> = {
  /**
   * hod: Head of Department.
   * Bound strictly to department_id.
   * Adds departmental curriculum drafting, review, score moderation, and allocation management.
   */
  hod: [
    { permission: 'students.records.view', scope: 'department', assignmentType: 'hod' },
    { permission: 'students.welfare.manage', scope: 'department', assignmentType: 'hod' },
    { permission: 'attendance.records.view', scope: 'department', assignmentType: 'hod' },
    { permission: 'curriculum.version.create', scope: 'department', assignmentType: 'hod' },
    { permission: 'curriculum.version.review', scope: 'department', assignmentType: 'hod' },
    { permission: 'curriculum.coverage.log', scope: 'department', assignmentType: 'hod' },
    { permission: 'curriculum.lesson_plan.generate', scope: 'department', assignmentType: 'hod' },
    { permission: 'exams.results.moderate', scope: 'department', assignmentType: 'hod' },
    { permission: 'exams.results.view', scope: 'department', assignmentType: 'hod' },
    { permission: 'staff.directory.view', scope: 'school', assignmentType: 'hod' },
    { permission: 'staff.allocations.manage', scope: 'department', assignmentType: 'hod' },
    { permission: 'communications.broadcast.view', scope: 'school', assignmentType: 'hod' },
  ],

  /**
   * form_master: Pastoral & Class Administrator.
   * Bound strictly to section_id.
   * Adds class-wide records view, welfare, and attendance marking & approval.
   */
  form_master: [
    { permission: 'students.records.view', scope: 'class', assignmentType: 'form_master' },
    { permission: 'students.welfare.manage', scope: 'class', assignmentType: 'form_master' },
    { permission: 'attendance.sessions.mark', scope: 'class', assignmentType: 'form_master' },
    { permission: 'attendance.sessions.approve', scope: 'class', assignmentType: 'form_master' },
    { permission: 'attendance.records.view', scope: 'class', assignmentType: 'form_master' },
    { permission: 'exams.results.view', scope: 'class', assignmentType: 'form_master' },
    { permission: 'staff.directory.view', scope: 'school', assignmentType: 'form_master' },
  ],

  /**
   * subject_teacher: Primary Subject Instructor.
   * Bound strictly to subject_offering_id.
   * Adds syllabus drafting, coverage logging, mark entry, and class marking.
   */
  subject_teacher: [
    { permission: 'students.records.view', scope: 'offering', assignmentType: 'subject_teacher' },
    { permission: 'students.welfare.manage', scope: 'offering', assignmentType: 'subject_teacher' },
    { permission: 'attendance.sessions.mark', scope: 'offering', assignmentType: 'subject_teacher' },
    { permission: 'attendance.records.view', scope: 'offering', assignmentType: 'subject_teacher' },
    { permission: 'curriculum.version.create', scope: 'offering', assignmentType: 'subject_teacher' },
    { permission: 'curriculum.coverage.log', scope: 'offering', assignmentType: 'subject_teacher' },
    { permission: 'curriculum.lesson_plan.generate', scope: 'offering', assignmentType: 'subject_teacher' },
    { permission: 'exams.results.enter', scope: 'offering', assignmentType: 'subject_teacher' },
    { permission: 'exams.results.view', scope: 'offering', assignmentType: 'subject_teacher' },
    { permission: 'staff.directory.view', scope: 'school', assignmentType: 'subject_teacher' },
  ],

  /**
   * assistant_teacher: Co-instructor / Teaching Assistant.
   * Bound strictly to subject_offering_id.
   * Adds attendance marking, offering records view, and DRAFT mark entry only.
   */
  assistant_teacher: [
    { permission: 'students.records.view', scope: 'offering', assignmentType: 'assistant_teacher' },
    { permission: 'attendance.sessions.mark', scope: 'offering', assignmentType: 'assistant_teacher' },
    { permission: 'attendance.records.view', scope: 'offering', assignmentType: 'assistant_teacher' },
    {
      permission: 'exams.results.enter',
      scope: 'offering',
      assignmentType: 'assistant_teacher',
      stageConstraint: 'draft',
    },
    { permission: 'exams.results.view', scope: 'offering', assignmentType: 'assistant_teacher' },
    { permission: 'staff.directory.view', scope: 'school', assignmentType: 'assistant_teacher' },
  ],

  /**
   * exam_officer: School Assessment & Examination Officer.
   * Bound strictly to school tenant_id.
   * Adds timetable, invigilation, school moderation, malpractice, and CASS export.
   * STRICT PROHIBITION: Does NOT hold exams.results.approve or exams.results.publish.
   */
  exam_officer: [
    { permission: 'admissions.applicants.view', scope: 'school', assignmentType: 'exam_officer' },
    { permission: 'admissions.applicants.evaluate', scope: 'school', assignmentType: 'exam_officer' },
    { permission: 'admissions.applicants.place', scope: 'school', assignmentType: 'exam_officer' },
    { permission: 'students.records.view', scope: 'school', assignmentType: 'exam_officer' },
    { permission: 'attendance.records.view', scope: 'school', assignmentType: 'exam_officer' },
    { permission: 'exams.sessions.manage', scope: 'school', assignmentType: 'exam_officer' },
    { permission: 'exams.schedules.manage', scope: 'school', assignmentType: 'exam_officer' },
    { permission: 'exams.results.moderate', scope: 'school', assignmentType: 'exam_officer' },
    { permission: 'exams.results.view', scope: 'school', assignmentType: 'exam_officer' },
    { permission: 'exams.malpractice.manage', scope: 'school', assignmentType: 'exam_officer' },
    { permission: 'exams.appeals.resolve', scope: 'school', assignmentType: 'exam_officer' },
    { permission: 'exams.cass.export', scope: 'school', assignmentType: 'exam_officer' },
    { permission: 'staff.directory.view', scope: 'school', assignmentType: 'exam_officer' },
    { permission: 'communications.templates.manage', scope: 'school', assignmentType: 'exam_officer' },
    { permission: 'communications.rules.manage', scope: 'school', assignmentType: 'exam_officer' },
    { permission: 'communications.broadcast.send', scope: 'school', assignmentType: 'exam_officer' },
    { permission: 'communications.broadcast.view', scope: 'school', assignmentType: 'exam_officer' },
  ],

  /**
   * vice_principal: Academic Leadership Assistance.
   * Bound strictly to school tenant_id.
   * Adds school-wide attendance, curriculum approval, exam moderation, and staff allocations.
   * STRICT PROHIBITION: Does NOT hold curriculum.version.publish, exams.results.approve, or exams.results.publish.
   */
  vice_principal: [
    { permission: 'admissions.applicants.view', scope: 'school', assignmentType: 'vice_principal' },
    { permission: 'students.records.view', scope: 'school', assignmentType: 'vice_principal' },
    { permission: 'students.welfare.manage', scope: 'school', assignmentType: 'vice_principal' },
    { permission: 'attendance.sessions.mark', scope: 'school', assignmentType: 'vice_principal' },
    { permission: 'attendance.sessions.approve', scope: 'school', assignmentType: 'vice_principal' },
    { permission: 'attendance.records.view', scope: 'school', assignmentType: 'vice_principal' },
    { permission: 'curriculum.version.review', scope: 'school', assignmentType: 'vice_principal' },
    { permission: 'curriculum.version.approve', scope: 'school', assignmentType: 'vice_principal' },
    { permission: 'exams.sessions.manage', scope: 'school', assignmentType: 'vice_principal' },
    { permission: 'exams.schedules.manage', scope: 'school', assignmentType: 'vice_principal' },
    { permission: 'exams.results.moderate', scope: 'school', assignmentType: 'vice_principal' },
    { permission: 'exams.results.view', scope: 'school', assignmentType: 'vice_principal' },
    { permission: 'exams.malpractice.manage', scope: 'school', assignmentType: 'vice_principal' },
    { permission: 'exams.appeals.resolve', scope: 'school', assignmentType: 'vice_principal' },
    { permission: 'staff.directory.view', scope: 'school', assignmentType: 'vice_principal' },
    { permission: 'staff.allocations.manage', scope: 'school', assignmentType: 'vice_principal' },
    { permission: 'communications.broadcast.view', scope: 'school', assignmentType: 'vice_principal' },
  ],
};

// ----------------------------------------------------------------------------
// 5. REGISTRY HELPER FUNCTIONS
// ----------------------------------------------------------------------------

export function isCanonicalPermission(key: string): key is CanonicalPermission {
  return (CANONICAL_PERMISSIONS as readonly string[]).includes(key);
}

export function isBaseRole(role: string): role is BaseRole {
  return (BASE_ROLES as readonly string[]).includes(role);
}

export function isStaffAssignmentType(type: string): type is StaffAssignmentType {
  return (STAFF_ASSIGNMENT_TYPES as readonly string[]).includes(type);
}

export function getPermissionDefinition(key: CanonicalPermission): PermissionDefinition {
  const def = PERMISSIONS_CATALOG[key];
  if (!def) {
    throw new Error(`[PermissionRegistry] Unknown canonical permission: ${key}`);
  }
  return def;
}

export function getBaseRoleGrants(role: BaseRole): readonly BaseRoleGrant[] {
  return BASE_ROLE_PERMISSIONS[role] || [];
}

export function getAssignmentGrants(
  assignmentType: StaffAssignmentType
): readonly FunctionalAssignmentGrant[] {
  return FUNCTIONAL_ASSIGNMENT_PERMISSIONS[assignmentType] || [];
}
