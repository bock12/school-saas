# Canonical Role-Based Access Control (RBAC) & Permission Architecture
## Comprehensive Architecture Specification

- **Document Status:** PROPOSED — PENDING FINAL SUPERVISORY REVIEW (TASK-0007 PHASE 1 FINAL CORRECTION)
- **Parent Program:** AI-EOS Security & Architecture Hardening
- **Phase:** Phase 1 — Architecture & Discovery (Final Correction)
- **Phase 2 Implementation:** STRICTLY NOT AUTHORIZED
- **Supervisory Authority:** ChatGPT (Chief Software Architect) / Human Project Owner
- **Implementation Engineer:** Gemini / Antigravity
- **Date:** 2026-09-06
- **Target Repository:** `bock12/school-saas`

---

## 1. Current-State Findings (CURRENT STATE — Verified Repository Facts)

Empirical investigation across 49 SQL migrations, route handlers, server actions, client navigation bars, and UI components confirmed the following current-state facts:
1. **Database Role Enum (`public.user_role`):** Contains exactly 6 values: `'super_admin'`, `'org_admin'`, `'school_admin'`, `'teacher'`, `'student'`, `'parent'`. Defined in `001_foundation.sql` (line 11) and unmodified across all 49 migrations.
2. **Absence of Database Permission Tables:** Zero permission tables (`permissions`, `role_permissions`, `user_permissions`, `user_roles`, `roles`) exist in PostgreSQL.
3. **The Migration 040 Dead Policy Query (`RBAC-001`):** `040_academic_calendar_events.sql` references non-existent tables `public.user_roles ur JOIN public.roles r`. The policy fails closed.
4. **The `exam_officer` Disconnect (`RBAC-007`):** TypeScript interfaces (`AppRole`, `TenantRole`, `users.ts`) recognize `exam_officer`, but updating a profile role to `'exam_officer'` crashes in PostgreSQL with an invalid enum casting error.
5. **Existing Relational Assignments:** Academic responsibilities are already partially modeled relationally:
   - Head of Department (HOD): `departments.head_teacher_id` (`002_school_modules.sql`).
   - Form Master / Class Teacher: `sections.class_teacher_id` (`002_school_modules.sql`).
   - Subject Teacher: `subject_offerings.teacher_id` (`041_subjects_curriculum_engine.sql`) and `teacher_assignments`.
   - Assistant Teacher: `subject_offerings.assistant_teacher_id` (`041_subjects_curriculum_engine.sql`).
6. **Separation-of-Duties Collapse on Approvals (`RBAC-004`):** `013_approval_requests.sql` has a wildcard `FOR ALL` policy for all tenant users, and `resolveApprovalRequest` in `src/app/actions/approvals.ts` lacks caller role checks.
7. **`job_title` Column Status (`RBAC-021`):** `public.profiles.job_title` exists as a TEXT column added in `010_branding_and_staff_columns.sql`. It is consumed exclusively for display badges and staff ID cards, with zero direct security authority.
8. **Tenant Hierarchy (`RBAC-015`):** `public.tenants` contains `parent_id` and `type` (`organization`, `district`, `school`, `campus`), but academic RLS policies enforce single-tenant equality without evaluating hierarchy. The database does NOT enforce depth limits or valid parent-child type combinations.

---

## 2. Architectural Principles (PROPOSED)

1. **Evidence-Based Security:** Every authorization rule must be grounded in verified schema relations and server-authoritative state.
2. **Contextual Functional Assignment Architecture:** Base roles remain coarse, immutable, and minimal; specialized operational capabilities are granted via relational functional appointments.
3. **Strict Separation of Concerns:**
   - Base System Role $\neq$ Functional Assignment $\neq$ Job Title $\neq$ Permission $\neq$ Resource Scope.
4. **Deterministic Evaluation:** Authorization is evaluated via a deterministic 8-step precedence order defaulting to `DENY`.
5. **Least Privilege & Fail-Closed:** Absence of an explicit grant results in immediate denial. Deactivated accounts (`is_active = false`) fail closed across all layers.
6. **Tenant Isolation Invariant:** Tenant boundaries supersede all role permissions. A user possessing an administrative permission in School A has zero rights in School B.
7. **Strict Additivity Invariant:** Functional assignments ADD permissions to a base role; they can NEVER remove or subtract permissions already granted by a base role.

---

## 3. Base Role Model (CURRENT STATE / PROPOSED)

