# Canonical Role-Based Access Control (RBAC) & Permission Architecture
## Comprehensive Architecture Specification

- **Document Status:** PHASE 3A IMPLEMENTATION COMPLETE — PENDING SUPERVISORY REVIEW (TASK-0007)
- **Parent Program:** AI-EOS Security & Architecture Hardening
- **Phase 1 Status:** COMPLETE — Architecture & Discovery (All corrections resolved)
- **Phase 2 Status:** COMPLETE — Migration 047 applied & verified (86/86 assertions)
- **Phase 3A Status:** IMPLEMENTATION COMPLETE — Canonical Authorization Engine implemented & verified (59/59 assertions)
- **Supervisory Authority:** ChatGPT (Chief Software Architect) / Human Project Owner
- **Implementation Engineer:** Gemini / Antigravity
- **Last Updated:** 2026-09-07
- **Target Repository:** `bock12/school-saas`
- **Branch:** `ai-eos/task-0007-phase-3a-canonical-authorization-engine`

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

In Phase 2, all institutional staff appointments will be persisted in a **single authoritative relational table: `public.school_staff_assignments`**. Alternative fragmented tables (`school_exam_officers`, `school_vp_assignments`) are explicitly rejected in favor of this unified model.

```sql
CREATE TABLE public.school_staff_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    assignment_type TEXT NOT NULL CHECK (assignment_type IN ('vice_principal', 'exam_officer', 'hod', 'form_master')),
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
    status public.assignment_status NOT NULL DEFAULT 'active',
    is_active BOOLEAN NOT NULL DEFAULT true,
    appointed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    appointed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_until DATE,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    revocation_reason TEXT,
    CONSTRAINT check_hod_dept CHECK (assignment_type != 'hod' OR department_id IS NOT NULL),
    CONSTRAINT check_form_master_section CHECK (assignment_type != 'form_master' OR section_id IS NOT NULL)
);
```

#### Removal of Generated Column & Active Status Evaluation
In PostgreSQL, `STORED` generated columns must evaluate an expression that is strictly `IMMUTABLE`. Because `CURRENT_DATE` is `STABLE` rather than `IMMUTABLE`, attempting to define `is_active` as a generated column referencing `CURRENT_DATE` produces `ERROR: generation expression is not immutable`.
Active status is therefore stored as a standard boolean `is_active BOOLEAN NOT NULL DEFAULT true` (updated via assignment lifecycle transitions) and evaluated dynamically at query/RLS time via a `STABLE` SQL helper function:

```sql
CREATE OR REPLACE FUNCTION public.is_staff_assignment_active(p_assignment_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.school_staff_assignments
        WHERE id = p_assignment_id
          AND status = 'active'
          AND is_active = true
          AND effective_from <= CURRENT_DATE
          AND (effective_until IS NULL OR effective_until >= CURRENT_DATE)
    );
$$;
```

#### Migration Relationship with Existing Assignment Fields
The repository currently contains partial, unversioned foreign keys across legacy migrations. The authoritative migration mapping to `public.school_staff_assignments` is as follows:

1. **`departments.head_teacher_id` (`002_school_modules.sql`):**
   - *Current State:* Foreign key referencing `teachers(id)`. Lacks lifecycle state machine, temporal validity ranges, and revocation audit history.
   - *Phase-2 Migration:* Migration 047 seeds `school_staff_assignments` with `assignment_type = 'hod'`, `department_id = departments.id`, and `teacher_id = departments.head_teacher_id`. In Phase 2, `departments.head_teacher_id` is retained as a denormalized cache / backward-compatible column maintained automatically by database trigger on `school_staff_assignments`.
2. **`sections.class_teacher_id` (`002_school_modules.sql`):**
   - *Current State:* Foreign key referencing `teachers(id)`. Lacks temporal bounds and lifecycle states.
   - *Phase-2 Migration:* Migration 047 seeds `school_staff_assignments` with `assignment_type = 'form_master'`, `section_id = sections.id`, and `teacher_id = sections.class_teacher_id`. Retained as a denormalized cache synchronized via trigger for backward compatibility.
