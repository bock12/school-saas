# TASK-0007 Phase 3C-A — Canonical Permission Architecture & Catalog Delta Specification

**Task:** TASK-0007 Phase 3C-A  
**Stage:** Architecture & Governance Specification Only  
**Status:** ARCHITECTURE READY — AWAITING SUPERVISORY APPROVAL  
**Branch:** `ai-eos/task-0007-phase-3c-a-permission-architecture`  
**Base Commit:** `e4d673e`  
**Supervisory Authority:** ChatGPT (Chief Software Architect & Project Supervisor)  
**Final Authority:** Human Project Owner  

---

## 1. Executive Architectural Summary

During the preflight verification of TASK-0007 Phase 3C, two critical semantic mismatches and one database security boundary exposure were identified:

1. **GAP-A (Academic AI):** Equating AI classroom lesson plan generation with `curriculum.version.create` ("Draft curriculum version or syllabus outline") is semantically invalid. Syllabus authoring and operational classroom lesson planning are fundamentally distinct capabilities with different lifecycles, operational scopes, and role assignments.
2. **GAP-B (Admissions Lifecycle):** Equating all 24 mutable fields in `PATCH /api/admissions` with `admissions.applicants.approve` ("Approve or reject admission application") collapses clerical demographic editing, academic evaluation/interview scoring, WAEC stream allocation, and executive admission approval under a single approval permission.
3. **GAP-C (Database Security):** The `public.enroll_applicant` RPC runs as `SECURITY DEFINER` without caller verification or permission checks, directly callable by any authenticated user via Supabase client RPC.

This document formally specifies the **Canonical Permission Architecture & Catalog Delta**, resolving GAP-A and GAP-B without altering the frozen Phase 3A engine mechanics (`authorization-engine.ts`, `authorization-context-resolver.ts`) and without adding speculative scopes or roles.

---

## 2. Invariant Compliance

This architectural specification strictly enforces:

- **`INV-3C-A-01`:** Phase 3A canonical authorization engine mechanics remain 100% frozen.
- **`INV-3C-A-02`:** No existing permission is repurposed or semantically distorted.
- **`INV-3C-A-03`:** Authorization decisions are evaluated strictly against server-resolved trusted context.
- **`INV-3C-A-04`:** Client-controlled attributes (`role`, `tenantId`, `actorId`, `stage`) are treated as untrusted.
- **`INV-3C-A-05`:** Organization administrator reach into child schools does not expand permission resource scopes beyond `school`.
- **`INV-3C-A-06`:** Functional staff assignments do not grant executive administrative privileges.
- **`INV-3C-A-07`:** Business operations with materially different security consequences receive distinct, dedicated permissions.
- **`INV-3C-A-08`:** Security-sensitive database functions cannot bypass the application authorization model.
- **`INV-3C-A-09`:** External AI side effects occur only after authentication, resource resolution, and authorization succeed.
- **`INV-3C-A-10`:** No code implementation begins until this charter receives formal supervisory approval.

---

## 3. GAP-A: Academic AI Lesson Planning Authorization Model

### 3.1 Domain Disambiguation

A rigorous decomposition of the academic domain reveals four distinct operations that must never be collapsed:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ACADEMIC DOMAIN LIFECYCLE                               │
├───────────────────────────────┬────────────────────────────────────────────────────────┤
│ Operation                     │ Operational Definition & Entity                        │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1. Curriculum Authoring       │ Drafting an institutional syllabus outline version     │
│                               │ Entity: public.curriculum_versions (status: 'draft')   │
│                               │ Permission: curriculum.version.create                  │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 2. Lesson-Plan Generation     │ Operationalizing an approved, published topic via AI   │
│                               │ into pedagogical delivery phases, activities, timings  │
│                               │ Entity: In-memory returned JSON + ai_usage_logs        │
│                               │ Permission: curriculum.lesson_plan.create (PROPOSED)   │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 3. Lesson-Plan Maintenance    │ Editing instructional notes, homework, activities      │
│                               │ Entity: Classroom delivery documentation               │
│                               │ Permission: curriculum.lesson_plan.manage (FUTURE)     │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 4. Curriculum Publishing      │ Promoting syllabus version to institutional catalog   │
│                               │ Entity: public.curriculum_versions (status: published) │
│                               │ Permission: curriculum.version.publish                 │
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

### 3.2 Detailed Specification of `curriculum.lesson_plan.create`

