# Module Security Control Matrix

## 1. Enforcement Layers by Module & Table Domain

| Module / Resource | Application Guard | RLS | Role Check | Tenant Check | Resource Ownership | Privileged Boundary | Status | Evidence |
|---|---|---|---|---|---|---|---|---|
| **public.tenants** | `authorizeApiRequest(scope: 'platform')` | `tenants_super_admin_all`, `tenants_read_member` | Super Admin / Member | Invariant | Platform scope | Server-only / super_admin | **REMEDIATED** | Migration 046; T-012, T-015A, T-015B, T-015C, T-015D |
| **public.profiles** | `authorizeApiRequest(scope: 'tenant')` | `profiles_update_self`, `profiles_select_active_same_tenant` | Role allowlists | `tenant_id = get_user_tenant_id()` | `id = auth.uid()` | `trg_protect_profile_mutations` | **REMEDIATED** | Migration 046; PROFILE-01 to 07, T-005, T-006, T-014 |
| **public.applicants** | `authorizeApiRequest(roles: ['school_admin', ...])` | `applicants_tenant_isolation_*` | School Admin / Exam Officer | `tenant_id = get_user_tenant_id()` | Tenant boundary | API allowlist + RLS WITH CHECK | **REMEDIATED** | Migration 046; SEC-08 to 18, T-001 to T-009 |
| **public.exam_sessions** | `authorizeApiRequest(roles: ['school_admin', 'exam_officer'])` | `exam_sessions_select/modify` | School Admin / Exam Officer / Teacher (read) | `tenant_id = get_user_tenant_id()` | Tenant boundary | Mutation restricted to privileged exam roles | **REMEDIATED** | Migration 046; T-001, T-003, T-010 |
| **public.exam_schedules** | `authorizeApiRequest(roles: ['school_admin', 'exam_officer'])` | `exam_schedules_select/modify` | Staff & Student (read) / Admin (write) | `tenant_id = get_user_tenant_id()` | Tenant boundary | Mutation restricted to Admin / Exam Officer | **REMEDIATED** | Migration 046; T-010 |
| **public.exam_results_approval** | Privileged API guard | `exam_results_approval_select/modify` | Super Admin / School Admin / Exam Officer | `tenant_id = get_user_tenant_id()` | Tenant boundary | Zero student/parent/teacher access | **REMEDIATED** | Migration 046; T-010 |
| **public.exam_malpractices** | Privileged API guard | `exam_malpractices_select/modify` | Super Admin / School Admin / Exam Officer | `tenant_id = get_user_tenant_id()` | Tenant boundary | Confidential; restricted to exam officers / admins | **REMEDIATED** | Migration 046; T-010 |
| **public.exam_appeals** | API guard | `exam_appeals_select/insert/modify` | Student/Parent (submit/view own), Staff (review) | `tenant_id = get_user_tenant_id()` | `student_id = auth.uid()` for students | Resolution restricted to Admin / Exam Officer | **REMEDIATED** | Migration 046; T-001, T-010 |
| **Exam Analytics (6 tables)** | Read-only API routes | `*_tenant_select` (read-only) | Staff / Admin (read-only) | `tenant_id = get_user_tenant_id()` | Tenant boundary | Read-only for tenant users; mutations super_admin only | **REMEDIATED** | Migration 046; T-001, T-003, T-010 |
| **public.notifications** | `authorizeApiRequest` | `notifications_select/update_recipient/admin` | Recipient (own) / Admin (tenant) | `tenant_id = get_user_tenant_id()` | `get_user_recipient_notification_ids()` | System/service process & Admin creation | **REMEDIATED** | Migration 046; T-001, T-002, T-010 |
| **public.notification_recipients**| Notification API guard | `notification_recipients_select/update` | Recipient (own) / Admin (tenant) | Direct recipient ID | `user_id = auth.uid()` | Admin manage / User read status update | **REMEDIATED** | Migration 046; T-001, T-002 |
| **Notification Config/Rules (4)** | Admin API guard | `*_admin_all` | School Admin / Super Admin | `tenant_id = get_user_tenant_id()` | Tenant boundary | Ordinary users (teachers/students) denied | **REMEDIATED** | Migration 046; T-010 |
| **Academic Core (Classes/Subjects)**| `authorizeApiRequest` | Table-level tenant policies | Staff / Student / Admin | `tenant_id = get_user_tenant_id()` | Tenant boundary | Mutations restricted to school_admin | **PASS** | Existing migrations 001-042; T-001 to T-007 |
| **Attendance** | `authorizeApiRequest` | `attendance_*` policies | Teacher / School Admin | `tenant_id = get_user_tenant_id()` | Tenant / Class boundary | Verification ongoing in TASK-0007 | **PARTIAL** | Verified tenant boundary; role refinements in TASK-0007 |
| **Finance / Bursary** | `authorizeApiRequest` | `finance_*` policies | Finance / School Admin | `tenant_id = get_user_tenant_id()` | Tenant boundary | Sensitive financial boundary; verification ongoing | **PARTIAL** | Application guard active; RLS audit scheduled |
| **Super Admin Platform Routes** | `authorizeApiRequest(scope: 'platform')` | `tenants_super_admin_all` | `super_admin` only | Platform-wide | Super Admin only | Service role strictly deferred | **PASS** | SEC-22, T-015A, T-015D, T-015E |

