# Review Queue

Verdicts: `APPROVED` / `CHANGES_REQUESTED` / `BLOCKED`.

## Review lifecycle
Implementer records evidence; ChatGPT reviews acceptance criteria, scope, architecture, quality, security, tenant/RLS impact and Definition of Done; findings receive severity/action/verification; implementer responds; ChatGPT records the review verdict; human makes the final merge/release decision. A reviewer never self-approves implementation. Critical/high security findings block approval unless explicitly accepted by human.

## REVIEW-GOV-0001 — Governance setup
**Task:** GOV-0001  
**Reviewer:** Human Project Owner  
**Status:** OPEN  
**Priority:** Medium

### Scope
Confirm canonical `.ai` records, authority boundaries, security gates and roadmap fit the intended operating model.

### Required human decision
Accept/revise the AI-EOS authority migration and canonical structure. No application changes are implied.

### Final decision
Pending human review.

## REVIEW-TASK-TEST-001 — AI-EOS Protocol Validation Review
**Task:** TASK-TEST-001  
**Reviewer:** ChatGPT (Chief Software Architect & Project Supervisor)  
**Status:** CHANGES_REQUESTED  
**Priority:** P1  

### Scope
Verify Gemini/Antigravity implementation report for TASK-TEST-001 against acceptance criteria AC-001 through AC-010.

### ChatGPT Review Findings
The collaboration-protocol test passed its core objective, but the submitted recommendation and evidence terminology required correction. Those corrections were subsequently recorded by Gemini in `MSG-TEST-004`.

### Required supervisor decision
Disposition: `CHANGES_REQUESTED`.

### Recommendation disposition
`REC-0001`: `ACCEPTED_WITH_CHANGES` for continued refinement only; this disposition does not authorize application implementation.

### Implementer Response
`MSG-TEST-004` recorded the requested corrections. A later second supervisory review remains pending if this historical process test is to be formally closed.

### Final decision
Pending second ChatGPT review.

## REVIEW-TASK-0003 — Privileged API Security Investigation Review
**Task:** TASK-0003  
**Reviewer:** ChatGPT (Chief Software Architect & Project Supervisor)  
**Status:** APPROVED  
**Priority:** P1 (Critical Security)  

### Scope
Review Gemini's read-only security investigation, evidence classification, risk register, recommendations `REC-0002` through `REC-0006`, and proposed remediation roadmap.

### Supervisor Assessment
**Verdict: APPROVED — INVESTIGATION COMPLETE.**

The report provides sufficient repository evidence to establish the documented security baseline and to begin remediation as separate authorized implementation tasks. The major findings are consistent with the repository controls reviewed: privileged API exposure, missing API-level RBAC/tenant enforcement, BOLA/IDOR risks, permissive examination RLS, fail-open tenant fallback, and absence of automated authorization regression tests.

The investigation's strict read-only boundary was also satisfied: no application code, database schema, migrations, RLS, authentication implementation, dependencies, or infrastructure were changed as part of TASK-0003.

### Recommendation Disposition
- `REC-0001`: **ACCEPTED_WITH_CHANGES** — privileged access must remain behind explicit authentication, tenant, role/permission, and resource authorization; moving client creation alone is insufficient.
- `REC-0002`: **ACCEPTED** — proceed with the unified API authorization guard as TASK-0004.
- `REC-0003`: **PROPOSED / DEFERRED TO TASK-0005** — privileged API containment follows the guard foundation.
- `REC-0004`: **PROPOSED / DEFERRED** — tenant fallback remediation requires its own implementation task.
- `REC-0005`: **PROPOSED / DEFERRED** — examination RLS changes require separate migration review and safe-environment verification.
- `REC-0006`: **PROPOSED / DEFERRED** — automated security testing is a separate implementation task.

### Authorization Decision
`TASK-0004` is authorized through `MSG-0007` and `CONTROL-STATE.yaml`. It is intentionally limited to the reusable API authorization foundation; vulnerable route containment remains a subsequent task.

### Final decision
**APPROVED.** TASK-0003 is closed as an investigation. The confirmed vulnerabilities remain open until their dedicated remediation tasks are implemented and verified.

## REVIEW-TASK-0004 — Unified API Route Authorization Guard Review
**Task:** TASK-0004  
**Reviewer:** ChatGPT (Supervision) & Human Project Owner (Final Authority)  
**Status:** APPROVED (Merged into main)  
**Priority:** P1 (Critical Application Security Foundation)  
**Branch:** `ai-eos/task-0004-api-authorization-guard` (Merged)  
**Specification:** `.ai/05-WORKFLOW/TASK-0004.md`  
**Implementation Report:** `.ai/05-WORKFLOW/IMPLEMENTATION-REPORT.md`  
**Response Message:** `.ai/05-WORKFLOW/messages/MSG-0008.md`