- **Permission Key:** `curriculum.lesson_plan.create`
- **Module:** `curriculum`
- **Resource:** `lesson_plan`
- **Action:** `create`
- **Description:** `Generate and draft classroom instructional lesson plans from published curriculum`
- **Canonical Scope:** `offering`
- **Allowed Scopes:** `['platform', 'organization', 'school', 'department', 'offering']`
- **Base-Role Grants:**
  - `super_admin`: `platform`
  - `org_admin`: `school`
  - `school_admin`: `school`
  - `teacher`: None (Teachers receive this capability strictly via functional assignment to subject offerings).
  - `student`, `parent`, `exam_officer`: None.
- **Functional-Assignment Grants:**
  - `subject_teacher`: `offering` (Assigned to the specific `subject_offering_id`).
  - `hod`: `department` (Governing the department of the offering).
- **Separation of Duties (SoD):** None required for draft generation.
- **Lifecycle Preconditions (Enforced by Resource Resolver & Route):**
  - The subject offering must be linked to a curriculum version in `published` status.
  - The topic must exist within that published curriculum version.
- **Persistence Model:**
  - The lesson plan itself is generated dynamically and returned to the client session for immediate interactive display, clipboard copying, or plain-text download.
  - AI token consumption and metadata are persistently recorded in `public.ai_usage_logs` (`tenant_id`, `user_id`, `feature = 'lesson_plan'`, `input_tokens`, `output_tokens`, `status`).

---

## 4. GAP-B: Admissions Lifecycle & Granular Permission Architecture

### 4.1 Deconstructing Admissions Operations

The legacy `PATCH /api/admissions` endpoint accepted 24 mutable fields across five materially different operational categories. Under canonical RBAC, each category requires distinct authority:

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                             ADMISSIONS OPERATIONS DECOMPOSITION                          │
├──────────────────────────────┬────────────────────────────────┬──────────────────────────┤
│ Business Operation           │ Fields Involved                │ Canonical Permission     │
├──────────────────────────────┼────────────────────────────────┼──────────────────────────┤
│ 1. Demographic Maintenance   │ firstName, lastName, dob,      │ admissions.applicants.   │
│                              │ gender, email, phone, address, │ manage                   │
│                              │ city, parentName, parentPhone, │ (PROPOSED)               │
│                              │ parentEmail, parentRelation,   │                          │
│                              │ previousSchool, targetGrade    │                          │
├──────────────────────────────┼────────────────────────────────┼──────────────────────────┤
│ 2. Applicant Evaluation      │ interviewScore, assessmentScore│ admissions.applicants.   │
│                              │ docsVerified, npseAggregate,   │ evaluate                 │
│                              │ beceAggregate, beceSubjects,   │ (PROPOSED)               │
│                              │ wassceCredits, wassceSubjects, │                          │
│                              │ nationalIndexNo                │                          │
├──────────────────────────────┼────────────────────────────────┼──────────────────────────┤
│ 3. WAEC Stream Track         │ targetStream, streamAutoPlaced,│ admissions.applicants.   │
│    Allocation                │ streamPlacedAt                 │ evaluate                 │
│                              │                                │ (PROPOSED)               │
├──────────────────────────────┼────────────────────────────────┼──────────────────────────┤
│ 4. Executive Adjudication    │ stage ('Offer', 'Enrolled'),   │ admissions.applicants.   │
│                              │ status ('active', 'rejected'), │ approve                  │
│                              │ rejectionReason                │ (EXISTING)               │
├──────────────────────────────┼────────────────────────────────┼──────────────────────────┤
│ 5. Document Dispatch         │ admissionLetterSent,           │ admissions.applicants.   │
│                              │ admissionLetterSentAt          │ manage                   │
│                              │                                │ (PROPOSED)               │
└──────────────────────────────┴────────────────────────────────┴──────────────────────────┘
```

### 4.2 Proposed Admissions Permission Definitions

#### A. `admissions.applicants.manage` (PROPOSED)
- **Permission Key:** `admissions.applicants.manage`
- **Module:** `admissions`
- **Resource:** `applicants`
- **Action:** `manage`
- **Description:** `Update applicant demographic records, contact details, and admission documents`
- **Canonical Scope:** `school`
- **Allowed Scopes:** `['platform', 'organization', 'school']`
- **Base-Role Grants:**
  - `super_admin`: `platform`
  - `org_admin`: `school`
  - `school_admin`: `school`
- **Functional-Assignment Grants:** None.
- **Strict Prohibition:** Does NOT grant authority to alter `stage` to `Offer` or `Allocation`, or `status` to `rejected`.

#### B. `admissions.applicants.evaluate` (PROPOSED)
- **Permission Key:** `admissions.applicants.evaluate`
- **Module:** `admissions`
- **Resource:** `applicants`
- **Action:** `evaluate`
- **Description:** `Record interview scores, entrance assessment scores, and WAEC stream track allocations`
- **Canonical Scope:** `school`
- **Allowed Scopes:** `['platform', 'organization', 'school']`
- **Base-Role Grants:**
  - `super_admin`: `platform`
  - `org_admin`: `school`
  - `school_admin`: `school`
- **Functional-Assignment Grants:**
  - `exam_officer`: `school` (Enables Examination Officers to record external WAEC/BECE aggregates and stream allocations).
- **Strict Prohibition:** Does NOT permit changing applicant profile names, parent emails, or final admission acceptance/rejection.

#### C. `admissions.applicants.approve` (EXISTING — RETAIN)
- **Permission Key:** `admissions.applicants.approve`
- **Module:** `admissions`
- **Resource:** `applicants`
- **Action:** `approve`
- **Description:** `Approve or reject admission application and advance lifecycle stage`
- **Canonical Scope:** `school`
- **Allowed Scopes:** `['platform', 'organization', 'school']`
- **Base-Role Grants:**
  - `super_admin`: `platform`
  - `org_admin`: `school`
  - `school_admin`: `school`
- **Functional-Assignment Grants:** None.
- **Strict Prohibition:** `exam_officer`, `teacher`, `student`, and `parent` are STRICTLY EXCLUDED from this permission.

---

## 5. Exam Officer Authority Demarcation

In West African institutional schools (MBSSE / WAEC), the Examination Officer has an essential technical role in admissions that must be strictly bounded:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                    EXAM OFFICER ADMISSIONS BOUNDARY                    │
├────────────────────────────────────────────────────────────────────────┤
│ PERMITTED (Technical Assessment Role):                                 │
│  - View admission applications (admissions.applicants.view)            │
│  - Inspect BECE/NPSE subject grades and aggregates                     │
│  - Record entrance assessment and interview scores                     │
│    (admissions.applicants.evaluate)                                    │
│  - Allocate students to SSS WAEC stream tracks (Science, Arts, etc.)   │
│    based on national criteria (admissions.applicants.evaluate)         │
├────────────────────────────────────────────────────────────────────────┤
│ STRICTLY PROHIBITED (Executive Authority Preserved):                   │
│  ❌ Creating admission applications (admissions.applicants.create)     │
│  ❌ Editing parent billing / contact info (admissions.applicants.manage│
│  ❌ Approving or rejecting applications (admissions.applicants.approve)│
│  ❌ Enrolling applicants into the student registry (enroll_applicant)  │
│  ❌ Hard deleting applicant records (admissions.applicants.delete)     │
└────────────────────────────────────────────────────────────────────────┘
```

