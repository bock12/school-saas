# Canonical Task Queue

All implementation follows `.ai/AGENTS.md`. Every task requires owner, supervisor, objective, scope, acceptance criteria, security classification, dependencies and linked report/review/ADR/risk records.

## TASK-0001 — Security boundary inventory and verification
**Status:** IMPLEMENTED · **Priority:** Critical · **Owner:** ChatGPT / architecture supervision · **Implementation:** Gemini/Antigravity after human approval

Read-only inventory completed for privileged Supabase/PostgreSQL/auth-user access, protected APIs, server actions, tenant resolution, RLS, RBAC and test gaps. No implementation change was made. See `.ai/04-SECURITY/SECURITY-ARCHITECTURE.md` and the preserved historical audit record.

## TASK-0002 — Credential exposure incident containment
**Status:** IN_REVIEW · **Priority:** Critical · **Owner:** ChatGPT Supervision · **Target:** Gemini/Antigravity

Eliminate credential and secret exposure across the repository: purge ad-hoc migration scripts and committed scratch directories, enforce strict remote database TLS verification, sanitize utility scripts to source from environment without logging plaintext credentials, enforce server-only isolation for administrative clients, eliminate dangerous raw SQL auth.users password overwrites, and establish a comprehensive automated security regression suite (SEC-01 through SEC-14). Specification: `.ai/05-WORKFLOW/TASK-0002.md`. Report: `.ai/05-WORKFLOW/IMPLEMENTATION-REPORT.md`. Review: `REVIEW-TASK-0002`. Response: `.ai/05-WORKFLOW/messages/MSG-0010.md`.

## TASK-0003 — Privileged API & Tenant Isolation Security Investigation
**Status:** IMPLEMENTED · **Priority:** Critical · **Owner:** ChatGPT supervision · **Target:** Gemini/Antigravity

Read-only security architecture investigation and remediation-planning task covering unauthenticated privileged APIs, service-role client usage, tenant resolution, and tenant isolation boundaries. Investigation accepted as complete; implementation remediation is tracked separately. Specification: `.ai/05-WORKFLOW/TASK-0003.md`. Authorization: `.ai/05-WORKFLOW/messages/MSG-0005.md`. Implementation Response: `.ai/05-WORKFLOW/messages/MSG-0006.md`. Report: `.ai/05-WORKFLOW/IMPLEMENTATION-REPORT.md`. Review: `REVIEW-TASK-0003`.

## TASK-0004 — Unified API Route Authorization Guard
**Status:** COMPLETED (Merged to main) · **Priority:** Critical · **Owner:** ChatGPT / Architecture & Security Supervision · **Target:** Gemini/Antigravity

Create the centralized request-safe `authorizeApiRequest` boundary for Next.js Route Handlers. Authentication, trusted tenant resolution, explicit role/permission checks, standardized JSON 401/403 responses, and strict separation from privileged-client creation must be established before TASK-0005 secures vulnerable route families. Specification: `.ai/05-WORKFLOW/TASK-0004.md`. Authorization: `.ai/05-WORKFLOW/messages/MSG-0007.md`. Implementation Response: `.ai/05-WORKFLOW/messages/MSG-0008.md`. Report: `.ai/05-WORKFLOW/IMPLEMENTATION-REPORT.md`. Review: `REVIEW-TASK-0004`.

## TASK-0005 — Privileged API Containment
**Status:** IN_REVIEW · **Priority:** Critical · **Owner:** ChatGPT / Architecture & Security Supervision · **Target:** Gemini/Antigravity

Harden high-risk privileged API routes identified during TASK-0003 (/api/admissions, /api/cass-export, /api/exam-office/dashboard) by applying the unified authorizeApiRequest() security boundary. Eliminate module-level admin clients, enforce method-specific role authorization, prevent IDOR/BOLA, and ensure strict tenant containment. Regression-check TASK-0004 routes. Specification: `.ai/05-WORKFLOW/TASK-0005.md`. Report: `.ai/05-WORKFLOW/IMPLEMENTATION-REPORT.md`. Review: `REVIEW-TASK-0005`. Response: `.ai/05-WORKFLOW/messages/MSG-0009.md`.