The canonical database enum `public.user_role` remains immutable with **6 base system roles**:

```sql
CREATE TYPE public.user_role AS ENUM (
    'super_admin',
    'org_admin',
    'school_admin',
    'teacher',
    'student',
    'parent'
);
```

### Clarification on `school_admin` Authority (`BLOCKER 2`)
- **`school_admin` is an administrative security role, not a human job-title taxonomy.**
- In SchoolSaaS, `school_admin` represents **institutional executive authority** (the Principal / Headmaster level).
- Bursars, registrars, and administrative clerks do NOT automatically receive `school_admin` base role. If limited administrative positions are required in the future, they must be represented through dedicated functional assignments or scoped permissions in a separate task.
- **Invariant:** `job_title` NEVER grants security authority.

| Base Role | Scope Authority | Intended Population | Multi-School Access | Governance Model |
|---|---|---|---|---|
| `super_admin` | Platform-wide | Platform operations & engineering | Yes (Global) | Server-only, strictly audited, MFA required |
| `org_admin` | Multi-school network | Trust executives, diocesan boards, foundation directors | Yes (Child schools of parent tenant) | Provisioning, cross-school analytics, governance |
| `school_admin` | Single school | Institutional executive (Principal / Headmaster) | No (Own school tenant only) | Full institutional executive operations within tenant |
| `teacher` | Academic & classes | Certified teachers, instructors, academic specialists | No (Own school tenant only) | Classroom instruction, attendance, marking |
| `student` | Self | Enrolled pupils, learners | No (Own school tenant only) | Learning materials, attendance, grades |
| `parent` | Children | Parents, legal guardians, financial sponsors | No (Own school tenant only) | Child progress, fees, communications |

---

## 4. Functional Assignment Model (PROPOSED)

Functional assignments represent contextual appointments within an educational institution granting operational capabilities over specific resources without altering the user's base role.

```text
User (auth.users)
   ↓
Tenant Membership (public.profiles.tenant_id + active status)
   ↓
Base System Role (public.profiles.role: super_admin, org_admin, school_admin, teacher, student, parent)
   +
Functional Assignment(s) (HOD, Form Master, Subject Teacher, Assistant Teacher, Exam Officer, Vice Principal)
   ↓
Effective Permissions (<module>.<resource>.<action>)
   ↓
Resource Scope (platform | org | school | department | class | offering | self)
   ↓
Deterministic Authorization Decision (ALLOW / DENY)
```

---

## 5. Job Title Model (CURRENT STATE / PROPOSED)

- **Definition:** An informational, human-readable designation for administrative directories, staff lists, and ID cards.
- **Database Storage:** `public.profiles.job_title` (TEXT, nullable, added in `010_branding_and_staff_columns.sql`).
- **Verified Consumers:** `users-roles-client.tsx`, `org-staff/page.tsx`, `id-card-modal.tsx`.
- **Absolute Rule:** **Job titles have ZERO direct security authority.** Code must NEVER execute predicates such as `if (user.job_title === 'Principal')`.

---

## 6. Permission Model (PROPOSED)

A permission is a fine-grained capability to perform an atomic action on a specific resource type within an evaluated scope.
- Grammar: `<module>.<resource>.<action>`
- Permissions are strictly **atomic** and non-overlapping.
- There are no wildcard, negative, or subtractive permissions.

---

## 7. Canonical Permission Registry (PROPOSED)

The **Canonical Permission Registry** is the authoritative specification of platform capabilities.

1. **Authoritative Location:** Application Code / TypeScript (`src/lib/auth/permissions-registry.ts`) as the Single Source of Truth, defining all permissions, descriptions, allowed roles, and default scopes.
2. **Hybrid Design Rationale:** Software permissions represent hardcoded code execution paths; defining them exclusively as dynamic database rows leads to unhandled runtime states. Storing the catalog in code with schema validation provides compile-time safety, while synchronizing to a static lookup table (`public.permissions_catalog` in Phase 2) allows PostgreSQL RLS policies to query permissions declaratively.
3. **Versioning:** Permissions are versioned through code releases and schema migrations. Deprecated permissions are marked with sunset warnings.
4. **Mutation Authority:** Platform engineering only via Git pull requests and migrations. Tenant administrators cannot invent permissions.
5. **Consumption Across Layers:**
   - **RLS Policies:** Consume permissions via SQL function `public.has_permission(auth.uid(), 'exams.results.approve', target_tenant_id)`.
   - **API Guards:** Consume via `authorizeApiRequest(req, { permission: 'exams.results.moderate' })`.
   - **Server Actions:** Consume via `authorizeAction('curriculum.version.review', { departmentId })`.
   - **Frontend:** Consumes via `const { can } = usePermissions(); if (can('curriculum.version.publish')) ...`.
