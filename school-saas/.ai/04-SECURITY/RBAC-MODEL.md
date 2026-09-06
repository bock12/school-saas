# Canonical Role-Based Access Control (RBAC) & Permission Architecture
## Comprehensive Architecture Specification

- **Document Status:** PROPOSED — PENDING SUPERVISORY APPROVAL (TASK-0007 PHASE 1 CORRECTION)
- **Parent Program:** AI-EOS Security & Architecture Hardening
- **Phase:** Phase 1 — Architecture & Discovery (Correction)
- **Supervisory Authority:** ChatGPT (Chief Software Architect) / Human Project Owner
- **Implementation Engineer:** Gemini / Antigravity
- **Date:** 2026-09-06
- **Target Repository:** `bock12/school-saas`

---

## 1. Current-State Findings (Verified Repository Facts)

Empirical investigation across 49 SQL migrations, route handlers, server actions, client sidebars, and UI components confirmed the following current-state facts:
1. **Database Role Enum (`public.user_role`):** Contains exactly 6 values: `'super_admin'`, `'org_admin'`, `'school_admin'`, `'teacher'`, `'student'`, `'parent'`. Defined in `001_foundation.sql` and never modified.
2. **Absence of Database Permission Tables:** Zero permission tables (`permissions`, `role_permissions`, `user_permissions`, `user_roles`, `roles`) exist in PostgreSQL.
3. **The Migration 040 Ghost Dependency (`RBAC-001`):** `040_academic_calendar_events.sql` references non-existent tables `public.user_roles` and `public.roles`. The policy fails closed.
4. **The `exam_officer` Disconnect (`RBAC-007`):** TypeScript interfaces (`AppRole`, `TenantRole`, `users.ts`) recognize `exam_officer`, but updating a profile role to `'exam_officer'` crashes with a PostgreSQL enum violation (`42804`).
5. **Existing Relational Assignments:** Academic responsibilities are already partially modeled relationally:
   - Head of Department (HOD): `departments.head_teacher_id` (`002_school_modules.sql`).
   - Form Master / Class Teacher: `sections.class_teacher_id` (`002_school_modules.sql`).
   - Subject Teacher: `subject_offerings.teacher_id` (`041_subjects_curriculum_engine.sql`) and `teacher_assignments`.
   - Assistant Teacher: `subject_offerings.assistant_teacher_id` (`041_subjects_curriculum_engine.sql`).
6. **Separation-of-Duties Collapse on Approvals (`RBAC-004`):** `013_approval_requests.sql` has a wildcard `FOR ALL` policy for all tenant users, and `resolveApprovalRequest` in `src/app/actions/approvals.ts` lacks caller role checks.
7. **`job_title` Column Status (`RBAC-021`):** `public.profiles.job_title` exists as a TEXT column added in `010_branding_and_staff_columns.sql`. It is consumed for display badges and staff ID cards, with zero security authority.
8. **Multi-School Hierarchy (`RBAC-006`, `RBAC-015`):** `public.tenants` contains `parent_id` and `type` (`organization`, `district`, `school`, `campus`), but academic RLS policies enforce single-tenant equality without evaluating hierarchy.

---

## 2. Architectural Principles (PROPOSED)

1. **Evidence-Based Security:** Every authorization rule must be grounded in verified schema relations and server-authoritative state.
2. **Contextual Functional Assignment Architecture:** Base roles remain coarse and immutable; specialized operational capabilities are granted via relational functional appointments.
3. **Strict Separation of Concerns:**
   - Base System Role $\neq$ Functional Assignment $\neq$ Job Title $\neq$ Permission $\neq$ Resource Scope.
4. **Deterministic Evaluation:** Authorization is evaluated via a deterministic 9-step algorithm defaulting to `DENY`.
5. **Least Privilege & Fail-Closed:** Absence of an explicit grant results in immediate denial. Deactivated accounts (`is_active = false`) fail closed across all layers.
6. **Tenant Isolation Invariant:** Tenant boundaries supersede all role permissions. A user possessing an administrative permission in School A has zero rights in School B.

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

