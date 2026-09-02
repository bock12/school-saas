# Task Queue

Use the lifecycle in `.ai/AGENTS.md`. Every task needs owner, supervisor, module, objective, acceptance criteria, constraints, files, dependencies, security classification, and linked report/review/ADR/risk records.

## TASK-0001 - Security boundary inventory and verification plan

**Status:** IMPLEMENTED

**Priority:** Critical

**Owner:** Gemini/Antigravity (after human approval)

**Supervisor:** Codex

**Module:** Cross-cutting auth, tenant isolation, API routes, Supabase/RLS

**Security classification:** Mandatory security review

### Objective

Create evidence-backed inventory of every service-role use and protected API route, then define an approved test plan proving role and cross-tenant boundaries. Do not alter behavior until implementation scope is human-approved.

### Acceptance criteria

- [ ] Each service-role call identifies actor, trusted authorization, tenant scope, data touched, and RLS-bypass reason.
- [ ] Each protected API route identifies auth, authorization, tenant resolution, validation, and public/private exposure.
- [ ] Test strategy covers applicable super admin, org admin, school admin, teacher, student, parent, and exam officer boundaries.
- [ ] Strategy includes distinct-tenant RLS denial tests without service-role clients as proof.
- [ ] Findings and remediation proposals are documented without secrets or production data.

### Constraints

No migration/schema/RLS modification, dependency installation, broad refactor, or production access. Escalate suspected critical/high issues immediately.

### Relevant files

`src/lib/auth/guards.ts`, `src/lib/supabase/admin.ts`, `src/app/api/**`, `supabase/migrations/**`, and `.ai/SECURITY_*` records.

### Dependencies

Human approval; safe non-production environment and approved test-data approach.

### Outcome

Read-only inventory completed in `SECURITY_AUDIT.md`. Critical/high remediation tasks below are recommendations only; none is authorized for implementation until approved by the human.

## TASK-0002 - Credential exposure incident containment

**Status:** BACKLOG

**Priority:** Critical

**Owner:** Human developer / security owner

**Supervisor:** Codex

**Module:** Repository operational scripts and credential management

**Security classification:** Mandatory security review

### Objective

Respond to `SEC-005`: rotate/revoke exposed database credentials, assess repository/history exposure, remove embedded credentials through an approved recovery plan, and add an approved secret-scanning control.

### Constraints

Human-owned operation. Do not rotate, delete history, or execute database changes without explicit human approval and operational rollback planning.

## TASK-0003 - Contain unauthenticated privileged APIs

**Status:** BACKLOG

**Priority:** Critical

**Owner:** Gemini/Antigravity (after human approval)

**Supervisor:** Codex

**Module:** Admissions, exams, CASS export, super-admin leads

**Security classification:** Mandatory security review

### Objective

Address `SEC-006` through `SEC-008` by defining intended public/private route contracts and enforcing authenticated actor, role, tenant, object, validation, and response-minimization boundaries.

### Acceptance criteria

- [ ] Every non-public method denies unauthenticated and wrong-role callers before privileged DB access.
- [ ] Tenant-scoped operations derive/verify tenant from trusted actor and object ownership.
- [ ] Explicitly public intake routes retain only minimal safe behavior and abuse controls.
- [ ] Regression tests cover unauthenticated, wrong-role, and second-tenant requests.

## TASK-0004 - Privileged server-action authorization boundary

**Status:** BACKLOG

**Priority:** Critical

**Owner:** Gemini/Antigravity (after human approval)

**Supervisor:** Codex

**Module:** Tenant, academic, curriculum, offering, subject, CMS actions; pg fallback

**Security classification:** Mandatory security review

### Objective

Address `SEC-009` and `SEC-010` by requiring trusted actor/role/tenant/object checks before every privileged action and limiting direct auth-user/PostgreSQL fallback operations.

### Acceptance criteria

- [ ] No exported privileged action performs a DB/auth-admin operation before authorization.
- [ ] Tenant ID/slug/UUID and target objects are authorized against the actor, including org-child rules.
- [ ] Direct `auth.users` manipulation is isolated, human-approved, and not exposed to untrusted action inputs.
- [ ] Direct action tests prove denial of unauthenticated and cross-tenant calls.

## TASK-0005 - Tenant resolution and RLS correction plan

**Status:** BACKLOG

**Priority:** High

**Owner:** Codex for design; Gemini/Antigravity after human approval

**Supervisor:** Human developer

**Module:** Tenant resolution, examinations, notifications, staff attendance

**Security classification:** Mandatory security review and migration approval

### Objective

Design and approve remediation for `SEC-011` and `SEC-012`: fail-closed canonical tenant resolution, examination tenant/role RLS, notification RLS coverage, and appropriate staff-attendance write roles.

### Constraints

Requires ADR, migration/RLS review, safe test environment, rollout/rollback plan, and explicit human approval before any database change.

## TASK-0006 - Authorization regression test foundation

**Status:** BACKLOG

**Priority:** High

**Owner:** Gemini/Antigravity (after human approval)

**Supervisor:** Codex

**Module:** Cross-cutting security verification

**Security classification:** Mandatory security review

### Objective

Implement the approved TASK-0001 test matrix without using service-role clients as RLS proof. Cover tenant isolation, RBAC, API/action denial, RLS, service-role boundaries, and sensitive student/parent data.