6. **Unknown Permission Handling:** **FAIL-CLOSED (DENY).** Throws an authorization exception and emits an audit event (`UNKNOWN_PERMISSION_REQUESTED`).

---

## 8. Permission Resolution Algorithm & Precedence Order (PROPOSED — `BLOCKER 8`)

### Deterministic Conflict & Precedence Evaluation Order
Evaluation proceeds strictly in this order; any failure halts evaluation immediately with `DENY`:

```text
1. Authentication Check:
   Is auth.uid() valid and verified?
   NO → DENY (401 Unauthorized)

2. Account Status Check:
   Is profiles.is_active = true?
   NO → DENY (403 Forbidden / Deactivated)

3. Tenant Boundary Check:
   Does caller's tenant match or cover target resource tenant?
   (A broader role NEVER overrides a tenant boundary)
   NO → DENY (403 Forbidden / Cross-Tenant Denial)

4. Permission Grant Check:
   Does caller hold required permission via Base Role OR Active Functional Assignment?
   (Effective Permissions = Base Permissions ∪ Active Assignment Permissions)
   NO → DENY (403 Forbidden / Insufficient Privilege)

5. Scope Containment Check:
   Does caller's grant scope contain the target resource?
   NO → DENY (403 Forbidden / Out of Scope)

6. Ownership / Relationship Check:
   For self/student/parent scopes, does verified relationship exist?
   NO → DENY (404 Not Found / 403 Forbidden)

7. Separation-of-Duties (SoD) Check:
   Does action violate workflow independence (e.g. self-moderation actor_id == submitter_id)?
   (A permission grant NEVER overrides an SoD constraint)
   YES → DENY (403 Forbidden / SoD Violation)

8. All Checks Passed:
   RETURN ALLOW
```

### Core Invariants
- **Broader roles do NOT override tenant boundaries.**
- **Permission grants do NOT override separation-of-duties constraints.**
- **Functional assignments ADD permissions; they NEVER subtract base-role permissions.**

---

## 9. Scope Model & Resource Graph (PROPOSED — `BLOCKER 5`)

### Resource & Scope Graph
`department` and `class` (section) are **parallel branches** under a school, NOT parent-child:

```text
platform
   |
organization
   |
school
   |---------------------------------------|
department                               class (section)
   |                                       |
departmental subjects                 enrolled students / class attendance
   \                                       /
    --------> subject_offering <-----------
```

### Scope Containment vs Permission Scope
- **Scope Containment (Structural):**
  - `platform` contains all organizations and schools.
  - `organization` contains child schools (in proposed hierarchy).
  - `school` contains departments and classes.
  - `department` contains subjects and curriculum versions belonging to that department.
  - `class` contains sections, enrolled students, and class-level attendance.
  - `offering` represents the intersection of a subject (from department) and a section (from class).
- **Universal Rule:** **`department` is NEVER a parent of `class`.**
- **Permission Scope (Evaluation):**
  A permission is evaluated against one of: `platform`, `org`, `school`, `department`, `class`, `offering`, `self`.

---

## 10. Tenant Hierarchy Model (CURRENT STATE / PROPOSED — `BLOCKER 6`, `BLOCKER 7`)

1. **Current State:**
   - `public.tenants` contains `parent_id UUID REFERENCES public.tenants(id)` and `type TEXT` (`011_hierarchy_columns.sql`).
   - The database does NOT enforce hierarchy depth limits, cycle checks, or parent-child type constraints.
   - Current RLS policies enforce single-tenant equality (`tenant_id = public.get_user_tenant_id()`).
2. **Proposed Supported Business Model (Phase 2):**
   - Supports up to 4 organizational tiers:
     $$\text{organization} \longrightarrow \text{district/group} \longrightarrow \text{school} \longrightarrow \text{campus}$$
   - **School Administrative Scope:** Proposed that `school_admin` authority encompasses their school tenant and any authorized subordinate campus tenants.
