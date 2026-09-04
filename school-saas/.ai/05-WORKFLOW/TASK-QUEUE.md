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

## TASK-0006 — Authorization regression test foundation
**Status:** BACKLOG · **Priority:** High · **Owner:** Gemini/Antigravity after approval

Implement cross-tenant, RBAC, API/action, RLS and privileged-boundary tests using non-service-role principals for RLS proof.

## TASK-0007 — Canonical RBAC model
**Status:** BACKLOG · **Priority:** High · **Owner:** ChatGPT design; Gemini/Antigravity after approval

Reconcile database/application roles, permissions and hierarchy before adding new roles. Add regression coverage.

## TASK-TEST-001 — AI-EOS Collaboration Protocol Validation
**Status:** IMPLEMENTED (Review Corrections Applied · Awaiting Second Review) · **Priority:** P1 · **Owner:** ChatGPT / Project Supervisor · **Target:** Gemini/Antigravity

Controlled process test. Validated that a fresh Gemini/Antigravity session can discover and follow the AI-EOS collaboration protocol, identify authority, recognize an authorized task, assess governance/documentation health, submit an evidence-based recommendation and report blockers without changing application functionality. Specification: `.ai/05-WORKFLOW/TASK-TEST-001.md`. Authorization: `.ai/05-WORKFLOW/messages/MSG-TEST-001.md`. Supervisory review: `.ai/05-WORKFLOW/messages/MSG-TEST-003.md` (CHANGES_REQUESTED). Implementation corrections response: `.ai/05-WORKFLOW/messages/MSG-TEST-004.md`. Implementation report: `.ai/05-WORKFLOW/IMPLEMENTATION-REPORT.md`. Status is IMPLEMENTED pending second ChatGPT supervisory review (`REVIEW-TASK-TEST-001`). No merge is authorized.