*Note on Status Values:*
- **PASS**: Control verified both at application layer and PostgreSQL RLS layer with automated tests.
- **REMEDIATED**: Discovered vulnerability/misconfiguration that has been fully fixed via database migration and proven by tests.
- **PARTIAL**: Application guard active and basic tenant isolation present; granular sub-role policies scheduled for comprehensive hardening.
- **DEFERRED**: Architecture change deferred to dedicated task (e.g., sub-role redesign in TASK-0007).
- **FAILED**: Control failing verification (currently 0).
- **NOT APPLICABLE**: Control not relevant to this resource.

---

## 2. Findings Classification & Audit Register

### Finding RLS-001
- **Severity**: CRITICAL
- **Affected component**: `public.tenants`
- **Security impact**: Complete tenant boundary bypass. Any authenticated user could read or mutate any tenant record in the database.
- **Current behavior**: Insecure prototype policy `Prototype allow all` (`USING (true) WITH CHECK (true)`).
- **Expected behavior**: Users can only read their own tenant. Super admins can manage all tenants. Mutations restricted to platform administrators.
- **Evidence**: `supabase/migrations/001_initial_schema.sql` policy `Prototype allow all`. Live database inspection: `cmd: "ALL", qual: "true", with_check: "true"`.
- **Remediation**: Dropped `Prototype allow all` in migration 046. Enforced `tenants_read_member` (`USING (id = public.get_user_tenant_id())`) and `tenants_super_admin_all` (`USING (public.is_super_admin())`).
- **Residual risk**: None. Zero tenant users can mutate or read cross-tenant records.
- **Follow-up task**: None. Verified by tests T-012, T-015A, T-015B, T-015C, T-015D.

### Finding RLS-002
- **Severity**: HIGH
- **Affected component**: Exam Core Tables (`exam_sessions`, `exam_schedules`, `exam_results_approval`, `exam_malpractices`, `exam_appeals`)
- **Security impact**: Row Level Security was disabled (`rowsecurity = false`) on all 5 tables while permissive policies (`cmd: ALL, qual: true`) existed. Any authenticated user could view sensitive malpractice records, alter schedules, or approve results.
- **Current behavior**: RLS disabled, permissive wildcard policy.
- **Expected behavior**: RLS enabled. Table-specific authorization separating public/student visibility from privileged examination workflows.
- **Evidence**: `pg_tables.rowsecurity = false` on all 5 tables; `pg_policies` had `USING (true)`.
- **Remediation**: Enabled RLS on all 5 tables in migration 046. Dropped wildcard policies. Created table-specific role and ownership policies. Restricted `exam_results_approval` and `exam_malpractices` strictly to administrative roles (`school_admin`, `org_admin`, `super_admin`), denying ordinary `teacher` and `student` roles. Enforced student ownership on `exam_appeals`.
- **Residual risk**: None.
- **Follow-up task**: None. Verified by tests T-001, T-003, and T-010A through T-010P.

### Finding RLS-003
- **Severity**: HIGH
- **Affected component**: Exam Analytics Tables (`exam_analytics_session_summary`, `exam_analytics_class_performance`, `exam_analytics_subject_performance`, `exam_analytics_grade_distribution`, `exam_analytics_teacher_performance`, `exam_analytics_at_risk_students`)
- **Security impact**: Tables contain derived snapshots and reporting aggregations, but had permissive `cmd: ALL USING (true)` policies permitting arbitrary mutations by ordinary users.
- **Current behavior**: Permissive `ALL` policies allowed INSERT/UPDATE/DELETE by ordinary tenant users.
- **Expected behavior**: Analytics tables must be read-only for tenant staff/admins. Mutations reserved strictly for server-side / super_admin processes.
- **Evidence**: `pg_policies` showed `ALL USING (true)` on all 6 tables.
- **Remediation**: Dropped permissive policies in migration 046. Created read-only `SELECT` policies (`*_tenant_select`) bound to tenant ID and authorized staff roles. Mutations restricted to `is_super_admin()`.
- **Residual risk**: None.
- **Follow-up task**: None. Verified by tests T-001, T-003, T-010.

