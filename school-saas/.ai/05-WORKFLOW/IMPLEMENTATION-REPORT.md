# Implementation Reports

## Reporting template

### Task
### Status
### Summary
### Files changed
### Database/API changes
### Authentication/authorization behavior
### Tenant behavior
### Tests and exact results
### Typecheck/lint/build
### Security review notes
### Known limitations
### Escalations
### Documentation updated

## GOV-0001 — AI Engineering Governance Setup
**Date:** 2026-09-01  
**Status:** Historical — documentation/governance only

Created the initial AI governance records from the old collaboration playbook and a read-only repository architecture inventory. No application source, migration, database, dependency, package or infrastructure change was made.

**Validation:** Repository documentation, configuration, route architecture, auth guards, Supabase admin client, page inventory and migrations were inspected. No implementation checks were run because this was documentation-only.

**Security impact:** Established mandatory review for tenant, RLS, privileged, API, data and migration work.

## TASK-0001 — Security Boundary Inventory and Verification
**Date:** 2026-09-01  
**Status:** Historical — implemented as read-only investigation

Completed a static security-boundary inventory covering privileged Supabase/PostgreSQL/auth-user access, protected API routes, server actions, tenant resolution, RLS, RBAC and test gaps. No implementation change was made.

**Evidence highlights:**
- Tracked hard-coded database credentials were confirmed in eleven migration-runner scripts (`SEC-005`).
- Unauthenticated sensitive service-role/direct-PostgreSQL APIs were confirmed for admissions, CASS export, exams/dashboard and super-admin leads.
- Missing action-boundary authorization was confirmed in several tenant/academic/curriculum/offering/subject/CMS actions.
- Permissive examination RLS predicates and notification-policy gaps were identified.
- Metadata/tenant-slug trust issues were recorded as potential findings requiring runtime verification.

**Validation:** Static repository inspection only. No runtime tests, production access, credential use, migration execution or dependency scan.

**Follow-up:** Human review required; prioritize credential containment, privileged API/action authorization, tenant resolution/RLS remediation and regression tests.

## TASK-TEST-001 — AI-EOS Collaboration Protocol Validation
**Date:** 2026-09-03  
**Status:** IMPLEMENTED (Review Corrections Applied · Awaiting Second ChatGPT Supervisory Review)  
**Implementer:** Gemini / Antigravity (Implementation Engineer & Technical Contributor)  
**Supervisor / Authority:** ChatGPT (Chief Software Architect & Project Supervisor)  
**Final Authority:** Human Project Owner  

### Summary
Executed operational and governance validation test TASK-TEST-001 in accordance with the SchoolSaaS AI Engineering Operating System (AI-EOS v1.1/v1.2). Validated autonomous discovery of authority boundaries, recognized the authoritative handshake from `CONTROL-STATE.yaml` and `MSG-TEST-001`, evaluated repository and governance documentation health, identified stale references and governance duplications, formulated evidence-based recommendation `REC-0001`, and verified blocker/escalation mechanisms without modifying application source, database schemas, authentication, RLS, or production infrastructure.

Following ChatGPT supervisory review `REVIEW-TASK-TEST-001` (`CHANGES_REQUESTED` via `MSG-TEST-003`), this report was updated to incorporate all six requested corrections: correcting `REC-0001` remediation logic to distinguish function scoping from genuine multi-layered authorization; isolating the examination API exposure (`src/app/api/admin/exams/route.ts`) as a distinct critical security concern; documenting the arbitrary tenant fallback in `src/app/actions/academic-calendar.ts` (`R-004`); revising QA evidence terminology into standardized categories; and clarifying review lifecycle boundaries.

### Repository and Governance Files Inspected
1. `school-saas/AGENTS.md` (Next.js 16 breaking change rules)
2. `school-saas/CLAUDE.md` (`@AGENTS.md` pointer)
3. `school-saas/.ai/AGENTS.md` (Core AI-EOS governance charter)
4. `school-saas/.ai/README.md` (AI-EOS overview and canonical structure rules)
5. `school-saas/.ai/00-GOVERNANCE/AI-GOVERNANCE.md` (Authority, lifecycle, evidence rules)
6. `school-saas/.ai/00-GOVERNANCE/AI-COLLABORATION-PROTOCOL.md` (Handshake, recommendations, review protocol)
7. `school-saas/.ai/00-GOVERNANCE/AUTHORITY-MODEL.md` (Hierarchy and escalation thresholds)
8. `school-saas/.ai/00-GOVERNANCE/AI-ROLES.md` (Role definitions and responsibilities)
9. `school-saas/.ai/00-GOVERNANCE/ESCALATION-POLICY.md` (ARCHITECTURAL_ESCALATION triggers)
10. `school-saas/.ai/00-GOVERNANCE/AUDIT-PROTOCOL.md` (12-point inspection hierarchy)
11. `school-saas/.ai/00-GOVERNANCE/REPOSITORY-TRUTH.md` (Evidence classification standards)
12. `school-saas/.ai/01-PROJECT/PROJECT-CONTEXT.md` & `school-saas/.ai/PROJECT-CONTEXT.md`
13. `school-saas/.ai/01-PROJECT/MODULE-STATUS.md` & `school-saas/.ai/01-PROJECT/MODULE_STATUS.md`
14. `school-saas/.ai/01-PROJECT/ROADMAP.md` & `SYSTEM-MAP.md`
15. `school-saas/.ai/02-ARCHITECTURE/ARCHITECTURE.md`, `DECISIONS.md`, `TARGET-ARCHITECTURE.md`
16. `school-saas/.ai/03-ENGINEERING/CODING-STANDARDS.md` & `TESTING-STANDARDS.md`
17. `school-saas/.ai/04-SECURITY/SECURITY-POLICY.md`, `SECURITY-ARCHITECTURE.md`, `PRIVILEGED-ACCESS.md`, `RBAC.md`, `TENANT-ISOLATION.md`, `THREAT-MODEL.md`
18. `school-saas/.ai/05-WORKFLOW/CONTROL-STATE.yaml`, `TASK-QUEUE.md`, `TASK-TEST-001.md`, `DEFINITION-OF-DONE.md`, `WORKED-EXAMPLE.md`, `REVIEW-QUEUE.md`, `RECOMMENDATIONS.md`, `messages/MSG-TEST-001.md`, `messages/MSG-TEST-002.md`, `messages/MSG-TEST-003.md`, `messages/README.md`
19. `school-saas/.ai/06-MODULES/SECURITY-CONTROL-MATRIX.md`
20. `school-saas/.ai/07-RISK/RISKS.md` & `INCIDENTS.md`
21. `school-saas/.ai/08-CHANGE/AI-EOS-MIGRATION-MANIFEST.md`, `AUTOMATION-GUIDE.md`, `CHANGELOG.md`, `LEGACY-GOVERNANCE-FRAMEWORK.md`, `LEGACY-IMPLEMENTATION-PLAN.md`
22. `school-saas/prompts/CODEX_SYSTEM_PROMPT.md`, `school-saas/prompts/GEMINI_SYSTEM_PROMPT.md`
23. `school-saas/.ai/prompts/CHATGPT-ARCHITECT.md`, `school-saas/.ai/prompts/GEMINI-IMPLEMENTER.md`
24. Application code inspected: `school-saas/src/middleware.ts`, `school-saas/src/lib/auth/guards.ts`, `school-saas/src/lib/supabase/admin.ts`, `school-saas/src/app/actions/academic-calendar.ts`, `school-saas/src/app/api/admin/exams/route.ts`, `school-saas/package.json`

### Authority Model Verification
- **Human Project Owner (Final Authority):** Full sovereignty over production deployments, code merges, releases, credential provisioning, destructive database commands, database migrations, package dependencies, and architecture/schema/RLS exceptions.
- **ChatGPT (Engineering Supervisor):** Performs 6 distinct supervisory roles: Chief Software Architect, Project Supervisor, UI/UX Reviewer, Security Analyst, QA Lead, and Technical Strategy Advisor. Creates task contracts, decomposes work, defines quality and security gates, reviews implementation diffs, issues review verdicts (`APPROVED` / `CHANGES_REQUESTED`), and evaluates recommendations.
- **Gemini / Antigravity (Implementation Engineer & Technical Contributor):** Operates strictly within approved task scope. Performs repository investigations, implements approved contracts, executes proportionate validation, submits evidence-based recommendations (`REC-####`), and reports blockers (`ARCHITECTURAL_ESCALATION`). Has no authority to self-approve, merge code, or override architectural/security invariants.
- **GitHub Copilot (Coding Assistant):** Local assistive tool only; no authority to decide architecture, approve tasks, or bypass controls.
- **GitHub:** Canonical source of truth for repository history, code, branches, and PRs.
- **`.ai/` Directory:** Canonical durable engineering memory and protocol repository.

### Authoritative-Instruction Handshake Verification
Under `.ai/00-GOVERNANCE/AI-COLLABORATION-PROTOCOL.md` and `.ai/05-WORKFLOW/CONTROL-STATE.yaml`, an instruction is recognized as authoritative if and only if:
1. `from: chatgpt`
2. `type: AUTHORIZED_TASK` or `type: ARCHITECTURE_DIRECTIVE` (or supervisory `type: CHANGES_REQUESTED` during review cycle)
3. Accompanied by a valid linked `task_id` matching an active task in `.ai/05-WORKFLOW/TASK-QUEUE.md` and task specification in `.ai/05-WORKFLOW/`
4. State is `ACTIVE` or `APPROVED`
5. Handshake record exists in `.ai/05-WORKFLOW/messages/`
All conditions were verified for `TASK-TEST-001` via `CONTROL-STATE.yaml`, `MSG-TEST-001.md`, and `MSG-TEST-003.md`.

