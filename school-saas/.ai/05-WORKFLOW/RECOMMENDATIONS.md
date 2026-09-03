# Engineering Recommendations

This is the canonical index for substantive recommendations raised by Gemini/Antigravity or other authorized contributors.

## Recommendation contract
Each recommendation uses `REC-####` and records:
- related task
- author
- category
- severity
- problem
- repository evidence
- impact
- alternatives considered
- recommendation
- risk if ignored
- decision required
- status
- ChatGPT disposition
- human decision when required

## Statuses
`PROPOSED`, `UNDER_REVIEW`, `ACCEPTED`, `ACCEPTED_WITH_CHANGES`, `REJECTED`, `DEFERRED`, `ESCALATED_TO_HUMAN`, `IMPLEMENTED`.

Recommendations do not authorize implementation. An accepted recommendation that changes approved scope must be converted into an authorized task or amendment.

## Current recommendations

### REC-0001 — Eliminate module-level instantiation of privileged `createAdminClient()` and establish request-scoped authorized caller pattern

- **Task:** TASK-0004 / TASK-0003
- **Author:** Gemini / Antigravity (Implementation Engineer)
- **Category:** Security & Architectural Hardening / Reliability
- **Severity:** High
- **Status:** PROPOSED
- **ChatGPT Disposition:** PENDING_REVIEW

#### Problem
`createAdminClient()` is instantiated at the top-level module scope in server action and API route files rather than inside function handlers after authentication and tenant guards have executed.

#### Repository Evidence
1. `src/app/actions/academic-calendar.ts` line 8:
   ```ts
   const supabaseAdmin = createAdminClient();
   ```
   This executes immediately when the module is imported by Next.js.
2. `src/app/api/admin/exams/route.ts` line 4:
   ```ts
   const supabase = createAdminClient();
   ```
   This executes at module load time; the subsequent `GET` handler queries `exam_sessions`, `exam_results_approval`, and `exam_malpractices` without user authentication, session verification, or tenant filtering.
3. `src/lib/supabase/admin.ts` lines 4–9:
   `requireEnv('SUPABASE_SERVICE_ROLE_KEY')` throws an unhandled `Error` if the environment variable is missing, empty, or placeholder.
4. `.ai/02-ARCHITECTURE/ARCHITECTURE.md` (lines 10–12) & `.ai/04-SECURITY/PRIVILEGED-ACCESS.md`:
   "Tenant operations enforce application authorization and applicable RLS; service-role access is a reviewed exception, not a replacement for authorization... trusted authorization at every call site."

#### Impact
- **Build & CI Failures:** Any static analysis, Next.js build compilation, or CI test run in an environment where `SUPABASE_SERVICE_ROLE_KEY` is absent or set to a placeholder will fail at build/import time.
- **Separation of Authorization from Privileged Access:** Instantiating a module-level admin client decouples client creation from request-level authorization. Developers can easily reference `supabaseAdmin` in handlers without performing prior session, tenant, or role checks (as seen in `src/app/api/admin/exams/route.ts`).
- **Connection & State Isolation:** Module-level singletons can lead to unintended state sharing or unpredictable lifetime management across edge/serverless runtimes.

#### Alternatives Considered
1. *Lazy module-level singleton initialized on first call:* Discarded because it still allows handlers to query the service-role client without verifying that the current request has passed authorization guards.
2. *Request-scoped invocation inside handler post-guard check:* Call `createAdminClient()` strictly inside handlers after `requireTenantRole()` or equivalent guard returns an authorized session. (Recommended approach).
3. *Centralized authorized client factory:* E.g. `getAuthorizedAdminClient(user, requiredRole, tenantId)`.

#### Recommendation
1. Refactor `src/app/actions/academic-calendar.ts` and `src/app/api/admin/exams/route.ts` to remove module-level `createAdminClient()` calls, moving instantiation strictly inside individual server action and route handler bodies.
2. Ensure that in every server action or API route, user authentication and tenant/role authorization (`requireTenantRole` / `requireSuperAdmin`) occur *before* `createAdminClient()` is invoked.
3. Add a linter rule or static check banning `createAdminClient()` at top-level module scope outside function scopes.
4. Incorporate this remediation into the execution scope of `TASK-0004` and `TASK-0003`.

#### Risk if Ignored
Build and CI pipelines will break when running without live service-role credentials. Further unauthenticated endpoints may inadvertently leverage top-level admin clients, perpetuating critical security vulnerabilities `R-002` and `R-003`.

#### Decision Required
ChatGPT architectural review and disposition on the standardized pattern for privileged service-role invocation across server actions and route handlers.
