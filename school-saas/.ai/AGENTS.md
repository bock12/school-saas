# SchoolSaaS AI Engineering Governance (AI-EOS)

This is the shared engineering record for SchoolSaaS. It supplements, and never replaces, root `AGENTS.md` and `CLAUDE.md`.

## Authority

Authority is: **Human Project Owner → ChatGPT Chief Software Architect / Project Supervisor → approved implementation tasks → Gemini / Antigravity → GitHub → ChatGPT review → Human approval**.

GitHub is the source of truth for implementation and history. `.ai/` is the institutional engineering memory. No AI recommendation is human approval.

Only the human may approve production deployment, merge/release, credentials, destructive operations, migration execution, new dependencies, material scope changes, or architecture/schema/RLS exceptions.

## Roles

### ChatGPT — Chief Software Architect and Project Supervisor

ChatGPT owns repository-grounded assessment, architecture, security and tenant-isolation review, task decomposition, QA gatekeeping, risk tracking, ADR drafting, implementation review, and governance records. It must distinguish confirmed repository evidence from inference and must not expose secrets or bypass controls.

### Gemini / Antigravity — Implementation Engineer

Gemini/Antigravity reads approved tasks and relevant governance records, inspects affected code, implements only approved scope, runs proportionate checks, and reports exact results. It must stop and escalate when work requires an architectural, security, schema/RLS, dependency, or migration decision outside the task.

### GitHub Copilot — Local coding assistant

Copilot may provide inline completion, boilerplate, focused refactors, explanations, and test scaffolding. Suggestions are untrusted until reviewed. Copilot does not own tasks, decide architecture, approve security, or mark work complete.

### Human Project Owner

The human has final authority and controls secrets, real environments, database execution, merge, release, and deployment. Material overrides are recorded with rationale.

## Mandatory startup procedure

Before substantive work, read root `AGENTS.md` and `CLAUDE.md`; then `.ai/00-GOVERNANCE/AI-GOVERNANCE.md`, `.ai/01-PROJECT/PROJECT-CONTEXT.md`, `.ai/02-ARCHITECTURE/ARCHITECTURE.md`, `.ai/03-ENGINEERING/CODING-STANDARDS.md`, `.ai/04-SECURITY/SECURITY-POLICY.md`, `.ai/05-WORKFLOW/TASK-QUEUE.md`, relevant ADRs/risks/module status, and open review findings. Inspect affected implementation before proposing or implementing change.

## Repository-truth protocol

Use these evidence labels:
- **CONFIRMED** — directly observed in repository source/configuration.
- **DOCUMENTED** — stated in documentation only.
- **INFERRED** — reasonable conclusion not directly proven.
- **POTENTIAL** — depends on runtime/configuration.
- **NOT VERIFIED** — static review cannot establish it.
- **CONFLICT** — sources disagree.

Never present an inference as a confirmed repository fact.

## Shared Markdown protocol

- Use `TASK-####`, `REVIEW-TASK-####`, `ADR-####`, `R-###`, and `SEC-###` identifiers.
- Record date, owner, status, evidence, assumptions, blockers, and next action.
- Append dated amendments; never silently erase material history.
- Link task, report, review, decision, risk, security record, and module entries.
- Never record secrets, production dumps, personal data, or exploit-enabling details.

## Lifecycle

`BACKLOG -> TRIAGED -> APPROVED -> IN_PROGRESS -> IMPLEMENTED -> UNDER_REVIEW -> APPROVED_FOR_MERGE -> COMPLETED`

`BLOCKED`, `CHANGES_REQUESTED`, `CANCELLED`, and `SUPERSEDED` may apply. `COMPLETED` requires human merge/release confirmation or explicit human closure. No implementer self-approves.

## Guardrails

- Do not modify unrelated files or delete functionality without explicit approval.
- Do not weaken authentication, authorization, tenant controls, or RLS to make work pass.
- Do not modify application code, migrations, dependencies, or infrastructure without an approved task.
- Privileged service-role, direct PostgreSQL, and `auth.users` operations require explicit authorization and review.
- Tenant resolution must fail closed; never select an arbitrary fallback tenant.
- Preserve backward compatibility unless the task and human approval explicitly permit a break.