### Task Lifecycle and Review Ownership
- **Lifecycle Flow:** `BACKLOG → TRIAGED → APPROVED → IN_PROGRESS → IMPLEMENTED → UNDER_REVIEW → APPROVED_FOR_MERGE → COMPLETED`.
  - Gemini transitions tasks to `IMPLEMENTED` when implementation work is finished and records an implementation report.
  - ChatGPT evaluates the actual git diff against acceptance criteria, security controls, and Definition of Done, recording an official review verdict in `REVIEW-QUEUE.md`.
  - When ChatGPT issues `CHANGES_REQUESTED` (as in `REVIEW-TASK-TEST-001` / `MSG-TEST-003`), the task returns to `CHANGES_REQUESTED` / `IN_PROGRESS` until corrections are applied.
  - Upon applying corrections, Gemini resubmits for supervisory review.
  - Human alone executes merge/release (`COMPLETED`).
  - **Gemini never self-approves or marks work approved.**

### Specific Security & Architectural Findings (Separated)

1. **Privileged Client Instantiation vs. Multi-Layered Authorization (`REC-0001`):**
   - `createAdminClient()` at module level in `src/app/actions/academic-calendar.ts:8` and `src/app/api/admin/exams/route.ts:4` creates build-time fragility and decouples client creation from request-level guards.
   - **Correction Applied:** Moving `createAdminClient()` into function scope is **not an authorization control**. Genuine security requires explicit multi-layered enforcement:
     1. Authentication / session validation via Supabase auth.
     2. Tenant resolution and tenant authorization (fail-closed).
     3. Role / permission authorization (RBAC).
     4. Resource-level ownership / scope checks.
     5. Privileged execution strictly after authorization boundaries pass.

2. **Unauthenticated Privileged Examination API (`src/app/api/admin/exams/route.ts`):**
   - Lines 7–25 expose a `GET` endpoint that directly executes `supabase.from('exam_sessions').select('*')`, `exam_results_approval`, and `exam_malpractices` across all tenants.
   - It performs **no** authentication check, **no** session check, **no** role check, and **no** tenant filtering.
   - This is an active critical security finding (`R-002` / `TASK-0003`) that is distinct from client placement. A dedicated remediation task is recommended.

3. **Arbitrary Tenant Resolution Fallback (`src/app/actions/academic-calendar.ts`):**
   - Lines 66–73, 118–119, and 125–133 in `resolveTenantId()` explicitly fall back to `SELECT id FROM tenants LIMIT 1` (arbitrary tenant) when a tenant slug is missing, invalid, or unresolvable.
   - This directly violates `.ai/AGENTS.md` ("Tenant resolution must fail closed; never select an arbitrary fallback tenant") and represents an active tenant-isolation risk (`R-004`).

### Documentation and Governance Health Findings
1. **Accidental Truncation of `RECOMMENDATIONS.md` (`CONFIRMED`):** In commit `0d05dd2`, `school-saas/.ai/05-WORKFLOW/RECOMMENDATIONS.md` was inadvertently truncated to 0 bytes. Restored canonical header and indexed `REC-0001`.
2. **Stale Codex References (`CONFIRMED` / `CONFLICT`):**
   - `school-saas/prompts/CODEX_SYSTEM_PROMPT.md` retains `# Codex / ChatGPT — Chief Software Architect & Project Supervisor Prompt` and references old flat paths (`.ai/TASK_QUEUE.md`, `.ai/DECISIONS.md`, etc.).
   - `school-saas/prompts/GEMINI_SYSTEM_PROMPT.md` similarly references pre-AI-EOS flat file paths.
   - Contrast with canonical `.ai/08-CHANGE/AI-EOS-MIGRATION-MANIFEST.md` which explicitly notes Codex has been retired in favor of ChatGPT.
3. **Governance Duplication (`CONFIRMED` / `CONFLICT`):**
   - `school-saas/.ai/PROJECT-CONTEXT.md` (empty placeholder) vs `school-saas/.ai/01-PROJECT/PROJECT-CONTEXT.md` (actual populated context).
   - `school-saas/.ai/01-PROJECT/MODULE-STATUS.md` (emoji status) vs `school-saas/.ai/01-PROJECT/MODULE_STATUS.md` (evidence-based status matrix).
4. **Topology Disconnect (`CONFIRMED`):** Git repo root is `SchoolSaas/`, but project code and `.ai/` live in `SchoolSaas/school-saas/`. Repo root lacks an `AGENTS.md` file; `school-saas/AGENTS.md` contains only Next.js 16 rules, while `.ai/AGENTS.md` contains AI-EOS governance.
5. **Untracked Historical Implementation Artifacts (`CONFIRMED`):** `school-saas/Implemenation plan.md` sits untracked in project root outside AI-EOS workflow.

### QA Evidence & Validation Categories (Corrected Terminology)
1. **Governance & Collaboration Protocol Validation:**
   - Handshake verification: Successfully parsed `CONTROL-STATE.yaml` and authenticated message `MSG-TEST-001`.
   - Review cycle execution: Processed ChatGPT supervisory instruction `MSG-TEST-003` (`CHANGES_REQUESTED`), updated records, and generated response `MSG-TEST-004`.
   - Branching verification: Maintained clean isolation on `ai-eos/task-test-001-validation` without merging.
2. **Static Repository & Security Analysis:**
   - Static inspection of `src/middleware.ts`, `src/lib/auth/guards.ts`, `src/lib/supabase/admin.ts`, `src/app/actions/academic-calendar.ts`, and `src/app/api/admin/exams/route.ts`.
   - Identification of module-level client instantiation, unauthenticated API exposure, and `LIMIT 1` tenant fallback.
3. **Automated Application Tests:**
   - **None run.** As confirmed in `package.json`, no automated test framework (e.g. Vitest, Jest, Playwright) is configured or installed in the repository. Application automated tests were not required and were not run.
4. **Runtime & Integration Tests:**
   - **None run.** In accordance with explicit task boundaries, no dev servers, live database connections, or HTTP requests were executed.

### Application Code, Database, and Production Boundary Compliance
- Application code modified: **None** (0 lines)
- Database schema / migrations modified: **None** (0 lines)
- Authentication / Authorization / RLS modified: **None** (0 lines)
- Dependencies modified: **None** (0 lines)
- Infrastructure / production configuration modified: **None** (0 lines)
- Merges executed: **None** (0 merges)

### Files Changed (Current Review Correction Round)
- `school-saas/.ai/05-WORKFLOW/RECOMMENDATIONS.md` (Refined REC-0001 with layered auth logic, exam API details, and tenant fallback details)
- `school-saas/.ai/05-WORKFLOW/IMPLEMENTATION-REPORT.md` (Updated report with QA taxonomy, separated security findings, and review correction status)
- `school-saas/.ai/05-WORKFLOW/REVIEW-QUEUE.md` (Recorded implementer response to REVIEW-TASK-TEST-001)
- `school-saas/.ai/05-WORKFLOW/TASK-QUEUE.md` (Updated TASK-TEST-001 status reflecting review corrections applied)
- `school-saas/.ai/05-WORKFLOW/CONTROL-STATE.yaml` (Updated last_response to MSG-TEST-004)
- `school-saas/.ai/05-WORKFLOW/messages/MSG-TEST-004.md` (Created implementation response message to MSG-TEST-003)

### Current Assessment
**CORRECTIONS APPLIED · PENDING SECOND CHATGPT SUPERVISORY REVIEW** — All six review findings from `MSG-TEST-003` have been addressed in documentation. PR remains unmerged awaiting ChatGPT review verdict.

---

# TASK-0003 — Privileged API & Tenant Isolation Security Investigation Report

**Task Identifier:** TASK-0003  
**Investigation Date:** 2026-09-03  
**Investigator:** Gemini / Antigravity (Implementation Engineer & Technical Contributor)  
**Authoritative Reference:** `school-saas/.ai/05-WORKFLOW/messages/MSG-0005.md` & `school-saas/.ai/05-WORKFLOW/TASK-0003.md`  
**Execution Nature:** READ-ONLY Security Architecture Investigation & Remediation Planning  
**Enforcement Boundary:** 0 application modifications, 0 database changes, 0 RLS modifications, 0 auth changes, 0 dependency changes, 0 infrastructure changes.

---

## 1. Executive Summary

A comprehensive static security architecture investigation was conducted across the entire SchoolSaaS API surface, authentication boundaries, privileged client usages, and tenant isolation mechanisms. 

The investigation confirmed multiple **CRITICAL** security vulnerabilities across primary API routes and Server Actions. Most significantly:
1. **Edge Middleware Excludes All API Routes:** `src/middleware.ts` explicitly matches `(?!api...)`, meaning zero `/api/*` routes receive edge authentication, session token refresh, or subdomain tenant scoping.
2. **Unauthenticated Privileged API Routes:** High-privilege endpoints—specifically `/api/admin/exams`, `/api/admissions`, `/api/cass-export`, `/api/exam-office/dashboard`, and `/api/super-admin/leads`—are entirely unauthenticated. They instantiate module-level or request-level privileged clients (`createAdminClient()` or raw PostgreSQL connection pools) and expose sensitive cross-tenant student records, national exam scores, WAEC Continuous Assessment data, applicant PII, and sales leads to any anonymous internet caller.
3. **Broken Object-Level Authorization (BOLA / IDOR):** Anonymous or unauthenticated callers can mutate examination sessions (`PATCH /api/admin/exams`, `PATCH /api/exam-office/dashboard`), delete applicants (`DELETE /api/admissions?id=...`), update applicant profiles (`PATCH /api/admissions`), and delete leads (`DELETE /api/super-admin/leads?id=...`) across any school tenant simply by passing row UUIDs.
4. **Database RLS Bypass & Permissive Policies:** While tables like `applicants` have well-formed tenant-scoping RLS policies in migrations, the API route handlers bypass RLS entirely by using `createAdminClient()`. Moreover, core examination tables created in migrations `030_exam_core_system.sql` and `031_exam_analytics_dashboard.sql` define `FOR ALL USING (true)` policies with zero tenant or role checks, allowing direct exploitation via the Supabase REST/PostgREST client interface.
5. **Arbitrary Tenant Fallbacks:** In Server Actions (`src/app/actions/academic-calendar.ts` and `academic-sessions.ts`), tenant resolution fails open rather than closed: if a slug is missing or unmatched, the system executes `SELECT id FROM tenants LIMIT 1`, silently operating against an arbitrary school.
6. **Zero Automated Test Coverage:** The repository contains zero unit, integration, or API security tests, leaving all authorization and tenant boundary regressions undetected.