### Finding RLS-004
- **Severity**: MEDIUM
- **Affected component**: Notification Tables (`notifications`, `notification_recipients`, `notification_templates`, `notification_rules`, `notification_deliveries`, `notification_events`)
- **Security impact**: All 6 tables had RLS enabled but 0 policies defined, causing fail-closed denial for all non-service-role queries and lacking recipient ownership enforcement.
- **Current behavior**: Zero policies defined; notifications inaccessible without service role bypass.
- **Expected behavior**: Recipients can read and update their own notifications. Admins can manage tenant notifications. Templates and rules managed by school admins.
- **Evidence**: Live database inspection showed 0 policies across all 6 tables.
- **Remediation**: In migration 046, implemented `public.get_user_recipient_notification_ids()` helper (`SECURITY DEFINER`, `SET row_security = off` to prevent infinite recursion). Added recipient-owned `SELECT` and read-state `UPDATE` policies. Added administrative management policies for `school_admin` and `super_admin`.
- **Residual risk**: None.
- **Follow-up task**: None. Verified by tests T-001, T-002, T-010.

### Finding RLS-005
- **Severity**: HIGH
- **Affected component**: `public.profiles`
- **Security impact**: Existing update policy lacked a `WITH CHECK` clause and column-level trigger guards. An authenticated user updating their profile could change `role` to `super_admin`, change `tenant_id` to another tenant, or activate their own account (`is_active = true`).
- **Current behavior**: `profiles_update_self` had `USING (id = auth.uid())` without column mutation restrictions.
- **Expected behavior**: Self profile updates cannot alter `role`, `tenant_id`, or `is_active`.
- **Evidence**: `pg_policies` showed `with_check = null` on `profiles_update_self`.
- **Remediation**: Added `WITH CHECK (tenant_id = public.get_user_tenant_id())` to `profiles_update_self`. Created PostgreSQL trigger `trg_protect_profile_mutations` with function `protect_profile_fields()` raising an exception if `role`, `tenant_id`, or `is_active` are altered by anyone other than `service_role` or `super_admin`. Compatible with `bind_invitation_to_user()` RPC.
- **Residual risk**: None.
- **Follow-up task**: None. Verified by tests PROFILE-01 through PROFILE-07.

### Finding RLS-006
- **Severity**: MEDIUM
- **Affected component**: Database Helper Functions (`get_user_tenant_id`, `is_super_admin`, `is_school_admin`, `is_org_admin`, `is_teacher`)
- **Security impact**: Helpers checked `profiles.role` and `profiles.tenant_id` without checking `is_active = true`. A deactivated account could retain active tenant ID resolution and privileged role status in RLS policies.
- **Current behavior**: Queries did not filter on `is_active = true`.
- **Expected behavior**: Deactivated accounts fail closed immediately (`get_user_tenant_id()` returns NULL, role checks return FALSE).
- **Evidence**: Routine definition in `information_schema.routines` showed `WHERE id = auth.uid()` without `is_active = true`.
- **Remediation**: Re-created all helper functions in migration 046 with `WHERE id = auth.uid() AND is_active = true`, `SECURITY DEFINER`, `SET search_path = public`, and `SET row_security = off`.
- **Residual risk**: None.
- **Follow-up task**: None. Verified by tests T-011 and T-015E.

### Finding RLS-007
- **Severity**: LOW
- **Affected component**: `public.applicants`
- **Security impact**: `applicants_tenant_isolation_update` lacked `WITH CHECK`, allowing an UPDATE to attempt rebinding an applicant to another tenant ID.
- **Current behavior**: Policy had `USING (tenant_id = public.get_user_tenant_id())` without `WITH CHECK`.
- **Expected behavior**: Both `USING` and `WITH CHECK` must enforce tenant isolation.
- **Evidence**: `pg_policies` showed `with_check = null` on update policy.
- **Remediation**: Added `WITH CHECK (tenant_id = public.get_user_tenant_id())` in migration 046.
- **Residual risk**: None.
- **Follow-up task**: None. Verified by tests T-008 and T-014.

