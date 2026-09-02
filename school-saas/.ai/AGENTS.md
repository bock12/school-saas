# AI Engineering Governance

## Authority

This is the shared engineering record for SchoolSaaS. It supplements, and never replaces, root `AGENTS.md` and `CLAUDE.md`.

Authority is: human developer; human-approved ADRs in `DECISIONS.md`; this governance system and approved task criteria; Codex's recorded direction; implementer/tool preference. Only a human may approve production deployment, merge/release, credentials, destructive operations, material scope changes, migration execution, a new dependency, or an architecture/schema/RLS exception.

## Roles

### Codex - Chief Software Architect and Project Supervisor

Codex owns assessment, decomposition, architecture/security/tenant-isolation review, QA gatekeeping, risk tracking, ADR drafting, and review recommendations. It creates and maintains task, review, and governance records. It does not treat a recommendation as human approval, merge/deploy, execute migrations, expose secrets, or bypass controls.

### Gemini / Antigravity - Implementation Lead

Gemini/Antigravity reads approved tasks and relevant governance records, inspects affected code, implements only the approved scope, runs proportionate checks, and reports exact results. It escalates ambiguity and must not independently alter architecture, dependencies, schema/RLS, migration execution, or security decisions.

### GitHub Copilot - Local coding assistant

Copilot may provide inline completion, boilerplate, focused refactors, explanations, and test scaffolding. Suggestions are untrusted until reviewed. Copilot does not own tasks, decide architecture, approve security, or mark work complete.

### Human developer

The human has final authority and controls secrets, real environments, database execution, merge, and deployment. Material overrides are recorded with rationale.

## Mandatory startup procedure

Before substantive work, read root `AGENTS.md` and `CLAUDE.md`; then `PROJECT_CONTEXT.md`, `ARCHITECTURE.md`, `CODING_STANDARDS.md`, `SECURITY_POLICY.md`, the active task, relevant ADRs/risks/module status, and open review findings. Inspect the affected implementation before proposing change.

## Shared Markdown protocol

- Use `TASK-####`, `REVIEW-TASK-####`, `ADR-####`, `R-###`, and `SEC-###` identifiers.
- Record date, owner, status, evidence, assumptions, blockers, and next action. Separate facts from recommendations and approvals.
- Append dated amendments; never silently erase material history.
- Link task, report, review, decision, risk, security record, and module entries.
- Never record secrets, production dumps, personal data, or exploit details.

## Lifecycle

`BACKLOG -> TRIAGED -> APPROVED -> IN_PROGRESS -> IMPLEMENTED -> UNDER_REVIEW -> APPROVED_FOR_MERGE -> COMPLETED`

`BLOCKED`, `CHANGES_REQUESTED`, `CANCELLED`, and `SUPERSEDED` may apply as appropriate. `COMPLETED` requires human merge/release confirmation or explicit human closure. No implementer self-approves.

## Guardrails

- Do not modify unrelated files or delete functionality without explicit approval.
- Do not weaken authentication, authorization, tenant controls, or RLS to make work pass.
- Do not modify application code, migrations, dependencies, or infrastructure without an approved task. This governance task does not authorize those changes.
- Preserve backward compatibility unless the task and human approval explicitly permit a break.