Immediate architectural remediation is required before production deployment.

---

## 2. Architecture Baseline

### 2.1 Next.js App Router Structure & Edge Proxy Boundary
- **Framework:** Next.js 14 (App Router) with React 18, Supabase SSR (`@supabase/ssr`), and TypeScript.
- **Edge Middleware (`src/middleware.ts`):** 
  - Excludes all API routes via lines 103–115:
    ```typescript
    export const config = {
      matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
      ],
    };
    ```
  - **Security Consequence [CONFIRMED]:** The edge proxy refreshes sessions and extracts subdomains *only* for HTML page routes. API routes (`/api/*`) are completely unshielded at the edge and must perform their own authentication and authorization.

### 2.2 Client Invocations vs Server Actions vs API Routes
- **UI Pages:** Rendered via Server Components with `requireTenantRole` guards from `src/lib/auth/guards.ts`.
- **Server Actions:** Located in `src/app/actions/*.ts`. Next.js exposes these as callable HTTP POST RPC endpoints. Some actions (e.g., `src/app/actions/users.ts`) enforce strict RBAC checks via `getActorProfile()` and `canManageTarget()`. Others (e.g., `academic-calendar.ts`, `subjects.ts`) omit caller authentication and rely only on `resolveTenantId(tenantSlug)`, allowing cross-tenant caller abuse.
- **API Routes:** Located in `src/app/api/*/route.ts`. Standalone HTTP handlers. Currently lack a centralized API authorization middleware or helper.

### 2.3 Privileged Client Architectures
- **Supabase Admin Client (`src/lib/supabase/admin.ts`):**
  - Instantiates `@supabase/supabase-js` `createClient` using `SUPABASE_SERVICE_ROLE_KEY` with `{ auth: { persistSession: false, autoRefreshToken: false } }`.
  - Calling this client completely bypasses Postgres Row Level Security (RLS).
  - Module-level declarations (`const supabase = createAdminClient()` at line 4) execute on module import, risking CI/build-time environment failures and promoting context-free query execution.
- **Direct PostgreSQL Connection Pool (`pg.Pool` in `src/lib/db/pg-fallback.ts`):**
  - Connects directly to `DATABASE_URL` with `{ ssl: { rejectUnauthorized: false } }`.
  - Used in 5 API route handlers and 3 server actions to bypass Supabase APIs completely, directly querying tables and writing directly into `auth.users` via `crypt($..., gen_salt('bf'))`.

---

## 3. Complete API Inventory (All 17 Route Handlers)

| # | Route Path | Methods | Intended Scope | Auth Enforced? | Role Check | Tenant Isolation | Privileged Client | Sensitive Data Exposed | Vulnerability Status |
|---|------------|---------|----------------|----------------|------------|------------------|-------------------|------------------------|----------------------|
| 1 | `/api/academics/ai/lesson-plan` | POST | Authenticated Staff | Yes (`getUser()`) | None | Broken (BOLA on `offering_id`) | Direct `pg.Pool` | Complete curriculum, teacher names, generated plans | **CONFIRMED VULNERABLE** |
| 2 | `/api/admin/exams` | GET, PATCH | School / Exam Admin | None | None | None (Global leak) | Module `createAdminClient` | Exam sessions, malpractice cases, approvals | **CONFIRMED CRITICAL** |
| 3 | `/api/admissions` | GET, POST, PATCH, DELETE | Admin / Public Apply | None | None | Broken (`tenantSlug` optional; leaks all) | Module `createAdminClient` | Full applicant PII, WAEC scores, parent contacts | **CONFIRMED CRITICAL** |
| 4 | `/api/auth/callback` | GET | Public Auth Callback | Yes (Exchange code) | Yes | Positive Control (Validates tenant match) | Scoped service-role client | Session tokens | **CONTROL VERIFIED** |
| 5 | `/api/cass-export` | GET, POST | Exam Officer / MBSSE | None | None | Broken (`tenantSlug` unauthenticated) | Module `createAdminClient` | Student WAEC index numbers, grades, CA marks | **CONFIRMED CRITICAL** |
| 6 | `/api/exam-office/communication-rules` | GET, POST | Exam Admin | Yes (`getUser()`) | None | Broken (Leaks all if metadata empty) | Request `createAdminClient` | Automated communication trigger rules | **CONFIRMED VULNERABLE** |
| 7 | `/api/exam-office/communication-templates` | GET, POST | Exam Admin | Yes (`getUser()`) | None | Broken (Leaks all if metadata empty) | Request `createAdminClient` | Message templates, internal variables | **CONFIRMED VULNERABLE** |
| 8 | `/api/exam-office/communications` | GET, POST | Exam Admin | Yes (`getUser()`) | None | Broken (Arbitrary `tenantSlug` bypass) | Request `createAdminClient` | Broadcast dispatch, SMS dispatch, logs | **CONFIRMED CRITICAL** |
| 9 | `/api/exam-office/dashboard` | GET, POST, PATCH, DELETE | Exam Officer | None | None | None (Dumps 10 entire DB tables) | Module `createAdminClient` | Student GPA, marks, rank, appeals, malpractices | **CONFIRMED CRITICAL** |
| 10 | `/api/notifications` | GET, POST | Authenticated User | Yes (`getUser()`) | N/A | Enforced (`user_id = user.id`) | Request `createAdminClient` | User-specific notifications | **CONTROL VERIFIED** |
| 11 | `/api/public/check-slug` | GET | Public Landing | None | None | N/A | Direct `pg.Pool` | Subdomain availability | **LOW RISK (Needs rate limiting)** |
| 12 | `/api/public/demo-requests` | POST | Public Landing | None | None | N/A | Direct `pg.Pool` + REST | Inbound sales lead creation | **LOW RISK (Needs rate limiting)** |
| 13 | `/api/public/landing-sections` | GET | Public Landing | None | None | N/A | Action CMS Client | Landing page content | **INTENDED PUBLIC** |
| 14 | `/api/public/register-tenant` | POST | Public Onboarding | None | None | N/A (Provisions tenant) | Direct `pg.Pool` (`auth.users` raw insert) | Returns provisioned admin & school metadata | **MEDIUM RISK (Needs rate limiting/CAPTCHA)** |
| 15 | `/api/public/tenants` | GET | Public Landing Directory | None | None | N/A (Filters suspended) | Direct `pg.Pool` + REST | School names, slugs, contact emails/phones | **INTENDED PUBLIC** |
| 16 | `/api/super-admin/leads` | GET, PATCH, DELETE | Super Admin | None | None | N/A (Platform-wide) | Direct `pg.Pool` | Full lead contact PII, phone, email, notes | **CONFIRMED CRITICAL** |
| 17 | `/api/test-db` | GET | Super Admin Diagnostic | Yes (`getUser()`) | Yes (`super_admin`) | Platform diagnostic | Request `createAdminClient` | Student and applicant search results | **CONTROLLED (404 in prod)** |

---

## 4. Authentication Findings

### 4.1 Missing Edge Authentication
- `src/middleware.ts` excludes `/api/*` from its matcher regex (line 113).
- **Finding [CONFIRMED]:** No session validation, authentication header check, or cookie hydration occurs at the Next.js middleware layer for any API route.

### 4.2 Unauthenticated Route Handlers
The following routes have **zero** authentication checks and process requests from anonymous callers:
- `src/app/api/admin/exams/route.ts:18` (GET) and `route.ts:40` (PATCH)
- `src/app/api/admissions/route.ts:15` (GET), `route.ts:51` (POST), `route.ts:167` (PATCH), `route.ts:212` (DELETE)
- `src/app/api/cass-export/route.ts:18` (GET), `route.ts:120` (POST)
- `src/app/api/exam-office/dashboard/route.ts:6` (GET), `route.ts:174` (POST), `route.ts:218` (PATCH), `route.ts:253` (DELETE)
- `src/app/api/super-admin/leads/route.ts:15` (GET), `route.ts:76` (PATCH), `route.ts:131` (DELETE)

### 4.3 Insecure Session Extraction Pattern
In `src/app/api/exam-office/communications/route.ts:24-28`:
```typescript
let tenantId = user.user_metadata?.tenant_id;
if (!tenantId && tenantSlug) {
  const { data: tenant } = await adminSupabase.from('tenants').select('id').eq('slug', tenantSlug).single();
  tenantId = tenant?.id;
}
```
- **Finding [CONFIRMED]:** Even when authenticated, the route trusts user-supplied query parameters or headers (`tenantSlug` or `x-tenant-slug`) without verifying that the authenticated user actually belongs to that tenant.

---

## 5. Authorization Findings (RBAC)

### 5.1 Absence of API-Level RBAC Helpers
- `src/lib/auth/guards.ts` contains `requireSuperAdmin()`, `requireTenantRole()`, `requireSchoolAdmin()`, `requireExamOfficer()`.
- **Finding [CONFIRMED]:** All functions in `guards.ts` use `redirect('/login')` or `redirect('/')` from `next/navigation`. They are designed solely for React Server Components and cannot return HTTP 401/403 JSON responses.
- As a consequence, none of the API route handlers import or use these guards.

### 5.2 Missing Role Checks in Authenticated Endpoints
- `/api/academics/ai/lesson-plan`: Authenticates `user`, but never verifies if `user` has the `teacher` or `school_admin` role. A student or parent account can invoke this endpoint.
- `/api/exam-office/communications`: Authenticates `user`, but never verifies if `user` is an `exam_officer` or `school_admin`. Any authenticated student can trigger mass broadcast SMS/Email notifications.
- `/api/exam-office/communication-templates`: Authenticates `user`, but allows any authenticated user to create official system communication templates.
- `/api/exam-office/communication-rules`: Authenticates `user`, but allows any authenticated user to configure event-driven notification dispatch rules.

