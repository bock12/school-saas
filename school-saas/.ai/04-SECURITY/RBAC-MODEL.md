# Canonical Role-Based Access Control (RBAC) & Permission Architecture

**Document Status:** PROPOSED (TASK-0007 PHASE 1 ARCHITECTURE ASSESSMENT)  
**Parent Program:** AI-EOS Security & Architecture Hardening  
**Authority:** ChatGPT (Chief Software Architect) / Human Project Owner  
**Implementation Engineer:** Gemini / Antigravity  

---

## 1. Executive Summary & Core Architectural Paradigm

SchoolSaaS enforces multi-tenant institutional administration, academic scheduling, and student lifecycle management across primary and secondary educational institutions.

Historically, authorization was partially modeled through coarse enum values (`public.user_role`), fragmented TypeScript interfaces, simulated client-side dashboard toggles, and ad-hoc RLS policies. This created authorization ambiguities, such as the `exam_officer` role being recognized in API types but failing database enum validation, and dead policy queries referencing non-existent `user_roles`/`roles` tables.

The canonical SchoolSaaS authorization architecture eliminates these ambiguities by strictly rejecting two flawed extremes:
1. **Flat Coarse Roles:** Forcing composite responsibilities into mutually exclusive base roles (which fails real-world school staffing where a teacher is also an HOD, Form Master, or Exam Officer).
2. **Role Explosion:** Creating artificial combinatorial database enums (e.g. `teacher_hod`, `teacher_exam_officer`, `principal_teacher`).

Instead, SchoolSaaS adopts the **Contextual Functional Assignment Architecture**:

```text
User Identity (auth.users)
      ↓
Tenant Membership (public.profiles.tenant_id + active status)
      ↓
Base System Role (public.profiles.role)
      +
Functional Assignment(s) (departments.head_teacher_id, sections.class_teacher_id, teacher_assignments, exam_officers)
      ↓
Effective Permissions (<module>.<resource>.<action>)
      ↓
Resource Scope (platform | org | school | department | class | offering | self)
      ↓
Deterministic Authorization Decision (ALLOW / DENY)
```

---

## 2. Distinction of Concepts

To prevent architectural confusion, SchoolSaaS strictly delineates five distinct concepts:

| Concept | Definition | Storage Location | Example |
|---|---|---|---|
| **Base System Role** | Fundamental account classification governing system security boundaries and base capabilities. | `public.profiles.role` (`user_role` enum) | `super_admin`, `org_admin`, `school_admin`, `teacher`, `student`, `parent` |
| **Functional Assignment** | Contextual appointment within a school granting operational responsibilities over specific resources. | Dedicated relational tables or foreign keys | `HOD` (Math Dept), `Form Master` (Class 10A), `Exam Officer` |
| **Job Title** | Human-readable organizational title for display and administrative directory purposes (zero security authority). | `public.profiles.job_title` (TEXT) | "Dean of Sciences", "Senior Chemistry Master", "Vice Principal Academics" |
| **Permission** | Fine-grained capability to perform an action on a specific resource type. | Canonical Permission Registry | `exams.results.enter`, `exams.results.approve`, `attendance.mark` |
| **Resource Scope** | The target boundary within which an authorized permission may be executed. | Contextual / Parameterized | Department UUID, Section UUID, Tenant UUID, Self UUID |

---

## 3. Canonical Base System Roles

The canonical database enum `public.user_role` remains intentionally minimal, robust, and immutable:

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

### Role Governance Matrix

| Base Role | Scope Authority | Intended Population | Multi-School Access | Direct Database Management |
|---|---|---|---|---|
| `super_admin` | Platform-wide | DreamDay Technology engineering & platform operations | Yes (Global) | Server-only, MFA required, fully audited |
| `org_admin` | Multi-school network | Trust executives, foundation directors, diocesan boards | Yes (Child schools of parent tenant) | School provisioning, cross-school analytics |
| `school_admin` | Single school | School principals, headmasters, bursars, registrars | No (Own school tenant only) | Full institutional operations within tenant |
| `teacher` | Academic & classes | Certified teachers, instructors, academic specialists | No (Own school tenant only) | Classroom instruction, attendance, marking |
| `student` | Self | Enrolled pupils, candidates, learners | No (Own school tenant only) | View learning materials, attendance, grades |
| `parent` | Children | Parents, legal guardians, financial sponsors | No (Own school tenant only) | View child progress, fees, communications |