## TASK-0006 — Authorization regression test foundation & RLS Verification
**Status:** COMPLETED (Merged to main via PR #16) · **Priority:** High · **Owner:** ChatGPT Supervision · **Target:** Gemini/Antigravity

Implement and verify database-level Row Level Security (RLS) policies, cross-tenant isolation, RBAC boundaries, and recipient ownership. See prior governance record and implementation report.

## TASK-0007 — Canonical RBAC & Permission Architecture
**Status:** ACTIVE — Phase 3D post-merge verification · **Priority:** High · **Owner:** ChatGPT / Architecture Supervision · **Implementation:** Gemini/Antigravity

The canonical permission catalog is now 46 permissions. Phase 3D follows the approved sequential charter in `.ai/05-WORKFLOW/TASK-0007-PHASE-3D-DISCOVERY.md`.

### Phase 3D Cohort 3D-2 — Server Actions Security & Authorization Boundary
**Status:** IMPLEMENTATION MERGED — POST-MERGE VERIFICATION PENDING · **Priority:** Critical  
**Specification:** `.ai/05-WORKFLOW/TASK-0007-PHASE-3D-COHORT-2.md`  
**Authorization:** `.ai/05-WORKFLOW/messages/MSG-0023.md`  
**Implementation branch:** `ai-eos/task-0007-phase-3d-cohort-2-server-actions`  
**Merged PR:** #22  
**Merge commit:** `41a6071d024a4018e34c745177e4269ea3919999`

Objective: establish a unified request-safe Server Action authorization boundary; secure core student, teacher, parent, class and bursary mutations; eliminate arbitrary tenant fallback in academic calendar; and secure subjects/curriculum/offerings against unauthenticated direct privileged database access.

**Frontend authorization is deferred to Phase 3D Cohort 3D-4.**

### TASK-0007 next execution gate
Do not begin Cohort 3D-3 until post-merge verification of Cohort 3D-2 is complete and the supervisory gate is explicitly cleared.

## TASK-TEST-001 — AI-EOS Collaboration Protocol Validation
**Status:** IMPLEMENTED (Review Corrections Applied · Awaiting Second Review) · **Priority:** P1 · **Owner:** ChatGPT / Project Supervisor · **Target:** Gemini/Antigravity

Controlled process test. No merge is authorized until its separate supervisory review is completed.


## ROADMAP-0001 — Four-Level Implementation Roadmap
**Status:** PLANNING · **Priority:** High · **Owner:** Human Project Owner · **Supervisor:** ChatGPT Engineering Authority

Formal implementation roadmap: Level 1 Platform Foundation → Level 2 Core School ERP → Level 3 Advanced ERP → Level 4 SaaS Expansion.

**Dependency:** Level 1 establishes authentication, tenant isolation, centralized authorization, RLS, audit and platform primitives before Level 2 becomes the primary delivery focus. Level 3 depends on Level 2. Level 4 is demand-driven and depends on Levels 1–3 stability.

**Execution rule:** Do not generate hundreds of implementation tickets upfront. Decompose progressively as Level → Epic → Feature → Vertical Slice → Implementation Task → Tests → Review.

**Acceptance criteria:** `school-saas/.ai/05-WORKFLOW/ROADMAP.md` defines all four levels, scope and exit gates; security, QA, database governance and documentation are cross-level requirements; material architecture decisions remain subject to ADR and human approval.

**Governance note:** This record authorizes planning structure only. It does not authorize implementation of all roadmap items.


## L1-01 — Governance & Architecture Baseline
**Status:** IN PROGRESS — BASELINE RECORDED · **Priority:** High · **Owner:** ChatGPT / Engineering Authority · **Implementation:** Governance/documentation only

Objective: establish a verified repository, governance, architecture, dependency, authorization, migration and security baseline before Level 1 feature/security implementation proceeds.

**Baseline report:** `.ai/05-WORKFLOW/L1-01-GOVERNANCE-BASELINE-REPORT.md`

**Current conditions:** documentation synchronization and dependency reproducibility remain open. Current `main` has no `school-saas/package-lock.json`; the canonical permission registry contains 46 permissions while some Phase-3A documentation still states 33; migration prefixes 018, 022 and 024 are duplicated.

**Security note:** existing critical/high security findings remain open and are not closed by L1-01.

**Next gate:** synchronize authoritative documentation, address lockfile reproducibility, then proceed to L1-02 Tenant & Authorization Foundation under task-level authorization.