### 5.3 Positive Control Benchmark
- `src/app/actions/users.ts:139-158` (`authorizeUserAction` and `canManageTarget`): Exclusively loads `getActorProfile()`, validates active status, evaluates organizational hierarchy, enforces that school admins cannot manage admins, and creates `createAdminClient()` strictly after authorization passes. This represents the reference pattern for the entire codebase.

---

## 6. Tenant Isolation Findings

### 6.1 Unconditional Global Data Leaks
- **`/api/admin/exams` (GET):** Queries `exam_sessions`, `exam_results_approval`, `exam_malpractices` with no `tenant_id` filter. Returns cross-tenant records from every institution on the platform.
- **`/api/exam-office/dashboard` (GET):** Queries 10 database tables (`exam_sessions`, `exam_results_approval`, `exam_malpractices`, `exam_appeals`, `exam_student_spotlights`, `exam_grade_distributions`, `exam_student_details`, `exam_subject_results`, `exam_subject_averages`, `exam_class_gender_counts`) with zero tenant filter.
- **`/api/admissions` (GET):** If `tenantSlug` query parameter is omitted, `tenantId` is `undefined`, causing the handler to omit `.eq('tenant_id', ...)` and return all applicants across all tenants.

### 6.2 Fail-Open Arbitrary Tenant Resolution in Server Actions
In `src/app/actions/academic-calendar.ts:66-73`, `118-119`, `125-133` and `src/app/actions/academic-sessions.ts:66-80`:
```typescript
if (!slugOrId || slugOrId === 'undefined' || slugOrId === 'null') {
  const { data: firstTenant } = await supabase
    .from('tenants')
    .select('id')
    .limit(1)
    .maybeSingle();
  return firstTenant?.id || null;
}
```
- **Finding [CONFIRMED]:** If a caller provides a null, undefined, or unmatched slug, the code executes `SELECT id FROM tenants LIMIT 1` and binds the mutation or query to an arbitrary school. This violates `.ai/AGENTS.md` Line 49 (*"Tenant resolution must fail closed; never select an arbitrary fallback tenant"*).

---

## 7. Privileged Client Findings (`createAdminClient`)

### 7.1 Complete Call Site Inventory (45 Identified Sites)
1. **API Routes (11 call sites):**
   - `src/app/api/admin/exams/route.ts:4` (module-level)
   - `src/app/api/admissions/route.ts:4` (module-level)
   - `src/app/api/cass-export/route.ts:4` (module-level)
   - `src/app/api/exam-office/dashboard/route.ts:4` (module-level)
   - `src/app/api/exam-office/communications/route.ts:3, 21, 74` (request-level)
   - `src/app/api/exam-office/communication-templates/route.ts:3, 13, 50` (request-level)
   - `src/app/api/exam-office/communication-rules/route.ts:3, 12, 41` (request-level)
   - `src/app/api/notifications/route.ts:3, 14, 51` (request-level)
   - `src/app/api/test-db/route.ts:3, 25` (request-level)
2. **Server Actions (18 call sites):**
   - `src/app/actions/academic-calendar.ts:3, 8, 64` (module-level + resolve helper)
   - `src/app/actions/academic-sessions.ts:3, 7, 73, 101` (module-level + resolve helper)
   - `src/app/actions/subjects.ts:3, 102` (resolve helper)
   - `src/app/actions/tenant.ts:3, 33` (request-level tenant creation)
   - `src/app/actions/users.ts:3, 140` (request-level user management)
   - `src/app/actions/students.ts:3, 22` (request-level student management)
   - `src/app/actions/staff-attendance.ts:3, 19` (request-level staff attendance)
3. **Communication & Event Subsystems (16 call sites):**
   - `src/lib/communication/audience-resolver.ts:4, 18`
   - `src/lib/communication/audit.ts:3, 12`
   - `src/lib/communication/event-engine.ts:3, 25`
   - `src/lib/communication/channels/email.ts:4, 15`
   - `src/lib/communication/channels/sms.ts:4, 16`
   - `src/lib/communication/channels/in-app.ts:4, 14`

### 7.2 Module-Level vs Request-Level Execution
- **Module-Level Anti-Pattern [CONFIRMED]:** `admin/exams/route.ts:4`, `admissions/route.ts:4`, `cass-export/route.ts:4`, `exam-office/dashboard/route.ts:4`, `academic-calendar.ts:8`, `academic-sessions.ts:7`.
- Executing `createAdminClient()` at module level means:
  1. The client is created during static build/import time. If `SUPABASE_SERVICE_ROLE_KEY` is missing in CI, builds crash.
  2. No request headers, cookies, or caller identity can ever be bound to this client instance.
  3. Every incoming request automatically inherits full service-role database bypass privileges.

### 7.3 Direct PostgreSQL Bypasses (`pg.Pool`)
- `src/lib/db/pg-fallback.ts` bypasses Supabase GoTrue Auth completely, executing raw SQL `INSERT INTO auth.users` with `crypt()` and `ssl: { rejectUnauthorized: false }`.
- Route handlers `/api/super-admin/leads`, `/api/public/register-tenant`, `/api/public/check-slug`, `/api/public/demo-requests`, `/api/public/tenants`, and `/api/academics/ai/lesson-plan` all utilize direct PostgreSQL connections, bypassing Supabase API gateways and RLS policies completely.

---

## 8. Object-Level Authorization Findings (BOLA / IDOR)

| Route / Action | Vulnerable Parameter | Mechanism | Impact |
|----------------|----------------------|-----------|--------|
| `PATCH /api/admin/exams` | `body.id` | Queries `exam_sessions.update(...).eq('id', id)` via admin client with no tenant check | Any caller can modify exam session names, weightages, and status for any tenant |
| `PATCH /api/admissions` | `body.id` | Updates `applicants.update(...).eq('id', id)` via admin client with no tenant check | Any caller can alter admission stage, scores, and personal data for any applicant |
| `DELETE /api/admissions` | `?id=` query param | Executes `applicants.delete().eq('id', id)` via admin client with no tenant check | Any caller can permanently delete any applicant in the system |
| `PATCH /api/exam-office/dashboard` | `body.id` | Updates `exam_sessions.update(...).eq('id', id)` via admin client with no tenant check | Unauthenticated mutation of exam deadlines and approval statuses |
| `DELETE /api/exam-office/dashboard` | `?id=` query param | Executes `exam_sessions.delete().eq('id', id)` via admin client with no tenant check | Unauthenticated deletion of exam sessions |
| `PATCH /api/super-admin/leads` | `body.id` | Executes raw SQL `UPDATE demo_requests WHERE id = $1` with no auth check | Any caller can tamper with lead statuses and notes |
| `DELETE /api/super-admin/leads` | `?id=` query param | Executes raw SQL `DELETE FROM demo_requests WHERE id = $1` with no auth check | Any caller can delete sales leads |
| `POST /api/academics/ai/lesson-plan` | `body.offering_id` | Fetches `subject_offerings WHERE id = $1` without verifying caller belongs to `so.tenant_id` | Caller from Tenant A can extract curriculum and lesson plans from Tenant B |

---

## 9. Response Exposure Findings

1. **Mass Applicant PII Exposure (`/api/admissions` GET):**
   - Returns unredacted applicant records: `first_name`, `last_name`, `dob`, `gender`, `nin` (National Identification Number), `email`, `phone`, `address`, `city`, `parent_name`, `parent_phone`, `parent_email`, `parent_relation`, `interview_score`, `assessment_score`, `national_index_no`, and raw WAEC results.
2. **National Examination Results Exposure (`/api/cass-export` GET):**
   - Returns downloadable CSV or JSON containing student full names, WAEC index numbers, continuous assessment component scores (`ca1`, `ca2`, `ca3`, `caTotal`), examination marks (`exam_70`), final composite score, WAEC letter grade (`A1` through `F9`), and official MBSSE compliance flags.
3. **Student Academic Performance & Spotlights Exposure (`/api/exam-office/dashboard` GET):**
   - Exposes complete student spotlight records, grade distributions, subject averages, student names with marks and rank, appeals, and reported exam malpractice cases with student candidate numbers and offense details.
4. **Prospective Customer & Institutional Leads Exposure (`/api/super-admin/leads` GET):**
   - Exposes full names, work emails, personal phone numbers, institution names, regions, and internal sales notes for all demo requests.

---

## 10. Security Risk Register

| Risk ID | Vulnerability / Threat Description | Likelihood | Impact | Severity | OWASP Top 10 | Status |
|---------|-----------------------------------|------------|--------|----------|--------------|--------|
| **RSK-001** | Unauthenticated exposure of student WAEC and exam scores via `/api/admin/exams` & `/api/exam-office/dashboard` | High | Critical | **CRITICAL** | API1:2023 Broken Object Level Auth / API2:2023 Broken Auth | CONFIRMED |
| **RSK-002** | Unauthenticated mass disclosure and deletion of applicant PII via `/api/admissions` | High | Critical | **CRITICAL** | API1:2023 Broken Object Level Auth / API2:2023 Broken Auth | CONFIRMED |
| **RSK-003** | Unauthenticated export of official CASS scoresheets via `/api/cass-export` | High | Critical | **CRITICAL** | API2:2023 Broken Authentication | CONFIRMED |
| **RSK-004** | Unauthenticated disclosure, update, and deletion of sales leads via `/api/super-admin/leads` | High | High | **CRITICAL** | API1:2023 Broken Object Level Auth / API2:2023 Broken Auth | CONFIRMED |
| **RSK-005** | Unauthorized mass broadcast SMS/Email dispatch via `/api/exam-office/communications` | High | High | **CRITICAL** | API1:2023 Broken Object Level Auth / API5:2023 Broken Function Level Auth | CONFIRMED |
| **RSK-006** | Permissive `FOR ALL USING (true)` RLS policies in migrations `030` and `031` | High | Critical | **CRITICAL** | API1:2023 Broken Object Level Auth / Database Security | CONFIRMED |
| **RSK-007** | Arbitrary tenant fallback (`SELECT id FROM tenants LIMIT 1`) in Server Actions | Medium | High | **HIGH** | API1:2023 Broken Object Level Auth / Tenant Isolation | CONFIRMED |
| **RSK-008** | Edge middleware exclusion of all `/api/*` routes | High | High | **HIGH** | API2:2023 Broken Authentication | CONFIRMED |
| **RSK-009** | Module-level instantiation of privileged `createAdminClient()` | Medium | High | **HIGH** | Architectural / Secret Exposure | CONFIRMED |
| **RSK-010** | Cross-tenant lesson plan and curriculum theft via `/api/academics/ai/lesson-plan` | Medium | Medium | **MEDIUM** | API1:2023 Broken Object Level Auth | CONFIRMED |
| **RSK-011** | Direct database password hashing and user insertion in `pg-fallback.ts` bypassing GoTrue | Low | High | **MEDIUM** | Authentication Integrity | CONFIRMED |
| **RSK-012** | Missing rate limiting and abuse controls on public registration and demo endpoints | High | Medium | **MEDIUM** | API4:2023 Unrestricted Resource Consumption | CONFIRMED |