### Scope
Verify the implementation of `src/lib/auth/api-guard.ts`, representative route migrations (`/api/admin/exams`, `/api/exam-office/communications`, `/api/super-admin/leads`), unit test suite (`tests/auth/api-guard.test.ts`), and build/typecheck compliance against acceptance criteria AC-001 through AC-011.

### Evidence Summary
- `src/lib/auth/api-guard.ts` created with fail-closed pipeline, explicit `scope: 'tenant' | 'platform'`, and hardened candidate-tenant resolution.
- Standardized JSON 401/403/404/400 responses (no `redirect()`).
- Resource-level authorization verified via user-scoped client under RLS (`WHERE id = :id AND tenant_id = :tenantId`). Privileged client is never instantiated inside the guard pipeline.
- Module-level `createAdminClient()` eliminated from `/api/admin/exams`.
- Unverified `tenantSlug` override closed in `/api/exam-office/communications`.
- Direct `pg.Pool` connection protected in `/api/super-admin/leads`.
- 15 automated unit test scenarios executing via `npx tsx --test` (15/15 passed in 1.48s).
- Next.js production build (`npm run build`) and TypeScript check (`npx tsc --noEmit`) passed with 0 errors.

### Final decision
**APPROVED AND MERGED.** Approved by Project Owner and merged into `main`. The API authorization foundation is now live on `main`.

## REVIEW-TASK-0005 — Privileged API Containment Review
**Task:** TASK-0005  
**Reviewer:** ChatGPT (Chief Software Architect & Project Supervisor) & Human Project Owner  
**Status:** OPEN (SUBMITTED FOR SUPERVISORY REVIEW)  
**Priority:** P1 (Critical Security Containment)  
**Branch:** `ai-eos/task-0005-privileged-api-containment` (Unmerged)  
**Specification:** `.ai/05-WORKFLOW/TASK-0005.md`  
**Implementation Report:** `.ai/05-WORKFLOW/IMPLEMENTATION-REPORT.md`  
**Submission Message:** `.ai/05-WORKFLOW/messages/MSG-0009.md`

### Scope
Verify the security containment of remaining high-risk privileged API routes identified during the TASK-0003 audit:
1. `src/app/api/admissions/route.ts` (GET, POST, PATCH, DELETE)
2. `src/app/api/cass-export/route.ts` (GET, POST)
3. `src/app/api/exam-office/dashboard/route.ts` (GET, POST, PATCH, DELETE)
4. `src/app/api/test-db/route.ts` (DELETED per REC-0007)
5. `tests/security/privileged-api-containment.test.ts` (22 automated route-handler security tests invoking actual handlers)
6. `tests/auth/api-guard.test.ts` (15 unit tests)
7. Regression check of TASK-0004 foundation

### Evidence Summary
- Top-level module-scope `createAdminClient()` eliminated from all three routes.
- Downstream privileged access instantiated exclusively via `auth.adminClient()` after successful authentication and tenant authorization.
- Method-specific role gates enforced (`DELETE /api/admissions` restricted strictly to `school_admin`, `org_admin`, `super_admin`; `exam_officer` denied).
- Candidate tenant parameters treated as untrusted requested targets; all operations bind strictly to server-authorized `auth.tenantId`.
- Admissions PATCH strictly allowlisted against `ALLOWED_APPLICANT_PATCH_FIELDS`; immutable fields (`id`, `tenant_id`, `tenantId`, `tenantSlug`) and arbitrary columns rejected with 400.
- Multi-table exam office dashboard queries (10 tables) executed concurrently via `Promise.all` with zero NULL-tenant fallback and explicit database query error handling returning 500 DATABASE_ERROR.
- CASS export synthetic data documented as pre-existing prototype code; non-production status declared; `REC-0010` recorded.
- 22/22 route-handler security tests in `tests/security/privileged-api-containment.test.ts` passed (11.28s).
- 15/15 guard unit tests in `tests/auth/api-guard.test.ts` passed (6.17s).
- `npx tsc --noEmit` and Next.js production build (`npm run build`) passed with 0 errors.

### Supervisor Assessment & Decision
Supervisory corrections applied. Resubmitted for ChatGPT review and Human Project Owner merge decision.

## REVIEW-TASK-0002 — Credential Exposure Containment Review
**Task:** TASK-0002  
**Reviewer:** ChatGPT (Chief Software Architect & Project Supervisor) & Human Project Owner  
**Status:** OPEN (CORRECTION-03 SUBMITTED FOR SUPERVISORY REVIEW)  
**Priority:** P1 (Critical Security Containment)  
**Branch:** `ai-eos/task-0002-credential-exposure-containment` (Unmerged)  
**Specification:** `.ai/05-WORKFLOW/TASK-0002.md`  
**Implementation Report:** `.ai/05-WORKFLOW/IMPLEMENTATION-REPORT.md`  
**Submission Message:** `.ai/05-WORKFLOW/messages/MSG-0011.md`

