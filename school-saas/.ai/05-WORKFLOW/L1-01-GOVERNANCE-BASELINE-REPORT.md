# L1-01 — Governance & Architecture Baseline Report

**Task:** L1-01 Governance & Architecture Baseline  
**Date:** 2026-10-08  
**Repository:** `bock12/school-saas`  
**Branch:** `arch/l1-01-governance-baseline`  
**Status:** DISCOVERED / BASELINE RECORDED  
**Verdict:** READY WITH CONDITIONS

## 1. Executive Summary

The repository has a coherent nested application root and a single active AI-EOS governance tree under `school-saas/.ai/`. The previously suspected competing top-level `.ai` governance tree is not present on current `main`.

The principal baseline conflicts are documentation drift and repository hygiene, not a need for architectural redesign:

1. `school-saas/package.json` declares Next.js `^16.4.0`, while `.ai/01-PROJECT/PROJECT-CONTEXT.md` still states Next.js `16.2.9`.
2. The canonical TypeScript permission registry contains **46** permissions, while RBAC documentation still contains Phase-3A statements claiming **33**.
3. The canonical migration directory contains **51** SQL files with duplicate numeric prefixes `018`, `022`, and `024`.
4. `school-saas/package-lock.json` is absent from current `main`, despite the project context and package workflow identifying npm/package-lock as the dependency baseline.
5. Module-status documentation contains stale claims that there is no visible test suite/CI, while current repository evidence includes a test script and three GitHub Actions workflows.
6. Existing security audit material still records critical/high findings. L1-01 does not authorize silently fixing those findings; they remain remediation inputs for L1-02/L1-06 and dedicated security tasks.

No material architecture decision should be inferred from this report. Proposed ADRs remain subject to the authority rules already defined in the repository.

## 2. Repository Structure

**CONFIRMED**

- Application root: `school-saas/`
- Application source: `school-saas/src/`
- Database migrations: `school-saas/supabase/migrations/`
- Tests: `school-saas/tests/`
- Governance: `school-saas/.ai/`
- CI workflows: `.github/workflows/`
- Root-level application source duplication was not observed in the current repository listing.
- Root-level competing `.ai` governance tree was not observed.

The nested `school-saas/.ai/` structure is therefore the current active governance location.

## 3. Governance Baseline

The repository contains:

- `.ai/00-GOVERNANCE/`
- `.ai/01-PROJECT/`
- `.ai/02-ARCHITECTURE/`
- `.ai/03-ENGINEERING/`
- `.ai/04-SECURITY/`
- `.ai/05-WORKFLOW/`
- `.ai/06-MODULES/`
- `.ai/07-RISK/`
- `.ai/08-CHANGE/`

The repository also has `.ai/AGENTS.md`, `.ai/PROJECT-CONTEXT.md`, and `.ai/SECURITY_AUDIT.md`.

`.ai/00-GOVERNANCE/REPOSITORY-TRUTH.md` explicitly defines evidence classifications and states that GitHub source and actual implementation outrank assumptions.

`.ai/00-GOVERNANCE/AUTHORITY-MODEL.md` establishes human final authority, ChatGPT supervisory authority, and Gemini/Antigravity implementation authority.

### Governance decision

**CONFIRMED:** Use `school-saas/.ai/` as the active governance source for current work.

**NOT AUTHORIZED:** Changing proposed ADR statuses or materially changing governance policy without human approval.

## 4. Technology and Dependency Baseline

Current `school-saas/package.json`:

- Next.js: `^16.4.0`
- React: `19.2.4`
- TypeScript: `^5`
- ESLint: `^9`
- eslint-config-next: `^16.4.0`
- Tailwind CSS: `^4`
- Supabase JS: `^2.108.2`
- Supabase SSR: `^0.12.0`
- pg: `^8.22.0`

### Conflict

`.ai/01-PROJECT/PROJECT-CONTEXT.md` still records Next.js `16.2.9`.

**Resolution:** The package manifest is the current implementation evidence; project context should be updated to reflect the current manifest.

### Lockfile finding

`school-saas/package-lock.json` is **not present on current main**.

This is a **HIGH repository reproducibility concern**, because the project uses npm and CI/dependency governance should have a committed lockfile.

This report does not fabricate or generate a lockfile. Reconstructing it requires a controlled dependency installation and verification step.

## 5. Architecture Baseline

Current documented architecture describes:

- Next.js App Router
- Supabase Auth/PostgreSQL/RLS
- session refresh and tenant routing in middleware
- server-side authorization guards
- API routes independently responsible for authentication/authorization/tenant/validation
- server-only privileged Supabase client
- `src/lib/db` database helpers
- append-only Supabase migrations

The architecture document also explicitly recognizes that service-role access bypasses RLS and therefore requires trusted authorization at the operation boundary.

**Assessment:** The current architectural model is a modular monolith with server-centric authorization and PostgreSQL RLS. No architectural rewrite is required for L1-01.

## 6. Tenant Baseline

The current security and architecture documentation establish tenant isolation as a security invariant.

The Level 1 implementation plan identifies the initial model as:

**School = tenant**

This remains the appropriate Level 1 baseline.

Broader organization/district/campus hierarchy remains a separate architectural decision and should not be silently introduced during L1-01.

## 7. Authorization Baseline

The current canonical implementation is:

`school-saas/src/lib/auth/permissions-registry.ts`

The registry currently contains **46** entries in `CANONICAL_PERMISSIONS`.

This was directly counted from the current source.

The 46 include:

- admissions
- students
- attendance
- curriculum
- examinations
- finance
- staff
- platform
- notifications
- communications