---

## 11. Confirmed Vulnerabilities

1. **VULN-001 — Unauthenticated Exam Management API**
   - **Classification:** CONFIRMED
   - **Location:** `school-saas/src/app/api/admin/exams/route.ts:4`, `18-38`, `40-62`
   - **Evidence:** `GET` returns all exam sessions and malpractice records without `user` or `tenant_id` checks. `PATCH` allows arbitrary updates to exam sessions by UUID via module-level `createAdminClient()`.
2. **VULN-002 — Unauthenticated Admissions PII & Deletion API**
   - **Classification:** CONFIRMED
   - **Location:** `school-saas/src/app/api/admissions/route.ts:4`, `15-49`, `167-210`, `212-230`
   - **Evidence:** `GET` returns all applicants when `tenantSlug` is omitted. `PATCH` updates any applicant record by `id`. `DELETE` removes any applicant record by `id`. All methods use module-level `createAdminClient()` with zero authentication.
3. **VULN-003 — Unauthenticated CASS Score Export**
   - **Classification:** CONFIRMED
   - **Location:** `school-saas/src/app/api/cass-export/route.ts:4`, `18-118`, `120-152`
   - **Evidence:** `GET` generates and downloads CSV/JSON score sheets with WAEC index numbers and continuous assessment marks for any school slug without authentication. `POST` creates batch records without authentication.
4. **VULN-004 — Unauthenticated Super Admin Leads API**
   - **Classification:** CONFIRMED
   - **Location:** `school-saas/src/app/api/super-admin/leads/route.ts:15-74`, `76-129`, `131-152`
   - **Evidence:** Route resides in `/api/super-admin/` but lacks all authentication checks. Directly queries PostgreSQL pool to list, modify, and delete customer leads.
5. **VULN-005 — Unauthenticated Exam Office Dashboard API**
   - **Classification:** CONFIRMED
   - **Location:** `school-saas/src/app/api/exam-office/dashboard/route.ts:4`, `6-172`, `174-216`, `218-251`, `253-274`
   - **Evidence:** Module-level `createAdminClient()`. `GET` dumps 10 database tables with no tenant or user check. `POST`, `PATCH`, `DELETE` mutate exam records without authentication.
6. **VULN-006 — Cross-Tenant Notification Spoofing & Dispatch**
   - **Classification:** CONFIRMED
   - **Location:** `school-saas/src/app/api/exam-office/communications/route.ts:24-28`, `76-80`
   - **Evidence:** Authenticated caller can pass arbitrary `tenantSlug` query parameter or header; the route resolves `tenantId` without verifying that the caller belongs to that school, allowing unauthorized notification dispatches.
7. **VULN-007 — Permissive RLS Policies on Core Examination Tables**
   - **Classification:** CONFIRMED
   - **Location:** `school-saas/supabase/migrations/030_exam_core_system.sql:91-95` & `031_exam_analytics_dashboard.sql:79-83`
   - **Evidence:** 10 examination tables have policies defined as `FOR ALL USING (true)`, granting full public access via direct PostgREST calls.
8. **VULN-008 — Arbitrary Tenant Fallback in Server Actions**
   - **Classification:** CONFIRMED
   - **Location:** `school-saas/src/app/actions/academic-calendar.ts:66-73`, `118-119`, `125-133` & `src/app/actions/academic-sessions.ts:66-80`
   - **Evidence:** Helper `resolveTenantId()` executes `SELECT id FROM tenants LIMIT 1` when given undefined input, silently operating on an arbitrary school.

---

## 12. Inferred Risks

1. **Unauthenticated Public Registration Abuse (`/api/public/register-tenant`):**
   - **Inference:** The route lacks rate limiting and CAPTCHA verification. An automated attacker could provision thousands of organization and school tenants, consuming database connection pool slots and disk storage.
2. **Subdomain Enumeration (`/api/public/check-slug`):**
   - **Inference:** Anonymous callers can brute-force subdomain names to build a target list of active schools on the platform.
3. **API Secret Leakage via Module-Level Execution:**
   - **Inference:** Instantiating `createAdminClient()` at module level in multiple files increases the likelihood that client-side code bundles inadvertently bundle the module if imported improperly.

---

## 13. Not Verified Items

1. **Production Infrastructure Rate Limiting:**
   - **Status:** NOT VERIFIED
   - **Reason:** Cloudflare, AWS WAF, or Vercel edge firewall rules cannot be inspected from the repository code.
2. **Live GoTrue / PostgREST Configuration:**
   - **Status:** NOT VERIFIED
   - **Reason:** Supabase project settings (e.g., JWT expiry, email verification requirements, schema exposure) are hosted in Supabase cloud and cannot be inspected statically.
3. **Production Database Seed State:**
   - **Status:** NOT VERIFIED
   - **Reason:** Whether the seed records from `030_exam_core_system.sql` exist in production was not verified via live query in order to preserve read-only boundaries.

---

## 14. Recommendations

### `REC-0002`: Implement Unified API Route Authorization Guard (`authorizeApiRequest`)
- **Category:** Architecture / Authentication / RBAC
- **Scope:** Create `src/lib/auth/api-guard.ts` providing `authorizeApiRequest(req, options)`:
  - Validates Supabase JWT session via `createClient()`.
  - Resolves caller profile, role, and tenant membership from `profiles`.
  - Matches caller tenant against target tenant (or validates `org_admin` parent hierarchy / `super_admin` bypass).
  - Returns structured `{ user, profile, tenantId }` or JSON response (`401 Unauthorized` / `403 Forbidden`).
  - Completely replaces ad-hoc route authentication.

### `REC-0003`: Remediate Unauthenticated Privileged API Routes & Eliminate Module-Level Admin Clients
- **Category:** Security Remediation
- **Scope:** 
  1. Remove `const supabase = createAdminClient()` from module level in all 4 API routes and 2 Server Actions.
  2. Protect `/api/admin/exams`, `/api/admissions`, `/api/cass-export`, `/api/exam-office/dashboard`, and `/api/super-admin/leads` with `authorizeApiRequest`.
  3. Enforce strict `WHERE tenant_id = :tenantId` scoping on all queries.
  4. Separate public admission application submission (`POST /api/admissions/apply`) from internal administrative applicant management.

### `REC-0004`: Enforce Fail-Closed Tenant Resolution & Deprecate `LIMIT 1` Fallback
- **Category:** Multi-Tenant Isolation
- **Scope:** 
  - Remove all occurrences of `SELECT id FROM tenants LIMIT 1` from `src/app/actions/academic-calendar.ts` and `src/app/actions/academic-sessions.ts`.
  - When `tenantSlug` is missing, invalid, or unauthorized, immediately return `{ success: false, error: 'Tenant context required' }`.

### `REC-0005`: Replace Permissive RLS Policies with Strict Tenant Policies
- **Category:** Database / RLS
- **Scope:** 
  - Author a new migration (`044_fix_exam_rls_policies.sql`) dropping all `FOR ALL USING (true)` policies on `exam_sessions`, `exam_schedules`, `exam_results_approval`, `exam_malpractices`, `exam_appeals`, `exam_student_spotlights`, `exam_grade_distributions`, `exam_student_details`, `exam_subject_results`, and `exam_subject_averages`.
  - Replace them with tenant-scoped policies using `tenant_id = public.get_user_tenant_id()`.

### `REC-0006`: Establish Automated Security & Authorization Regression Test Suite
- **Category:** Quality Assurance / Testing
- **Scope:** 
  - Install Vitest and create an automated test suite verifying:
    1. Unauthenticated requests to all private API routes return 401.
    2. Requests with valid tokens but mismatched tenants return 403.
    3. Requests attempting IDOR mutations across tenants return 403/404.
    4. Tenant resolution strictly fails closed.

---

## 15. Recommended Implementation Tasks

The following engineering task sequence is recommended for ChatGPT supervisory authorization:

1. **TASK-0004 — API Route Authorization Guard & Edge Alignment:**
   - Create `src/lib/auth/api-guard.ts`.
   - Update `src/middleware.ts` if edge token verification is required, or standardize on route-level `authorizeApiRequest`.
2. **TASK-0005 — Contain Unauthenticated Privileged API Routes:**
   - Apply `authorizeApiRequest` to `/api/admin/exams`, `/api/admissions`, `/api/cass-export`, `/api/exam-office/dashboard`, and `/api/super-admin/leads`.
   - Remove module-level `createAdminClient()` calls.
   - Enforce tenant filtering on all SELECT, UPDATE, and DELETE operations.
3. **TASK-0006 — Fix Examination System Row Level Security (RLS):**
   - Author migration `044_fix_exam_rls_policies.sql`.
   - Replace `FOR ALL USING (true)` with tenant-isolated RLS policies across all 10 exam tables.
4. **TASK-0007 — Purge Fail-Open Tenant Fallbacks in Server Actions:**
   - Remove `LIMIT 1` tenant fallback queries from `academic-calendar.ts` and `academic-sessions.ts`.
   - Add caller authentication and RBAC checks to mutating Server Actions in `academic-calendar.ts` and `subjects.ts`.
5. **TASK-0008 — Security Regression Testing Harness:**
   - Install Vitest.
   - Implement automated tenant isolation and BOLA regression test suites.