3. **Phase-2 Enforcement Requirement:**
   - A future migration/service must validate tree structure (preventing cycles and invalid shapes like `school -> organization`) via database triggers and a recursive traversal function (`public.get_subtenant_ids()`).

---

## 11. Academic-Year Scoping & Temporal Model (PROPOSED)

Operational academic assignments (`Subject Teacher`, `Assistant Teacher`, `Form Master`, `HOD`, `Exam Officer`, `Vice Principal`) are time-bound:
1. **Academic Year Association:** Functional assignments must record `academic_year_id UUID NOT NULL REFERENCES public.academic_years(id)`.
2. **Historical Invariance:**
   - When Teacher A is HOD in 2025/2026 and transitions to another role in 2026/2027, two distinct assignment records exist.
   - Transactional tables (`exam_results_approval`, `curriculum_versions`, `audit_logs`) snapshot the actor UUID, timestamp, and active role at execution time.
   - Assignment changes in new academic years never alter or invalidate past audit records.

---

## 12. Functional Assignment Lifecycle (PROPOSED)

Every functional assignment follows an explicit 5-state lifecycle state machine:
- `appointed`: Created by administrator with future effective date.
- `active`: Valid for operational authorization (`effective_from <= CURRENT_DATE <= effective_until` and `is_active = true`).
- `suspended`: Temporarily disabled pending administrative review.
- `expired`: Past `effective_until` or academic year concluded.
- `revoked`: Prematurely terminated by administrator before scheduled expiration.

### Authoritative Persistence Model (Phase-2 DDL Requirement — `BLOCKER 3`)
Vice Principals, Exam Officers, and academic appointments cannot be represented solely by `profiles.job_title` because `job_title` is unconstrained display text lacking tenant binding, lifecycle states, temporal validity, and auditability.
In Phase 2, appointments will be persisted in dedicated relational tables:
- `public.school_staff_assignments` (or specific relational tables `school_exam_officers`, `school_vp_assignments`) containing:
  - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE`
  - `teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE`
  - `academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE`
  - `assignment_type TEXT NOT NULL CHECK (assignment_type IN ('vice_principal', 'exam_officer', 'hod', 'form_master'))`
  - `status public.assignment_status NOT NULL DEFAULT 'active'`
  - `appointed_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `appointed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL`
  - `effective_from DATE NOT NULL DEFAULT CURRENT_DATE`
  - `effective_until DATE`
  - `revoked_at TIMESTAMPTZ`
  - `revoked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL`
  - `revocation_reason TEXT`
  - `is_active BOOLEAN GENERATED ALWAYS AS (status = 'active' AND (effective_until IS NULL OR effective_until >= CURRENT_DATE)) STORED`

---

## 13. Composite Role Strategy (PROPOSED)

Academic staff frequently hold multiple responsibilities simultaneously (e.g. Teacher + HOD + Exam Officer).
- **Strategy:** Zero combinatorial database roles (rejecting `teacher_hod_exam_officer`).
- **Resolution:** Base role is strictly `teacher`. Individual functional assignments grant additive permissions.
- **Invariant:** Additive only. No assignment can remove permissions granted by the base role.

---

## 14. Separation of Duties (PROPOSED)

Separation of duties is enforced at the **Transaction and Workflow Level**:

### Multi-Role Staff Rule (Teacher + HOD + Exam Officer)
1. **Mark Entry:** Permitted for assigned subject offerings (`exams.results.enter`).
2. **Mark Moderation:** Permitted across department, **EXCEPT** for marks entered by the actor themselves. Enforced by transactional check: `actor_id != submitter_id`.
3. **Validation:** Exam officer validates school-wide grading curves, but cannot self-validate their own subject.
4. **Approval:** **BLOCKED.** Only `school_admin` (Principal) can approve results (`exams.results.approve`).
5. **Publication:** **BLOCKED.** Only `school_admin` (Principal) can publish results (`exams.results.publish`).

---

## 15. Approval Authority Model (PROPOSED — `BLOCKER 1`, `BLOCKER 2`)

- `exams.results.approve`: Formally certifies examination results. Held exclusively by `school_admin` (Principal) and `org_admin`.
- `exams.results.publish`: Releases results to students, parents, and public portals. Held exclusively by `school_admin` (Principal) and `org_admin`.
- **Vice Principal:**
  - Base role is strictly `teacher`.
  - Holds `curriculum.version.approve` (academic content approval) and `exams.results.moderate` (school-wide moderation).
  - **Does NOT hold `exams.results.publish` or unilateral `exams.results.approve`.**