---

## 4. Functional Assignments (Composite Role Resolution)

In secondary and primary schools, academic staff frequently carry multiple functional roles simultaneously. Functional assignments grant additive permissions scoped strictly to the assigned domain.

```text
                                  ┌── Base: Teacher ────────────────────────┐
                                  │   - Attendance marking (assigned classes)│
                                  │   - CA mark entry (assigned subjects)   │
                                  └──────────────────┬──────────────────────┘
                                                     │
                     ┌───────────────────────────────┼───────────────────────────────┐
                     │                               │                               │
                     ▼                               ▼                               ▼
       ┌───────────────────────────┐   ┌───────────────────────────┐   ┌───────────────────────────┐
       │   HOD Assignment          │   │   Form Master Assignment  │   │   Exam Officer Assignment │
       ├───────────────────────────┤   ├───────────────────────────┤   ├───────────────────────────┤
       │ Scope: Department UUID    │   │ Scope: Section UUID       │   │ Scope: School UUID        │
       │ Additive Permissions:     │   │ Additive Permissions:     │   │ Additive Permissions:     │
       │ - curriculum.review       │   │ - attendance.approve      │   │ - exams.sessions.manage   │
       │ - marks.moderate          │   │ - class.welfare.manage    │   │ - exams.malpractice.manage│
       │ - department.staff.view   │   │ - class.report_card.review│   │ - exams.results.moderate  │
       └───────────────────────────┘   └───────────────────────────┘   └───────────────────────────┘
```

### 1. Head of Department (HOD)
- **Relational Anchor:** `public.departments.head_teacher_id` (foreign key to `teachers.id`).
- **Resource Scope:** The specific `department_id` and all subjects/teachers linked to that department.
- **Additive Capabilities:**
  - Review curriculum versions submitted by departmental teachers (`curriculum.review`).
  - Review and moderate preliminary continuous assessment marks (`exams.marks.moderate`).
  - View departmental subject allocations and curriculum coverage reports (`academics.department.view`).

### 2. Form Master / Class Teacher
- **Relational Anchor:** `public.sections.class_teacher_id` (foreign key to `teachers.id`).
- **Resource Scope:** The specific `section_id` (e.g. "SS2-Gold", "Grade 10B").
- **Additive Capabilities:**
  - Verify and approve daily class attendance (`attendance.approve`).
  - Manage class welfare alerts and behavioral logs (`students.welfare.manage`).
  - Review preliminary end-of-term report card compilations for class students (`reports.class.review`).
  - Initiate class-wide parent broadcasts (`communication.class.broadcast`).

### 3. Subject Teacher
- **Relational Anchor:** `public.teacher_assignments` (`teacher_id`, `section_id`, `subject_id`, `academic_year_id`).
- **Resource Scope:** Specific subject offering in an assigned section.
- **Capabilities:**
  - Take subject-level period attendance (`attendance.mark`).
  - Enter assignments, homework, and term assessments (`exams.results.enter`).
  - Log curriculum topic progress and lesson plans (`curriculum.coverage.log`).

### 4. Examination Officer
- **The "Exam Officer" Architectural Fix:**
  Historically, application types contained `exam_officer`, but no database table existed. An Exam Officer is **not** a separate human identity or user account; it is a sensitive functional appointment given to a senior teacher or academic administrator.
- **Relational Anchor:**
  A formal appointment table within the school:
  ```sql
  CREATE TABLE IF NOT EXISTS public.school_exam_officers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
      teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
      is_active BOOLEAN NOT NULL DEFAULT true,
      appointed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      appointed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
      UNIQUE (tenant_id, teacher_id)
  );
  ```
- **Resource Scope:** Whole School (`tenant_id`).
- **Additive Capabilities:**
  - Configure exam sessions, timetables, and candidate roll numbers (`exams.sessions.manage`, `exams.schedules.manage`).
  - Administer exam malpractices, allegations, and investigation dossiers (`exams.malpractice.manage`).
  - Moderate preliminary exam results prior to principal sign-off (`exams.results.moderate`).
  - Transmit national CASS export batches (`exams.cass.export`).
  - *Separation of duties control:* The Exam Officer **cannot** unilaterally publish approved results without Principal / School Admin approval.