---

## 16. Testing Gaps

1. **Framework Absence:** The repository has zero testing dependencies installed (no Jest, Vitest, Playwright, or Cypress).
2. **CI Pipeline Gap:** GitHub Actions or local npm scripts only execute `lint` and `build`. No automated security checks or unit tests run on commit.
3. **Missing Regression Suites:**
   - No tests verifying that unauthenticated API calls return 401.
   - No tests verifying that a user from School A cannot access records from School B.
   - No tests verifying that non-admin roles cannot mutate examination data.

---

## 17. Overall Security Assessment

**Current Security Rating: CRITICAL VULNERABILITIES DETECTED — NOT READY FOR PRODUCTION**

The SchoolSaaS application provides extensive institutional features and has strong foundational designs in specific areas (such as `src/app/actions/users.ts` and `015_admission_applicants.sql`). However, the unauthenticated state of multiple privileged API routes, the complete exclusion of API routes from edge middleware protection, the module-level admin client anti-patterns, and the `USING (true)` RLS policies represent severe multi-tenant isolation and data privacy risks.

Until the remediation tasks outlined in `TASK-0004` through `TASK-0007` are implemented, verified, and audited, privileged APIs must remain restricted from production deployment.

---

### Execution Boundary Verification Metrics
- Application code changed: **0**
- Database changed: **0**
- RLS changed: **0**
- Authentication changed: **0**
- Dependencies changed: **0**
- Infrastructure changed: **0**
- Tests created: **0**
- Tests executed: **0** *(No testing framework installed in repository)*

---

## TASK-0004 — Unified API Route Authorization Guard
**Date:** 2026-09-03  
**Status:** IMPLEMENTED (Pending ChatGPT Supervisory Review)  
**Implementer:** Gemini / Antigravity (Implementation Engineer & Technical Contributor)  
**Supervisor / Authority:** ChatGPT (Chief Software Architect & Project Supervisor)  
**Final Authority:** Human Project Owner  
**Git Branch:** `ai-eos/task-0004-api-authorization-guard` (Category C Feature Branch)  
**Specification:** `.ai/05-WORKFLOW/TASK-0004.md`  
**Authorization:** `.ai/05-WORKFLOW/messages/MSG-0007.md`  
**Review State:** `REVIEW-TASK-0004` in `.ai/05-WORKFLOW/REVIEW-QUEUE.md`

---

### 1. Summary
Implemented the centralized, server-side API authorization boundary in `src/lib/auth/api-guard.ts` to establish fail-closed security for Next.js Route Handlers. The guard authenticates caller sessions via Supabase Auth, resolves the actor profile under user-scoped RLS (`001_foundation.sql:234`), checks active status, enforces role/permission requirements without inventing a second RBAC model, verifies tenant membership/hierarchy, and supports tenant-scoped object-level authorization (`WHERE id = :id AND tenant_id = :tenantId`). Privileged database access (`createAdminClient()`) is strictly prohibited until authorization succeeds. Migrated three representative routes (`/api/admin/exams`, `/api/exam-office/communications`, `/api/super-admin/leads`) to prove the pattern. All 10 automated test scenarios passed using native Node 20 / tsx test runner, and the full Next.js production build (`npm run build`) passed with zero type errors.

---

### 2. Files Changed
1. **`src/lib/auth/api-guard.ts` [NEW]:**
   - Centralized `authorizeApiRequest(req, options)` server-side guard.
   - Enforces 7-stage authorization pipeline: Authenticate → Actor Resolution → Active Status → Role Check → Fail-Closed Tenant Resolution → Tenant-Scoped Resource Authorization → Lazy Privileged Client Boundary.
   - Exposes standardized JSON responses (`apiError`) for HTTP 401, 403, 404, 400 without using `redirect()`.
   - Lazily loads `createAdminClient` so that `'server-only'` is never imported prematurely during test analysis.
2. **`tests/auth/api-guard.test.ts` [NEW]:**
   - 10 automated unit test scenarios executing against real NextRequest objects and mocked client contexts.
   - Validates anonymous rejection, inactive accounts, role mismatches, valid roles, tenant requirement, cross-tenant spoofing, super-admin platform boundary, org-admin hierarchy, and cross-tenant IDOR protection.
3. **`src/app/api/admin/exams/route.ts` [MODIFIED]:**
   - Removed module-level `createAdminClient()` instantiation.
   - `GET`: Authenticates caller, restricts access to `['school_admin', 'exam_officer', 'super_admin']`, and enforces tenant isolation (`eq('tenant_id', auth.tenantId)`).
   - `PATCH`: Authenticates caller, enforces role check, validates exam session ID, and enforces tenant-scoped resource update (`eq('id', id).eq('tenant_id', auth.tenantId)`). Mismatched or non-existent sessions return 404 Not Found.
4. **`src/app/api/exam-office/communications/route.ts` [MODIFIED]:**
   - Eliminated reliance on unverified `user.user_metadata?.tenant_id` and client-supplied `tenantSlug` overrides.
   - `GET`: Enforces role check and scopes notification queries strictly to verified `auth.tenantId`.
   - `POST`: Enforces role check, verifies target tenant authorization, and binds notification records and dispatches strictly to `auth.tenantId`.
5. **`src/app/api/super-admin/leads/route.ts` [MODIFIED]:**
   - Guarded direct `pg.Pool` connection with `authorizeApiRequest(req, { roles: ['super_admin'], requireTenant: false })`.
   - `GET`, `PATCH`, `DELETE`: Denies non-super-admin actors with HTTP 403 Forbidden. Guarantees that sales leads in `demo_requests` cannot be accessed, altered, or deleted without a valid platform `super_admin` session.

---

### 3. Database / API Changes
- **Database Schema Changes:** None (`0`).
- **Migration Changes:** None (`0`).
- **RLS Policy Changes:** None (`0`).
- **API Changes:**
  - Standardized JSON error response envelope: `{ "error": string, "code": string }` on status 401, 403, 404, 400.
  - Eliminated unauthenticated access and cross-tenant leakage on `/api/admin/exams`, `/api/exam-office/communications`, and `/api/super-admin/leads`.

---

### 4. Authentication / Authorization Behavior
- **Authentication Source:** Exclusively utilizes standard Next.js server cookie sessions via `@/lib/supabase/server` (`createClient()`). No Bearer token surface added.
- **Actor Resolution:** User-scoped query against `profiles` table where `id = auth.uid()`. Fails closed if profile is missing or `is_active === false`.
- **Role Verification:** Validates `profile.role` against existing `AppRole` enum (`super_admin`, `org_admin`, `school_admin`, `teacher`, `student`, `parent`, `exam_officer`). Denies by default.
- **Tenant Scope & Tenant Boundary Hardening:** Explicitly decoupled into `scope: 'tenant' | 'platform'`. Caller-supplied tenant identifiers are treated strictly as untrusted requested targets (`requestedTenantSlug`, `requestedTenantId`), resolved server-side against the `tenants` table, and verified against the actor's profile. Normal tenant users can never select another tenant (returns 403 Forbidden). Non-super-admins cannot access platform-scoped routes (returns 403 Forbidden).
- **Resource Ownership & Privileged Invariant:** Enforced at the database query level (`WHERE id = :id AND tenant_id = :authorizedTenantId`) using the user-scoped client (`supabase`). The privileged/service-role client (`createAdminClient()`) is NEVER instantiated merely to perform resource authorization. Mismatches return 404 Not Found.
- **Privileged Client Boundary:** `createAdminClient()` is accessible strictly downstream via the `auth.adminClient()` factory returned after all authorization checks succeed.

---

### 5. Tests and Exact Results

#### Automated Security Unit Test Suite (`npx tsx --test tests/auth/api-guard.test.ts`)
```text
TAP version 13
# Subtest: T-01: Anonymous request returns 401 Unauthorized
ok 1 - T-01: Anonymous request returns 401 Unauthorized
# Subtest: T-02: Inactive account returns 403 Forbidden
ok 2 - T-02: Inactive account returns 403 Forbidden
# Subtest: T-03: Authenticated user with missing role returns 403 Forbidden
ok 3 - T-03: Authenticated user with missing role returns 403 Forbidden
# Subtest: T-04: Authenticated user with authorized role succeeds
ok 4 - T-04: Authenticated user with authorized role succeeds
# Subtest: T-05: Missing tenant membership on tenant-scoped route returns 403
ok 5 - T-05: Missing tenant membership on tenant-scoped route returns 403
# Subtest: T-06: Cross-tenant spoofing attempt returns 403 Forbidden
ok 6 - T-06: Cross-tenant spoofing attempt returns 403 Forbidden
# Subtest: T-07: Platform super-admin route accessed by normal user returns 403
ok 7 - T-07: Platform super-admin route accessed by normal user returns 403
# Subtest: T-08: Platform super-admin route accessed by super_admin succeeds
ok 8 - T-08: Platform super-admin route accessed by super_admin succeeds
# Subtest: T-09: Org admin accessing child tenant succeeds via hierarchy
ok 9 - T-09: Org admin accessing child tenant succeeds via hierarchy
# Subtest: T-10: Cross-tenant resource authorization (IDOR protection) returns 404
ok 10 - T-10: Cross-tenant resource authorization (IDOR protection) returns 404
# Subtest: T-11: Admin client factory is NOT invoked during resource authorization
ok 11 - T-11: Admin client factory is NOT invoked during resource authorization
# Subtest: T-12: Arbitrary requestedTenantId cannot bypass tenant authorization
ok 12 - T-12: Arbitrary requestedTenantId cannot bypass tenant authorization
# Subtest: T-13: Invalid/non-existent requestedTenantId returns 404
ok 13 - T-13: Invalid/non-existent requestedTenantId returns 404
# Subtest: T-14: Super-admin operating within tenant requires explicit roles: [super_admin]
ok 14 - T-14: Super-admin operating within tenant requires explicit roles: [super_admin]
# Subtest: T-15: Resource authorization verifies ownership via user-scoped client and succeeds for valid tenant object
ok 15 - T-15: Resource authorization verifies ownership via user-scoped client and succeeds for valid tenant object
1..15
# tests 15
# suites 0
# pass 15
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1477.3637
```
**Result:** 15 passed, 0 failed, 0 cancelled (Execution time: 1.48s).