- **Exam Officer:**
  - Base role is strictly `teacher`.
  - Holds `exams.results.moderate`, `exams.sessions.manage`, `exams.malpractice.manage`, `exams.cass.export`.
  - **Does NOT hold `exams.results.approve` or `exams.results.publish`.**
- **Delegation Protocol:** Any future delegation of approval authority to a Vice Principal must occur via an explicit, time-bounded, and audited delegation record (`delegation_tokens`), not implicit role assignment.

---

## 16. Principal & Vice Principal Model (PROPOSED — `BLOCKER 1`, `BLOCKER 9`)

### Dedicated Authoritative Positions Matrix

| Position | Base Role | Assignment | Scope | Result Approve | Result Publish |
|---|---|---|---|:---:|:---:|
| **Principal** | `school_admin` | None (Intrinsic executive authority) | School | **YES** | **YES** |
| **Vice Principal** | `teacher` | `Vice Principal` | School | **NO** | **NO** |
| **Exam Officer** | `teacher` | `Exam Officer` | School | **NO** | **NO** |
| **Head of Department (HOD)** | `teacher` | `HOD` | Department | **NO** | **NO** |
| **Form Master** | `teacher` | `Form Master` | Class | **NO** | **NO** |
| **Subject Teacher** | `teacher` | `Subject Teacher` | Offering | **NO** | **NO** |
| **Assistant Teacher** | `teacher` | `Assistant Teacher` | Offering | **NO** | **NO** |

---

## 17. Assistant Teacher Model (PROPOSED)

- **Base System Role:** `teacher`.
- **Relational Anchor:** `subject_offerings.assistant_teacher_id` (`041_subjects_curriculum_engine.sql` line 248).
- **Scope:** Narrowly bound to assigned `subject_offering`.
- **Capabilities:** `attendance.sessions.mark` (Offering) and `exams.results.enter` (Offering, constrained to draft mark entry by workflow stage).
- **Prohibitions:** Cannot approve attendance, cannot finalize mark batches, cannot submit curriculum versions.

---

## 18. Examination Authorization Model (TASK-0006 Preserved + PROPOSED Delegation)

- `exam_sessions` & `exam_schedules`: Managed by `school_admin`, with proposed delegated management for `is_exam_officer(tenant_id)`.
- `exam_malpractices`: Read/Write restricted to `school_admin` and `is_exam_officer(tenant_id)`. Invisible to ordinary teachers and students.
- `exam_results_approval`: Writes restricted to `school_admin` and `org_admin`. Ordinary teachers, exam officers, and students are denied (`42501`).
- `exam_student_spotlights`: Analytics derived snapshots; direct writes denied to all tenant staff (`42501`).

---

## 19. Permission Naming Standard (PROPOSED — `BLOCKER 11`, `BLOCKER 19`)

### Strict Grammar
$$\langle\text{module}\rangle.\langle\text{resource}\rangle.\langle\text{action}\rangle$$

### Atomic Actions Vocabulary
- `view`: Read/inspect entities (safe, non-mutating).
- `create`: Instantiate new entities.
- `update`: Modify non-status mutable attributes.
- `delete`: Archive or purge entities.
- `enter`: Record raw operational records (attendance, marks).
- `moderate`: Scrutinize and adjust operational data prior to sign-off.
- `approve`: Institutional executive authorization.
- `publish`: Release records to end-users or external stakeholders.
- `export`: Generate official national export batches (e.g. WAEC CASS).

### The Definition of `manage` (`RBAC-019`)
- **Formal Rule:** $\text{manage} = \text{view} + \text{create} + \text{update} + \text{delete}$.
- $\text{manage} \neq \text{approve} \neq \text{publish} \neq \text{moderate} \neq \text{export}$.
- `manage` is an application shorthand convenience. In the Canonical Registry, permissions are stored and evaluated strictly as **atomic permissions**.

---

## 20. Canonical Permission Matrix (PROPOSED — `BLOCKER 4`, `BLOCKER 10`)

The canonical permission count is derived from the registry inventory and validated mechanically. There are **exactly 33 atomic permissions**:

| # | Module | Canonical Atomic Permission | super_admin | org_admin | school_admin | teacher (base) | + HOD | + Form Master | + Subject Teacher | + Assistant Teacher | + Exam Officer | + VP | student | parent |
|---|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | **Admissions** | `admissions.applicants.view` | Platform | Org | School | — | — | — | — | — | School | School | Self | Self (Child) |
| 2 | | `admissions.applicants.create` | Platform | Org | School | — | — | — | — | — | — | — | Self | Self (Child) |
| 3 | | `admissions.applicants.approve` | Platform | Org | School | — | — | — | — | — | — | — | — | — |
| 4 | **Students** | `students.records.view` | Platform | Org | School | Offering | Department | Class | Offering | Offering | School | School | Self | Self (Child) |
| 5 | | `students.records.manage` | Platform | Org | School | — | — | — | — | — | — | — | — | — |
| 6 | | `students.welfare.manage` | Platform | Org | School | Offering | Department | Class | Offering | — | — | School | — | — |
| 7 | **Attendance** | `attendance.sessions.mark` | Platform | Org | School | — | — | Class | Offering | Offering | — | School | — | — |
| 8 | | `attendance.sessions.approve` | Platform | Org | School | — | — | Class | — | — | — | School | — | — |
| 9 | | `attendance.records.view` | Platform | Org | School | Offering | Department | Class | Offering | Offering | School | School | Self | Self (Child) |
| 10 | **Academics** | `curriculum.version.create` | Platform | Org | School | — | Department | — | Offering | — | — | — | — | — |
| 11 | | `curriculum.version.review` | Platform | Org | School | — | Department | — | — | — | — | School | — | — |
| 12 | | `curriculum.version.approve` | Platform | Org | School | — | — | — | — | — | — | School | — | — |
| 13 | | `curriculum.version.publish` | Platform | Org | School | — | — | — | — | — | — | — | — | — |
| 14 | | `curriculum.coverage.log` | Platform | Org | School | — | Department | — | Offering | — | — | — | — | — |
| 15 | **Exams** | `exams.sessions.manage` | Platform | Org | School | — | — | — | — | — | School | School | — | — |
| 16 | | `exams.schedules.manage` | Platform | Org | School | — | — | — | — | — | School | School | — | — |
| 17 | | `exams.results.enter` | Platform | Org | School | — | — | — | Offering | Offering (Draft) | — | — | — | — |
| 18 | | `exams.results.moderate` | Platform | Org | School | — | Department | — | — | — | School | School | — | — |
| 19 | | `exams.results.approve` | Platform | Org | School | — | — | — | — | — | — | — | — | — |
| 20 | | `exams.results.publish` | Platform | Org | School | — | — | — | — | — | — | — | — | — |
| 21 | | `exams.results.view` | Platform | Org | School | Offering | Department | Class | Offering | Offering | School | School | Self | Self (Child) |
| 22 | | `exams.malpractice.manage` | Platform | Org | School | — | — | — | — | — | School | School | — | — |
| 23 | | `exams.appeals.submit` | Platform | Org | — | — | — | — | — | — | — | — | Self | Self (Child) |
| 24 | | `exams.appeals.resolve` | Platform | Org | School | — | — | — | — | — | School | School | — | — |
| 25 | | `exams.cass.export` | Platform | Org | School | — | — | — | — | — | School | — | — | — |
| 26 | **Finance** | `finance.invoices.view` | Platform | Org | School | — | — | — | — | — | — | — | Self | Self (Child) |
| 27 | | `finance.invoices.manage` | Platform | Org | School | — | — | — | — | — | — | — | — | — |
| 28 | | `finance.waivers.approve` | Platform | Org | School | — | — | — | — | — | — | — | — | — |
| 29 | **Staff** | `staff.directory.view` | Platform | Org | School | School | School | School | School | School | School | School | — | — |
| 30 | | `staff.allocations.manage` | Platform | Org | School | — | Department | — | — | — | — | School | — | — |
| 31 | | `staff.accounts.manage` | Platform | Org | School | — | — | — | — | — | — | — | — | — |
| 32 | **Platform** | `platform.tenants.manage` | Platform | — | — | — | — | — | — | — | — | — | — | — |
| 33 | | `platform.billing.manage` | Platform | — | — | — | — | — | — | — | — | — | — | — |

---

## 21. API Authorization Model (PROPOSED)