---

## 5. Permission Naming Standard & Taxonomy

Permissions follow the standard hierarchical pattern:
```text
<module>.<resource>.<action>
```

### Standard Actions Vocabulary
- `view`: Read/inspect resources (safe, non-mutating).
- `create`: Instantiate new entities.
- `update`: Modify non-status mutable properties.
- `delete`: Remove or archive an entity.
- `enter`: Input operational data (e.g. marks, attendance).
- `moderate`: Scrutinize and adjust operational data prior to formal sign-off.
- `approve`: Institutional executive authorization.
- `publish`: Release data to end-users (students, parents, public).
- `export`: Generate official downloadable batches (e.g. WAEC CASS).
- `manage`: Full operational lifecycle (view + create + update + delete).

### Standard Scope Dimensions
- `platform`: Global cross-tenant.
- `org`: Organization tenant and all child schools.
- `school`: All resources within the user's school tenant.
- `department`: Resources linked to the user's assigned department.
- `class`: Resources linked to the user's assigned class/section.
- `offering`: Resources linked to the user's assigned subject-class pairing.
- `self`: Resources owned by or linked directly to the authenticated user.

---

## 6. Comprehensive Role-to-Permission Matrix

| Module | Canonical Permission | super_admin | org_admin | school_admin | teacher (base) | + HOD | + Form Master | + Exam Officer | student | parent |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Admissions** | `admissions.applicants.view` | Platform | Org | School | — | — | — | School | Self | Self (Child) |
| | `admissions.applicants.create` | Platform | Org | School | — | — | — | — | Self | Self (Child) |
| | `admissions.applicants.approve` | Platform | Org | School | — | — | — | — | — | — |
| **Students** | `students.records.view` | Platform | Org | School | Offering | Department | Class | School | Self | Self (Child) |
| | `students.records.manage` | Platform | Org | School | — | — | — | — | — | — |
| | `students.welfare.manage` | Platform | Org | School | Offering | Department | Class | — | — | — |
| **Attendance** | `attendance.sessions.mark` | Platform | Org | School | Offering | Offering | Class | — | — | — |
| | `attendance.sessions.approve` | Platform | Org | School | — | — | Class | — | — | — |
| | `attendance.records.view` | Platform | Org | School | Offering | Department | Class | School | Self | Self (Child) |
| **Academics** | `curriculum.version.create` | Platform | Org | School | Offering | Department | — | — | — | — |
| | `curriculum.version.review` | Platform | Org | School | — | Department | — | — | — | — |
| | `curriculum.version.approve` | Platform | Org | School | — | — | — | — | — | — |
| | `curriculum.version.publish` | Platform | Org | School | — | — | — | — | — | — |
| | `curriculum.coverage.log` | Platform | Org | School | Offering | Department | — | — | — | — |
| **Exams** | `exams.sessions.manage` | Platform | Org | School | — | — | — | School | — | — |
| | `exams.schedules.manage` | Platform | Org | School | — | — | — | School | — | — |
| | `exams.results.enter` | Platform | Org | School | Offering | Offering | — | — | — | — |
| | `exams.results.moderate` | Platform | Org | School | — | Department | — | School | — | — |
| | `exams.results.approve` | Platform | Org | School | — | — | — | — | — | — |
| | `exams.results.publish` | Platform | Org | School | — | — | — | — | — | — |
| | `exams.results.view` | Platform | Org | School | Offering | Department | Class | School | Self | Self (Child) |
| | `exams.malpractice.manage` | Platform | Org | School | — | — | — | School | — | — |
| | `exams.appeals.submit` | Platform | Org | — | — | — | — | — | Self | Self (Child) |
| | `exams.appeals.resolve` | Platform | Org | School | — | — | — | School | — | — |
| | `exams.cass.export` | Platform | Org | School | — | — | — | School | — | — |
| **Finance** | `finance.invoices.view` | Platform | Org | School | — | — | — | — | Self | Self (Child) |
| | `finance.invoices.manage` | Platform | Org | School | — | — | — | — | — | — |
| | `finance.waivers.approve` | Platform | Org | School | — | — | — | — | — | — |
| **Staff** | `staff.directory.view` | Platform | Org | School | School | School | School | School | — | — |
| | `staff.allocations.manage` | Platform | Org | School | — | Department | — | — | — | — |
| | `staff.accounts.manage` | Platform | Org | School | — | — | — | — | — | — |
| **Platform** | `platform.tenants.manage` | Platform | — | — | — | — | — | — | — | — |
| | `platform.billing.manage` | Platform | — | — | — | — | — | — | — | — |

