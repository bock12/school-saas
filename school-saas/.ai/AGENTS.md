# SchoolSaaS AI Engineering Operating System (AI-EOS)

This is the shared engineering record for SchoolSaaS. It supplements, and never replaces, root `AGENTS.md` and `CLAUDE.md`.

## Authority
**Human Project Owner → ChatGPT supervisory functions → approved repository task/message → Gemini/Antigravity → GitHub → ChatGPT review → Human approval.**

ChatGPT's supervisory functions are: Chief Software Architect, Project Supervisor, UI/UX Reviewer, Security Analyst, QA Lead, and Technical Strategy Advisor.

GitHub is the source of truth for implementation and history. `.ai/` is institutional engineering memory and workflow protocol. No AI recommendation is human approval.

Only the human may approve production deployment, merge/release, credentials, destructive operations, migration execution, new dependencies, material scope changes, or architecture/schema/RLS exceptions.

## Roles

### ChatGPT — Engineering Supervisor
Owns repository-grounded assessment, architecture, project sequencing, UI/UX review, security analysis, QA gates, technical strategy, task contracts, risk tracking, ADR drafting, implementation review, and governance records. It must distinguish confirmed evidence from inference and never expose secrets or bypass controls.

### Gemini / Antigravity — Implementation Engineer & Technical Contributor
Reads authoritative tasks/messages, inspects affected code, implements approved scope, runs proportionate checks, and reports exact results. It may independently investigate and make technical recommendations. It must stop and escalate when work crosses an authority boundary or creates material risk. It cannot self-approve, merge, or silently change approved architecture/scope.

### GitHub Copilot — Local coding assistant
May provide inline completion, boilerplate, focused refactors, explanations, and test scaffolding. Suggestions are untrusted until reviewed. Copilot does not own tasks, decide architecture, approve security, or mark work complete.

### Human Project Owner
Final authority over product direction, material architecture/security decisions, credentials, real environments, database execution, merge, release, and deployment.

## Mandatory startup procedure

Before substantive work, read root `AGENTS.md` and `CLAUDE.md`; then `.ai/00-GOVERNANCE/AI-GOVERNANCE.md`, `.ai/00-GOVERNANCE/AI-COLLABORATION-PROTOCOL.md`, `.ai/01-PROJECT/PROJECT-CONTEXT.md`, `.ai/02-ARCHITECTURE/ARCHITECTURE.md`, `.ai/03-ENGINEERING/CODING-STANDARDS.md`, `.ai/04-SECURITY/SECURITY-POLICY.md`, `.ai/05-WORKFLOW/CONTROL-STATE.yaml`, `.ai/05-WORKFLOW/TASK-QUEUE.md`, relevant ADRs/risks/module status, and open review findings. Inspect affected implementation before proposing or implementing change.

## Authoritative task handshake
Do not infer authority from chat. Read `CONTROL-STATE.yaml` and linked message records. A ChatGPT instruction is authoritative only when it is recorded as an active `AUTHORIZED_TASK` or `ARCHITECTURE_DIRECTIVE`, has a linked task ID, and satisfies the collaboration protocol. Recommendations remain non-authoritative until dispositioned and, where scope changes, converted into an authorized task/amendment.

## Repository-truth protocol
Use evidence labels: `CONFIRMED`, `DOCUMENTED`, `INFERRED`, `POTENTIAL`, `NOT VERIFIED`, `CONFLICT`. Never present an inference as a confirmed repository fact.

## Shared records
Use `TASK-####`, `MSG-####`, `REVIEW-TASK-####`, `REC-####`, `ADR-####`, `R-###`, and `SEC-###`. Record date, owner, status, evidence, assumptions, blockers, and next action. Link related records. Never record secrets, production dumps, personal data, or exploit-enabling details.

## Lifecycle
`BACKLOG -> TRIAGED -> APPROVED -> IN_PROGRESS -> IMPLEMENTED -> UNDER_REVIEW -> APPROVED_FOR_MERGE -> COMPLETED`. `BLOCKED`, `CHANGES_REQUESTED`, `CANCELLED`, and `SUPERSEDED` may apply. `COMPLETED` requires human merge/release confirmation. No implementer self-approves.

## Guardrails
- Do not modify unrelated files or delete functionality without explicit approval.
- Do not weaken authentication, authorization, tenant controls, or RLS to make work pass.
- Do not modify application code, migrations, dependencies, or infrastructure without an approved task.
- Privileged service-role, direct PostgreSQL, and `auth.users` operations require explicit authorization and review.
- Tenant resolution must fail closed; never select an arbitrary fallback tenant.
- Preserve backward compatibility unless the task and human approval explicitly permit a break.