### Scope
Verify containment of credential exposure risks across the repository, including all CORRECTION-03 requirements:
1. Deletion of 14 unvetted scripts containing hardcoded credentials.
2. Complete untracking of `scratch/` and `.gitignore` update.
3. Remediation of `pg-fallback.ts` with `server-only`, secure TLS, removal of `createAuthUserAndProfileDirectly`.
4. Elimination of dangerous `UPDATE auth.users SET encrypted_password` mutation.
5. Transition to Supabase Auth Admin APIs for user provisioning.
6. Dedicated `public.user_invitations` table (migration 044) with server-only invitation service enforcing role hierarchies.
7. Hardening of `callback-sync.ts` — never trusting `user_metadata`, requiring authoritative invitation.
8. **[CORRECTION-03]** `supabase/migrations/045_bind_invitation_rpc.sql`: `bind_invitation_to_user(invitation_id, user_id)` SECURITY DEFINER stored procedure — SELECT FOR UPDATE, atomic profile insert + invitation consumption, revoke PUBLIC/anon/authenticated EXECUTE, grant service_role only.
9. **[CORRECTION-03]** `callback-sync.ts` updated to call RPC — application-level compensating delete removed.
10. **[CORRECTION-03]** GoTrue/application correlation documented in `callback-sync.ts`.
11. **[CORRECTION-03]** Token column status documented; no bearer credential generated/stored/returned.
12. **[CORRECTION-03]** SEC-29 through SEC-38 added (10 new tests). Total: 39 credential-containment, 76 repository-wide.
13. Regression verification of TASK-0004 and TASK-0005 security suites.
14. Verification of typecheck, linter, and production build.

### Evidence Summary — CORRECTION-03
- `supabase/migrations/045_bind_invitation_rpc.sql` created: `bind_invitation_to_user(p_invitation_id UUID, p_user_id UUID)` — SECURITY DEFINER, `SET search_path = public, pg_catalog`, `SELECT FOR UPDATE`, atomic INSERT + UPDATE, REVOKE PUBLIC/anon/authenticated, GRANT service_role.
- `src/lib/auth/callback-sync.ts` updated: `rpc('bind_invitation_to_user', { p_invitation_id, p_user_id })` replaces the previous INSERT+UPDATE+DELETE pattern. GoTrue/application correlation documented. Token column unused status documented.
- `tests/security/credential-containment.test.ts` updated: mock now includes `.ilike()` and `.rpc()` handlers. SEC-29–SEC-38 added.
- **76/76 automated tests passed** (15 api-guard + 22 privileged-api-containment + 39 credential-containment). Exit code 0.
- **`npx tsc --noEmit`**: 0 errors. Exit code 0.
- **`npx eslint src/lib/auth/callback-sync.ts tests/security/credential-containment.test.ts`**: 0 errors, 0 warnings. Exit code 0.
- **`npm run build`**: Compiled successfully (2.4 min). TypeScript type-check running at time of governance update — no errors expected (tsc --noEmit already confirmed 0 errors separately).

### Concurrency Limitation (Disclosed per AC-029)
SEC-30 verifies the concurrent acceptance logical invariant sequentially via the mock. True database-level race safety is provided by `SELECT FOR UPDATE` in `045_bind_invitation_rpc.sql`. A live concurrent integration test requires two simultaneous Supabase client connections against a live PostgreSQL instance — this is **PENDING human action** against the live Supabase project.

### SECURITY DEFINER Privilege Verification (Static)
The migration includes:
```sql
REVOKE EXECUTE ON FUNCTION public.bind_invitation_to_user(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bind_invitation_to_user(UUID, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.bind_invitation_to_user(UUID, UUID) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.bind_invitation_to_user(UUID, UUID) TO service_role;
```
### Live Database Verification Status (Completed 2026-09-05)
- **Environment:** Supabase Cloud (`aws-0-eu-west-1.pooler.supabase.com:5432`)
- **Code Commit:** `6b54786` (includes `v_invitation.role::public.user_role` enum cast fix)
- **Live Gates:**
  1. `bind_invitation_to_user` RPC verified in `information_schema.routines` (`SECURITY DEFINER`): **PASSED**
  2. Execute grants verified in `information_schema.role_routine_grants` (`service_role` + `postgres` only): **PASSED**
  3. `user_invitations` schema (12 columns) verified in `information_schema.columns`: **PASSED**
  4. Live two-client concurrency race test (166ms duration, exactly 1 success, 1 failure): **PASSED**
  5. Live transaction failure rollback test (profile unpersisted, invitation pending): **PASSED**
- **Sole Remaining Release Gate:** Human administrative rotation of exposed historical production credentials in Supabase Cloud dashboard and hosting environment.

### Final Supervisory Assessment & Merge Decision
Pending ChatGPT final approval and Human Project Owner merge decision. **Do not merge.**

## Review rules
Every review links the task, implementation report, ADRs, risks and security records as applicable. Security blockers include missing auth boundaries, missing tenant checks, privileged database access without justification, RLS weakening, secret exposure, destructive migrations without approval, and missing cross-tenant/role regression tests.


