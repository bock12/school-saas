# Risk Register

| ID | Risk | Severity | Likelihood | Evidence | Mitigation / next action | Owner | Status |
|---|---|---|---|---|---|---|---|
| R-001 | Service-role use could bypass tenant/RLS controls without local authorization. | High | Medium | Audit identifies privileged calls; admin client bypasses RLS. | TASK-0001 inventory and verification. | Codex / implementer | Open |
| R-002 | Tenant/role authorization lacks visible automated proof. | High | High | Audit found no visible suite for isolation, authorization, onboarding, or critical workflows. | Approve and execute test strategy. | Codex / human | Open |
| R-003 | Prototype routes may be treated as production-ready. | High | High | 108/170 pages have prototype signals. | Use module status before feature planning. | Product / Codex | Open |
| R-004 | Migration ordering/execution is unreliable. | High | Medium | Duplicate prefixes and runner scripts in multiple locations. | Define approved migration workflow; do not execute now. | Human / Codex | Open |
| R-005 | Release confidence is constrained by build capacity and missing CI/tests. | Medium | High | Audit records `ENOSPC`; no visible CI/test suite. | Later operational-hardening task. | Human / DevOps | Open |
| R-006 | Sensitive-data retention/export/audit controls are incomplete. | Medium | Medium | Audit lists these as enterprise work. | Design before enterprise-readiness claim. | Human / Codex | Open |

## Verified by TASK-0001 (2026-09-01)

| ID | Risk | Severity | Likelihood | Evidence | Mitigation / next action | Owner | Status |
|---|---|---|---|---|---|---|---|
| R-007 | Tracked database credential exposure. | Critical | High | Eleven tracked migration-runner scripts contain hard-coded database connection strings. | Human-led credential incident response and secret-scanning gate. | Human / Security | Open |
| R-008 | Unauthenticated sensitive API operations. | Critical | High | Admissions, CASS, exams/dashboard, and super-admin leads perform sensitive direct/service-role DB work without auth. | Contain and authorize affected routes before feature work. | Human / Codex | Open |
| R-009 | Privileged server actions lack operation-boundary authorization. | Critical | Medium | Tenant action and direct auth-user primitive mutate users/tenants from caller-supplied values without actor checks. | Centralize actor/role/tenant/object authorization; test direct action calls. | Codex / implementer | Open |
| R-010 | Arbitrary tenant fallback can select another tenant. | High | Medium | Two direct `SELECT id FROM tenants LIMIT 1` fallbacks exist in unguarded academic actions. | Fail closed, canonicalize tenant input, authorize resolved tenant. | Codex / implementer | Open |
| R-011 | Examination RLS does not apply tenant/role restrictions. | High | Medium | Exam RLS policies use `FOR ALL USING (true)`. | Approved policy redesign and distinct-principal RLS tests. | Human / Codex | Open |