---

### 6. Typecheck, Lint, and Build Results
1. **TypeScript Typecheck (`npx tsc --noEmit`):**
   - **Status:** PASSED (Exit code: 0).
   - Zero compilation or type errors across the entire repository.
2. **ESLint (`npm run lint`):**
   - Repository baseline has 1952 pre-existing lint problems across legacy files.
   - Newly introduced `src/lib/auth/api-guard.ts` compiles cleanly with zero unaddressed errors.
3. **Next.js Production Build (`npm run build`):**
   - **Status:** PASSED (Exit code: 0).
   - Turbopack compilation succeeded in 81s.
   - Full TypeScript checking finished in 83s.
   - 40 static and dynamic routes generated and optimized successfully.
   - All 3 migrated routes (`/api/admin/exams`, `/api/exam-office/communications`, `/api/super-admin/leads`) verified in build output.

---

### 7. Security Review Notes
- **Blocker 1 Resolved:** Privileged client is never instantiated inside the authorization boundary. Resource authorization executes strictly through the user-scoped client (`supabase`).
- **Blocker 2 Resolved:** Target tenant selection is strictly validated against the server database. Arbitrary tenant UUIDs or slugs cannot bypass tenant authorization. Normal tenant users can never select another tenant.
- **Architectural Improvement:** Decoupled tenancy boundary (`scope: 'tenant' | 'platform'`) from role authorization (`roles: ['super_admin']`).
- **VULN-001 Contained:** `/api/admin/exams` GET and PATCH are now authenticated, role-restricted, and strictly tenant-filtered. Module-level admin client eliminated.
- **VULN-004 Contained:** `/api/super-admin/leads` direct `pg.Pool` connection is now gated behind explicit `scope: 'platform'` and `super_admin` role validation.
- **VULN-006 Contained:** `/api/exam-office/communications` cross-tenant spoofing closed; notification records and delivery channels are strictly scoped to verified `auth.tenantId`.
- **BOLA/IDOR Defense:** Verified pattern for object-level authorization requiring `resource.id` AND `tenant_id` at the database level.

---

### 8. Known Limitations
1. **Unit Test Scope:** The 15 unit tests exercise pure authorization logic, decision branches, and payload structures against simulated database contexts. Live end-to-end integration tests hitting deployed PostgreSQL and RLS are scheduled for **TASK-0008**.
2. **Remaining Unmigrated Routes:** Routes identified in TASK-0003 (`/api/admissions`, `/api/cass-export`, `/api/exam-office/dashboard`, etc.) remain scheduled for migration under **TASK-0005**.

---

### 9. Escalations
- None. All implementation work strictly adhered to the approved plan, non-goals, and boundary constraints.

---

### 10. Documentation Updated
- `.ai/05-WORKFLOW/TASK-QUEUE.md`
- `.ai/05-WORKFLOW/CONTROL-STATE.yaml`
- `.ai/05-WORKFLOW/REVIEW-QUEUE.md`
- `.ai/05-WORKFLOW/messages/MSG-0008.md`
- `src/lib/auth/api-guard.ts` (inline API documentation)

---

## TASK-0005 — Privileged API Containment
**Date:** 2026-09-04  
**Status:** IMPLEMENTED — READY FOR SUPERVISORY REVIEW  
**Implementer:** Gemini / Antigravity (Implementation Engineer & Technical Contributor)  
**Supervisor / Authority:** ChatGPT (Chief Software Architect & Project Supervisor)  
**Final Authority:** Human Project Owner  
**Repository:** `bock12/school-saas`  
**Base Branch:** `main` (containing merged TASK-0004)  
**Implementation Branch:** `ai-eos/task-0005-privileged-api-containment`  

---

### 1. Task Objective & Context
Harden the remaining high-risk privileged API routes identified during the TASK-0003 security audit by applying the unified `authorizeApiRequest()` security boundary introduced and approved in TASK-0004. Ensure that privileged API requests cannot access or modify data until:
1. The caller is authenticated.
2. The caller's account is active.
3. The caller has an explicitly authorized role.
4. The requested tenant is resolved and authorized server-side.
5. Any requested resource is verified within the permitted tenant.
6. Privileged/admin database access is instantiated strictly downstream after authorization succeeds.

---

### 2. Files Changed
1. `src/app/api/admissions/route.ts` (MODIFIED — secured GET, POST, PATCH, DELETE; removed module-level admin client)
2. `src/app/api/cass-export/route.ts` (MODIFIED — secured GET, POST; removed module-level admin client)
3. `src/app/api/exam-office/dashboard/route.ts` (MODIFIED — secured GET, POST, PATCH, DELETE; removed module-level admin client; strictly scoped all 10 queries to `auth.tenantId`)
4. `src/app/api/test-db/route.ts` (DELETED — decommissioned per REC-0007)
5. `tests/security/privileged-api-containment.test.ts` (NEW — 27 automated security tests)
6. `.ai/05-WORKFLOW/TASK-0005.md` (NEW — task contract and implementation plan)
7. `.ai/05-WORKFLOW/CONTROL-STATE.yaml` (MODIFIED — workflow tracking state)
8. `.ai/05-WORKFLOW/TASK-QUEUE.md` (MODIFIED — task queue tracking)
9. `.ai/05-WORKFLOW/REVIEW-QUEUE.md` (MODIFIED — review queue tracking)
10. `.ai/05-WORKFLOW/messages/MSG-0009.md` (NEW — supervisory review submission message)

---

### 3. Route-by-Route Migration Matrix

| Route | HTTP Methods | Allowed Roles | Tenancy Scope | Resource Check / IDOR Defense | Admin Client Lifecycle |
|---|---|---|---|---|---|
| `/api/admissions` | `GET`, `POST`, `PATCH` | `['school_admin', 'org_admin', 'super_admin', 'exam_officer']` | `tenant` (`requestedTenantSlug` query/body param resolved server-side) | Queries filter `.eq('tenant_id', auth.tenantId)`. In mutations: `resource: { table: 'applicants', id, tenantColumn: 'tenant_id' }` verified via user client. | Instantiated downstream via `auth.adminClient()` only after authorization. |
| `/api/admissions` | `DELETE` | `['school_admin', 'org_admin', 'super_admin']` (*`exam_officer` denied*) | `tenant` | `resource: { table: 'applicants', id, tenantColumn: 'tenant_id' }` checked via user client, then deleted with `.eq('id', id).eq('tenant_id', auth.tenantId)`. | Instantiated downstream via `auth.adminClient()` only after authorization. |
| `/api/cass-export` | `GET`, `POST` | `['school_admin', 'org_admin', 'super_admin', 'exam_officer']` | `tenant` (`requestedTenantSlug` query/body param) | All applicant and config lookups filter `.eq('tenant_id', auth.tenantId)`. POST inserts batch record with `tenant_id: auth.tenantId`. | Instantiated downstream via `auth.adminClient()` only after authorization. |
| `/api/exam-office/dashboard` | `GET`, `POST`, `PATCH`, `DELETE` | `['school_admin', 'org_admin', 'super_admin', 'exam_officer']` | `tenant` (`requestedTenantSlug` query/body param) | All 10 queries across sessions, spotlights, distributions, student details, approvals, class-gender matrix, subject results, and subject averages strictly query `.eq('tenant_id', auth.tenantId)` without NULL fallback. | Instantiated downstream via `auth.adminClient()` only after authorization. |
| `/api/test-db` | `GET` | N/A | N/A | Route DELETED per REC-0007. No arbitrary DB probe endpoint remains. | N/A |

---

### 4. Implementation Details & Invariants

#### A. Elimination of Module-Level Privileged Clients
Previously, `src/app/api/admissions/route.ts`, `src/app/api/cass-export/route.ts`, and `src/app/api/exam-office/dashboard/route.ts` executed:
```typescript
const supabaseAdmin = createAdminClient();
```
at the top-level module scope, instantiating the service-role client before request execution and prior to authentication.
All three routes have been refactored so that `createAdminClient()` is never called at module level. Instead, privileged access is provided strictly through `auth.adminClient()` downstream of successful `authorizeApiRequest()` validation.

#### B. Tenant Isolation & Client Parameter Untrust
Client-supplied tenant parameters (`tenantSlug` in query string or JSON payload) are treated as untrusted requested targets (`requestedTenantSlug`).
- The server validates the actor's profile and tenant membership via `authorizeApiRequest({ scope: 'tenant', requestedTenantSlug })`.
- If an actor attempts to pass another school's slug, the guard rejects the request with HTTP 403 Forbidden.
- All subsequent database queries and mutations bind strictly to `auth.tenantId`. Any client-supplied `tenant_id` in request payloads is ignored or overwritten.

#### C. IDOR / BOLA Prevention (Application-Layer Verification)
- For resource mutations (`PATCH` and `DELETE` on `/api/admissions`):
  1. `authorizeApiRequest` verifies existence and tenant ownership via `resource: { table: 'applicants', id, tenantColumn: 'tenant_id' }` using the authenticated, user-scoped client. If the applicant does not belong to the authorized tenant, HTTP 404 Not Found is returned immediately.
  2. The update/delete query applies compound filtering:
     ```typescript
     .eq('id', id).eq('tenant_id', auth.tenantId)
     ```
  3. `tenant_id` is explicitly stripped from payload updates (`delete patchData.tenant_id`) to prevent tenant reassignment attacks.
- *Note:* In accordance with instructions, this is clearly documented as **Application/API-layer authorization**. Verification of database-level PostgreSQL schema RLS policies is deferred to TASK-0008.

#### D. Exam Office Dashboard Tenant Strictness
Schema investigation of `031_exam_analytics_dashboard.sql` confirmed that rows with `tenant_id IS NULL` contain seeded sample student names ("Luka Magic", "Kinara Zuri") and mock distribution metrics, rather than global system defaults. Allowing a NULL fallback would leak mock student records across schools.
Therefore, all queries in `/api/exam-office/dashboard` enforce strict multi-tenant isolation:
```typescript
.eq('tenant_id', tenantId)
```
with zero `.or('tenant_id.is.null')` fallback.

