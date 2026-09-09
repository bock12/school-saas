# Architecture Decisions

## ADR-0001 — AI-EOS authority migration
**Date:** 2026-09-02  
**Status:** Proposed — human acceptance required  
**Authority:** ChatGPT recommendation; human approval required

### Context
The original collaboration model made Codex Chief Software Architect/Project Supervisor. Codex availability is no longer sufficient for the project. The repository must remain provider-independent while preserving Gemini/Antigravity implementation and human final authority.

### Decision
Use ChatGPT as Chief Software Architect and Project Supervisor. Gemini/Antigravity remains Implementation Engineer. GitHub is source of truth. Human retains final authority over merge/release, production, credentials, destructive operations, migration execution and material architecture/security exceptions.

### Consequences
AI-EOS governance can continue without Codex. No application behavior changes are implied by this governance migration.

## ADR-0002 — Canonical `.ai` structure
**Status:** Proposed — human acceptance required

Consolidate duplicate top-level policy files into the AI-EOS categorized structure. Preserve substantive project/security/task history; do not maintain competing active copies.

## ADR-0003 — Canonical RBAC & Contextual Functional Assignment Architecture
**Date:** 2026-09-06  
**Status:** PROPOSED — Supervisory approval required before Phase 2 implementation  
**Authority:** TASK-0007 Architecture Assessment; ChatGPT / Human Project Owner acceptance required  

### Context
SchoolSaaS authorization historically suffered from:
1. Disconnect between application TypeScript roles (`exam_officer`) and PostgreSQL enum values (`user_role` only had 6 roles).
2. Ghost schema references in legacy migrations (`040_academic_calendar_events.sql` referenced non-existent `public.user_roles` and `public.roles`).
3. Simulated client-side multi-role switching (`teachers/portal/page.tsx`) decoupled from backend authorization.
4. Risk of "role explosion" if every staff combination (`teacher_hod`, `teacher_form_master`, `teacher_exam_officer`) were encoded as a database role enum.

### Decision
Adopt the **Contextual Functional Assignment Architecture**:
1. Keep the base `user_role` database enum minimal, immutable, and stable with 6 base roles: `super_admin`, `org_admin`, `school_admin`, `teacher`, `student`, `parent`.
2. Define `school_admin` as an administrative security role representing **institutional executive / Principal-level authority**. Human titles (`job_title`) such as "Principal", "Bursar", "Registrar" NEVER grant security authority.
3. Classify organizational positions deterministically:
   - **Principal:** Base Role = `school_admin` (holds intrinsic executive approval/publication authority).
   - **Vice Principal:** Base Role = `teacher`, Functional Assignment = `Vice Principal` (holds academic moderation/review; NO result publication authority).
   - **Exam Officer:** Base Role = `teacher`, Functional Assignment = `Exam Officer` (holds exam management/moderation; CANNOT approve or publish).
   - **HOD:** Base Role = `teacher`, Functional Assignment = `HOD` (department scope).
   - **Form Master:** Base Role = `teacher`, Functional Assignment = `Form Master` (class scope).
   - **Subject Teacher:** Base Role = `teacher`, Functional Assignment = `Subject Teacher` (offering scope).
   - **Assistant Teacher:** Base Role = `teacher`, Functional Assignment = `Assistant Teacher` (offering scope; draft entry only).
4. **Strict Additivity Invariant:** Functional assignments ADD permissions to a base role; they can NEVER remove or subtract permissions already granted by a base role. Therefore, neither VP nor Exam Officer can be assigned `school_admin` base role.
5. Authoritative persistence for VP, Exam Officer, and academic appointments is established via a Phase-2 dedicated relational table `public.school_staff_assignments` with explicit 5-state lifecycle (`appointed`, `active`, `suspended`, `expired`, `revoked`) and temporal ranges (`effective_from`, `effective_until`, `academic_year_id`).
6. Scope graph: `department` and `class` are parallel branches under `school` (invariant: `department` is NEVER a parent of `class`).
7. Canonical permission registry inventory contains **exactly 33 atomic permissions** across 8 modules, adhering strictly to `<module>.<resource>.<action>` grammar.
8. Enforce deterministic 8-step evaluation precedence order defaulting to `DENY`.

