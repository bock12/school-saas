# Canonical Task Queue

All implementation follows `.ai/AGENTS.md`. Every task requires owner, supervisor, objective, scope, acceptance criteria, security classification, dependencies and linked report/review/ADR/risk records.

## TASK-0002 — Credential exposure incident containment
**Status:** BACKLOG · **Priority:** Critical · **Owner:** Human/security owner

Rotate/revoke exposed database credentials, assess repository/history exposure, remove embedded credentials through an approved recovery plan, and add secret scanning. Human-controlled operation; no credential rotation/history rewrite/database execution without explicit approval.

## TASK-0003 — Contain unauthenticated privileged APIs
**Status:** BACKLOG · **Priority:** Critical · **Owner:** Gemini/Antigravity after approval

Define public/private route contracts and enforce authenticated actor, role, tenant, object, validation and response-minimization boundaries. Add unauthenticated, wrong-role and cross-tenant regression tests.

## TASK-0004 — Privileged server-action authorization boundary
**Status:** BACKLOG · **Priority:** Critical · **Owner:** Gemini/Antigravity after approval

Require trusted actor/role/tenant/object checks before service-role/direct PostgreSQL/auth-admin operations. Restrict direct `auth.users` manipulation and prove denial cases.

## TASK-0005 — Tenant resolution and RLS correction
**Status:** BACKLOG · **Priority:** High · **Owner:** ChatGPT design; Gemini after approval

Fail-closed canonical tenant resolution; correct examination RLS; establish notification RLS; verify staff-attendance write roles. Requires ADR, migration/RLS review, safe test environment and human approval.

## TASK-0006 — Authorization regression test foundation
**Status:** BACKLOG · **Priority:** High · **Owner:** Gemini/Antigravity after approval

Implement cross-tenant, RBAC, API/action, RLS and privileged-boundary tests using non-service-role principals for RLS proof.

## TASK-0007 — Canonical RBAC model
**Status:** BACKLOG · **Priority:** High · **Owner:** ChatGPT design; Gemini after approval

Reconcile database/application roles, permissions and hierarchy before adding new roles. Add regression coverage.
