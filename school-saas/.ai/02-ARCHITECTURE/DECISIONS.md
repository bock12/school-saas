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
1. Keep the base `user_role` database enum minimal and stable: `super_admin`, `org_admin`, `school_admin`, `teacher`, `student`, `parent`.
2. Model composite and specialized responsibilities (`HOD`, `Form Master`, `Subject Teacher`, `Exam Officer`) as **Functional Assignments** linked to concrete institutional entities (departments, sections, offerings, school exam offices).
3. Derive effective permissions additively: `Effective Permissions = Base Role Permissions + Sum(Functional Assignment Permissions)`.
4. Enforce resource scopes (`department_id`, `section_id`, `tenant_id`) across RLS policies, server actions, and API route handlers.
5. Standardize permission nomenclature to `<module>.<resource>.<action>`.

### Consequences
- Eliminates duplicate accounts for teachers holding multiple responsibilities.
- Avoids enum explosion and risky destructive schema migrations.
- Preserves least privilege and strict separation of duties (e.g., Exam Officer moderates, School Admin/Principal approves).
- RLS policies remain performant, simple, and clean by joining existing relational assignment tables (`departments`, `sections`, `teacher_assignments`, and new `school_exam_officers`).

## ADR protocol
New ADRs cover material architecture, schema/RLS, dependency, integration, boundary and compatibility choices. Record evidence, alternatives, decision, consequences, security/data impact, rollout/rollback, authority and links. Human acceptance is required for material operational decisions.
