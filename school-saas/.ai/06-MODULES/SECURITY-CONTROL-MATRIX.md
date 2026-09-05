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
- **Remediation**: Enabled RLS on all 5 tables in migration 046. Dropped wildcard policies. Created table-specific role and ownership policies. Restricted `exam_results_approval` and `exam_malpractices` to privileged exam roles (`school_admin`, `exam_officer`, `super_admin`). Enforced student ownership on `exam_appeals`.
- **Residual risk**: None.
- **Follow-up task**: None. Verified by tests T-001, T-003, T-010.

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