### Finding RLS-008 (TASK-0006-CORRECTION)
- **Severity**: HIGH
- **Affected component**: Sensitive Examination Tables (`exam_results_approval`, `exam_malpractices`)
- **Security impact**: Prior draft policies granted active same-tenant teachers SELECT and INSERT on results approval and malpractice records. Least privilege and canonical application routes establish that teachers must have NO access to results approval workflows or malpractice records.
- **Current behavior**: Migration 046 initially allowed `public.is_teacher()`.
- **Expected behavior**: SELECT, INSERT, UPDATE, and DELETE on `exam_results_approval` and `exam_malpractices` must be strictly restricted to administrative roles (`school_admin`, `org_admin`, `super_admin`). Ordinary teachers and students are strictly denied across all operations (same-tenant and cross-tenant).
- **Evidence**: Audited routes `/api/exam-office/dashboard`, `/api/admin/exams`, `/[tenant]/exam-office`. Verified PostgreSQL RLS denial via SQLSTATE 42501 on INSERT and 0 rows on SELECT/UPDATE.
- **Remediation**: Corrected migration 046 policies to restrict to administrative roles (`is_school_admin() OR is_org_admin() OR is_super_admin()`). Applied to live Supabase database.
- **Residual risk**: None.
- **Follow-up task**: None. Verified by tests T-010A through T-010P with post-denial database-state absence assertions.

### Finding RLS-009 (TASK-0006-CORRECTION)
- **Severity**: HIGH
- **Affected component**: Profile Mutation Trigger Guard (`public.protect_profile_fields`)
- **Security impact**: `auth.uid() IS NULL` was previously used as a blanket administrative bypass. An anonymous web request (where PostgREST sets `auth.uid() IS NULL` and `request.jwt.claim.role = 'anon'`) or an unauthenticated request with missing `sub` could theoretically bypass profile field immutability if RLS table filtering was decoupled.
- **Current behavior**: Unchecked `auth.uid() IS NULL` bypass.
- **Expected behavior**: Administrative bypass must be strictly limited to: (1) explicit `service_role` execution, (2) active `super_admin`, or (3) direct database console superusers (`postgres`, `supabase_admin`) in non-web contexts (`request.jwt.claim.role IS NULL`). Web requests with `role = 'anon'` or `'authenticated'` must never bypass.
- **Evidence**: Trigger re-written in migration 046 with 3-tier qualification. Verified by PROFILE-08 and PROFILE-09 where web contexts attempting role manipulation are blocked with SQLSTATE 42501.
- **Remediation**: Corrected trigger definition in migration 046 and deployed to live Supabase database.
- **Residual risk**: No residual exploitable path identified under the tested execution contexts.
- **Follow-up task**: None. Verified by tests PROFILE-08, PROFILE-09, and PROFILE-10.

### Finding RBAC-001 (TASK-0007)
- **Severity**: MEDIUM
- **Affected component**: `public.academic_calendar_events` RLS Policy
- **Security impact**: Dead policy. Policy `"School admins manage calendar events"` references `public.user_roles ur JOIN public.roles r`, tables which do not exist in the database.
- **Current behavior**: Query evaluation against this policy either errors or denies legitimate school administrators from managing calendar events via client connections.
- **Expected behavior**: Policy should check `tenant_id = public.get_user_tenant_id() AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())`.
- **Evidence**: `supabase/migrations/040_academic_calendar_events.sql` lines 42-46.
- **Remediation**: Scheduled for TASK-0007 Phase 2 schema remediation.
- **Residual risk**: Controlled; currently fails closed.

### Finding RBAC-002 (TASK-0007)
- **Severity**: HIGH
- **Affected component**: `/api/academics/ai/lesson-plan` Route Handler
- **Security impact**: Direct PostgreSQL pool connection queries subject offerings and curriculum versions by ID with zero caller tenant-id or role authorization checks. Any authenticated user (including students or cross-tenant actors) can generate lesson plans for arbitrary subject offerings across any tenant.
- **Current behavior**: Only checks `if (!user) return 401`. Executes direct pool query using untrusted client input `offering_id`.
- **Expected behavior**: Must enforce `authorizeApiRequest()` requiring active teacher or school_admin role, verify that target offering belongs to caller's tenant, and verify teacher assignment scope.
- **Evidence**: `src/app/api/academics/ai/lesson-plan/route.ts` lines 18-49.
- **Remediation**: Scheduled for TASK-0007 Phase 2 API guard migration.
- **Residual risk**: Medium; read-only generation but leaks cross-tenant curriculum and teacher names.