3. **`subject_offerings.teacher_id` & `assistant_teacher_id` (`041_subjects_curriculum_engine.sql`):**
   - *Current State:* Direct foreign keys on `subject_offerings` defining the primary subject instructor and assistant instructor for a specific class section.
   - *Phase-2 Relationship:* These fields remain directly anchored on `subject_offerings` as the authoritative relational links for timetable scheduling and raw mark entry (`exams.results.enter`), because they are tightly coupled to the curriculum delivery engine. `school_staff_assignments` governs institutional, departmental, and whole-school appointments (`vice_principal`, `exam_officer`, `hod`, `form_master`), while subject offerings maintain their granular offering-level foreign keys.
4. **`public.teacher_assignments` (`002_school_modules.sql`):**
   - *Current State:* Legacy junction table linking `teacher_id`, `section_id`, `subject_id`, and `academic_year_id`.
   - *Phase-2 Relationship:* Superseded by `subject_offerings`. Retained as a legacy view without security authority.
5. **Vice Principal & Exam Officer Appointments:**
   - *Current State:* Zero database tables exist. `exam_officer` exists only in TypeScript types, and VP exists only as UI text.
   - *Phase-2 Migration:* `school_staff_assignments` provides their authoritative first-class relational persistence (`assignment_type = 'vice_principal'`, `assignment_type = 'exam_officer'`), completely eliminating the missing-schema defect.


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
export type CanonicalScope = 
  | 'platform'
  | 'org'
  | 'school'
  | 'department'
  | 'class'
  | 'offering'
  | 'self';

