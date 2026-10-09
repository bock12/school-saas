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

**Gemini recommendation authority:** Gemini may identify architectural and security problems, propose alternative designs, recommend implementation approaches, recommend new tasks, challenge assumptions, identify missing requirements, identify risks, and recommend tests (`REC-####`). Gemini may **not** self-authorize a task, self-approve implementation, override ChatGPT architectural decisions, override the Human Project Owner, merge its own PR, or silently convert a recommendation into an implementation directive.

### GitHub Copilot — Local coding assistant
May provide inline completion, boilerplate, focused refactors, explanations, and test scaffolding. Suggestions are untrusted until reviewed. Copilot does not own tasks, decide architecture, approve security, or mark work complete.

### Human Project Owner
Final authority over product direction, material architecture/security decisions, credentials, real environments, database execution, merge, release, and deployment.

## Mandatory startup procedure

Before substantive work, read root `AGENTS.md` and `CLAUDE.md`; then `.ai/00-GOVERNANCE/AI-GOVERNANCE.md`, `.ai/00-GOVERNANCE/AI-COLLABORATION-PROTOCOL.md`, `.ai/01-PROJECT/PROJECT-CONTEXT.md`, `.ai/02-ARCHITECTURE/ARCHITECTURE.md`, `.ai/03-ENGINEERING/CODING-STANDARDS.md`, `.ai/04-SECURITY/SECURITY-POLICY.md`, `.ai/05-WORKFLOW/CONTROL-STATE.yaml`, `.ai/05-WORKFLOW/TASK-QUEUE.md`, relevant ADRs/risks/module status, and open review findings. Inspect affected implementation before proposing or implementing change.

## Authoritative task handshake
Do not infer authority from chat. Read `CONTROL-STATE.yaml` and linked message records. A ChatGPT instruction is authoritative only when it is recorded as an active `AUTHORIZED_TASK` or `ARCHITECTURE_DIRECTIVE`, has a linked task ID, and satisfies the collaboration protocol:

```text
ChatGPT conversational instruction
        ↓
durable .ai authorization record
        ↓
CONTROL-STATE.yaml
        ↓
Gemini reads repository state
        ↓
Gemini may execute authorized task
```

Gemini must NEVER treat an ordinary ChatGPT chat message as sufficient authorization when the repository protocol requires a durable authorization record. The branching policy changes WHERE routine governance records are committed; it does NOT change WHAT constitutes authorization. Recommendations remain non-authoritative until dispositioned and, where scope changes, converted into an authorized task/amendment.

## Repository-truth protocol
Use evidence labels: `CONFIRMED`, `DOCUMENTED`, `INFERRED`, `POTENTIAL`, `NOT VERIFIED`, `CONFLICT`. Never present an inference as a confirmed repository fact.

## Shared records
Use `TASK-####`, `MSG-####`, `REVIEW-TASK-####`, `REC-####`, `ADR-####`, `R-###`, and `SEC-###`. Record date, owner, status, evidence, assumptions, blockers, and next action. Link related records. Never record secrets, production dumps, personal data, or exploit-enabling details.

## Lifecycle
`BACKLOG -> TRIAGED -> APPROVED -> IN_PROGRESS -> IMPLEMENTED -> UNDER_REVIEW -> APPROVED_FOR_MERGE -> COMPLETED`. `BLOCKED`, `CHANGES_REQUESTED`, `CANCELLED`, and `SUPERSEDED` may apply. `COMPLETED` requires human merge/release confirmation. No implementer self-approves.

## AI-EOS Governance Persistence & Branching Policy
The `.ai/` directory is the AI-EOS control plane and durable engineering memory. The repository distinguishes three categories of changes:

1. **Routine Control-Plane Changes (No dedicated branch required):**
   Task authorization, task status transitions, `CONTROL-STATE.yaml` updates, implementation reports, review queue updates, recommendations (`REC-####`), collaboration messages (`MSG-####`), and ordinary task lifecycle records. Routine governance updates may be committed directly to `main` when they contain no application, database, authentication, authorization, infrastructure, dependency, or other production-impacting changes and when the repository's human owner permits direct commits.
2. **Material Governance Changes (Dedicated governance branch and PR):**
   Changes to authority hierarchy, AI roles, authorization rules, security governance, approval/merge rules, repository-truth rules, or the AI-EOS collaboration protocol itself. These use a dedicated governance branch (e.g. `ai-eos/governance-*`) and PR review process.
3. **Product / Application Changes (Standard feature/fix branch and PR):**
   React/Next.js code, API routes, authentication and authorization implementations, database schemas, migrations, RLS policies, dependencies, infrastructure, and UI/UX changes. These MUST use the normal product-development branch and PR workflow.

Branches represent meaningful change sets, not individual AI conversations or messages.

## Guardrails
- Do not modify unrelated files or delete functionality without explicit approval.
- Do not weaken authentication, authorization, tenant controls, or RLS to make work pass.
- Do not modify application code, migrations, dependencies, or infrastructure without an approved task.
- Privileged service-role, direct PostgreSQL, and `auth.users` operations require explicit authorization and review.
- Tenant resolution must fail closed; never select an arbitrary fallback tenant.
- Preserve backward compatibility unless the task and human approval explicitly permit a break.