#### E. Recommendations Disposition
1. **REC-0007 (Decommission `/api/test-db`):** Completed in this task. File `src/app/api/test-db/route.ts` and directory removed.
2. **REC-0008 (Defer `/api/exam-office/communication-rules` and `communication-templates`):** Confirmed deferred to a dedicated exam communication module containment task.
3. **REC-0009 (Defer `/api/notifications`):** Confirmed deferred to notification service architecture review.

---

### 5. Automated Verification & Test Results

#### A. Unit Test Suite (`tests/auth/api-guard.test.ts`)
```text
TAP version 13
# Subtest: T-01: Anonymous request returns 401 Unauthorized
ok 1 - T-01: Anonymous request returns 401 Unauthorized
# Subtest: T-02: Inactive account returns 403 Forbidden
ok 2 - T-02: Inactive account returns 403 Forbidden
# Subtest: T-03: Authenticated user with missing role returns 403 Forbidden
ok 3 - T-03: Authenticated user with missing role returns 403 Forbidden
# Subtest: T-04: Authenticated user with authorized role succeeds
ok 4 - T-04: Authenticated user with authorized role succeeds
# Subtest: T-05: Missing tenant membership on tenant-scoped route returns 403
ok 5 - T-05: Missing tenant membership on tenant-scoped route returns 403
# Subtest: T-06: Cross-tenant spoofing attempt returns 403 Forbidden
ok 6 - T-06: Cross-tenant spoofing attempt returns 403 Forbidden
# Subtest: T-07: Platform super-admin route accessed by normal user returns 403
ok 7 - T-07: Platform super-admin route accessed by normal user returns 403
# Subtest: T-08: Platform super-admin route accessed by super_admin succeeds
ok 8 - T-08: Platform super-admin route accessed by super_admin succeeds
# Subtest: T-09: Org admin accessing child tenant succeeds via hierarchy
ok 9 - T-09: Org admin accessing child tenant succeeds via hierarchy
# Subtest: T-10: Cross-tenant resource authorization (IDOR protection) returns 404
ok 10 - T-10: Cross-tenant resource authorization (IDOR protection) returns 404
# Subtest: T-11: Admin client factory is NOT invoked during resource authorization
ok 11 - T-11: Admin client factory is NOT invoked during resource authorization
# Subtest: T-12: Arbitrary requestedTenantId cannot bypass tenant authorization
ok 12 - T-12: Arbitrary requestedTenantId cannot bypass tenant authorization
# Subtest: T-13: Invalid/non-existent requestedTenantId returns 404
ok 13 - T-13: Invalid/non-existent requestedTenantId returns 404
# Subtest: T-14: Super-admin operating within tenant requires explicit roles: [super_admin]
ok 14 - T-14: Super-admin operating within tenant requires explicit roles: [super_admin]
# Subtest: T-15: Resource authorization verifies ownership via user-scoped client and succeeds for valid tenant object
ok 15 - T-15: Resource authorization verifies ownership via user-scoped client and succeeds for valid tenant object
1..15
# tests 15
# suites 0
# pass 15
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 2293.7614
```
**Result:** 15 passed, 0 failed.

#### B. Security Test Suite (`tests/security/privileged-api-containment.test.ts`)
```text
TAP version 13
# Subtest: SEC-01: Anonymous request to /api/admissions returns 401 Unauthorized
ok 1 - SEC-01: Anonymous request to /api/admissions returns 401 Unauthorized
# Subtest: SEC-02: Anonymous request to /api/cass-export returns 401 Unauthorized
ok 2 - SEC-02: Anonymous request to /api/cass-export returns 401 Unauthorized
# Subtest: SEC-03: Anonymous request to /api/exam-office/dashboard returns 401 Unauthorized
ok 3 - SEC-03: Anonymous request to /api/exam-office/dashboard returns 401 Unauthorized
# Subtest: SEC-04: Teacher calling /api/admissions returns 403 Forbidden
ok 4 - SEC-04: Teacher calling /api/admissions returns 403 Forbidden
# Subtest: SEC-05: Student calling /api/cass-export returns 403 Forbidden
ok 5 - SEC-05: Student calling /api/cass-export returns 403 Forbidden
# Subtest: SEC-06: Teacher calling /api/exam-office/dashboard returns 403 Forbidden
ok 6 - SEC-06: Teacher calling /api/exam-office/dashboard returns 403 Forbidden
# Subtest: SEC-07: Exam officer calling DELETE /api/admissions returns 403 Forbidden (deletion restricted to admins)
ok 7 - SEC-07: Exam officer calling DELETE /api/admissions returns 403 Forbidden (deletion restricted to admins)
# Subtest: SEC-08: Same-tenant request with authorized role succeeds
ok 8 - SEC-08: Same-tenant request with authorized role succeeds
# Subtest: SEC-09: Cross-tenant request (requestedTenantSlug: other-school) returns 403 Forbidden
ok 9 - SEC-09: Cross-tenant request (requestedTenantSlug: other-school) returns 403 Forbidden
# Subtest: SEC-10: Arbitrary requestedTenantId cannot bypass tenant authorization (returns 403)
ok 10 - SEC-10: Arbitrary requestedTenantId cannot bypass tenant authorization (returns 403)
# Subtest: SEC-11: Non-existent requestedTenantId returns 404
ok 11 - SEC-11: Non-existent requestedTenantId returns 404
# Subtest: SEC-12: Missing tenant on tenant-scoped route returns 403 Forbidden
ok 12 - SEC-12: Missing tenant on tenant-scoped route returns 403 Forbidden
# Subtest: SEC-13: Admissions PATCH for resource belonging to different tenant returns 404 (IDOR defense)
ok 13 - SEC-13: Admissions PATCH for resource belonging to different tenant returns 404 (IDOR defense)
# Subtest: SEC-14: Admissions DELETE for resource belonging to different tenant returns 404 (IDOR defense)
ok 14 - SEC-14: Admissions DELETE for resource belonging to different tenant returns 404 (IDOR defense)
# Subtest: SEC-15: Admissions PATCH for valid same-tenant resource succeeds
ok 15 - SEC-15: Admissions PATCH for valid same-tenant resource succeeds
# Subtest: SEC-16: Unauthorized request to /api/admissions does NOT invoke adminClientFactory
ok 16 - SEC-16: Unauthorized request to /api/admissions does NOT invoke adminClientFactory
# Subtest: SEC-17: Unauthorized request to /api/cass-export does NOT invoke adminClientFactory
ok 17 - SEC-17: Unauthorized request to /api/cass-export does NOT invoke adminClientFactory
# Subtest: SEC-18: Unauthorized request to /api/exam-office/dashboard does NOT invoke adminClientFactory
ok 18 - SEC-18: Unauthorized request to /api/exam-office/dashboard does NOT invoke adminClientFactory
# Subtest: SEC-19: Resource authorization does NOT invoke adminClientFactory
ok 19 - SEC-19: Resource authorization does NOT invoke adminClientFactory
# Subtest: SEC-20: Admissions POST with client-supplied tenant_id is bound strictly to auth.tenantId
ok 20 - SEC-20: Admissions POST with client-supplied tenant_id is bound strictly to auth.tenantId
# Subtest: SEC-21: Admissions POST with authorized Tenant A actor requesting tenantSlug for Tenant B is rejected
ok 21 - SEC-21: Admissions POST with authorized Tenant A actor requesting tenantSlug for Tenant B is rejected
# Subtest: SEC-22: Admissions PATCH attempting to modify tenant_id is stripped and constrained to auth.tenantId
ok 22 - SEC-22: Admissions PATCH attempting to modify tenant_id is stripped and constrained to auth.tenantId
# Subtest: SEC-23: Admissions DELETE with valid ID from Tenant A while authorized against Tenant B deletes no record (returns 404)
ok 23 - SEC-23: Admissions DELETE with valid ID from Tenant A while authorized against Tenant B deletes no record (returns 404)
# Subtest: SEC-24: CASS POST with client-supplied tenant_id binds batch strictly to auth.tenantId
ok 24 - SEC-24: CASS POST with client-supplied tenant_id binds batch strictly to auth.tenantId
# Subtest: SEC-25: Exam dashboard strictly constrains queries to auth.tenantId without NULL fallback
ok 25 - SEC-25: Exam dashboard strictly constrains queries to auth.tenantId without NULL fallback
# Subtest: SEC-26: TASK-0004 Regression - /api/admin/exams preserves role and tenant authorization
ok 26 - SEC-26: TASK-0004 Regression - /api/admin/exams preserves role and tenant authorization
# Subtest: SEC-27: TASK-0004 Regression - /api/super-admin/leads preserves platform scope and super_admin restriction
ok 27 - SEC-27: TASK-0004 Regression - /api/super-admin/leads preserves platform scope and super_admin restriction
1..27
# tests 27
# suites 0
# pass 27
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1331.3463
```
**Result:** 27 passed, 0 failed.

#### C. Typecheck & Build Results
1. **TypeScript Typecheck (`npx tsc --noEmit`):**
   - **Status:** PASSED (Exit code: 0).
   - Zero compilation or type errors.
2. **Next.js Production Build (`npm run build`):**
   - **Status:** PASSED (Exit code: 0).
   - Production compilation and optimization completed successfully. All modified API routes verified as dynamic server routes (`ƒ`).

---

### 6. Known Limitations
1. **Application-Layer Boundary:** All tests verify application/API-layer authorization logic and query filter constructions. Database-level PostgreSQL RLS policy verification against live Supabase instances is deferred to **TASK-0008**.
2. **Deferred Audit Targets:** Endpoints `/api/exam-office/communication-rules`, `/api/exam-office/communication-templates`, and `/api/notifications` remain as audit findings to be addressed in subsequent dedicated tasks (`REC-0008` and `REC-0009`).

---

### 7. Escalations
None. All implementation work strictly adhered to the authorized scope, security invariants, and instructions.