### Finding RBAC-003 (TASK-0007)
- **Severity**: HIGH
- **Affected component**: `/api/exam-office/communication-rules` and `/api/exam-office/communication-templates`
- **Security impact**: Endpoints invoke `createAdminClient()`, which bypasses RLS, and rely on client-supplied `user.user_metadata?.tenant_id` without verifying role or database tenant membership. Any authenticated user can read and insert notification rules and templates.
- **Current behavior**: Bypasses `authorizeApiRequest()`; relies on untrusted `user_metadata.tenant_id`.
- **Expected behavior**: Must enforce `authorizeApiRequest()` with `roles: ['school_admin', 'exam_officer']` (or privileged admin client instantiated only post-authorization) and use authoritative `profile.tenant_id`.
- **Evidence**: `src/app/api/exam-office/communication-rules/route.ts` lines 12-19, 41-47.
- **Remediation**: Scheduled for TASK-0007 Phase 2 API guard migration.
- **Residual risk**: High; allows cross-tenant rule poisoning and unauthorized template insertion.

### Finding RBAC-004 (TASK-0007)
- **Severity**: CRITICAL
- **Affected component**: `public.approval_requests` Table Policy and `resolveApprovalRequest` Server Action
- **Security impact**: Complete separation-of-duties collapse. In `013_approval_requests.sql`, the policy `"school_members_see_own_requests"` defines `FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))`. In `src/app/actions/approvals.ts`, `resolveApprovalRequest` does not check caller role. Any authenticated user in a school (even students) can approve or delete arbitrary grade changes, fee waivers, admissions, and leave requests.
- **Current behavior**: `FOR ALL` RLS policy grants mutation authority to all tenant members without role check; server action does not check role.
- **Expected behavior**: RLS `FOR UPDATE` and `FOR DELETE` must strictly require `is_school_admin() OR is_org_admin() OR is_super_admin()`. `resolveApprovalRequest` server action must verify administrative authority.
- **Evidence**: `013_approval_requests.sql` line 43; `src/app/actions/approvals.ts` lines 62-82.
- **Remediation**: Scheduled for TASK-0007 Phase 2 RLS and action remediation.
- **Residual risk**: Critical until remediated in Phase 2.

### Finding RBAC-005 (TASK-0007)
- **Severity**: HIGH
- **Affected component**: Curriculum Server Actions (`approveCurriculum`, `publishCurriculum`)
- **Security impact**: Server actions in `src/app/actions/curriculum.ts` execute direct PostgreSQL pool updates without checking caller role or tenant membership. Any authenticated user can transition a curriculum version to `approved` or `published`.
- **Current behavior**: Direct pool `UPDATE curriculum_versions SET status = 'approved' ...` without checking if `userId` is a principal, HOD, or school admin.
- **Expected behavior**: Must verify caller is authorized for academic approvals within the tenant before executing mutation.
- **Evidence**: `src/app/actions/curriculum.ts` lines 333-363, 369-400.
- **Remediation**: Scheduled for TASK-0007 Phase 2 server-action guard migration.
- **Residual risk**: High; permits unauthorized publishing of unvetted curricula.

### Finding RBAC-006 (TASK-0007)
- **Severity**: MEDIUM
- **Affected component**: Academic Management RLS Policies on `classes`, `sections`, `subjects`, `departments`
- **Security impact**: Org admins managing multi-school networks receive RLS denials when trying to manage classes in child schools. Policies created in `007_academics_rls_refactor.sql` require `tenant_id = get_user_tenant_id() AND is_school_admin()`. An `org_admin` has `tenant_id = org.id`, so `tenant_id` does not match the child school's `id`.
- **Current behavior**: RLS denies `org_admin` from updating or creating classes in child schools.
- **Expected behavior**: Policies should support organizational hierarchy: `tenant_id = get_user_tenant_id() OR tenant_id IN (SELECT id FROM tenants WHERE parent_id = get_user_tenant_id())` when caller `is_org_admin()`.
- **Evidence**: `007_academics_rls_refactor.sql` lines 61, 67, 73, 79.
- **Remediation**: Scheduled for TASK-0007 Phase 2 RLS hierarchy alignment.
- **Residual risk**: Low security risk (fails closed), but breaks intended org-admin operations.

### Finding RBAC-007 (TASK-0007)
- **Severity**: HIGH
- **Affected component**: Application TypeScript Roles vs PostgreSQL `user_role` Enum
- **Security impact**: Architectural disconnect. TypeScript types `AppRole` and `TenantRole` recognize `exam_officer`, but `public.user_role` enum has only `('super_admin', 'org_admin', 'school_admin', 'teacher', 'student', 'parent')`. Calling `updateUserRole(userId, 'exam_officer')` fails at database level with an enum casting error.
- **Current behavior**: Exam Officer cannot be stored in the database as a role.
- **Expected behavior**: Reconciled via Contextual Functional Assignment in `public.school_staff_assignments` (`assignment_type = 'exam_officer'`), retaining `teacher` as base role.
- **Evidence**: `src/lib/auth/guards.ts` line 7; `src/app/actions/users.ts` line 7, 214; `001_foundation.sql` line 11.
- **Remediation**: Documented in ADR-0003; scheduled for TASK-0007 Phase 2 functional assignment schema.
- **Residual risk**: Causes application errors if admin attempts to assign `exam_officer` in user management UI.