This model prevents the Examination Officer from accidentally inheriting executive headmaster authority merely because they evaluate entrance candidates.

---

## 6. Scope Design

All proposed permissions strictly reuse the frozen canonical scopes:
- `platform`: Global cross-institution administration (`super_admin`).
- `organization`: Multi-school institutional network authority (`org_admin`).
- `school`: Single institution operational boundary (`school_admin`, `exam_officer`).
- `department`: Subject departmental boundary (`hod`).
- `class`: Pastoral section/form boundary (`form_master`).
- `offering`: Subject classroom instructional boundary (`subject_teacher`).
- `self`: Personal ownership boundary (`student`, `parent`).

**Guardrail on Organization Reach:** An `org_admin` holding `admissions.applicants.manage` at `school` scope exercises that permission across child schools within their organization. The permission's resource scope remains `school`; the caller's reachable boundary is `organization`. No new scopes are introduced.

---

## 7. Consolidated Decision Table (Required Section 13)

| Capability | Existing Permission | Proposed Permission | Scope | Authorized Actors | SoD Enforced | API Boundary | Governance Status |
|---|---|---|---|---|---|---|---|
| **Admissions View** | `admissions.applicants.view` | `admissions.applicants.view` (RETAIN) | `school` | `super_admin`, `org_admin`, `school_admin`, `exam_officer` | None | `GET /api/admissions` | APPROVED BASELINE |
| **Admissions Create** | `admissions.applicants.create` | `admissions.applicants.create` (RETAIN) | `school` | `super_admin`, `org_admin`, `school_admin` | None | `POST /api/admissions` | APPROVED BASELINE |
| **Applicant Maintenance** | None (Previously conflated) | `admissions.applicants.manage` (PROPOSED) | `school` | `super_admin`, `org_admin`, `school_admin` | None | `PATCH /api/admissions/:id` | PROPOSED NEW PERMISSION |
| **Applicant Evaluation** | None (Previously conflated) | `admissions.applicants.evaluate` (PROPOSED) | `school` | `super_admin`, `org_admin`, `school_admin`, `exam_officer` | None | `POST /api/admissions/:id/evaluate` | PROPOSED NEW PERMISSION |
| **Stream Placement** | None (Previously conflated) | `admissions.applicants.evaluate` (PROPOSED) | `school` | `super_admin`, `org_admin`, `school_admin`, `exam_officer` | None | `POST /api/admissions/:id/stream` | PROPOSED REUSE OF EVALUATE |
| **Admission Approval** | `admissions.applicants.approve` | `admissions.applicants.approve` (RETAIN) | `school` | `super_admin`, `org_admin`, `school_admin` | Executive Only (`exam_officer` denied) | `POST /api/admissions/:id/approve` | APPROVED BASELINE (RESTRICTED) |
| **Admission Rejection** | `admissions.applicants.approve` | `admissions.applicants.approve` (RETAIN) | `school` | `super_admin`, `org_admin`, `school_admin` | Executive Only (`exam_officer` denied) | `POST /api/admissions/:id/reject` | APPROVED BASELINE (RESTRICTED) |
| **Letter Dispatch** | None (Previously conflated) | `admissions.applicants.manage` (PROPOSED) | `school` | `super_admin`, `org_admin`, `school_admin` | None | `POST /api/admissions/:id/letter` | PROPOSED REUSE OF MANAGE |
| **AI Lesson Plan Generation** | `curriculum.version.create` (Mismatched) | `curriculum.lesson_plan.create` (PROPOSED) | `offering` | `super_admin`, `org_admin`, `school_admin`, `subject_teacher` (assigned), `hod` (department) | Teacher offering assignment verified | `POST /api/academics/ai/lesson-plan` | PROPOSED NEW PERMISSION |
| **AI Lesson Plan Editing** | None (Not persisted in DB) | Out of Scope (Client Session) | `offering` | Classroom instructor | None | Client UI (`LessonPlanGenerator.tsx`) | OUT OF SCOPE (NO DB PERSISTENCE) |
| **Student Enrollment** | None (Direct RPC) | `admissions.applicants.approve` + Server Internal | `school` | `super_admin`, `org_admin`, `school_admin` | Executive Only; Direct client RPC revoked | Server Action via Service Role | PROPOSED DB SECURITY FIX (GAP-C) |