### Consequences
- Eliminates duplicate accounts for teachers holding multiple responsibilities.
- Avoids enum explosion and risky destructive schema migrations.
- Preserves least privilege and strict separation of duties (e.g., Exam Officer moderates, School Admin/Principal approves).
- Preserves strict tenant isolation across all role levels.
- RLS policies remain performant, simple, and clean by joining existing relational assignment tables (`departments`, `sections`, `teacher_assignments`, and future `school_staff_assignments`).


## ADR-0004 — Canonical Communications & Notifications Authorization Architecture
**Date:** 2026-09-09  
**Status:** APPROVED (Supervisory Review TASK-0007 Phase 3D Cohort 3D-1)  
**Authority:** ChatGPT / Human Project Owner  

### Context
In Phase 3A/3B, communications endpoints were deferred under GAP-3B-01 because the canonical registry lacked communications permissions. Furthermore, discovery in Phase 3D revealed critical cross-tenant rule and template leakage via client-writable `user_metadata.tenant_id`, and unguarded service-role operations on notifications. To prevent permission laundering and maintain least privilege, personal inbox management must be strictly separated from administrative institutional broadcasts and rule/template management.

### Decision
Extend the canonical permission registry with six atomic permissions across two modules:
1. `notifications.self.view`: View personal inbox and unread counts (Scope: `self`, all active roles).
2. `notifications.self.manage`: Mark personal notifications as read / dismiss (Scope: `self`, all active roles).
3. `communications.templates.manage`: Create, edit, and archive message templates (Scope: `school`, base roles: `school_admin`, `org_admin`, `super_admin`; assignment: `exam_officer`).
4. `communications.rules.manage`: Configure automated trigger rules and routing (Scope: `school`, base roles: `school_admin`, `org_admin`, `super_admin`; assignment: `exam_officer`).
5. `communications.broadcast.send`: Dispatch or schedule mass multi-channel broadcasts (Scope: `school`, base roles: `school_admin`, `org_admin`, `super_admin`; assignment: `exam_officer`).
6. `communications.broadcast.view`: View broadcast dispatch history and delivery logs (Scope: `school`, base roles: `school_admin`, `org_admin`, `super_admin`; assignments: `vice_principal`, `exam_officer`, `hod`).

### Consequences
- Personal notifications are strictly bounded to `user.id === auth.userId`. Client-supplied recipient parameters are rejected.
- Multi-tenant boundary is enforced via server-validated `auth.tenantId`. Untrusted `user_metadata.tenant_id` is eliminated.
- Teachers, students, and parents cannot dispatch school broadcasts or alter institutional communication rules.

---

## ADR-0005 — Platform Leads Authorization Architecture
**Date:** 2026-09-09  
**Status:** APPROVED (Supervisory Review TASK-0007 Phase 3D Cohort 3D-1)  
**Authority:** ChatGPT / Human Project Owner  

### Context
Prospective institution demo inquiries and onboarding leads (`demo_requests` table) were historically guarded by legacy role checks (`roles: ['super_admin']`) and queried via raw `getPgPool()`. Overloading `platform.tenants.manage` with lead qualification conflates CRM pipeline management with production tenant lifecycle control (create, configure, suspend, migrate).

### Decision
Define a dedicated canonical permission:
- `platform.leads.manage`:
  - Module: `platform` | Resource: `leads` | Action: `manage`
  - Description: "Manage prospective tenant inquiries, demo scheduling, and onboarding pipeline"
  - Canonical Scope: `platform` | Allowed Scopes: `['platform']`
  - Base Role Entitled: `super_admin` only
  - Functional Assignments: None

### Consequences
- Clean domain separation between prospective onboarding leads and production school tenant infrastructure.
- Eliminates raw `getPgPool()` bypass on `/api/super-admin/leads`.
- Future platform sales/support roles can be granted lead management without inheriting production tenant management.

---

## ADR protocol
New ADRs cover material architecture, schema/RLS, dependency, integration, boundary and compatibility choices. Record evidence, alternatives, decision, consequences, security/data impact, rollout/rollback, authority and links. Human acceptance is required for material operational decisions.