| Base Role | Scope Authority | Intended Population | Multi-School Access | Governance Model |
|---|---|---|---|---|
| `super_admin` | Platform-wide | Platform operations & engineering | Yes (Global) | Server-only, strictly audited, MFA required |
| `org_admin` | Multi-school network | Trust executives, diocesan boards, foundation directors | Yes (Child schools of parent tenant) | Provisioning, cross-school analytics, governance |
| `school_admin` | Single school | School principals, headmasters, bursars, registrars | No (Own school tenant only) | Full institutional operations within tenant |
| `teacher` | Academic & classes | Certified teachers, instructors, academic specialists | No (Own school tenant only) | Classroom instruction, attendance, marking |
| `student` | Self | Enrolled pupils, learners | No (Own school tenant only) | Learning materials, attendance, grades |
| `parent` | Children | Parents, legal guardians, financial sponsors | No (Own school tenant only) | Child progress, fees, communications |

---

## 4. Functional Assignment Model (PROPOSED)

Functional assignments represent contextual appointments within a school granting operational capabilities over specific resources without altering the user's base role.

```text
User (auth.users)
   ↓
Tenant Membership (public.profiles.tenant_id + active status)
   ↓
Base System Role (public.profiles.role: super_admin, org_admin, school_admin, teacher, student, parent)
   +
Functional Assignment(s) (HOD, Form Master, Subject Teacher, Assistant Teacher, Exam Officer, VP)
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
- **Database Storage:** `public.profiles.job_title` (TEXT, nullable).
- **Verified Consumers:** `users-roles-client.tsx`, `org-staff/page.tsx`, `id-card-modal.tsx`.
- **Absolute Rule:** **Job titles have ZERO direct security authority.** Code must NEVER execute predicates such as `if (user.job_title === 'Principal')`.

---

## 6. Permission Model (PROPOSED)

A permission is a fine-grained capability to perform an atomic action on a specific resource type within an evaluated scope.
- Grammar: `<module>.<resource>.<action>`
- Permissions are strictly **atomic** and non-overlapping.

---

## 7. Canonical Permission Registry (PROPOSED)

The **Canonical Permission Registry** is the authoritative specification of platform capabilities.

1. **Authoritative Location:** Application Code / TypeScript (`src/lib/auth/permissions-registry.ts`) as the Single Source of Truth, paired with a synchronized static database lookup table (`public.permissions_catalog`).
2. **Hybrid Design Rationale:** Software permissions represent hardcoded code execution paths; defining them exclusively as dynamic database rows leads to unhandled runtime states. Storing the catalog in code with schema validation provides compile-time safety and runtime database verification.
3. **Versioning:** Permissions are versioned through code releases and schema migrations (`047_permissions_catalog.sql`). Deprecated permissions are marked with sunset warnings.
4. **Mutation Authority:** Platform engineering only via Git pull requests and migrations. Tenant administrators cannot invent permissions.
5. **Consumption Across Layers:**
   - **RLS Policies:** Consume permissions via SQL function `public.has_permission(auth.uid(), 'exams.results.approve', target_tenant_id)`.
   - **API Guards:** Consume via `authorizeApiRequest(req, { permission: 'exams.results.moderate' })`.
   - **Server Actions:** Consume via `authorizeAction('curriculum.version.review', { departmentId })`.
   - **Frontend:** Consumes via `const { can } = usePermissions(); if (can('curriculum.version.publish')) ...`.
6. **Unknown Permission Handling:** **FAIL-CLOSED (DENY).** Throws an authorization exception and emits an audit event (`UNKNOWN_PERMISSION_REQUESTED`).

---

## 8. Permission Resolution & Effective Permission Algorithm (PROPOSED)

### Deterministic 9-Step Evaluation Algorithm
```text
Step 1: Authenticate caller identity via auth.uid().
Step 2: Verify active tenant membership (profiles.tenant_id = target_tenant AND profiles.is_active = true).
Step 3: Resolve caller's base role (profiles.role).
Step 4: Resolve caller's active functional assignments for target resource and academic year.
Step 5: Aggregate Base Role Permissions + Active Assignment Permissions.
Step 6: Evaluate Resource Scope containment (caller scope covers target resource).
Step 7: Evaluate Separation-of-Duties constraints (actor != subject/submitter on same transaction).
Step 8: Evaluate ownership / recipient relationships (for self/parent/student scopes).
Step 9: If all checks pass → RETURN ALLOW. Otherwise → RETURN DENY (Default Deny).
```

### Precedence & Conflict Rules
- The model is **strictly additive**: `Effective Permissions = Base Permissions ∪ ∑ Assignment Permissions`.
- There are NO complex negative override permissions. If an operation requires a capability, having any active role or assignment granting it (at the required scope) satisfies the check, subject to Separation-of-Duties constraints.

---

## 9. Scope Model & Formal Containment Matrix (PROPOSED)

### Formal Scope Hierarchy
$$\text{platform} \supset \text{org} \supset \text{school} \supset \text{department} \supset \text{class} \supset \text{offering} \supset \text{self}$$

### Formal Containment Matrix

| Scope | Definition | Parent Scope | Child Resources Covered | Inheritance Rule | Resolver Logic |
|---|---|---|---|---|---|
| `platform` | Entire multi-tenant system | None | All organizations, schools, users | Global access | `profiles.role = 'super_admin'` |
| `org` | Parent organization + child schools | `platform` | Child schools, org-level policies | Cascades down to child schools | `tenants.id = caller_tenant OR parent_id = caller_tenant` |
| `school` | Single institutional tenant | `org` | Departments, classes, offerings, staff, students | Cascades to all school resources | `profiles.tenant_id = target_tenant_id` |
| `department` | Academic department (e.g. Science) | `school` | Departmental subjects, curriculum versions, department teachers | Scoped to subjects in department | `departments.id = target_dept_id AND departments.head_teacher_id = teacher_id` |
| `class` | Specific grade section (e.g. 10A) | `school` | Section students, class attendance, welfare logs | Scoped to section | `sections.id = target_section_id AND sections.class_teacher_id = teacher_id` |
| `offering` | Specific subject in a specific section | `class` | Period attendance, homework, CA marks, lesson plans | Scoped to offering | `subject_offerings.id = target_offering AND (teacher_id = tid OR assistant_teacher_id = tid)` |
| `self` | Caller's own identity / own child | `school` | Profile, student grades, parent invoices | Zero lateral access | `resource.user_id = auth.uid() OR student_parents(parent_id, student_id)` |

---

## 10. Tenant Hierarchy (CURRENT STATE / PROPOSED)

1. **Hierarchy Depth:** Supports up to **4 levels**:
   $$\text{organization} \longrightarrow \text{district/group} \longrightarrow \text{school} \longrightarrow \text{campus}$$
2. **Current Schema:** `public.tenants` contains `parent_id UUID REFERENCES public.tenants(id)` and `type` (`011_hierarchy_columns.sql`).
3. **RLS & API Hierarchy Resolver:**
   - PostgreSQL recursive CTE helper:
     ```sql
     CREATE OR REPLACE FUNCTION public.get_subtenant_ids(p_root_tenant_id UUID)
     RETURNS TABLE(tenant_id UUID) LANGUAGE sql STABLE SECURITY DEFINER AS $$
       WITH RECURSIVE tenant_tree AS (
           SELECT id FROM public.tenants WHERE id = p_root_tenant_id
           UNION ALL
           SELECT t.id FROM public.tenants t JOIN tenant_tree tt ON t.parent_id = tt.id
       )
       SELECT id FROM tenant_tree;
     $$;
     ```
   - RLS policies for multi-school `org_admin`: `tenant_id IN (SELECT get_subtenant_ids(public.get_user_tenant_id()))`.

---

## 11. Academic-Year Scoping & Temporal Model (PROPOSED)

Operational academic assignments (`Subject Teacher`, `Assistant Teacher`, `Form Master`, `HOD`, `Exam Officer`) are inherently time-bound:
1. **Academic Year Association:** Functional assignments must record `academic_year_id UUID NOT NULL REFERENCES public.academic_years(id)`.
2. **Preservation of Historical Integrity:**
   - When Teacher A is HOD of Mathematics in 2025/2026 and HOD of Science in 2026/2027, two separate assignment records exist.
   - Historical records (`exam_results_approval`, `curriculum_versions`, `audit_logs`) snapshot the actor ID, timestamp, and active role at execution time.
   - Updating assignments for a new academic year never alters or invalidates historical authorization audit trails.

---

## 12. Functional Assignment Lifecycle (PROPOSED)

Every functional assignment follows an explicit lifecycle state machine:
- **States:**
  - `appointed`: Created by administrator with future effective date.
  - `active`: Valid for operational authorization (`effective_from <= CURRENT_DATE <= effective_until` and `is_active = true`).
  - `suspended`: Temporarily disabled pending review.
  - `expired`: Past `effective_until` or academic year concluded.
  - `revoked`: Prematurely terminated by administrator.
- **Relational Schema Requirement (PHASE 2):**
  - `id UUID PRIMARY KEY`, `tenant_id UUID`, `teacher_id UUID`, `academic_year_id UUID`, `status assignment_status`, `appointed_at TIMESTAMPTZ`, `appointed_by UUID`, `effective_from DATE`, `effective_until DATE`, `revoked_at TIMESTAMPTZ`, `revoked_by UUID`, `revocation_reason TEXT`.

---

## 13. Composite Role Strategy (PROPOSED)

In secondary schools, staff members frequently hold multiple responsibilities simultaneously (e.g. Teacher + HOD + Exam Officer).
- **Architecture:** Zero artificial combinatorial database roles (rejecting `teacher_hod_exam_officer`).
- **Resolution:** The user holds base role `teacher` in `public.profiles.role`, with separate functional assignment rows in `departments`, `sections`, `subject_offerings`, and `school_exam_officers`.
- Effective permissions are resolved dynamically by summing the permissions of all active assignments.

---

## 14. Separation of Duties (PROPOSED)

Separation of duties is enforced at the **Transaction and Workflow Level**, preventing self-approval and conflicting stages:

### Multi-Stage Examination Workflow
```text
Stage 1: Mark Entry (Offering Scope)
  - Actor: Subject Teacher / Assistant Teacher
  - Permission: exams.results.enter