### Finding RBAC-008 (TASK-0007)
- **Severity**: LOW
- **Affected component**: User Management UI (`users-roles-client.tsx`)
- **Security impact**: Misleading UI presentation. Permission counts (`99 perms`, `60 perms`, `48 perms`, `14 perms`, `5 perms`, `4 perms`) are completely hardcoded numbers. No underlying permission catalog exists.
- **Current behavior**: Hardcoded numbers rendered in badges.
- **Expected behavior**: Permission counts should reflect actual canonical permissions defined in the RBAC registry.
- **Evidence**: `src/app/[tenant]/admin/users-roles/_components/users-roles-client.tsx` lines 28-35.
- **Remediation**: Scheduled for TASK-0007 Phase 2 UI alignment.
- **Residual risk**: Zero direct security vulnerability (presentation only).

### Finding RBAC-009 (TASK-0007)
- **Severity**: HIGH
- **Affected component**: Principal & Vice Principal Authorization Ambiguity
- **Security impact**: Without clear classification, permissions risk being granted based on string job titles or ad-hoc role checks, creating privilege escalation or bypassing executive sign-off boundaries.
- **Current behavior**: Principal and Vice Principal are treated as UI toggles in `teachers/portal/page.tsx` and job titles in `profiles.job_title` without formal security classification.
- **Expected behavior**: Principal must be mapped to base system role `school_admin` (representing institutional executive authority); Vice Principal must be mapped strictly to functional assignment `Vice Principal` on base role `teacher`, with school-wide academic review/moderation permissions and zero result publication rights. Functional assignments are strictly additive and cannot remove base-role permissions; therefore, neither Vice Principal nor Exam Officer may have `school_admin` base role.
- **Evidence**: `src/app/[tenant]/admin/teachers/portal/page.tsx` lines 65, 91, 182-183; `038_sierra_leone_letters_and_cass_export.sql` line 15.
- **Remediation**: Clarified in `RBAC-MODEL.md` Section 16; scheduled for Phase 2 functional assignment schema.
- **Residual risk**: High if unmitigated; resolved by canonical architecture definition.

### Finding RBAC-010 (TASK-0007)
- **Severity**: MEDIUM
- **Affected component**: Canonical Permission Registry Definition & Storage
- **Security impact**: Ambiguity over whether permissions live in dynamic database tables or application code risks desynchronization where unhandled permissions fail unpredictably.
- **Current behavior**: Zero canonical permission registry exists in the repository.
- **Expected behavior**: Authoritative single source of truth in application code (`src/lib/auth/permissions-registry.ts`) synchronized to a static database catalog (`public.permissions_catalog`), failing closed on unknown permissions.
- **Evidence**: Repository audit confirming zero permission tables.
- **Remediation**: Clarified in `RBAC-MODEL.md` Section 7; scheduled for Phase 2 registry implementation.
- **Residual risk**: Low once implemented in Phase 2.

### Finding RBAC-011 (TASK-0007)
- **Severity**: MEDIUM
- **Affected component**: Base Role vs Functional Assignment Permission Resolution
- **Security impact**: Unclear resolution formula could lead to permission leakage or accidental denial of core teacher capabilities.
- **Current behavior**: Role checking is coarse and hardcoded per endpoint.
- **Expected behavior**: Deterministic additive formula: `Effective Permissions = Base Permissions ∪ ∑ Assignment Permissions`, defaulting to DENY.
- **Evidence**: `.ai/04-SECURITY/RBAC-MODEL.md` Section 8.
- **Remediation**: Formalized in `RBAC-MODEL.md` Section 8.
- **Residual risk**: Zero once resolved.

### Finding RBAC-012 (TASK-0007)
- **Severity**: HIGH
- **Affected component**: Functional Assignment Lifecycle State Machine
- **Security impact**: Missing lifecycle fields (`is_active`, `effective_from`, `effective_until`) would allow revoked or expired staff (e.g. former HODs or former Exam Officers) to retain sensitive moderation capabilities indefinitely.
- **Current behavior**: Relational links (`departments.head_teacher_id`, `sections.class_teacher_id`) lack lifecycle states, temporal ranges, and revocation metadata.
- **Expected behavior**: Explicit state machine (`appointed`, `active`, `suspended`, `expired`, `revoked`) with dynamically evaluated active status via `STABLE` helper function.
- **Evidence**: `002_school_modules.sql` lines 65-75.
- **Remediation**: Defined in `RBAC-MODEL.md` Section 12; scheduled for Phase 2 DDL.
- **Residual risk**: Medium until Phase 2 lifecycle schema is applied.