---

## 7. Separation of Duties Workflows

### A. Examination Results Lifecycle (Verified TASK-0006 Baseline)
```text
Stage 1: Mark Entry
  - Actor: Subject Teacher
  - Action: Enter continuous assessment & exam marks
  - Permission: exams.results.enter
  - Scope: Assigned subject offering

Stage 2: Departmental Scrutiny
  - Actor: Head of Department (HOD)
  - Action: Scrutinize outliers, missing marks, moderation adjustments
  - Permission: exams.results.moderate
  - Scope: Assigned department

Stage 3: Central Exam Office Validation
  - Actor: Exam Officer
  - Action: Verify grading scales, validate candidate eligibility, document malpractice dossiers
  - Permission: exams.results.moderate, exams.malpractice.manage
  - Scope: School tenant

Stage 4: Institutional Executive Sign-Off
  - Actor: School Admin / Principal
  - Action: Official approval of examination results ledger
  - Permission: exams.results.approve
  - Scope: School tenant
  - Control: Strict 42501 denial if attempted by ordinary teacher, student, or non-admin

Stage 5: Official Publication
  - Actor: School Admin / Principal
  - Action: Publish to student/parent portals & generate transcripts
  - Permission: exams.results.publish
  - Scope: School tenant
```

### B. Curriculum Lifecycle
```text
Stage 1: Topic Authoring (Draft)
  - Actor: Subject Teacher
  - Permission: curriculum.version.create

Stage 2: Departmental Review (Pending Review)
  - Actor: Head of Department (HOD)
  - Permission: curriculum.version.review

Stage 3: Academic Approval (Approved)
  - Actor: Vice Principal / School Admin
  - Permission: curriculum.version.approve

Stage 4: Institutional Publication (Published — Immutable)
  - Actor: Principal / School Admin
  - Permission: curriculum.version.publish
```

---

## 8. Enforcement Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│ 1. Client UI (Next.js App Router & React Server Components)  │
│    - Helper: can(permission, scope?)                         │
│    - Role: UX convenience, menu visibility, button enabling  │
│    - Invariant: NEVER treated as a security boundary         │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTP Request (Bearer JWT / Session Cookie)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. API / Server Action Guard Layer                           │
│    - Guard: authorizeApiRequest() / authorizeAction()        │
│    - Role: Authenticates actor, verifies active status,      │
│            checks tenant isolation, validates permission     │
│    - Rejects: 401 Unauthorized, 403 Forbidden                │
└──────────────────────────────┬───────────────────────────────┘
                               │ Parameterized Postgres Client (PostgREST / pg)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Database Layer (PostgreSQL 15+ & RLS Policies)            │
│    - Helper: is_super_admin(), is_school_admin(),            │
│              is_exam_officer(tenant_id), is_hod(dept_id)     │
│    - Enforces: Row Level Security on ALL SELECT/INSERT/UPDATE│
│    - Defense-in-Depth: Triggers (e.g. protect_profile_fields)│
│    - Invariant: Independent authorization enforcement        │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. Security Invariants

1. **Least Privilege:** Users receive only permissions necessary for their assigned institutional responsibilities.
2. **Tenant Isolation Overrides Role:** Having `exams.results.approve` within School A provides zero authorization to view or approve records in School B.
3. **No Client-Controlled Security State:** Role, tenant, and functional assignments are loaded exclusively from database state (`public.profiles`, `public.tenants`, and assignment tables). `user_metadata` is completely ignored.
4. **Active Status Fail-Closed:** If `profiles.is_active = false`, all permissions immediately evaluate to `DENY` across RLS, API guards, and server actions.
5. **No Blind Service Role:** Backend server actions use authenticated user-scoped database clients wherever possible. `createAdminClient()` is restricted to verified system-level workflows.