Stage 2: Departmental Moderation (Department Scope)
  - Actor: Head of Department (HOD)
  - Permission: exams.results.moderate
  - Invariant: A teacher cannot moderate their own submitted subject marks. If HOD teaches the subject, moderation must be performed by the Vice Principal or Exam Officer.

Stage 3: Central Exam Office Validation (School Scope)
  - Actor: Exam Officer
  - Permission: exams.results.moderate, exams.malpractice.manage
  - Invariant: Exam Officer prepares and moderates draft ledgers, but cannot approve or publish.

Stage 4: Executive Approval (School Scope)
  - Actor: Principal / School Admin
  - Permission: exams.results.approve
  - Invariant: Strict separation from mark entry. Principal cannot approve marks they entered as a teacher without secondary administrative sign-off.

Stage 5: Official Publication (School Scope)
  - Actor: Principal / School Admin
  - Permission: exams.results.publish
```

---

## 15. Approval Authority Model (PROPOSED)

- `exams.results.approve`: Formally certifies the examination results ledger. Held exclusively by `school_admin` (Principal), `org_admin`, and `super_admin`.
- `exams.results.publish`: Releases results to parents, students, and external portals. Held exclusively by `school_admin` (Principal) and `org_admin`.
- **Vice Principal Authority:** May hold `curriculum.version.approve` (academic content approval) and `exams.results.moderate` (school-wide moderation), but does NOT hold `exams.results.publish`.
- **Delegation Protocol:** Any future delegation of approval powers to a Vice Principal must occur via an explicit, time-bounded, and audited delegation record (`delegation_tokens`), not implicit role assignment.

---

## 16. Principal & Vice Principal Model (PROPOSED)

| Position | Base System Role | Functional Assignment | Job Title (`profiles.job_title`) | Security Authority |
|---|---|---|---|---|
| **Principal** | `school_admin` | None (Intrinsic whole-school authority) | "Principal", "Headmaster" | Full school administration, `exams.results.approve`, `exams.results.publish`, `finance.waivers.approve` |
| **Vice Principal** | `teacher` (or `school_admin`) | `Vice Principal` (Whole-school) | "Vice Principal - Academics" | School-wide academic review, curriculum approval, welfare management, exam moderation |
| **Head of Department (HOD)** | `teacher` | `Head of Department` (`departments.head_teacher_id`) | "HOD Science", "HOD Arts" | Departmental curriculum review, departmental mark moderation |
| **Form Master** | `teacher` | `Form Master` (`sections.class_teacher_id`) | "Form Master 10A" | Class attendance verification, student welfare, report card review |
| **Subject Teacher** | `teacher` | `Subject Offering Teacher` (`subject_offerings.teacher_id`) | "Mathematics Teacher" | Offering lesson planning, attendance marking, continuous assessment mark entry |
| **Assistant Teacher** | `teacher` | `Assistant Subject Teacher` (`subject_offerings.assistant_teacher_id`) | "Assistant Teacher", "Lab Assistant" | Offering attendance marking, draft mark entry |
| **Exam Officer** | `teacher` (or `school_admin`) | `School Exam Officer` (`public.school_exam_officers`) | "Chief Examination Officer" | Exam session management, timetables, malpractice dossiers, school mark moderation, CASS export |

---

## 17. Assistant Teacher Model (PROPOSED)

- **Base System Role:** `teacher`.
- **Relational Anchor:** `subject_offerings.assistant_teacher_id` (verified in `041_subjects_curriculum_engine.sql` line 248).
- **Scope:** Narrowly bound to the specific assigned `subject_offering`.
- **Capabilities:**
  - `attendance.sessions.mark` (Scope: Offering).
  - `exams.results.enter_draft` (Scope: Offering — draft mark entry only).
- **Prohibitions:** Cannot approve attendance, cannot finalize mark batches, cannot submit curriculum versions.

---

## 18. Examination Authorization Model (TASK-0006 Preserved + PROPOSED Delegation)

- All TASK-0006 verified RLS boundaries are strictly preserved:
  - `exam_sessions` & `exam_schedules`: Managed by `school_admin`, with proposed delegated management for `is_exam_officer(tenant_id)`.
  - `exam_malpractices`: Read/Write strictly restricted to `school_admin` and `is_exam_officer(tenant_id)`. Invisible to ordinary teachers and students.
  - `exam_results_approval`: Writes strictly restricted to `school_admin` and `org_admin`. Ordinary teachers and students are denied (`42501`).
  - `exam_student_spotlights`: Analytics derived snapshots; direct writes denied to all tenant staff (`42501`).

---

## 19. Permission Naming Standard (PROPOSED)

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
- **Decision:** `manage` is an application shorthand convenience. In the Canonical Registry, permissions are stored and evaluated strictly as **atomic permissions**.

---

## 20. Canonical Permission Matrix (PROPOSED)

| Module | Canonical Atomic Permission | super_admin | org_admin | school_admin | teacher (base) | + HOD | + Form Master | + Exam Officer | + VP | student | parent |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Admissions** | `admissions.applicants.view` | Platform | Org | School | — | — | — | School | School | Self | Self (Child) |
| | `admissions.applicants.create` | Platform | Org | School | — | — | — | — | — | Self | Self (Child) |
| | `admissions.applicants.approve` | Platform | Org | School | — | — | — | — | — | — | — |
| **Students** | `students.records.view` | Platform | Org | School | Offering | Department | Class | School | School | Self | Self (Child) |
| | `students.records.manage` | Platform | Org | School | — | — | — | — | — | — | — |
| | `students.welfare.manage` | Platform | Org | School | Offering | Department | Class | — | School | — | — |
| **Attendance** | `attendance.sessions.mark` | Platform | Org | School | Offering | Offering | Class | — | School | — | — |
| | `attendance.sessions.approve` | Platform | Org | School | — | — | Class | — | School | — | — |
| | `attendance.records.view` | Platform | Org | School | Offering | Department | Class | School | School | Self | Self (Child) |
| **Academics** | `curriculum.version.create` | Platform | Org | School | Offering | Department | — | — | — | — | — |
| | `curriculum.version.review` | Platform | Org | School | — | Department | — | — | School | — | — |
| | `curriculum.version.approve` | Platform | Org | School | — | — | — | — | School | — | — |
| | `curriculum.version.publish` | Platform | Org | School | — | — | — | — | — | — | — |
| | `curriculum.coverage.log` | Platform | Org | School | Offering | Department | — | — | — | — | — |
| **Exams** | `exams.sessions.manage` | Platform | Org | School | — | — | — | School | School | — | — |
| | `exams.schedules.manage` | Platform | Org | School | — | — | — | School | School | — | — |
| | `exams.results.enter` | Platform | Org | School | Offering | Offering | — | — | — | — | — |
| | `exams.results.moderate` | Platform | Org | School | — | Department | — | School | School | — | — |
| | `exams.results.approve` | Platform | Org | School | — | — | — | — | — | — | — |
| | `exams.results.publish` | Platform | Org | School | — | — | — | — | — | — | — |
| | `exams.results.view` | Platform | Org | School | Offering | Department | Class | School | School | Self | Self (Child) |
| | `exams.malpractice.manage` | Platform | Org | School | — | — | — | School | School | — | — |
| | `exams.appeals.submit` | Platform | Org | — | — | — | — | — | — | Self | Self (Child) |
| | `exams.appeals.resolve` | Platform | Org | School | — | — | — | School | School | — | — |
| | `exams.cass.export` | Platform | Org | School | — | — | — | School | — | — | — |
| **Finance** | `finance.invoices.view` | Platform | Org | School | — | — | — | — | — | Self | Self (Child) |
| | `finance.invoices.manage` | Platform | Org | School | — | — | — | — | — | — | — |
| | `finance.waivers.approve` | Platform | Org | School | — | — | — | — | — | — | — |
| **Staff** | `staff.directory.view` | Platform | Org | School | School | School | School | School | School | — | — |
| | `staff.allocations.manage` | Platform | Org | School | — | Department | — | — | School | — | — |
| | `staff.accounts.manage` | Platform | Org | School | — | — | — | — | — | — | — |
| **Platform** | `platform.tenants.manage` | Platform | — | — | — | — | — | — | — | — | — |
| | `platform.billing.manage` | Platform | — | — | — | — | — | — | — | — | — |

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
- Validates that caller identity holds the requested canonical permission at the requested scope before allowing route handler execution.

---

## 22. RLS Authorization Model (PROPOSED)

Implement lightweight SQL helper functions in PostgreSQL:
```sql
CREATE OR REPLACE FUNCTION public.is_exam_officer(p_tenant_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.school_exam_officers
        WHERE tenant_id = p_tenant_id
        AND teacher_id = (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
        AND is_active = true
    );
$$;
```
- Replaces dead queries in `040_academic_calendar_events.sql` and unifies multi-tenant hierarchy across RLS policies.

---

## 23. Frontend Authorization Model (PROPOSED)

1. Introduce server-backed client permission hook: `const { can, scope } = usePermissions();`.
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

## 25. Migration Strategy (PHASE 2 ROADMAP)

1. **Step 1: DDL Additions:** Create `school_exam_officers` and `assignment_status` enum.
2. **Step 2: Helper Functions:** Create `is_exam_officer()`, `is_hod()`, `is_form_master()`, `get_subtenant_ids()`.
3. **Step 3: RLS Remediation:** Remediate `040` dead calendar policy, `013` approval requests policy, and `007` org-admin hierarchy.
4. **Step 4: TypeScript Registry:** Implement `src/lib/auth/permissions-registry.ts`.
5. **Step 5: API & Action Guards:** Upgrade `authorizeApiRequest()` and `authorizeAction()`.
6. **Step 6: UI & Navigation:** Connect teacher portal and navigation to authoritative functional assignments.

---

## 26. Rollback Strategy (PHASE 2 ROADMAP)

Because all schema changes in Phase 2 are **strictly additive** (new appointment tables and helper functions without altering the base `user_role` enum):
- Rollback migration drops added tables and functions and restores previous policy definitions without data loss.

---

## 27. Testing Strategy (PHASE 2 ROADMAP)

1. **Unit Tests:** Matrix verification of permission resolver across all roles and scopes.
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

## 29. Open Questions & Design Invariants (FOR SUPERVISORY CONFIRMATION)

1. **Organizational Hierarchy Max Depth:** Proposed at 4 levels (`org -> district -> school -> campus`). Confirmation requested.
2. **Vice Principal Delegation Architecture:** Proposed that Vice Principal has academic review powers, but final result approval requires Principal sign-off unless formal delegation is enacted in a future task.
3. **Approval Requests Policy Remediation:** Proposed that `013_approval_requests.sql` restricts UPDATE/DELETE to `school_admin`, `org_admin`, and `super_admin`.

---

## 30. Phase 2 Boundaries (MANDATORY INVARIANT)

Phase 2 implementation remains **STRICTLY PROHIBITED** until explicit supervisory review and approval from ChatGPT and the Human Project Owner.

---

**Status:** PROPOSED — PENDING SUPERVISORY APPROVAL