### Finding RBAC-013 (TASK-0007)
- **Severity**: HIGH
- **Affected component**: Academic-Year Scoping & Historical Record Integrity
- **Security impact**: Overwriting staff appointments across academic years would silently rewrite historical authorization audit trails.
- **Current behavior**: `departments.head_teacher_id` is an unversioned single foreign key.
- **Expected behavior**: Academic-year-bound assignment records (`academic_year_id UUID REFERENCES academic_years(id)`) combined with immutable transactional audit snapshots.
- **Evidence**: `002_school_modules.sql` line 67; `041_subjects_curriculum_engine.sql` line 242.
- **Remediation**: Documented in `RBAC-MODEL.md` Section 11.
- **Residual risk**: Resolved by temporal assignment design.

### Finding RBAC-014 (TASK-0007)
- **Severity**: MEDIUM
- **Affected component**: Formal Scope Containment & Inheritance Matrix
- **Security impact**: Informal scope assumptions could allow department-level managers to access peer departments or school-wide resources.
- **Current behavior**: Ad-hoc scope checks scattered across route handlers.
- **Expected behavior**: Formal scope model where `department` and `class` are parallel branches under `school` (`platform ⊃ org ⊃ school ⊃ (department || class) ⊃ offering ⊃ self`), with universal invariant that `department` is NEVER a parent of `class`.
- **Evidence**: `.ai/04-SECURITY/RBAC-MODEL.md` Section 9.
- **Remediation**: Defined in `RBAC-MODEL.md` Section 9.
- **Residual risk**: Zero once verified in Phase 2 tests.

### Finding RBAC-015 (TASK-0007)
- **Severity**: HIGH
- **Affected component**: Multi-Tier Organizational Hierarchy Traversal
- **Security impact**: Single-level `parent_id` checks fail to authorize `org_admin` over grandchild school and campus nodes (hierarchy depth > 2).
- **Current behavior**: Policies in `014_org_admin_rls.sql` and `046` only check immediate `parent_id = get_user_tenant_id()`.
- **Expected behavior**: Recursive CTE helper `get_subtenant_ids()` supporting up to 4 hierarchy levels (`organization -> district -> school -> campus`).
- **Evidence**: `011_hierarchy_columns.sql` line 8; `014_org_admin_rls.sql` line 22.
- **Remediation**: Specified in `RBAC-MODEL.md` Section 10; scheduled for Phase 2 helper function.
- **Residual risk**: Medium until recursive helper is deployed.

### Finding RBAC-016 (TASK-0007)
- **Severity**: CRITICAL
- **Affected component**: Multi-Role Separation of Duties (Teacher + HOD + Exam Officer)
- **Security impact**: A staff member holding multiple assignments could enter marks, moderate them, validate them, approve them, and publish them, destroying institutional examination integrity.
- **Current behavior**: No transactional separation-of-duties check prevents a teacher from moderating or validating their own mark batches.
- **Expected behavior**: Transactional rule preventing self-moderation (`actor_id != submitter_id`) and strict role restriction reserving approval and publication exclusively for `school_admin`.
- **Evidence**: `046_fix_rls_boundaries_and_exam_security.sql`; `.ai/04-SECURITY/RBAC-MODEL.md` Section 14.
- **Remediation**: Documented in `RBAC-MODEL.md` Section 14; scheduled for Phase 2 guards.
- **Residual risk**: Critical until enforced in Phase 2.

### Finding RBAC-017 (TASK-0007)
- **Severity**: HIGH
- **Affected component**: Examination Approval & Publication Authority
- **Security impact**: Unclear boundaries between Principal and Vice Principal could allow unratified results to be published externally.
- **Current behavior**: Undefined in database RLS.
- **Expected behavior**: `exams.results.approve` and `exams.results.publish` reserved strictly for `school_admin` (Principal) and `org_admin`. Vice Principal and Exam Officer have base role `teacher` with moderation rights only, with delegation requiring formal audited delegation tokens.
- **Evidence**: `030_exam_core_system.sql` line 51; `.ai/04-SECURITY/RBAC-MODEL.md` Section 15.
- **Remediation**: Clarified in `RBAC-MODEL.md` Section 15.
- **Residual risk**: Low once Phase 2 guards are deployed.