export interface AuthorizeOptions {
  roles?: AppRole[];
  permission?: CanonicalPermission;
  scope?: CanonicalScope;
  scopeId?: string;
}
```
- Validates caller identity against the requested canonical permission at the evaluated canonical scope before allowing route handler execution.


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

## 25. Phase-2 Migration Strategy

### IMPLEMENTED — Migration 047 (TASK-0007 Phase 2 Database Foundation)

`supabase/migrations/047_rbac_database_foundation.sql` — **IMPLEMENTED & VERIFIED**

1. **4 New Enums:**
   - `public.assignment_status`: `'active'`, `'expired'`, `'revoked'`, `'suspended'`.
   - `public.staff_assignment_type`: `'vice_principal'`, `'exam_officer'`, `'hod'`, `'form_master'`, `'subject_teacher'`, `'assistant_teacher'`.
   - `public.canonical_scope`: `'platform'`, `'tenant'`, `'school'`, `'department'`, `'section'`, `'offering'`, `'user'`.
   - `public.permission_status`: `'active'`, `'deprecated'`, `'disabled'`.

2. **`permissions_catalog` Table:**
   - Exactly 33 canonical atomic permissions seeded in `<module>.<resource>.<action>` format.
   - RLS enabled (SELECT: authenticated users, INSERT/UPDATE/DELETE: strictly `super_admin` via `is_super_admin()`).

3. **`school_staff_assignments` Table:**
   - Single authoritative source of truth for all 6 functional staff appointments.
   - Exact schema: 21 columns. Strict tenant scoping: `tenant_id` references `tenants(id)`. **Zero `school_id` column** (consistent with existing schema).
   - RLS enabled (SELECT: authenticated staff/admins in tenant hierarchy, DML: `school_admin`, `org_admin`, `super_admin`).

4. **Academic Year Invariant Enforcement:**
   - Added partial unique index `uniq_current_academic_year_per_tenant` on `public.academic_years (tenant_id) WHERE is_current = true`.
   - Guarantees at most 1 current academic year per tenant at the database engine level, removing any need for arbitrary `LIMIT 1` guessing.

5. **7 Check Constraints:**
   - `check_date_range`: `effective_until IS NULL OR effective_until >= effective_from`.
   - `check_lifecycle_consistency`: Ensures `is_active` matches `status = 'active'`.
   - `check_revocation_consistency`: Revoked status requires non-null `revoked_at`.
   - `check_hod_dept`: `assignment_type = 'hod'` requires `department_id IS NOT NULL`.
   - `check_form_master_section`: `assignment_type = 'form_master'` requires `section_id IS NOT NULL`.
   - `check_offering_assignment`: `subject_teacher` and `assistant_teacher` require `subject_offering_id IS NOT NULL`.
   - `check_school_scope_assignment`: `vice_principal` and `exam_officer` cannot have department, section, or offering foreign keys attached.

6. **5 Partial Unique Indexes:**
   - `uniq_active_hod_per_dept_year` on `(department_id, academic_year_id) WHERE assignment_type = 'hod' AND status = 'active'`.
   - `uniq_active_form_master_per_section_year` on `(section_id, academic_year_id) WHERE assignment_type = 'form_master' AND status = 'active'`.
   - `uniq_active_offering_teacher` on `(subject_offering_id, teacher_id) WHERE assignment_type = 'subject_teacher' AND status = 'active'`.
   - `uniq_active_vp_per_school_year` on `(tenant_id, academic_year_id, teacher_id) WHERE assignment_type = 'vice_principal' AND status = 'active'`.
   - `uniq_active_exam_officer_per_school_year` on `(tenant_id, academic_year_id, teacher_id) WHERE assignment_type = 'exam_officer' AND status = 'active'`.

7. **Cross-Tenant & Contextual Integrity Trigger (`trg_validate_staff_assignment_tenant_integrity`):**
   - Enforces `BEFORE INSERT OR UPDATE` on `public.school_staff_assignments`:
     - `teacher.tenant_id = assignment.tenant_id`
     - `academic_year.tenant_id = assignment.tenant_id`
     - `department.tenant_id = assignment.tenant_id` (if department_id is not null)
     - `section.tenant_id = assignment.tenant_id` (if section_id is not null)
     - `subject_offering.tenant_id = assignment.tenant_id` (if subject_offering_id is not null)
     - `subject_offering.academic_year_id = assignment.academic_year_id` (contextual academic-year consistency)

8. **Historical Preservation (`ON DELETE RESTRICT`):**
   - Foreign keys on `school_staff_assignments` (`teacher_id`, `academic_year_id`, `department_id`, `section_id`, `subject_offering_id`) configured with `ON DELETE RESTRICT`.
   - Historical authorization evidence cannot be silently cascade-deleted; requires lifecycle deactivation/revocation.

9. **6 SECURITY DEFINER Authorization Helper Functions:**
   - `is_staff_assignment_active(p_assignment_id UUID)`: Row-level predicate checking active status, `is_active = true`, `effective_from <= CURRENT_DATE`, and unexpired/unrevoked.
   - `is_hod(p_department_id UUID)`: Caller authorization joining `academic_years` `WHERE is_current = true` with subquery count validation `(SELECT count(*) ... is_current = true) = 1` (fails closed if 0 or >1 current years; strictly zero `LIMIT 1`).
   - `is_form_master(p_section_id UUID)`: Caller authorization for Form Master in current academic year.
   - `is_exam_officer(p_tenant_id UUID)`: Caller authorization for Exam Officer in current academic year.
   - `is_vice_principal(p_tenant_id UUID)`: Caller authorization for Vice Principal in current academic year.
   - `get_org_subtenant_ids(p_org_tenant_id UUID)`: Depth-1 tenant hierarchy resolver with caller context authorization (`is_super_admin() OR get_user_tenant_id() = p_org_tenant_id`); prevents unauthorized tenant enumeration.

10. **Future-Dated Assignment Semantics:**
    - Institutional scheduling allows creating assignments with `effective_from > CURRENT_DATE`.
    - Rows persist validly but authorization predicates return `false` until the effective date arrives.

11. **Idempotent Legacy Backfill:**
    - Backfilled active HOD assignments from `departments.head_teacher_id` with `effective_from = ay.start_date`.
    - Backfilled active Form Master assignments from `sections.class_teacher_id` with `effective_from = ay.start_date`.
    - Subject Teacher and Assistant Teacher assignments deferred to future migration (actively modeled on `subject_offerings`).

12. **4 Bi-directional Sync Triggers with Recursion & Isolation Hardening:**
    - `sync_hod_assignment_to_dept` (Forward: SSA -> departments.head_teacher_id)
    - `sync_dept_hod_to_assignments` (Reverse: departments.head_teacher_id -> SSA)
    - `sync_form_master_assignment_to_section` (Forward: SSA -> sections.class_teacher_id)
    - `sync_section_class_teacher_to_assignments` (Reverse: sections.class_teacher_id -> SSA)
    - Protected with `IF pg_trigger_depth() > 1 THEN RETURN COALESCE(NEW, OLD); END IF;` to permit direct operations (depth 1) while preventing infinite cascading loops (depth > 1).
    - Scoped strictly to same tenant + same resource + same assignment type + current academic year.
    - Historical academic years (e.g. 2025/2026) are isolated and unaffected by current-year updates.
    - Strict current academic year resolution via `SELECT id INTO STRICT` without `LIMIT 1`.

13. **Verification Test Suite:**
    - `tests/rbac-database-foundation.test.ts`: 36 automated assertions across 6 test suites executed directly against PostgreSQL over TLS. 100% pass rate (36 passed, 0 failed).

### PENDING — Future Migrations & Phases

- **Migration 048 Policies:** Remediate `040` dead calendar policy (`RBAC-001`), `013` approval requests policy (`RBAC-004`).
- **Backend Services:** Implement `permissions-registry.ts` and `authorizeAction()`.
- **UI & Portals:** Connect teacher portal and navigation to authoritative functional assignments.

---

## 26. Rollback Strategy (PHASE 2 ROADMAP)

Because all schema changes in Phase 2 are **strictly additive** (new appointment tables and helper functions without altering the base `user_role` enum):
- Rollback migration drops added tables and functions and restores previous policy definitions without data loss.

---

## 27. Phase-2 Testing Strategy (PHASE 2 ROADMAP)

1. **Database Foundation Tests (COMPLETE):** 36 empirical tests in `tests/rbac-database-foundation.test.ts` covering schema, lifecycle constraints, uniqueness, academic-year scoping, cross-tenant integrity, delete restriction, helper functions, and bi-directional synchronization.
2. **Unit Tests (Phase 3):** Matrix evaluation of permission resolver across all 33 permissions, roles, and scopes.
3. **API Guard Tests (Phase 3):** Verification of permission checks in `authorizeApiRequest`.
4. **PostgreSQL RLS Tests (Phase 3):** Empirical non-service-role assertions testing `is_exam_officer` permissions, multi-school hierarchy, and separation-of-duties denials.
5. **Regression Testing:** Automated execution of all repository tests (`npm test` — 132/132 passing).

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

## 30. Phase-2 Implementation Status

- Phase 2 Database Foundation: **COMPLETE & VERIFIED** — `047_rbac_database_foundation.sql` applied to live database; 86/86 assertions passing in `tests/rbac-database-foundation.test.ts`; 132/132 tests passing in `npm test`.

---

## 31. Phase-3A Implementation Status: Canonical Authorization Engine

### Architecture
- **Pure Deterministic Evaluator:** Implemented in `src/lib/auth/authorization-engine.ts`. Evaluates `evaluateAuthorization(context, permission, target)` without database or network dependencies.
- **Static Catalog & Explicit Matrices:** Implemented in `src/lib/auth/permissions-registry.ts`. Defines all 33 canonical permissions with immutable `allowedScopes`, explicit `BASE_ROLE_PERMISSIONS`, and explicit `FUNCTIONAL_ASSIGNMENT_PERMISSIONS`.
- **Server-Side Context Resolver:** Implemented in `src/lib/auth/authorization-context-resolver.ts`. Resolves trusted session, profile, active academic year (with strict 0/1/>1 fail-closed invariant), active assignments from `school_staff_assignments`, verified child students from `student_parents`, and invokes `get_org_subtenant_ids()` for org hierarchy.
- **Enforcement APIs:** Exposes `authorize()` (throwing `AuthorizationError`), `can()` (non-throwing boolean), and `hasCapability()` (abstract capability check, strictly non-authoritative for resources).
- **Separation of Duties (SoD):** Enforces self-moderation denial (`submitterId === actorId`), self-approval denial, exclusive executive approval/publishing restriction (`school_admin`), and assistant teacher draft stage constraint.

### Test Verification
- `tests/auth/authorization-engine.test.ts`: 35 assertions across 8 test suites (100% pass).
- `tests/auth/authorization-contract.test.ts`: 16 matrix-driven suites testing positive grants and negative space (default-deny) across all 33 permissions, 6 base roles, and 6 assignments (100% pass).
- `tests/auth/authorization-context-resolver.test.ts`: 8 assertions across 5 suites (100% pass).
- `tests/rbac-database-foundation.test.ts`: 86 assertions across 6 suites (100% pass).
- `npm test`: 132/132 tests pass (100% pass).
- `npx tsc --noEmit`: 0 errors.
- `npm run build`: Next.js production build succeeded with 0 errors.

---

**Status:** TASK-0007 PHASE 3A — IMPLEMENTATION COMPLETE
**Supervisory State:** PENDING SUPERVISORY REVIEW
**Merge Authority:** MERGE NOT AUTHORIZED
**Phase 3B–3E Authority:** NOT AUTHORIZED PENDING SUPERVISORY APPROVAL