and the dedicated platform lead permission.

### Documentation conflict

`.ai/02-ARCHITECTURE/DECISIONS.md` ADR-0003 and `.ai/04-SECURITY/RBAC-MODEL.md` still contain Phase-3A language referring to **33** canonical permissions.

**Resolution:** 46 is the current implementation count. The 33 references are stale historical/design text unless explicitly marked as historical.

The registry itself is authoritative for the current implementation.

No permission was added or removed by L1-01.

## 8. Database / Migration Baseline

Current migration inventory:

- **51** SQL migration files
- highest numeric prefix: **048**
- duplicate prefixes:
  - `018`: 2 files
  - `022`: 2 files
  - `024`: 2 files

Examples:

- `018_applicant_documents_and_rejection.sql`
- `018_applicant_source.sql`
- `022_applicant_acceptance_enhancements.sql`
- `022_stage_7_allocation_credentials.sql`
- `024_applicant_payment_details_enhancements.sql`
- `024_force_password_reset.sql`

These files must **not** be renamed or reordered as part of L1-01.

**Risk:** Future migration execution/order must be explicitly verified before additional schema work.

## 9. Testing and CI Baseline

Current repository evidence includes:

- `school-saas/package.json` test script covering authentication, authorization, API, privileged-access, credential-containment, RLS, and Server Action security suites.
- `.github/workflows/codeql.yml`
- `.github/workflows/dependency-review.yml`
- `.github/workflows/node.js.yml`

Therefore, documentation stating that there is no visible test suite/CI is stale.

This does **not** establish that current main CI is passing. CI status must be checked separately before a release or Level 1 gate.

## 10. Security Baseline

The current `.ai/SECURITY_AUDIT.md` records unresolved critical/high findings including:

- privileged/public API authorization gaps
- admissions/CASS exposure
- exam administration exposure
- super-admin lead exposure
- unguarded privileged Server Actions
- arbitrary/fallback tenant resolution
- examination RLS policies requiring remediation
- communications authorization gaps
- tracked credential exposure requiring human-led incident response

These findings remain security blockers for production readiness.

L1-01 records them but does not silently remediate them.

## 11. Documentation Conflicts

| Conflict | Current evidence | Required action |
|---|---|---|
| Next.js version | package.json = 16.4.x | Update project context |
| Permission count | registry = 46 | Reconcile stale 33 references |
| Migration count | 51 files / highest prefix 048 | Update stale migration inventory |
| Duplicate migration prefixes | 018, 022, 024 | Record as technical debt; do not rename |
| CI/test status | test script + 3 workflows exist | Correct stale module-status statement |
| Lockfile | package-lock missing | Controlled dependency reproducibility task |
| ADR-0002 status | Proposed / human acceptance required | Do not self-approve |

## 12. Architecture Decision Status

| Decision | Status |
|---|---|
| School as initial Level-1 tenant | Approved planning baseline |
| Modular monolith | Current/target architecture baseline |
| PostgreSQL RLS as tenant boundary | Existing security architecture |
| Canonical permission registry | Implemented source of truth |
| Contextual functional assignments | Proposed architecture; verify ADR authority |
| Canonical .ai structure | Implemented current repository structure; ADR-0002 remains historical/proposed governance decision |
| Broader organization/district/campus hierarchy | OPEN / deferred |
| Material schema/RLS architecture changes | HUMAN APPROVAL REQUIRED |

## 13. L1-01 Readiness

| Requirement | Status | Blocking? |
|---|---|---|
| Canonical governance source identified | PASS | No |
| Application root identified | PASS | No |
| Dependency baseline identified | CONDITIONAL | Yes for reproducible installs because lockfile is absent |
| School tenant model explicit | PASS | No |
| Authorization source identified | PASS | No |
| Permission count reconciled | PASS at implementation level; docs stale | No, documentation cleanup required |
| Migration inventory understood | PASS | No |
| Security findings identified | PASS | Yes for later security closure |
| Test/CI infrastructure identified | PASS | No |
| Documentation fully synchronized | FAIL | Yes before Level 1 Gate |
| Architecture decisions separated from proposals | PASS | No |

## 14. Required L1-01 Follow-up Actions

### L1-01-A — Documentation synchronization

Update:

- project stack version
- migration inventory
- permission-count references
- stale test/CI statements
- module-status evidence

### L1-01-B — Dependency reproducibility

Restore/produce the canonical npm lockfile through a controlled dependency-installation procedure and verify it against `package.json`.

### L1-01-C — Permission documentation reconciliation

Replace current-state references to 33 with 46 where they describe the live registry, while preserving historical Phase-3A evidence where it is intentionally historical.

### L1-01-D — Migration governance

Create a documented rule for handling the existing duplicate numeric prefixes without rewriting migration history.

### L1-01-E — Security remediation continuation

Carry unresolved security findings into the authorized Level 1 security tasks. Do not close them based on static documentation.

## 15. L1-01 Verdict

**READY WITH CONDITIONS**

The repository structure and architectural baseline are sufficiently understood to proceed with controlled Level 1 work.

However, L1-01 should not be considered fully closed until:

1. documentation drift is reconciled;
2. the missing npm lockfile is addressed;
3. permission documentation reflects the current 46-entry registry;
4. migration-order technical debt is explicitly recorded;
5. unresolved security findings remain linked to concrete remediation tasks.

No product feature implementation is authorized by this baseline report.

## 16. Evidence Principle

This report distinguishes confirmed repository evidence from assumptions and historical documentation.

The next implementation task should begin only after these baseline conditions are acknowledged and the task-level authorization is recorded according to the repository governance protocol.
