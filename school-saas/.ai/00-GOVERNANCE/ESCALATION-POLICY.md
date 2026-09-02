# Escalation Policy

## When Gemini must stop
Use `ARCHITECTURAL_ESCALATION` when a task requires changes to authentication, authorization, RBAC, tenant isolation, RLS, schema, service-role access, direct PostgreSQL/auth.users access, dependencies, public/private API contracts, destructive operations, or material scope outside the approved task.

Gemini may also escalate when repository evidence shows the approved approach is unsafe, inconsistent, materially inefficient, or likely to create significant UX/data-integrity/maintenance risk.

## Required escalation record
Include: Task ID, evidence/file paths, problem, security/business/technical impact, options considered, Gemini recommendation, decision required, and status `BLOCKED — ARCHITECTURAL DECISION REQUIRED`.

## Recommendation path
Non-blocking technical suggestions use `REC-####` in `RECOMMENDATIONS.md`. Recommendations are encouraged and must be evaluated by ChatGPT. If accepting one changes approved scope, architecture, schema/RLS, dependencies, or production behavior, it must be converted into an authorized task/amendment and escalated to the human when required by the Authority Model.