Extend `authorizeApiRequest()` in `src/lib/auth/api-guard.ts`:
```ts
export interface AuthorizeOptions {
  roles?: AppRole[];
  permission?: CanonicalPermission;
  scope?: 'platform' | 'org' | 'school' | 'own';
  scopeId?: string;
}
```
- Validates caller identity against the requested canonical permission at the requested scope before allowing route handler execution.

---

## 22. RLS Authorization Model (PROPOSED)

Implement SQL helper functions in PostgreSQL:
```sql
CREATE OR REPLACE FUNCTION public.has_permission(
    p_user_id UUID,
    p_permission TEXT,
    p_tenant_id UUID
) RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
    -- Evaluated in Phase 2 via synchronized permissions_catalog
    SELECT false;
$$;
```
- Replaces dead queries in `040_academic_calendar_events.sql` and unifies multi-tenant hierarchy across RLS policies.

---

## 23. Frontend Authorization Model (PROPOSED)

1. Server-backed client permission hook: `const { can, scope } = usePermissions();`.
2. Replace simulated toggle in `src/app/[tenant]/teachers/portal/page.tsx` with server-rendered functional assignments.
3. Replace hardcoded badges in `users-roles-client.tsx` with dynamic permissions evaluated from the Canonical Registry.

---

## 24. Audit Requirements (PROPOSED)

The following security events MUST emit immutable audit records to `public.audit_logs`:
- Role modifications (`rbac.role.assigned`, `rbac.role.revoked`).
- Functional assignment appointment/revocation (`rbac.assignment.appointed`, `rbac.assignment.revoked`).
- Examination approval and publication (`exams.results.approved`, `exams.results.published`).
- Curriculum publishing (`curriculum.version.published`).
- Approval request resolution (`approval.request.resolved`).

---

## 25. Phase-2 Migration Strategy (PHASE 2 ROADMAP — NOT YET IMPLEMENTED)

1. **Migration 047 DDL:** Create `public.school_staff_assignments`, `assignment_status` enum, and `permissions_catalog`.
2. **Migration 048 Functions:** Create `is_exam_officer()`, `is_hod()`, `is_form_master()`, `get_subtenant_ids()`, `has_permission()`.
3. **Migration 049 Policies:** Remediate `040` dead calendar policy, `013` approval requests policy, and `007` org-admin hierarchy.
4. **Backend Services:** Implement `permissions-registry.ts` and `authorizeAction()`.
5. **UI & Portals:** Connect teacher portal and navigation to authoritative functional assignments.

---

## 26. Rollback Strategy (PHASE 2 ROADMAP)

Because all schema changes in Phase 2 are **strictly additive** (new appointment tables and helper functions without altering the base `user_role` enum):
- Rollback migration drops added tables and functions and restores previous policy definitions without data loss.

---

## 27. Phase-2 Testing Strategy (PHASE 2 ROADMAP)

1. **Unit Tests:** Matrix evaluation of permission resolver across all 33 permissions, roles, and scopes.
2. **API Guard Tests:** Verification of permission checks in `authorizeApiRequest`.
3. **PostgreSQL RLS Tests:** Empirical non-service-role assertions testing `is_exam_officer` permissions, multi-school hierarchy, and separation-of-duties denials.
4. **Regression Testing:** Automated execution of all 132 tests repository-wide.

---

## 28. Risks & Mitigations (PROPOSED)

| Risk | Likelihood | Impact | Mitigation Strategy |
|---|---|---|---|
| Enum modification deadlock | None | High | Base `user_role` enum is untouched. |
| RLS recursive join performance | Low | Medium | Helper functions are `STABLE`, `SECURITY DEFINER`, and query indexed foreign keys. |
| Teacher workflow disruption | Low | High | Base teacher role permissions remain intact; assignments grant additive authority. |

---

## 29. Open Questions (FOR SUPERVISORY CONFIRMATION)

1. **Hierarchy Depth Enforcement:** Confirm whether 4-tier tree shape validation (`organization -> district -> school -> campus`) should be enforced via database trigger or service-layer validation in Phase 2.
2. **Delegation Token Schema:** Confirm whether future Vice Principal delegation tokens should be modeled in `public.delegation_tokens` under a separate task.

---

## 30. Phase-2 Boundaries (MANDATORY INVARIANT)

Phase 2 implementation remains **STRICTLY PROHIBITED** until explicit supervisory review and approval from ChatGPT and the Human Project Owner.

---

**Status:** PROPOSED — PENDING FINAL SUPERVISORY REVIEW