---

## 8. Catalog Delta Specification (Phase 3A Delta)

The proposed delta against `src/lib/auth/permissions-registry.ts` represents exactly **two new permissions**, expanding the catalog from 33 to 35 atomic permissions:

```typescript
// Proposed Delta for public.permissions_catalog / PERMISSIONS_CATALOG:

// 1. New Permission: admissions.applicants.manage
'admissions.applicants.manage': {
  key: 'admissions.applicants.manage',
  module: 'admissions',
  resource: 'applicants',
  action: 'manage',
  description: 'Update applicant demographic records, contact details, and admission documents',
  canonicalScope: 'school',
  allowedScopes: ['platform', 'organization', 'school'],
},

// 2. New Permission: admissions.applicants.evaluate
'admissions.applicants.evaluate': {
  key: 'admissions.applicants.evaluate',
  module: 'admissions',
  resource: 'applicants',
  action: 'evaluate',
  description: 'Record interview scores, entrance assessment scores, and WAEC stream track allocations',
  canonicalScope: 'school',
  allowedScopes: ['platform', 'organization', 'school'],
},

// 3. New Permission: curriculum.lesson_plan.create
'curriculum.lesson_plan.create': {
  key: 'curriculum.lesson_plan.create',
  module: 'curriculum',
  resource: 'lesson_plan',
  action: 'create',
  description: 'Generate and draft classroom instructional lesson plans from published curriculum',
  canonicalScope: 'offering',
  allowedScopes: ['platform', 'organization', 'school', 'department', 'offering'],
},
```

### Base Role Grants Delta:
- `super_admin`: Receives all three at `platform` scope.
- `org_admin`: Receives all three at `school` scope.
- `school_admin`: Receives all three at `school` scope.
- `teacher`, `student`, `parent`: Receive zero base grants for these permissions.

### Functional Assignment Grants Delta:
- `exam_officer`: Receives `admissions.applicants.evaluate` at `school` scope.
- `subject_teacher`: Receives `curriculum.lesson_plan.create` at `offering` scope.
- `hod`: Receives `curriculum.lesson_plan.create` at `department` scope.

Zero modifications are required in `src/lib/auth/authorization-engine.ts` or `src/lib/auth/authorization-context-resolver.ts`. The pure authorization evaluation mechanics handle these new entries automatically.