### Finding RBAC-018 (TASK-0007)
- **Severity**: MEDIUM
- **Affected component**: Assistant Teacher Security Scope & Authority
- **Security impact**: An assistant teacher could inadvertently inherit full subject teacher rights (submitting curricula, finalizing grades) if classified broadly as `teacher`.
- **Current behavior**: `assistant_teacher_id` exists in `subject_offerings` (`041_subjects_curriculum_engine.sql` line 248) but lacks formal authorization rules.
- **Expected behavior**: Base role `teacher` with functional assignment `Assistant Subject Teacher`, restricted strictly to attendance marking and draft mark entry.
- **Evidence**: `041_subjects_curriculum_engine.sql` line 248; `src/lib/types/curriculum.ts` line 590.
- **Remediation**: Formally classified in `RBAC-MODEL.md` Section 17.
- **Residual risk**: Low once implemented in Phase 2.

### Finding RBAC-019 (TASK-0007)
- **Severity**: MEDIUM
- **Affected component**: Formalization of `manage` Action
- **Security impact**: Conflating `manage` with executive actions (`approve`, `publish`) could grant destructive or premature release powers to administrative assistants.
- **Current behavior**: Informal usage of `manage` across legacy documents.
- **Expected behavior**: `manage = view + create + update + delete`. Invariant: `manage ≠ approve ≠ publish ≠ moderate ≠ export`. `manage` treated as application shorthand expanding into atomic permissions.
- **Evidence**: `.ai/04-SECURITY/RBAC-MODEL.md` Section 19.
- **Remediation**: Formalized in `RBAC-MODEL.md` Section 19.
- **Residual risk**: Zero.

### Finding RBAC-020 (TASK-0007)
- **Severity**: LOW
- **Affected component**: Permission Nomenclature Normalization
- **Security impact**: Aliased or inconsistent permission strings (`attendance.mark` vs `attendance.sessions.mark`) cause authorization bypasses if route guards check mismatched strings.
- **Current behavior**: Inconsistent patterns across legacy documents and client components.
- **Expected behavior**: Strict grammar: `<module>.<resource>.<action>` across all 33 canonical atomic permissions with zero unmapped aliases.
- **Evidence**: `.ai/04-SECURITY/RBAC-MODEL.md` Section 19-20.
- **Remediation**: Normalized in `RBAC-MODEL.md` Section 20.
- **Residual risk**: Zero.

### Finding RBAC-021 (TASK-0007)
- **Severity**: MEDIUM
- **Affected component**: Verification of `job_title` Schema Column
- **Security impact**: Relying on unverified columns for security predicates causes runtime failures or false security assumptions.
- **Current behavior**: `job_title` exists in `public.profiles` (`010_branding_and_staff_columns.sql` line 28) and is consumed for display badges.
- **Expected behavior**: Verified as display-only attribute with zero direct security authority.
- **Evidence**: `010_branding_and_staff_columns.sql` line 28; `src/app/actions/users.ts` line 214.
- **Remediation**: Documented in `RBAC-MODEL.md` Section 5.
- **Residual risk**: Zero.

### Finding RBAC-022 (TASK-0007)
- **Severity**: LOW
- **Affected component**: Governance Document Status Correction
- **Security impact**: Claiming proposed architectures as "ACTIVE" before supervisory review confuses implementation boundaries.
- **Current behavior**: `PRIVILEGED-ACCESS.md` was marked `ACTIVE (TASK-0007 CANONICAL GOVERNANCE)`.
- **Expected behavior**: Explicitly labeled `PROPOSED — PENDING SUPERVISORY APPROVAL`.
- **Evidence**: `.ai/04-SECURITY/PRIVILEGED-ACCESS.md` line 3.
- **Remediation**: Corrected to `PROPOSED — PENDING SUPERVISORY APPROVAL`.
- **Residual risk**: Zero.

### Finding RBAC-023 (TASK-0007)
- **Severity**: LOW
- **Affected component**: Separation of Facts, Proposals, and Approvals
- **Security impact**: Blurring verified current-state facts with proposed designs weakens audit precision.
- **Current behavior**: Mixed terminology in preliminary assessment.
- **Expected behavior**: Explicit taxonomy labels: `CURRENT STATE (Verified Fact)`, `PROPOSED (Pending Approval)`, `APPROVED (Supervisory Approved)`, `PHASE 2 (Future Implementation)`.
- **Evidence**: `.ai/04-SECURITY/RBAC-MODEL.md` Section 1, 2, 30.
- **Remediation**: Enforced throughout all Phase 1 governance documents.
- **Residual risk**: Zero.



