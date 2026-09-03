# AI Collaboration Protocol

## Purpose
Define how ChatGPT and Gemini/Antigravity collaborate through GitHub and `.ai/` without relying on shared chat context.

## Roles
- **Human** — Product Owner and final authority.
- **ChatGPT** — Chief Software Architect, Project Supervisor, UI/UX Reviewer, Security Analyst, QA Lead, Technical Strategy Advisor.
- **Gemini/Antigravity** — Implementation Engineer & Technical Contributor. It may investigate, implement approved scope, run checks, identify blockers, and make technical recommendations.
- **GitHub** — source of truth for code, history, branches, PRs and collaboration records.
- **`.ai/`** — durable engineering memory and workflow protocol.

## Authority
ChatGPT may issue task contracts, architecture guidance, review findings, QA/security gates and recommendations. Gemini may not silently override an approved architectural/security decision. Human approval is required for merge/release, production, credentials, destructive operations, migrations, new dependencies, breaking changes and material architecture/schema/RLS exceptions.

## Authoritative instruction handshake
Gemini must begin substantive work by reading root `AGENTS.md`, `CLAUDE.md`, `.ai/AGENTS.md`, then `.ai/05-WORKFLOW/CONTROL-STATE.yaml`. An instruction is authoritative when it is represented by an active message with `from: chatgpt`, `type: AUTHORIZED_TASK` or `ARCHITECTURE_DIRECTIVE`, a valid task ID, and a status of `ACTIVE` or `APPROVED`. The referenced task is the implementation contract. Chat messages outside GitHub are advisory until recorded in the repository.

## Gemini recommendations
Gemini is expected to challenge assumptions when repository evidence supports a better approach. Recommendations use `REC-####` identifiers and must state: problem, evidence, impact, alternatives, recommendation, risk of ignoring, related task, and whether a human/architectural decision is required. A recommendation is **not** authorization. ChatGPT records a disposition: `ACCEPTED`, `ACCEPTED_WITH_CHANGES`, `REJECTED`, `DEFERRED`, or `ESCALATED_TO_HUMAN`.

## Blockers
When continuing would cross an authority boundary or create material security, architecture, data-integrity or UX risk, Gemini must stop and record a blocker/escalation rather than silently changing scope.

## Response protocol
After implementation, Gemini updates the task status and produces an implementation report containing files changed, tests/checks, evidence, limitations, recommendations, blockers and questions. ChatGPT reviews the actual diff and may mark `APPROVED`, `CHANGES_REQUESTED`, `BLOCKED`, or `ESCALATED`.

## State flow
`DRAFT -> TRIAGED -> APPROVED -> IN_PROGRESS -> IMPLEMENTED -> UNDER_REVIEW -> APPROVED_FOR_MERGE -> COMPLETED`.
`BLOCKED`, `CHANGES_REQUESTED`, `CANCELLED`, and `SUPERSEDED` are exception states. Only the human can confirm merge/release completion.

## No silent communication
Do not assume that a file merely existing means it is current. Use `CONTROL-STATE.yaml`, task IDs, message IDs, timestamps/commits and linked records to determine current workflow state.
